import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import { CompanyService } from "@/modules/companies/services/company.service";

// GET /api/companies
// Fetch all companies (Tenant accounts)
export async function GET(req: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const result = await CompanyService.getCompaniesWithUserCounts(page, limit, search);
    
    return NextResponse.json(result, { status: 200 });
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
    if (error.message === "Name and Admin Email are required." || error.message === "A company already exists for this admin email." || error.message === "This admin email is already assigned to another user.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error?.code === 11000) return NextResponse.json({ error: "A company or admin email already exists." }, { status: 409 });
    console.error("POST /api/companies error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}