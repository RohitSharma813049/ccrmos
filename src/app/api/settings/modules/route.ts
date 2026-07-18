import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomModule from '@/modules/settings/schemas/CustomModule';
import Company from '@/modules/companies/schemas/Company';
import SubscriptionPlan from '@/modules/settings/schemas/SubscriptionPlan';
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

    const companyId = user.hierarchyLevel === 1 ? null : user.companyId;
    
    // For now, Platform Owner gets their global modules. Tenants get theirs + global ones.
    const baseQuery = companyId ? { $or: [{ companyId }, { companyId: null }] } : { companyId: null };
    
    let query: any = { ...baseQuery };
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query = {
        $and: [
          baseQuery,
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
      .limit(limit);

    return NextResponse.json({ modules, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const companyId = user.hierarchyLevel === 1 ? null : user.companyId;

    if (companyId) {
      const company = await Company.findById(companyId);
      if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

      // Support "Unlimited" by having maxCustomForms = -1 or very large, or rely on plan
      const plan = await SubscriptionPlan.findOne({ name: company.plan });
      const maxForms = plan?.maxCustomForms ?? 2; // Default to 2 if not found

      const existingFormsCount = await CustomModule.countDocuments({ companyId });

      if (maxForms !== -1 && existingFormsCount >= maxForms) {
        return NextResponse.json({ 
          error: `Upgrade required: Your ${company.plan} plan limits you to ${maxForms} custom forms.` 
        }, { status: 403 });
      }
    }

    const newModule = await CustomModule.create({
      ...body,
      companyId
    });

    return NextResponse.json({ module: newModule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
