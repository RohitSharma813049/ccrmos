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
    const { id } = await params;

    const query: any = { _id: id };
    if (user.hierarchyLevel !== 1) {
      query.companyId = user.companyId;
    }

    const moduleDoc = await CustomModule.findOne(query);
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

import RecycleBin from '@/modules/settings/schemas/RecycleBin';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const query: any = { _id: id };
    if (user.hierarchyLevel !== 1) {
      query.companyId = user.companyId;
    }

    const moduleToDel = await CustomModule.findOne(query).lean();
    if (!moduleToDel) {
      return NextResponse.json({ error: "Module not found or unauthorized" }, { status: 404 });
    }

    // Save to recycle bin
    if (user.companyId) {
      await RecycleBin.create({
        companyId: user.companyId,
        originalId: moduleToDel._id,
        collectionName: 'custommodules',
        documentData: moduleToDel,
        deletedBy: user.id
      });
    }

    await CustomModule.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
