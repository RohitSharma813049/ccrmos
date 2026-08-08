import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DynamicRecord from "@/modules/dynamic/schemas/DynamicRecord";
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!userCompanyId) return NextResponse.json({ error: "No company context" }, { status: 403 });

    const { moduleId } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const query = { moduleId, companyId: userCompanyId };
    
    const records = await DynamicRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await DynamicRecord.countDocuments(query);
    
    return NextResponse.json({
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!userCompanyId) return NextResponse.json({ error: "No company context" }, { status: 403 });

    const { moduleId } = await params;
    const body = await req.json();
    const { data } = body;

    const record = await DynamicRecord.create({
      moduleId,
      companyId: userCompanyId,
      createdBy: (session.user as any).id,
      data: data || {}
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
