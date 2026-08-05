import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Voice from '@/modules/ai/schemas/Voice';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    
    const body = await req.json();
    const { _id, ...updateData } = body;

    const voice = await Voice.findOneAndUpdate(
      { _id: id, ...buildTenantQuery(user) },
      updateData,
      { new: true }
    );

    if (!voice) return NextResponse.json({ error: "Voice not found" }, { status: 404 });

    return NextResponse.json({ voice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    
    const voice = await Voice.findOneAndDelete({ 
      _id: id, 
      ...buildTenantQuery(user) 
    });

    if (!voice) return NextResponse.json({ error: "Voice not found" }, { status: 404 });

    return NextResponse.json({ message: "Voice deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
