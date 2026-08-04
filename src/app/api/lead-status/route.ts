import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LeadStatus from '@/modules/leads/schemas/LeadStatus';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = { ...buildTenantQuery(user) };

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "All";
    
    if (filter === "Active") {
      queryObj.active = true;
    } else if (filter === "Inactive") {
      queryObj.active = false;
    }

    if (search) {
      queryObj.name = { $regex: search, $options: "i" };
    }

    const statuses = await LeadStatus.find(queryObj).populate('stageId').sort({ createdAt: -1 });
    
    return NextResponse.json({ statuses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();

    if (user) {
      body.companyId = user.companyId;
    }

    const newStatus = await LeadStatus.create(body);
    return NextResponse.json({ status: newStatus }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
