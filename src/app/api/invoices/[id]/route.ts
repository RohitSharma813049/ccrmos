import { NextResponse } from 'next/server';
import Invoice from '@/modules/invoices/schemas/Invoice';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Invoices', 'edit');
    const body = await req.json();
    body.updatedBy = user._id;

    if (body.approvalStatus && body.approvalStatus !== 'Pending') {
      body.approvedBy = user._id;
      body.approvedAt = new Date();
    }

    // State transition validation
    if (body.status) {
      const existing = await Invoice.findOne({ _id: (await params).id, ...buildTenantQuery(user) });
      if (!existing) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      
      const currentStatus = existing.status;
      const newStatus = body.status;
      
      if (currentStatus !== newStatus) {
        if (currentStatus === 'Unpaid' && newStatus === 'Refunded') {
          return NextResponse.json({ error: 'Cannot refund an unpaid invoice.' }, { status: 400 });
        }
        if (currentStatus === 'Cancelled' && newStatus === 'Paid') {
          return NextResponse.json({ error: 'Cannot pay a cancelled invoice.' }, { status: 400 });
        }
      }
    }

    const item = await Invoice.findOneAndUpdate({ _id: (await params).id, ...buildTenantQuery(user) }, body, { new: true, runValidators: true });
    return NextResponse.json({ message: 'Updated successfully', invoice: item }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Invoices', 'delete');
    // Soft delete instead of hard delete
    await Invoice.findOneAndUpdate({ _id: (await params).id, ...buildTenantQuery(user) }, { status: 'Archived' });
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
