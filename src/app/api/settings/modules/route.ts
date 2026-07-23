import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomModule from '@/modules/settings/schemas/CustomModule';
import Company from '@/modules/companies/schemas/Company';
import SubscriptionPlan from '@/modules/settings/schemas/SubscriptionPlan';
import Industry from '@/modules/settings/schemas/Industry';
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const scope = searchParams.get("scope");
    const specificIndustry = searchParams.get("industry");

    const companyId = user.companyId || user.impersonatedFounderId;
    const hierarchyLevel = user.hierarchyLevel;
    
    let query: any = {};
    
    if (hierarchyLevel === 1) {
      if (scope === "Global") {
        query.tenantScope = "Global";
      } else if (scope === "Industry") {
        query.tenantScope = "Industry";
        if (specificIndustry && specificIndustry !== "All") {
          const mongoose = require("mongoose");
          query.industryId = new mongoose.Types.ObjectId(specificIndustry);
        }
      } else if (scope === "Company") {
        query.tenantScope = "Company";
        const specificCompany = searchParams.get("company");
        if (specificCompany && specificCompany !== "All") {
          const mongoose = require("mongoose");
          query.companyId = new mongoose.Types.ObjectId(specificCompany);
        }
      } else {
        query.tenantScope = { $in: ["Global", "Industry", "Company"] };
      }
    } else if (companyId) {
      const mongoose = require("mongoose");
      query.$or = [
        { tenantScope: "Global" },
        { tenantScope: "Industry" }, // Note: in a real scenario, this matches company's industry
        { companyId: new mongoose.Types.ObjectId(companyId) }
      ];
    } else {
      query.tenantScope = { $in: ["Global", "Industry"] };
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query = {
        $and: [
          query,
          {
            $or: [
              { name: searchRegex },
              { description: searchRegex }
            ]
          }
        ]
      };
    }

    const skip = (page - 1) * limit;
    const total = await CustomModule.countDocuments(query);
    const modules = await CustomModule.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("industryId", "name")
      .populate("companyId", "name")
      .lean();

    return NextResponse.json({ modules, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    console.error("API Error in GET /api/settings/modules:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    let effectiveCompanyId = undefined;
    
    if (user.hierarchyLevel !== 1) {
      // Founders can ONLY create company-scoped modules
      body.tenantScope = "Company";
      effectiveCompanyId = user.companyId;
    } else if (body.tenantScope === "Company") {
      if (body.companyId) {
        effectiveCompanyId = body.companyId;
      } else {
        effectiveCompanyId = user.companyId || user.impersonatedFounderId;
      }
    }

    if (effectiveCompanyId && body.tenantScope === "Company") {
      const company = await Company.findById(effectiveCompanyId);
      if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

      const plan = await SubscriptionPlan.findOne({ name: company.plan });
      const maxForms = plan?.maxCustomForms ?? 2;

      const existingFormsCount = await CustomModule.countDocuments({ companyId: effectiveCompanyId });

      if (maxForms !== -1 && existingFormsCount >= maxForms) {
        return NextResponse.json({ 
          error: `Upgrade required: The ${company.plan} plan limits you to ${maxForms} custom forms.` 
        }, { status: 403 });
      }
    }

    const newModule = await CustomModule.create({
      ...body,
      companyId: effectiveCompanyId,
      industryId: body.tenantScope === "Industry" && body.industryId ? body.industryId : undefined
    });

    return NextResponse.json({ module: newModule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
