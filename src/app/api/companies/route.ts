import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import { CompanyService } from "@/modules/companies/services/company.service";

// GET /api/companies
// Fetch all companies (Tenant accounts)
export async function GET() {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const companiesWithCounts = await CompanyService.getCompaniesWithUserCounts();
    
    return NextResponse.json({ companies: companiesWithCounts }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/companies
// Register a new tenant
export async function POST(req: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const payload = await req.json();
    const newCompany = await CompanyService.registerTenant(payload);
    
    return NextResponse.json({ message: "Tenant registered successfully.", company: newCompany }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Name and Admin Email are required.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
