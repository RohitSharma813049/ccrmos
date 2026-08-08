import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AIProvider from "@/modules/settings/schemas/AIProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Unauthorized. Platform Owner only." }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    await dbConnect();

    const provider = await AIProvider.findByIdAndUpdate(id, body, { new: true });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    return NextResponse.json({ provider }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Unauthorized. Platform Owner only." }, { status: 401 });
    }

    const { id } = params;
    await dbConnect();

    await AIProvider.findByIdAndDelete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
