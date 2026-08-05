import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LeadStatus from '@/modules/leads/schemas/LeadStatus';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const body = await req.json();
    const { _id, ...updateData } = body;

    const statusObj = await LeadStatus.findOneAndUpdate(
      { _id: params.id, ...buildTenantQuery(user) },
      updateData,
      { new: true }
    );

    if (!statusObj) return NextResponse.json({ error: "Lead Status not found" }, { status: 404 });

    return NextResponse.json({ status: statusObj });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const statusObj = await LeadStatus.findOneAndDelete({ 
      _id: params.id, 
      ...buildTenantQuery(user) 
    });

    if (!statusObj) return NextResponse.json({ error: "Lead Status not found" }, { status: 404 });

    return NextResponse.json({ message: "Lead Status deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
