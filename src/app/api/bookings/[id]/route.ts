import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/modules/bookings/schemas/Booking';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const body = await req.json();
    const { _id, ...updateData } = body;

    const booking = await Booking.findOneAndUpdate(
      { _id: params.id, ...buildTenantQuery(user) },
      updateData,
      { new: true }
    );

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    return NextResponse.json({ booking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const booking = await Booking.findOneAndDelete({ 
      _id: params.id, 
      ...buildTenantQuery(user) 
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
