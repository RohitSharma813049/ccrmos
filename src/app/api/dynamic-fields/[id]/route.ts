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

    // Handle Custom Module pseudo-fields
    if (id.startsWith('custom_')) {
      const parts = id.split('_');
      const moduleId = parts[1];
      const fieldIdOrName = parts.slice(2).join('_');
      
      const { name, target, type, required, section, order, options, optionColors, customCss } = await req.json();

      const CustomModule = (await import("@/modules/settings/schemas/CustomModule")).default;
      const customModule = await CustomModule.findById(moduleId);
      if (!customModule) return NextResponse.json({ error: "Module not found" }, { status: 404 });

      // Find the field
      const fieldIndex = customModule.fields.findIndex((f: any) => 
        (f._id && f._id.toString() === fieldIdOrName) || f.name === fieldIdOrName
      );

      if (fieldIndex === -1) return NextResponse.json({ error: "Field not found in module" }, { status: 404 });

      if (customModule.tenantScope === "Global" && user.hierarchyLevel > 1) {
        return NextResponse.json({ error: "Forbidden: Cannot edit Global fields." }, { status: 403 });
      }

      if (section !== undefined) customModule.fields[fieldIndex].section = section;
      if (name !== undefined) customModule.fields[fieldIndex].name = name;
      if (type !== undefined) customModule.fields[fieldIndex].type = type;
      if (required !== undefined) customModule.fields[fieldIndex].required = required;
      if (options !== undefined) customModule.fields[fieldIndex].options = options;

      customModule.markModified(`fields.${fieldIndex}`);
      await customModule.save();
      return NextResponse.json({ message: "Field updated successfully.", field: customModule.fields[fieldIndex] }, { status: 200 });
    }

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

    // Handle Custom Module pseudo-fields
    if (id.startsWith('custom_')) {
      const parts = id.split('_');
      const moduleId = parts[1];
      const fieldIdOrName = parts.slice(2).join('_'); // Handle field names with underscores

      const CustomModule = (await import("@/modules/settings/schemas/CustomModule")).default;
      const customModule = await CustomModule.findById(moduleId);
      if (!customModule) return NextResponse.json({ error: "Module not found" }, { status: 404 });

      // Find the field
      const fieldIndex = customModule.fields.findIndex((f: any) => 
        (f._id && f._id.toString() === fieldIdOrName) || f.name === fieldIdOrName
      );

      if (fieldIndex === -1) return NextResponse.json({ error: "Field not found in module" }, { status: 404 });

      const field = customModule.fields[fieldIndex];

      if (customModule.tenantScope === "Global" && user.hierarchyLevel > 1) {
        if (user.companyId) {
          // Founder disables it for their tenant
          if (!field.disabledBy) field.disabledBy = [];
          if (!field.disabledBy.includes(user.companyId)) {
            field.disabledBy.push(user.companyId);
            customModule.markModified(`fields.${fieldIndex}.disabledBy`);
            await customModule.save();
          }
          return NextResponse.json({ message: "Field disabled for your company." }, { status: 200 });
        }
        return NextResponse.json({ error: "Forbidden: Cannot delete Global fields." }, { status: 403 });
      }

      // If Owner, actually delete the field from the custom module
      customModule.fields.splice(fieldIndex, 1);
      await customModule.save();
      return NextResponse.json({ message: "Field removed from custom module." }, { status: 200 });
    }

    const field = await DynamicField.findById(id);
    if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });
    
    if (field.tenantScope === "Global" && user.hierarchyLevel > 1) {
      if (user.companyId) {
        // Founders can't delete global fields, but they can disable them for their tenant
        await DynamicField.findByIdAndUpdate(id, {
          $addToSet: { disabledBy: user.companyId }
        });
        return NextResponse.json({ message: "Field disabled for your company." }, { status: 200 });
      }
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
