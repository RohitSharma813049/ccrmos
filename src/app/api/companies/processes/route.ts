import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Process from '@/modules/companies/schemas/Process';
import Department from '@/modules/companies/schemas/Department'; // needed for population
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
    const departmentId = searchParams.get("departmentId") || "";

    const companyId = user.companyId || user.impersonatedCompanyId;
    if (!companyId) {
      return NextResponse.json({ processes: [], total: 0, page: 1, totalPages: 1 });
    }

    const query: any = {
      companyId: companyId,
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (departmentId) {
      query.departmentId = departmentId;
    }

    const skip = (page - 1) * limit;
    const total = await Process.countDocuments(query);
    
    // Explicitly import Department to prevent MissingSchemaError
    if (!mongoose.models.Department) {
        mongoose.model('Department', Department.schema);
    }

    const processes = await Process.find(query)
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ processes, total, page, totalPages: Math.ceil(total / limit) });
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

    if (!body.departmentId) {
      return NextResponse.json({ error: "Department ID is required." }, { status: 400 });
    }

    const newProcess = await Process.create({
      name: body.name || "Unnamed Process",
      processCode: body.processCode || "",
      companyId: companyId,
      departmentId: body.departmentId,
      isActive: true,
      dynamicData: body.dynamicData || {},
    });

    return NextResponse.json({ process: newProcess }, { status: 201 });
  } catch (error: any) {
    // Check for duplicate key error on departmentId + name
    if (error.code === 11000) {
      return NextResponse.json({ error: "A process with this name already exists in this department." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
