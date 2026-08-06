import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Agent from '@/modules/ai/schemas/Agent';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = { ...buildTenantQuery(user) };

    const agents = await Agent.find(queryObj).sort({ createdAt: -1 });
    
    return NextResponse.json({ agents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();

    if (user) {
      body.companyId = user.companyId || (user.hierarchyLevel === 2 ? user.id : user.founderId) || user.id;
      body.founderId = user.hierarchyLevel === 2 ? user.id : user.founderId || user.id;
    }

    const newAgent = await Agent.create(body);
    return NextResponse.json({ agent: newAgent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
