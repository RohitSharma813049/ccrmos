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
      const Company = (await import("@/modules/companies/schemas/Company")).default;
      const company = await Company.findById(companyId).select('industryId');
      
      const orConditions: any[] = [
        { tenantScope: "Global" },
        { companyId: new mongoose.Types.ObjectId(companyId) }
      ];

      if (company && company.industryId) {
        orConditions.push({ 
          tenantScope: "Industry",
          industryId: company.industryId 
        });
      }

      query.$or = orConditions;
      // Filter out fields that this company has disabled
      query.disabledBy = { $ne: new mongoose.Types.ObjectId(companyId) };
    } else {
      query.tenantScope = { $in: ["Global", "Industry"] };
    }

    // Check if the target corresponds to a CustomModule
    const CustomModule = (await import("@/modules/settings/schemas/CustomModule")).default;
    let customModuleFields: any[] = [];
    if (target && target !== "all") {
      const customModule = await CustomModule.findOne({ name: target }).lean();
      if (customModule) {
        // Map embedded fields to DynamicField format
        customModuleFields = customModule.fields
          .filter((f: any) => {
            // Filter disabledBy for the current user
            if (hierarchyLevel > 1 && companyId && f.disabledBy) {
              return !f.disabledBy.map((id: any) => id.toString()).includes(companyId.toString());
            }
            return true;
          })
          .map((f: any) => ({
            _id: `custom_${customModule._id}_${f._id || f.name}`, // special ID prefix
            name: f.name,
            target: customModule.name,
            type: f.type,
            required: f.required,
            tenantScope: customModule.tenantScope,
            companyId: customModule.companyId,
            section: f.section || "General",
            order: 0,
            options: f.options || [],
            isCustomModuleField: true,
            moduleId: customModule._id.toString()
          }));
      }
    }

    // Sort by order
    let fields = await DynamicField.find(query, null, { strictQuery: false })
      .sort({ section: 1, order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    if (customModuleFields.length > 0) {
      fields = [...customModuleFields, ...fields];
    }
      
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
    
    const { name, target, type, required, section, order, options, optionColors, tenantScope, customCss } = await req.json();
    
    if (!name || !target || !type) {
      return NextResponse.json({ error: "Name, target, and type are required." }, { status: 400 });
    }

    // Check if target is a Custom Module
    const CustomModule = (await import("@/modules/settings/schemas/CustomModule")).default;
    const customModule = await CustomModule.findOne({ name: target });
    if (customModule) {
      // It's a Custom Module pseudo-field
      if (customModule.tenantScope === "Global" && (session?.user as any)?.hierarchyLevel > 1) {
        return NextResponse.json({ error: "Forbidden: Cannot add fields to Global Custom Modules." }, { status: 403 });
      }

      const newField = {
        name,
        type,
        required: required || false,
        section: section || "General",
        options: options || [],
      };
      
      customModule.fields.push(newField);
      await customModule.save();
      
      const addedField = customModule.fields[customModule.fields.length - 1];
      const mappedField = {
        _id: `custom_${customModule._id}_${(addedField as any)._id || addedField.name}`,
        name: addedField.name,
        target: customModule.name,
        type: addedField.type,
        required: addedField.required,
        section: addedField.section || "General",
        options: addedField.options || [],
        isCustomModuleField: true
      };
      return NextResponse.json({ message: "Field deployed to Custom Module successfully.", field: mappedField }, { status: 201 });
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
      optionColors: optionColors || {},
      customCss: customCss || ""
    });
    
    return NextResponse.json({ message: "Field deployed successfully.", field: newField }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
