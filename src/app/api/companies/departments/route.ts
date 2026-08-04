import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Department from '@/modules/companies/schemas/Department';
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const companyId = user.companyId || user.impersonatedCompanyId;
    if (!companyId) {
      return NextResponse.json({ departments: [], total: 0, page: 1, totalPages: 1 });
    }

    const query: any = {
      companyId: companyId,
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const total = await Department.countDocuments(query);
    
    const departments = await Department.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ departments, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const companyId = user.companyId || user.impersonatedCompanyId;
    if (!companyId) {
      return NextResponse.json({ error: "No company associated with this user." }, { status: 400 });
    }

    const newDepartment = await Department.create({
      name: body.name || "Unnamed Department",
      departmentCode: body.departmentCode || "",
      companyId: companyId,
      isActive: true,
      dynamicData: body.dynamicData || {},
    });

    return NextResponse.json({ department: newDepartment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
