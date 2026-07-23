import { NextResponse } from 'next/server';
import Project from '@/modules/projects/schemas/Project';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Projects', 'edit');
    const body = await req.json();
    body.updatedBy = user._id;

    if (body.approvalStatus && body.approvalStatus !== 'Pending') {
      body.approvedBy = user._id;
      body.approvedAt = new Date();
    }

    // State transition validation
    if (body.status) {
      const existing = await Project.findOne({ _id: (await params).id, ...buildTenantQuery(user) });
      if (!existing) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      
      const currentStatus = existing.status;
      const newStatus = body.status;
      
      if (currentStatus !== newStatus) {
        if (currentStatus === 'Cancelled' && newStatus === 'Completed') {
          return NextResponse.json({ error: 'Cannot mark a cancelled project as completed.' }, { status: 400 });
        }
      }
    }

    const item = await Project.findOneAndUpdate({ _id: (await params).id, ...buildTenantQuery(user) }, body, { new: true, runValidators: true });
    return NextResponse.json({ message: 'Updated successfully', project: item }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Projects', 'delete');
    // Soft delete instead of hard delete
    await Project.findOneAndUpdate({ _id: (await params).id, ...buildTenantQuery(user) }, { status: 'Archived' });
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
