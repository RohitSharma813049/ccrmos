import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Agent from '@/modules/ai/schemas/Agent';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;
    
    const body = await req.json();
    const { _id, ...updateData } = body;

    const agent = await Agent.findOneAndUpdate(
      { _id: id, ...buildTenantQuery(user) },
      updateData,
      { new: true }
    );

    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    return NextResponse.json({ agent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;
    
    const agent = await Agent.findOneAndDelete({ 
      _id: id, 
      ...buildTenantQuery(user) 
    });

    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    return NextResponse.json({ message: "Agent deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
