import { NextResponse } from "next/server";
import mongoose from "mongoose";
import DynamicField from "@/modules/settings/schemas/DynamicField";
import Industry from "@/modules/settings/schemas/Industry";
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
    const search = searchParams.get("search");
    const scope = searchParams.get("scope"); // "All", "Global", or "Industry"
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    
    const query: any = {};
    if (target && target !== "all") {
      query.target = target;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const specificIndustry = searchParams.get("industry");

    // Fetch Global fields OR company-specific fields if session exists
    const user = session?.user as any;
    const companyId = user && (user.companyId || user.impersonatedFounderId);
    const hierarchyLevel = user && user.hierarchyLevel;
    
    if (hierarchyLevel === 1) {
      // Platform Owner sees all Global and Industry fields, filterable by scope dropdown
      if (scope === "Global") {
        query.tenantScope = "Global";
      } else if (scope === "Industry") {
        query.tenantScope = "Industry";
        if (specificIndustry && specificIndustry !== "All") {
          const mongoose = require("mongoose");
          query.industryId = new mongoose.Types.ObjectId(specificIndustry);
        }
      } else {
        query.tenantScope = { $in: ["Global", "Industry"] };
      }
    } else if (companyId) {
      // Normal tenant
      const mongoose = require("mongoose");
      query.$or = [
        { tenantScope: "Global" },
        { tenantScope: "Industry" }, // In a real app, this should filter by the specific company's industryId
        { companyId: new mongoose.Types.ObjectId(companyId) }
      ];
    } else {
      query.tenantScope = { $in: ["Global", "Industry"] };
    }

    // Sort by order
    const fields = await DynamicField.find(query, null, { strictQuery: false })
      .sort({ section: 1, order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    // Manually populate industries to completely bypass Mongoose schema cache issues
    const industryIds = fields.map(f => f.industryId).filter((id): id is mongoose.Types.ObjectId => !!id);
    const industries = await Industry.find({ _id: { $in: industryIds } }).lean();
    const industryMap: any = {};
    for (const ind of industries) {
      industryMap[ind._id.toString()] = { _id: ind._id, name: ind.name };
    }
    
    for (const field of fields) {
      if (field.industryId && industryMap[field.industryId.toString()]) {
        field.industryId = industryMap[field.industryId.toString()] as any;
      }
    }
      
    const total = await DynamicField.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({ fields, total, page, totalPages }, { status: 200 });
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

    // If attempting to create a Global or Industry field, require MANAGE_COMPANIES (Platform Owner)
    if (tenantScope === "Global" || tenantScope === "Industry") {
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
