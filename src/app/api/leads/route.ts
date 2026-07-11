import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import Pipeline from '@/modules/settings/schemas/Pipeline';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { evaluateWorkflows } from "@/modules/automation/services/workflow.service";
import { buildTenantQuery } from "@/lib/access-control";
import { logActivity } from "@/modules/audit/services/audit.service";
import { getRecordScopeFilter, filterFields } from "@/lib/permissions";

function errorResponse(error: any) {
  const message = error?.message || "Internal server error";
  if (message === "Unauthorized" || message.startsWith("Unauthorized:")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (message.startsWith("Forbidden:") || message.includes("permission")) {
    return NextResponse.json({ error: message }, { status: 403 });
  }
  if (error?.code === 11000) {
    return NextResponse.json({ error: "A lead with this email already exists in this tenant." }, { status: 409 });
  }
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'view');
    await dbConnect();

    const queryScope = getRecordScopeFilter(user, "Leads");

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    
    const queryObj: any = { ...queryScope, status: { $ne: 'Archived' } };
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchOr = ['firstName', 'lastName', 'email'].map(field => ({ [field]: searchRegex }));
      queryObj.$or = queryObj.$or ? [...queryObj.$or, ...searchOr] : searchOr;
    }

    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments(queryObj);
    const leads = await Lead.find(queryObj).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    
    // Apply Field-Level Permissions
    const filteredLeads = leads.map(lead => filterFields(lead, user, "Leads"));
    
    return NextResponse.json({ leads: filteredLeads, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) { return errorResponse(error); }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'create');
    await dbConnect();
    const companyId = user?.companyId || null;

    const body = await req.json();

    // Auto-assign hierarchical ownership based on creator
    if (user) {
      body.createdBy = user.id;
      body.companyId = companyId;
      body.founderId = user.hierarchyLevel === 2 ? user.id : user.founderId;
      if (!body.assignedUserId) body.assignedUserId = user.id;
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
        userId: user.id,
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
  } catch (error: any) { return errorResponse(error); }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'edit');
    await dbConnect();

    const body = await req.json();
    const { _id, status, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Missing Lead ID" }, { status: 400 });

    const lead = await Lead.findOne({ _id, ...buildTenantQuery(user) });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    // Enforce "forward-only" logic if status is changing
    if (status && lead.status !== status) {
      const pipeline = await Pipeline.findOne({ companyId: user.companyId, module: "lead" });
      
      // Fallback for default pipeline stages
      const stages = pipeline?.stages || [
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
  } catch (error: any) { return errorResponse(error); }
}
