import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/modules/customers/schemas/Customer';
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
    const customer = // Soft delete instead of hard delete
    await Customer.findOneAndUpdate({ _id: (await params).id, ...buildTenantQuery(user) }, { status: 'Archived' });
    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
