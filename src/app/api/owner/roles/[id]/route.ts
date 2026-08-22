import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GlobalRole from '@/modules/owner/schemas/GlobalRole';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: 'Only Platform Owner can update roles' }, { status: 403 });
    }

    const body = await req.json();
    let updateOps: any = { $set: { ...body } };
    if (!body.industryId) {
      delete updateOps.$set.industryId;
      updateOps.$unset = { ...updateOps.$unset, industryId: 1 };
    }
    if (!body.planId) {
      delete updateOps.$set.planId;
      updateOps.$unset = { ...updateOps.$unset, planId: 1 };
    }
    
    const updatedRole = await GlobalRole.findByIdAndUpdate(params.id, updateOps, { new: true });
    if (!updatedRole) return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    
    return NextResponse.json({ data: updatedRole });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: 'Only Platform Owner can delete roles' }, { status: 403 });
    }

    // Soft delete
    const updatedRole = await GlobalRole.findByIdAndUpdate(params.id, { isActive: false }, { new: true });
    if (!updatedRole) return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    
    return NextResponse.json({ data: updatedRole });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
