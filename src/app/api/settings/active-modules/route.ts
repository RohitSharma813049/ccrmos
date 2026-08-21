import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import CompanyModule from "@/modules/companies/schemas/CompanyModule";
import CustomModule from "@/modules/settings/schemas/CustomModule";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userCompanyId = user.companyId || user.impersonatedFounderId;
    if (!userCompanyId) return NextResponse.json({ modules: [] });

    await dbConnect();

    const companyModules = await CompanyModule.find({ 
      company_id: userCompanyId, 
      visible: true 
    }).sort({ sort_order: 1 }).lean();

    const customModules = await CustomModule.find({
      active: true,
      $or: [
        { companyId: userCompanyId },
        { enabledBy: userCompanyId }
      ]
    }).select("name").lean();

    // Map to simple names
    const stdNames = companyModules.map((m: any) => m.display_name || m.module_id);
    const customNames = customModules.map((m: any) => m.name);

    let finalModules = [...stdNames, ...customNames];
    if (finalModules.length === 0) {
      finalModules = ["Leads", "Projects", "Tasks", "Invoices", "Customers"];
    }

    // Deduplicate array
    const uniqueModules = Array.from(new Set(finalModules));

    return NextResponse.json({ modules: uniqueModules });
  } catch (error: any) {
    console.error("API Error in GET /api/settings/active-modules:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
