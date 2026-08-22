import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/modules/tickets/schemas/Ticket';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();

    const { id } = await params;
    const body = await req.json();

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, companyId },
      { $set: body },
      { new: true }
    );

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error("Update Ticket Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();

    const { id } = await params;

    const ticket = await Ticket.findOneAndDelete({ _id: id, companyId });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Ticket Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
