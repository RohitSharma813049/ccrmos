import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomRecord from '@/modules/settings/schemas/CustomRecord';
import CustomModule from '@/modules/settings/schemas/CustomModule';
import { getSession } from "@/lib/auth-utils";

export async function PUT(req: Request, { params }: { params: Promise<{ moduleId: string, recordId: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user || !user.companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId, recordId } = await params;
    const body = await req.json();

    const moduleDoc = await CustomModule.findOne({
      _id: moduleId,
      active: true,
      $or: [{ companyId: user.companyId }, { companyId: null }]
    });

    if (!moduleDoc) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const record = await CustomRecord.findOne({ _id: recordId, moduleId, companyId: user.companyId });
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Basic required field validation
    for (const field of moduleDoc.fields) {
      if (field.required && !body.data?.[field.name]) {
        return NextResponse.json({ error: `Field ${field.name} is required` }, { status: 400 });
      }
    }

    record.data = body.data;
    await record.save();

    return NextResponse.json({ record });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ moduleId: string, recordId: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user || !user.companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId, recordId } = await params;

    const deleted = await CustomRecord.findOneAndDelete({ _id: recordId, moduleId, companyId: user.companyId });
    if (!deleted) {
      return NextResponse.json({ error: "Record not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
