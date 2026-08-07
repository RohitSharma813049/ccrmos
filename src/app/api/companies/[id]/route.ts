import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Company from "@/modules/companies/schemas/Company";
import User from "@/modules/users/schemas/User";
import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";

// PUT /api/companies/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { id } = await params;
    const { name, adminEmail, plan, usersQuota, status, industryId, enabledModules } = await req.json();
    
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { 
        name, 
        adminEmail, 
        plan, 
        usersQuota, 
        status, 
        industryId: industryId === "" ? null : industryId, 
        enabledModules 
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Tenant updated successfully.", company: updatedCompany }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/companies/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { id } = await params;
    
    // HARD DELETE for initial implementation
    const company = await Company.findByIdAndDelete(id);
    
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    
    // Cascade delete all data belonging to this company across all collections
    const collectionsToClear = [
      "users", "roles", "customers", "leads", "projects", "tasks", "invoices", 
      "orders", "departments", "teams", "custommodules", "dynamicfields",
      "dynamicrecords", "customrecords", "pipelines", "leadstages", "leadstatuses",
      "properties", "apikeys", "webhooks", "integrationlinks", "integrationsettings",
      "campaignsettings", "notifications", "partners", "forms", "formsubmissions",
      "systemsettings"
    ];

    if (mongoose.connection.db) {
      for (const collectionName of collectionsToClear) {
        try {
          // Delete records where companyId is a string
          await mongoose.connection.db.collection(collectionName).deleteMany({ companyId: id });
          // Delete records where companyId is an ObjectId
          if (mongoose.Types.ObjectId.isValid(id)) {
            await mongoose.connection.db.collection(collectionName).deleteMany({ companyId: new mongoose.Types.ObjectId(id) });
          }
        } catch (e) {
          console.error(`Failed to clear collection ${collectionName} for tenant ${id}`, e);
        }
      }
    } else {
      // Fallback if db is not immediately accessible, at least delete users
      await User.deleteMany({ companyId: id });
    }
    
    return NextResponse.json({ message: "Tenant and all associated data deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/companies/[id] error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
