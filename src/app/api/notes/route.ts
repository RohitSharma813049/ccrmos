import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/modules/core/schemas/Note";
import { requireAuthenticatedUser } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("recordId");
    const recordModel = searchParams.get("recordModel");

    if (!recordId || !recordModel) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const notes = await Note.find({
      companyId: user.companyId,
      recordId,
      recordModel
    })
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email");

    return NextResponse.json({ notes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const data = await req.json();

    const note = await Note.create({
      ...data,
      companyId: user.companyId,
      createdBy: user._id
    });

    const populatedNote = await Note.findById(note._id).populate("createdBy", "name email");

    return NextResponse.json({ success: true, note: populatedNote });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
