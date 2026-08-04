import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GlobalRole from '@/modules/owner/schemas/GlobalRole';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: 'Only Platform Owner can update roles' }, { status: 403 });
    }

    const body = await req.json();
    const updatedRole = await GlobalRole.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedRole) return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    
    return NextResponse.json({ data: updatedRole });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
