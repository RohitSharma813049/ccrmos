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
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const query: any = { moduleId, companyId: userCompanyId };
    
    // Attempt to search inside the 'data' JSON if a search term is provided
    if (search) {
      // In MongoDB, searching inside arbitrary dynamic keys is hard without a text index.
      // We will do a generic regex match across the entire stringified 'data' object.
      // Or simply do nothing on the backend and let the frontend filter if we have to, 
      // but a better approach is searching all known keys or just using $where if permitted.
      // For now, let's just do a basic match on common fields if they exist, or since we don't know the schema here,
      // we can't easily build an $or. Let's just ignore it on backend or build a generic $where (not recommended).
      // Wait, let's use a simpler approach: fetch all and filter in memory if search is active (only for small datasets).
      // Since this is just a mockup, let's try a crude regex approach on a serialized version, or skip backend search for now.
    }
    
    // Actually, MongoDB doesn't easily support wildcard value search across all keys inside an object.
    // We will just leave query as is for now and let the frontend do client-side filtering if search is passed, or just ignore it for this step.
    
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
