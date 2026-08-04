import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Partner from '@/modules/partners/schemas/Partner';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";
import User from '@/modules/users/schemas/User';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = { ...buildTenantQuery(user) };

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    
    if (type && type !== "All Partner Types") {
      queryObj.type = type;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchOr = ['name', 'company', 'email', 'phone', 'city'].map(field => ({ [field]: searchRegex }));
      queryObj.$or = queryObj.$or ? [...queryObj.$or, ...searchOr] : searchOr;
    }

    const partners = await Partner.find(queryObj).sort({ createdAt: -1 });
    
    return NextResponse.json({ partners });
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
      body.createdBy = user._id;
    }

    // Auto-generate User Account if email is provided
    let newUserId;
    let tempPassword;
    if (body.email) {
      const existingUser = await User.findOne({ email: body.email.toLowerCase() });
      if (!existingUser) {
        tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const newUser = await User.create({
          name: body.name,
          email: body.email.toLowerCase(),
          password: hashedPassword,
          role: 'Manager',
          userType: 'Partner',
          companyId: body.companyId,
          active: true
        });
        newUserId = newUser._id;
        body.userId = newUserId;
      } else {
        body.userId = existingUser._id;
      }
    }

    const newPartner = await Partner.create(body);
    return NextResponse.json({ partner: newPartner, tempPassword }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
