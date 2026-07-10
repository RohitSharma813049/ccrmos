import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomModule from '@/modules/settings/schemas/CustomModule';
import Company from '@/modules/companies/schemas/Company';
import SubscriptionPlan from '@/modules/settings/schemas/SubscriptionPlan';
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.hierarchyLevel === 1 ? null : user.companyId;
    
    // For now, Platform Owner gets their global modules. Tenants get theirs + global ones.
    const query = companyId ? { $or: [{ companyId }, { companyId: null }] } : { companyId: null };
    
    const modules = await CustomModule.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ modules });
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
