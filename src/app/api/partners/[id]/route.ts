import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Partner from '@/modules/partners/schemas/Partner';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";
import User from '@/modules/users/schemas/User';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const body = await req.json();
    const { _id, ...updateData } = body;

    const partner = await Partner.findOneAndUpdate(
      { _id: params.id, ...buildTenantQuery(user) },
      updateData,
      { new: true }
    );

    if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

    return NextResponse.json({ partner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const partner = await Partner.findOneAndDelete({ 
      _id: params.id, 
      ...buildTenantQuery(user) 
    });

    if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

    if (partner.userId) {
      await User.findByIdAndDelete(partner.userId);
    }

    return NextResponse.json({ message: "Partner deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
