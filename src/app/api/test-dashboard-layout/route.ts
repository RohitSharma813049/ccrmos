import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/modules/companies/schemas/Company";
import Industry from "@/modules/settings/schemas/Industry";
import CustomModule from "@/modules/settings/schemas/CustomModule";
import CompanyModule from "@/modules/companies/schemas/CompanyModule";
import User from "@/modules/users/schemas/User";

export async function GET(req: Request) {
  try {
    await dbConnect();
    // Simulate userCompanyId
    const userCompanyId = "60b9b0b9b0b9b0b9b0b9b0b9"; // dummy ID
    const company = await Company.findById(userCompanyId)
      .select("subscriptionStatus enabledModules industryId")
      .populate("industryId", "name");
      
    const companyModules = await CompanyModule.find({ company_id: userCompanyId, visible: true }).sort({ sort_order: 1 }).lean();
    
    const customModules = await CustomModule.find({
      active: true,
      $or: [
        { companyId: userCompanyId },
        { enabledBy: userCompanyId }
      ]
    }).select("_id name").lean();

    const dbUser = await User.findById(userCompanyId).select("avatarUrl").lean();

    return NextResponse.json({ success: true, companyModules, customModules });
  } catch (error: any) {
    console.error("Test Error:", error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
