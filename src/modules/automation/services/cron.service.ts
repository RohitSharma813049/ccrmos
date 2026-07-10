import dbConnect from "@/lib/db";
import Lead from "@/modules/leads/schemas/Lead";
import Workflow from "@/modules/automation/schemas/Workflow";
import Company from "@/modules/companies/schemas/Company";
import { evaluateWorkflows } from "./workflow.service";

/**
 * Main orchestration function triggered by Vercel CRON.
 * Iterates through active companies and runs background tasks.
 */
export async function runScheduledTasks() {
  await dbConnect();
  
  try {
    const companies = await Company.find({ status: "active" });

    for (const company of companies) {
      await processCompanyCronJobs(company._id);
    }

    return { success: true, processedCompanies: companies.length };
  } catch (error) {
    console.error("[CRON] Orchestration Failed:", error);
    throw error;
  }
}

/**
 * Run scheduled batch processes for a specific company.
 */
async function processCompanyCronJobs(companyId: any) {
  try {
    // 1. Time-Based Workflow Automations
    // Check for workflows that are triggered on a schedule or delay
    const scheduledWorkflows = await Workflow.find({
      companyId,
      trigger: "Scheduled",
      isActive: true
    });

    for (const workflow of scheduledWorkflows) {
      // In a real implementation, this would fetch records meeting specific criteria
      // and run the workflow engine on them.
      console.log(`[CRON] Executing scheduled workflow ${workflow.name} for company ${companyId}`);
    }

    // 2. Data Cleanup / Stale Leads
    // Example: Auto-archive leads that have been in "new" status for > 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleLeads = await Lead.updateMany(
      { 
        companyId, 
        status: "new", 
        createdAt: { $lt: thirtyDaysAgo } 
      },
      { 
        $set: { status: "Archived", "customData.archivedReason": "Stale - Auto Archived by CRON" } 
      }
    );
    
    if (staleLeads.modifiedCount > 0) {
      console.log(`[CRON] Auto-archived ${staleLeads.modifiedCount} stale leads for company ${companyId}`);
    }

    // 3. Daily Metrics & Reporting (Stub for future reporting module)
    // generateDailyMetrics(companyId);

  } catch (error) {
    console.error(`[CRON] Failed processing company ${companyId}:`, error);
  }
}
