import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import Pipeline from '@/modules/settings/schemas/Pipeline';
import { getSession } from "@/lib/auth-utils";
import { evaluateWorkflows } from "@/modules/automation/services/workflow.service";
import { buildQueryScope } from "@/lib/access-control";
import { logActivity } from "@/modules/audit/services/audit.service";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    
    // For now, assuming standard Manager/Director access uses 'Company' scope or 'Department' scope
    // We would fetch their Role's recordScope, but for MVP we default to "Company" if Founder, else "Own"
    // Let's assume recordScope is passed or resolved. Here we enforce standard RBAC.
    const scope = user?.hierarchyLevel <= 2 ? "Company" : (user?.role?.permissions?.leads?.recordScope || "Own");
    
    const queryScope = buildQueryScope(user, scope);
    const finalQuery = { ...queryScope, status: { $ne: 'Archived' } };

    const leads = await Lead.find(finalQuery).sort({ createdAt: -1 });
    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    const companyId = user?.companyId || null;

    const body = await req.json();

    // Auto-assign hierarchical ownership based on creator
    if (user) {
      body.createdBy = user._id;
      body.companyId = companyId;
      if (!body.assignedUserId) body.assignedUserId = user._id;
      if (user.departmentId) body.departmentId = user.departmentId;
      if (user.teamLeaderId) body.teamLeaderId = user.teamLeaderId;
      if (user.managerId) body.managerId = user.managerId;
      if (user.directorId) body.directorId = user.directorId;
    }

    const newLead = await Lead.create(body);

    if (companyId) {
      // Log the creation
      logActivity({
        companyId,
        userId: user._id,
        module: "Leads",
        recordId: newLead._id.toString(),
        action: "Lead Created",
        req
      }).catch(console.error);

      // Background execution of workflows
      evaluateWorkflows(companyId, "Lead Created", newLead._id.toString(), {
        ...newLead.toObject(),
        ...newLead.customData
      }).catch(console.error);
    }

    return NextResponse.json({ lead: newLead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { _id, status, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Missing Lead ID" }, { status: 400 });

    const lead = await Lead.findById(_id);
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    // Enforce "forward-only" logic if status is changing
    if (status && lead.status !== status) {
      let pipeline = await Pipeline.findOne({ companyId: user.companyId, module: "lead" });
      
      // Fallback for default pipeline stages
      let stages = pipeline?.stages || [
        { name: "New", order: 0 },
        { name: "Contacted", order: 1 },
        { name: "Qualified", order: 2 },
        { name: "Converted", order: 3 },
      ];

      const currentStage = stages.find(s => s.name === lead.status);
      const newStage = stages.find(s => s.name === status);

      // If both stages are in the pipeline, enforce ordering
      if (currentStage && newStage) {
        if (newStage.order < currentStage.order) {
          return NextResponse.json({ 
            error: "Status can only move forward in the pipeline." 
          }, { status: 400 });
        }
      }
      
      lead.status = status;

      // Workflow Hook
      evaluateWorkflows(user.companyId, "Lead Updated", lead._id.toString(), {
        ...lead.toObject(),
        status
      }).catch(console.error);
    }

    Object.assign(lead, updateData);
    await lead.save();

    return NextResponse.json({ lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
