import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomModule from '@/modules/settings/schemas/CustomModule';
import { getSession } from "@/lib/auth-utils";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const companyId = user.hierarchyLevel === 1 ? null : user.companyId;
    const { id } = await params;

    const moduleDoc = await CustomModule.findOne({ _id: id, companyId });
    if (!moduleDoc) {
      return NextResponse.json({ error: "Module not found or unauthorized" }, { status: 404 });
    }

    Object.assign(moduleDoc, body);
    await moduleDoc.save();

    return NextResponse.json({ module: moduleDoc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.hierarchyLevel === 1 ? null : user.companyId;
    const { id } = await params;

    const deleted = await CustomModule.findOneAndDelete({ _id: id, companyId });
    if (!deleted) {
      return NextResponse.json({ error: "Module not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
