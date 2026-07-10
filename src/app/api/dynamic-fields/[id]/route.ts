import { NextResponse } from "next/server";
import mongoose from "mongoose";
import DynamicField from "@/modules/settings/schemas/DynamicField";
import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";

// PUT /api/dynamic-fields/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { id } = await params;
    const { name, target, type, required } = await req.json();
    
    const updatedField = await DynamicField.findByIdAndUpdate(
      id,
      { name, target, type, required },
      { new: true, runValidators: true }
    );
    
    if (!updatedField) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Field updated successfully.", field: updatedField }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/dynamic-fields/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { id } = await params;
    
    // UI-level deletion (removes the definition, does not clean up actual records in tenants)
    const field = await DynamicField.findByIdAndDelete(id);
    
    if (!field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Field definition deleted successfully." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
