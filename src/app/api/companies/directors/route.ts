import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/modules/users/schemas/User';
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

    const query: any = {
      companyId: user.companyId,
      hierarchyLevel: 3 
    };

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    
    // Fetch Level 3 users (Directors) for the company
    const directors = await User.find(query)
      .populate("role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ directors, total, page, totalPages: Math.ceil(total / limit) });
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

    let assignedRole = await mongoose.models.Role.findOne({ 
      name: body.department, 
      companyId: user.companyId 
    });

    if (!assignedRole) {
      assignedRole = await mongoose.models.Role.create({
        name: body.department,
        companyId: user.companyId,
        permissions: ["view_dashboard"]
      });
    }

    const newDirector = await User.create({
      name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      role: assignedRole._id,
      hierarchyLevel: 3,
      companyId: user.companyId,
      isActive: true
    });

    return NextResponse.json({ director: newDirector }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
