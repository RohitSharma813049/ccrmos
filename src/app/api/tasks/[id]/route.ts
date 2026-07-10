import { NextResponse } from 'next/server';
import Task from '@/modules/tasks/schemas/Task';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Tasks', 'edit');
    const body = await req.json();
    const item = await Task.findOneAndUpdate({ _id: (await params).id, ...buildTenantQuery(user) }, body, { new: true, runValidators: true });
    return NextResponse.json({ message: 'Updated successfully', task: item }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Tasks', 'delete');
    // Soft delete instead of hard delete
    await Task.findOneAndUpdate({ _id: (await params).id, ...buildTenantQuery(user) }, { status: 'Archived' });
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
