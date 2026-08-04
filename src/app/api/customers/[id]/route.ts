import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/modules/customers/schemas/Customer';
import Project from '@/modules/projects/schemas/Project';
import Invoice from '@/modules/invoices/schemas/Invoice';
import Task from '@/modules/tasks/schemas/Task';
import Order from '@/modules/orders/schemas/Order';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Customers', 'view');
    const customer = await Customer.findOne({ _id: (await params).id, ...buildTenantQuery(user) });
    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Customers', 'edit');
    const body = await req.json();
    body.updatedBy = user._id;

    const { id } = await params;
    const existingRecord = await Customer.findOne({ _id: id, ...buildTenantQuery(user) });
    if (!existingRecord) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const terminalStatuses = ['closed', 'complete', 'closed won', 'closed lost'];
    const isTerminal = terminalStatuses.includes(existingRecord.status?.toLowerCase() || "");
    
    // Allow founders (level 1 or 2) to override lock
    if (isTerminal && user.hierarchyLevel > 2) {
      return NextResponse.json({ error: 'Cannot modify a closed or completed record.' }, { status: 403 });
    }

    // Cascade restore if status changes to something other than Archived
    if (body.status && body.status !== 'Archived') {
      const existingCustomer = await Customer.findOne({ _id: (await params).id, ...buildTenantQuery(user) });
      if (existingCustomer && existingCustomer.status === 'Archived') {
        const customerIdStr = existingCustomer._id.toString();
        const tenantQuery = buildTenantQuery(user);
        // Cascade restore to 'Planning', 'Processing', 'Unpaid', 'Pending' or similar default active statuses
        await Project.updateMany({ "customData.customerId": customerIdStr, status: 'Archived', ...tenantQuery }, { status: 'Planning' });
        await Invoice.updateMany({ "customData.customerId": customerIdStr, status: 'Archived', ...tenantQuery }, { status: 'Unpaid' });
        await Task.updateMany({ "customData.customerId": customerIdStr, status: 'Archived', ...tenantQuery }, { status: 'Pending' });
        await Order.updateMany({ "customData.customerId": customerIdStr, status: 'Archived', ...tenantQuery }, { status: 'Processing' });
      }
    }

    const updatedCustomer = await Customer.findOneAndUpdate({ _id: (await params).id, ...buildTenantQuery(user) }, body, { new: true, runValidators: true });
    if (!updatedCustomer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ customer: updatedCustomer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Customers', 'delete');
    const customer = await Customer.findOneAndUpdate({ _id: (await params).id, ...buildTenantQuery(user) }, { status: 'Archived' });
    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Cascade soft deletes for related records stored in customData
    const customerIdStr = customer._id.toString();
    const tenantQuery = buildTenantQuery(user);
    
    await Project.updateMany({ "customData.customerId": customerIdStr, ...tenantQuery }, { status: 'Archived' });
    await Invoice.updateMany({ "customData.customerId": customerIdStr, ...tenantQuery }, { status: 'Archived' });
    await Task.updateMany({ "customData.customerId": customerIdStr, ...tenantQuery }, { status: 'Archived' });
    await Order.updateMany({ "customData.customerId": customerIdStr, ...tenantQuery }, { status: 'Archived' });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
