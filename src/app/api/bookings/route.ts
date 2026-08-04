import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/modules/bookings/schemas/Booking';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = { ...buildTenantQuery(user) };

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "All";
    
    if (status !== "All") {
      queryObj.status = status;
    }

    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } },
        { bookingId: { $regex: search, $options: "i" } }
      ];
    }

    const bookings = await Booking.find(queryObj).sort({ createdAt: -1 });
    
    return NextResponse.json({ bookings });
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
      body.companyId = user.companyId;
    }

    const newBooking = await Booking.create(body);
    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
