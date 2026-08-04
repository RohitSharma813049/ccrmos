import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LeadStage from '@/modules/leads/schemas/LeadStage';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = buildTenantQuery(user);
    const body = await req.json();
    const stage = await LeadStage.findOneAndUpdate(
      { _id: params.id, ...queryObj },
      { $set: body },
      { new: true }
    );
    if (!stage) return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    return NextResponse.json(stage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = buildTenantQuery(user);
    const stage = await LeadStage.findOneAndDelete({ _id: params.id, ...queryObj });
    if (!stage) return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    return NextResponse.json({ message: 'Stage deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
