import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Process from '@/modules/companies/schemas/Process';
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
    if (body.processCode !== undefined) updateData.processCode = body.processCode;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.dynamicData !== undefined) updateData.dynamicData = body.dynamicData;

    const process = await Process.findOneAndUpdate(
      { _id: id, companyId: companyId },
      { $set: updateData },
      { new: true }
    ).populate('departmentId', 'name');

    if (!process) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ process }, { status: 200 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "A process with this name already exists in this department." }, { status: 409 });
    }
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
    
    const process = await Process.findOneAndDelete({ _id: id, companyId: companyId });
    if (!process) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
