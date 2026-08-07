import { NextResponse } from "next/server";
import mongoose from "mongoose";
import DynamicField from "@/modules/settings/schemas/DynamicField";
import { requirePermission, getSession } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import RecycleBin from "@/modules/settings/schemas/RecycleBin";

// PUT /api/dynamic-fields/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;
    
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: "Forbidden: Only Founders and Platform Owners can edit form fields." }, { status: 403 });
    }
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { id } = await params;
    const { name, target, type, required, section, order, options, optionColors, customCss } = await req.json();
    
    const field = await DynamicField.findById(id);
    if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });
    
    if (field.tenantScope === "Global" && user.hierarchyLevel > 1) {
      return NextResponse.json({ error: "Forbidden: Cannot edit Global fields." }, { status: 403 });
    }
    
    const updateData: any = { name, target, type, required };
    if (section !== undefined) updateData.section = section;
    if (order !== undefined) updateData.order = order;
    if (options !== undefined) updateData.options = options;
    if (optionColors !== undefined) updateData.optionColors = optionColors;
    if (customCss !== undefined) updateData.customCss = customCss;
    
    const updatedField = await DynamicField.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ message: "Field updated successfully.", field: updatedField }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/dynamic-fields/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;
    
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: "Forbidden: Only Founders and Platform Owners can delete form fields." }, { status: 403 });
    }
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { id } = await params;
    const field = await DynamicField.findById(id);
    if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });
    
    if (field.tenantScope === "Global" && user.hierarchyLevel > 1) {
      return NextResponse.json({ error: "Forbidden: Cannot delete Global fields." }, { status: 403 });
    }
    
    // Save to recycle bin
    if (user.companyId) {
      await RecycleBin.create({
        companyId: user.companyId,
        originalId: field._id,
        collectionName: 'dynamicfields',
        documentData: field.toObject(),
        deletedBy: user.id
      });
    }

    await DynamicField.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "Field definition deleted successfully." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
