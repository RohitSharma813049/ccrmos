import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import User from "@/modules/users/schemas/User";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const sessionUser = await requireAuthenticatedUser();
    
    const user = await User.findById(sessionUser.id).populate("role").select("-password").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let roleName = null;
    if (user.hierarchyLevel === 1) {
      roleName = "Platform Owner";
    } else if (user.role) {
      roleName = (user.role as any).name;
    }

    const userData = {
      ...user,
      role: roleName
    };

    return NextResponse.json({ user: userData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const sessionUser = await requireAuthenticatedUser();
    const body = await req.json();

    const updateFields: any = {};
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.phone !== undefined) updateFields.phone = body.phone;
    if (body.bio !== undefined) updateFields.bio = body.bio;
    if (body.avatarUrl !== undefined) updateFields.avatarUrl = body.avatarUrl;

    const user = await User.findByIdAndUpdate(
      sessionUser.id,
      { $set: updateFields },
      { new: true }
    ).select("-password").lean();

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
