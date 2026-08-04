import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Department from '@/modules/companies/schemas/Department';
import { getSession } from "@/lib/auth-utils";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.companyId || user.impersonatedCompanyId;
    if (!companyId) return NextResponse.json({ error: "No company associated" }, { status: 400 });

    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.departmentCode !== undefined) updateData.departmentCode = body.departmentCode;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.dynamicData !== undefined) updateData.dynamicData = body.dynamicData;

    const department = await Department.findOneAndUpdate(
      { _id: id, companyId: companyId },
      { $set: updateData },
      { new: true }
    );

    if (!department) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ department }, { status: 200 });
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

    const companyId = user.companyId || user.impersonatedCompanyId;
    if (!companyId) return NextResponse.json({ error: "No company associated" }, { status: 400 });

    const { id } = await params;
    
    const department = await Department.findOneAndDelete({ _id: id, companyId: companyId });
    if (!department) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
