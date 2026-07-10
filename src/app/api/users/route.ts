import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/modules/users/schemas/User';
import { getSession, requirePermission } from "@/lib/auth-utils";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = session.user as any;
    
    // Admins only (for now, simply requiring session and checking companyId)
    // We could enforce requirePermission("MANAGE_USERS") but for MVP we assume Founders/Directors access this
    
    const query: any = {};
    if (user.hierarchyLevel !== 1) {
      if (!user.companyId) {
        return NextResponse.json({ users: [] });
      }
      query.companyId = user.companyId;
    }

    const users = await User.find(query)
      .populate("role", "name")
      .populate("directorId", "name email")
      .populate("managerId", "name email")
      .populate("teamLeaderId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const authUser = session.user as any;

    const body = await req.json();
    
    // Enforce Company isolation
    if (authUser.hierarchyLevel !== 1) {
      body.companyId = authUser.companyId;
    }

    // In a real system, you would send an invite email and they would set their password.
    // For this MVP, we create a dummy user record that can login via our mock auth or standard auth
    const newUser = await User.create(body);

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const authUser = session.user as any;

    const body = await req.json();
    const { id, ...updateData } = body;

    const query: any = { _id: id };
    if (authUser.hierarchyLevel !== 1) {
      query.companyId = authUser.companyId;
    }

    const updatedUser = await User.findOneAndUpdate(query, updateData, { new: true });
    
    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const authUser = session.user as any;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const query: any = { _id: id };
    if (authUser.hierarchyLevel !== 1) {
      query.companyId = authUser.companyId;
    }

    await User.findOneAndDelete(query);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
