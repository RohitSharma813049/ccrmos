import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Property from '@/modules/properties/schemas/Property';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";
    const projectId = searchParams.get("projectId") || "";
    
    const queryObj: any = { ...buildTenantQuery(user) };

    if (projectId && projectId !== 'all') {
      queryObj.projectId = projectId;
    }
    
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchOr = ['title', 'location', 'description'].map(field => ({ [field]: searchRegex }));
      queryObj.$or = queryObj.$or ? [...queryObj.$or, ...searchOr] : searchOr;
    }

    const skip = (page - 1) * limit;
    const total = await Property.countDocuments(queryObj);
    const properties = await Property.find(queryObj)
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({ properties, total, page, totalPages: Math.ceil(total / limit) });
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

    const newProperty = await Property.create(body);
    return NextResponse.json({ property: newProperty }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
