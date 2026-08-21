import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { verifyPortalToken } from "@/lib/portal-auth";
import Ticket from "@/modules/tickets/schemas/Ticket";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const token = cookies().get("portal_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyPortalToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await dbConnect();

    const tickets = await Ticket.find({ customerId: payload.customerId })
      .sort({ createdAt: -1 });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = cookies().get("portal_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyPortalToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await dbConnect();

    const data = await req.json();
    const ticket = await Ticket.create({
      ...data,
      companyId: payload.companyId,
      customerId: payload.customerId,
      createdBy: "client_portal"
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
