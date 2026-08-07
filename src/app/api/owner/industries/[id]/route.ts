import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Industry from '@/modules/settings/schemas/Industry';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: 'Only Platform Owner can update industries' }, { status: 403 });
    }

    const body = await req.json();
    const updatedIndustry = await Industry.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedIndustry) return NextResponse.json({ error: 'Industry not found' }, { status: 404 });
    
    return NextResponse.json({ data: updatedIndustry });
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
      return NextResponse.json({ error: 'Only Platform Owner can delete industries' }, { status: 403 });
    }

    // Soft delete
    const updatedIndustry = await Industry.findByIdAndUpdate(params.id, { isActive: false }, { new: true });
    if (!updatedIndustry) return NextResponse.json({ error: 'Industry not found' }, { status: 404 });
    
    return NextResponse.json({ data: updatedIndustry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
