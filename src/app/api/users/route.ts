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
      const targetFounderId = user.hierarchyLevel === 2 ? user.id : user.founderId;
      if (!targetFounderId) {
        return NextResponse.json({ users: [] });
      }
      query.founderId = targetFounderId;
      // Users can only see others who are strictly BELOW them in hierarchy, plus themselves
      query.$or = [
        { hierarchyLevel: { $gt: user.hierarchyLevel } },
        { _id: user.id } // Can see themselves
      ];
    } else if (user.impersonatedFounderId) {
      // Platform Owner is impersonating a tenant, only show that tenant's users
      query.founderId = user.impersonatedFounderId;
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
    
    // Enforce Company isolation and Hierarchy
    if (authUser.hierarchyLevel !== 1) {
      body.companyId = authUser.companyId;
      body.founderId = authUser.hierarchyLevel === 2 ? authUser.id : authUser.founderId;
      
      const newHierarchyLevel = body.hierarchyLevel || 6;
      if (newHierarchyLevel <= authUser.hierarchyLevel) {
        return NextResponse.json({ error: "Forbidden: Cannot create users at or above your own hierarchy level." }, { status: 403 });
      }
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
      const targetFounderId = authUser.hierarchyLevel === 2 ? authUser.id : authUser.founderId;
      if (targetFounderId) query.founderId = targetFounderId;
      
      const targetUser = await User.findById(id);
      if (!targetUser) return NextResponse.json({ error: "Not found" }, { status: 404 });
      
      if ((targetUser.hierarchyLevel ?? 99) <= authUser.hierarchyLevel && targetUser._id.toString() !== authUser.id) {
        return NextResponse.json({ error: "Forbidden: Cannot edit users at or above your own hierarchy level." }, { status: 403 });
      }
      
      if (updateData.hierarchyLevel && updateData.hierarchyLevel <= authUser.hierarchyLevel && targetUser._id.toString() !== authUser.id) {
        return NextResponse.json({ error: "Forbidden: Cannot promote users to or above your own hierarchy level." }, { status: 403 });
      }
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
      const targetFounderId = authUser.hierarchyLevel === 2 ? authUser.id : authUser.founderId;
      if (targetFounderId) query.founderId = targetFounderId;
      
      const targetUser = await User.findById(id);
      if (!targetUser) return NextResponse.json({ error: "Not found" }, { status: 404 });
      
      if ((targetUser.hierarchyLevel ?? 99) <= authUser.hierarchyLevel) {
        return NextResponse.json({ error: "Forbidden: Cannot delete users at or above your own hierarchy level." }, { status: 403 });
      }
    }

    await User.findOneAndDelete(query);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
