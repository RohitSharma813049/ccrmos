import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LeadStage from '@/modules/leads/schemas/LeadStage';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = buildTenantQuery(user);
    const stages = await LeadStage.find(queryObj).sort({ order: 1 });
    return NextResponse.json(stages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();
    const newStage = await LeadStage.create({ ...body, companyId: user.companyId });
    return NextResponse.json(newStage, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
