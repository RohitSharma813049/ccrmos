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
    const companies = await Company.find({ status: "Active" });

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
      console.log(`[CRON] Executing scheduled workflow ${workflow.title} for company ${companyId}`);
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

    // 4. SLA Firewall Notifications
    const { sendPushNotification } = require("@/modules/notifications/services/notifications.service");
    const ModuleStatus = require("@/modules/settings/schemas/ModuleStatus").default;
    
    // Find all module statuses with an SLA defined for this company
    const slaStatuses = await ModuleStatus.find({
      companyId,
      slaHours: { $gt: 0 }
    });

    for (const status of slaStatuses) {
      if (!status.autoNotifyBeforeHours) continue;

      const breachThresholdHours = status.slaHours;
      const notifyThresholdHours = status.slaHours - status.autoNotifyBeforeHours;
      
      const notifyDate = new Date();
      notifyDate.setHours(notifyDate.getHours() - notifyThresholdHours);

      const breachDate = new Date();
      breachDate.setHours(breachDate.getHours() - breachThresholdHours);

      // Find leads in this status that haven't been updated recently enough
      const atRiskLeads = await Lead.find({
        companyId,
        status: status.name,
        updatedAt: { $lt: notifyDate, $gte: breachDate } // In the "warning" window
      });

      for (const lead of atRiskLeads) {
        // Send a notification to the assigned user
        if (lead.assignedUserId) {
          await sendPushNotification(
            lead.assignedUserId.toString(),
            "SLA Warning: Action Required",
            `Lead ${lead.firstName} ${lead.lastName} is approaching SLA breach in status "${status.name}".`
          );
        }
      }
    }

  } catch (error) {
    console.error(`[CRON] Failed processing company ${companyId}:`, error);
  }
}
