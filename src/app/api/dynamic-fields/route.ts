import { NextResponse } from "next/server";
import mongoose from "mongoose";
import DynamicField from "@/modules/settings/schemas/DynamicField";
import { getSession, requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";

// GET /api/dynamic-fields
export async function GET(req: Request) {
  try {
    const session = await getSession();
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("target");
    
    const query: any = {};
    if (target) {
      query.target = target;
    }

    // Fetch Global fields OR company-specific fields if session exists
    const companyId = session?.user && (session.user as any).companyId;
    if (companyId) {
      query.$or = [
        { tenantScope: "Global" },
        { companyId }
      ];
    } else {
      query.tenantScope = "Global";
    }

    // Sort by order
    const fields = await DynamicField.find(query).sort({ section: 1, order: 1, createdAt: -1 });
    
    return NextResponse.json({ fields }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/dynamic-fields
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userCompanyId = session?.user && (session.user as any).companyId;
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { name, target, type, required, section, order, options, tenantScope, customCss } = await req.json();
    
    if (!name || !target || !type) {
      return NextResponse.json({ error: "Name, target, and type are required." }, { status: 400 });
    }

    // If attempting to create a Global field, require MANAGE_COMPANIES (Platform Owner)
    if (tenantScope === "Global") {
      await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    }
    
    const newField = await DynamicField.create({
      name,
      target,
      type,
      required: required || false,
      tenantScope: tenantScope || "Company",
      companyId: tenantScope === "Global" ? undefined : userCompanyId,
      section: section || "General",
      order: order || 0,
      options: options || [],
      customCss: customCss || ""
    });
    
    return NextResponse.json({ message: "Field deployed successfully.", field: newField }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
