import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import Company from '@/modules/companies/schemas/Company';
import { evaluateWorkflows } from "@/modules/automation/services/workflow.service";

// This endpoint should be triggered daily via Vercel Cron or a similar scheduling service.
// It fetches new leads from external services that require polling (e.g. legacy APIs).
export async function GET(req: Request) {
  try {
    // Basic security: only allow requests with a specific cron secret
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();
    
    // In a real application, you would iterate through active companies with configured integration credentials
    // For example:
    // const companies = await Company.find({ status: "Active" });
    // for (const company of companies) {
    //   const jdSettings = await SystemSetting.findOne({ key: "justdial_configs", companyId: company._id });
    //   if (jdSettings && Array.isArray(jdSettings.value)) {
    //     for (const config of jdSettings.value) {
    //        // check config.scheduleType (interval vs fixed), compare with current time, and fetch if due.
    //        const newLeads = await fetchJustDialLeads(config.apiKey);
    //        // create lead, trigger workflows
    //     }
    //   }
    // }
    
    console.log("Starting daily fetch for third-party leads...");
    let totalImported = 0;

    return NextResponse.json({ 
      success: true, 
      message: "Daily lead fetch completed.",
      totalImported
    }, { status: 200 });

  } catch (error: any) {
    console.error("Cron Fetch Leads Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
