import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import User from "@/modules/users/schemas/User";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await requireAuthenticatedUser();
    const companyId = sessionUser.companyId || sessionUser.impersonatedFounderId;
    
    if (!companyId && sessionUser.hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const payload = await req.json();
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    
    const userToEdit = await User.findById(userId);
    if (!userToEdit) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure tenant admin can only edit users in their company
    if (sessionUser.hierarchyLevel !== 1 && userToEdit.companyId?.toString() !== companyId?.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (payload.role) {
      userToEdit.role = payload.role;
    }
    if (payload.status) {
      userToEdit.isActive = payload.status === "Active";
    }

    await userToEdit.save();

    return NextResponse.json({ message: "User updated successfully", user: userToEdit }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
