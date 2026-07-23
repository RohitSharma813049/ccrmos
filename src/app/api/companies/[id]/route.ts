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
      { name, adminEmail, plan, usersQuota, status, industryId, enabledModules },
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
    
    // Cascade delete users belonging to this company
    await User.deleteMany({ companyId: id });
    
    return NextResponse.json({ message: "Tenant and associated users deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/companies/[id] error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
