import { NextResponse } from 'next/server';
import Order from '@/modules/orders/schemas/Order';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Orders', 'edit');
    const body = await req.json();
    body.updatedBy = user._id;
    body.updatedBy = user._id;
    const { id } = await params;

    const existingRecord = await Order.findOne({ _id: id, ...buildTenantQuery(user) });
    if (!existingRecord) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const terminalStatuses = ['closed', 'complete', 'closed won', 'closed lost'];
    const isTerminal = terminalStatuses.includes(existingRecord.status?.toLowerCase() || "");
    
    // Allow founders (level 1 or 2) to override lock
    if (isTerminal && user.hierarchyLevel > 2) {
      return NextResponse.json({ error: 'Cannot modify a closed or completed record.' }, { status: 403 });
    }

    const item = await Order.findOneAndUpdate({ _id: id, ...buildTenantQuery(user) }, body, { new: true, runValidators: true });
    return NextResponse.json({ message: 'Updated successfully', order: item }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Orders', 'delete');
    // Soft delete instead of hard delete
    await Order.findOneAndUpdate({ _id: (await params).id, ...buildTenantQuery(user) }, { status: 'Archived' });
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
