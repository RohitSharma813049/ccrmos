import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';
import { logActivity } from '@/modules/audit/services/audit.service';
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'view');
    const lead = await Lead.findOne({ _id: (await params).id, ...buildTenantQuery(user) }).populate('stageId');
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'edit');
    const body = await req.json();
    body.updatedBy = user._id;
    const { id } = await params;

    const existingLead = await Lead.findOne({ _id: id, ...buildTenantQuery(user) });
    if (!existingLead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const terminalStatuses = ['closed', 'complete', 'closed won', 'closed lost'];
    const isTerminal = terminalStatuses.includes(existingLead.status?.toLowerCase() || "");
    
    // Allow founders (level 1 or 2) to override lock
    if (isTerminal && user.hierarchyLevel > 2) {
      return NextResponse.json({ error: 'Cannot modify a closed or completed lead.' }, { status: 403 });
    }

    const updatedLead = await Lead.findOneAndUpdate({ _id: id, ...buildTenantQuery(user) }, body, { new: true, runValidators: true });
    if (!updatedLead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    if (user.companyId) {
      logActivity({
        companyId: user.companyId,
        userId: user.id,
        module: "Leads",
        recordId: updatedLead._id.toString(),
        action: "Lead Updated",
        req
      }).catch(console.error);
    }

    return NextResponse.json({ lead: updatedLead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'delete');
    const { id } = await params;
    const lead = // Soft delete instead of hard delete
    await Lead.findOneAndUpdate({ _id: id, ...buildTenantQuery(user) }, { status: 'Archived' });
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    if (user.companyId) {
      logActivity({
        companyId: user.companyId,
        userId: user.id,
        module: "Leads",
        recordId: lead._id.toString(),
        action: "Lead Deleted",
        req
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
