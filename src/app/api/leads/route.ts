import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
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
