import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomRecord from '@/modules/settings/schemas/CustomRecord';
import CustomModule from '@/modules/settings/schemas/CustomModule';
import { getSession } from "@/lib/auth-utils";
import mongoose from 'mongoose';

export async function GET(req: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    const effectiveCompanyId = user?.companyId || user?.impersonatedFounderId;
    if (!user || !effectiveCompanyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId } = await params;
    
    // Verify module exists and is active
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const query = { moduleId, companyId: effectiveCompanyId };
    
    const total = await CustomRecord.countDocuments(query);
    const records = await CustomRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ records, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    const effectiveCompanyId = user?.companyId || user?.impersonatedFounderId;
    if (!user || !effectiveCompanyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId } = await params;
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

    // Basic required field validation based on schema
    for (const field of moduleDoc.fields) {
      if (field.required && !body.data?.[field.name]) {
        return NextResponse.json({ error: `Field ${field.name} is required` }, { status: 400 });
      }
    }

    const newRecord = await CustomRecord.create({
      moduleId,
      companyId: effectiveCompanyId,
      data: body.data || {},
      source: 'Manual',
      createdBy: user.id || user._id
    });

    return NextResponse.json({ record: newRecord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
