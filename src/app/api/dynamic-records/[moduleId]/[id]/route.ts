import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DynamicRecord from "@/modules/dynamic/schemas/DynamicRecord";
import { getSession } from "@/lib/auth-utils";

export async function PUT(req: Request, { params }: { params: Promise<{ moduleId: string, id: string }> }) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!userCompanyId) return NextResponse.json({ error: "No company context" }, { status: 403 });

    const { id, moduleId } = await params;
    const body = await req.json();
    const { data } = body;

    const record = await DynamicRecord.findOneAndUpdate(
      { _id: id, moduleId, companyId: userCompanyId },
      { data, updatedAt: new Date() },
      { new: true }
    );

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ moduleId: string, id: string }> }) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!userCompanyId) return NextResponse.json({ error: "No company context" }, { status: 403 });

    const { id, moduleId } = await params;

    const record = await DynamicRecord.findOneAndDelete({
      _id: id,
      moduleId,
      companyId: userCompanyId
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
