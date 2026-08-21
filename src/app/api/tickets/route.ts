import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import Ticket from "@/modules/tickets/schemas/Ticket";

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    if (id) {
      const ticket = await Ticket.findOne({ _id: id, companyId: user.companyId })
        .populate("customerId", "companyName contactName email")
        .populate("assignedUserId", "name email");
      if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ ticket });
    }

    const query: any = { companyId: user.companyId };
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;

    const tickets = await Ticket.find(query)
      .populate("customerId", "companyName contactName email")
      .populate("assignedUserId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const data = await req.json();
    const ticket = await Ticket.create({
      ...data,
      companyId: user.companyId,
      createdBy: user._id
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const data = await req.json();
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, companyId: user.companyId },
      { $set: data },
      { new: true }
    );

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await Ticket.findOneAndDelete({ _id: id, companyId: user.companyId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
