import dbConnect from "@/lib/db";
import Workflow from "@/modules/automation/schemas/Workflow";
import WorkflowLog from "@/modules/automation/schemas/WorkflowLog";
import { executionQueue } from "@/lib/queue";

export class WorkflowEngine {
  
  /**
   * Triggers an event and evaluates matching workflows for a given company.
   * @param companyId The tenant ID
   * @param triggerName The name of the event (e.g. 'LEAD_CREATED', 'TICKET_UPDATED')
   * @param payload The event data to evaluate against
   */
  static async triggerEvent(companyId: string, triggerName: string, payload: Record<string, any>) {
    await dbConnect();
    
    // Find all active workflows for this company and trigger
    const workflows = await Workflow.find({ companyId, active: true, trigger: triggerName }).lean();
    if (!workflows.length) return;

    for (const wf of workflows) {
      const passed = this.evaluateConditions(wf.conditions, payload);
      
      const log = await WorkflowLog.create({
        workflowId: wf._id,
        companyId,
        triggerEvent: triggerName,
        payload,
        status: passed ? "completed" : "failed",
        errorMessage: passed ? undefined : "Conditions not met",
      });

      if (passed) {
        // Enqueue actions
        for (const action of wf.actions) {
          if (action.type !== "Canvas") {
            await executionQueue.add(`action:${action.type}`, {
              workflowId: wf._id,
              companyId,
              logId: log._id,
              action,
              payload
            });
          }
        }
      }
    }
  }

  private static evaluateConditions(conditions: any[], payload: Record<string, any>): boolean {
    if (!conditions || conditions.length === 0) return true;

    for (const cond of conditions) {
      const val = payload[cond.field];
      const target = cond.value;

      // Skip condition if field is missing in payload entirely
      if (val === undefined) return false;

      switch (cond.operator) {
        case "equals":
          if (val.toString() !== target.toString()) return false;
          break;
        case "not_equals":
          if (val.toString() === target.toString()) return false;
          break;
        case "greater_than":
          if (Number(val) <= Number(target)) return false;
          break;
        case "less_than":
          if (Number(val) >= Number(target)) return false;
          break;
        case "contains":
          if (!val.toString().includes(target.toString())) return false;
          break;
        default:
          return false; // Unknown operator fails
      }
    }
    return true; // All conditions passed
  }
}
