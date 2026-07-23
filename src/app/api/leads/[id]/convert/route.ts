import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import Customer from '@/modules/customers/schemas/Customer';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';
import { logActivity } from '@/modules/audit/services/audit.service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'edit');
    const { id } = await params;
    
    const lead = await Lead.findOne({ _id: id, ...buildTenantQuery(user) });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    
    if (lead.status === 'Converted') {
      return NextResponse.json({ error: 'Lead is already converted' }, { status: 400 });
    }

    // Create Customer
    const newCustomer = await Customer.create({
      companyId: lead.companyId,
      founderId: lead.founderId,
      companyName: lead.company || `${lead.firstName} ${lead.lastName || ''}`.trim(),
      contactName: `${lead.firstName} ${lead.lastName || ''}`.trim(),
      email: lead.email,
      phone: lead.phone,
      status: "active",
      createdBy: user.id
    });

    // Update Lead status
    lead.status = 'Converted';
    if (!lead.activities) lead.activities = [];
    lead.activities.push({ type: 'Status Change', description: 'Converted to Customer', timestamp: new Date() });
    await lead.save();

    if (user.companyId) {
      logActivity({
        companyId: user.companyId,
        userId: user.id,
        module: "Leads",
        recordId: lead._id.toString(),
        action: "Lead Converted",
        req
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, customerId: newCustomer._id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
