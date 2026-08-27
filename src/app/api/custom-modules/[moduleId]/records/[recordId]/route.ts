import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomRecord from '@/modules/settings/schemas/CustomRecord';
import CustomModule from '@/modules/settings/schemas/CustomModule';
import { getSession } from "@/lib/auth-utils";
import RecycleBin from "@/modules/settings/schemas/RecycleBin";

export async function PUT(req: Request, { params }: { params: Promise<{ moduleId: string, recordId: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    const effectiveCompanyId = user.companyId || user.impersonatedFounderId;
    if (!effectiveCompanyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId, recordId } = await params;
    const body = await req.json();

    const moduleDoc = await CustomModule.findOne({
      _id: moduleId,
      active: true,
      $or: [
        { companyId: effectiveCompanyId }, 
        { companyId: null },
        { enabledBy: effectiveCompanyId }
      ]
    });

    if (!moduleDoc) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const record = await CustomRecord.findOne({ _id: recordId, moduleId, companyId: effectiveCompanyId });
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Basic required field validation
    if (body.data) {
      for (const field of moduleDoc.fields) {
        if (field.required && !body.data[field.name]) {
          return NextResponse.json({ error: `Field ${field.name} is required` }, { status: 400 });
        }
      }
      record.data = body.data;
    }

    if (body.status !== undefined) record.status = body.status;
    if (body.subStatus !== undefined) record.subStatus = body.subStatus;

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
    const effectiveCompanyId = user.companyId || user.impersonatedFounderId;
    if (!effectiveCompanyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId, recordId } = await params;

    const recordToDel = await CustomRecord.findOne({ _id: recordId, moduleId, companyId: effectiveCompanyId }).lean();
    if (!recordToDel) {
      return NextResponse.json({ error: "Record not found or unauthorized" }, { status: 404 });
    }

    // Save to recycle bin
    if (effectiveCompanyId) {
      await RecycleBin.create({
        companyId: effectiveCompanyId,
        originalId: recordToDel._id,
        collectionName: 'customrecords',
        documentData: recordToDel,
        deletedBy: user.id
      });
    }

    await CustomRecord.deleteOne({ _id: recordId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
