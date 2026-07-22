import mongoose from "mongoose";
import Workflow from "../schemas/Workflow";
import WorkflowLog from "../schemas/WorkflowLog";
import { executionQueue } from "@/lib/queue";

export async function evaluateWorkflows(companyId: string, triggerName: string, targetId: string, payload: any) {
  try {
    // Find all active workflows for this company and trigger
    const workflows = await Workflow.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      trigger: triggerName,
      active: true
    });

    if (!workflows.length) return;

    for (const workflow of workflows) {
      let conditionsMet = true;

      // Evaluate Conditions
      for (const condition of workflow.conditions) {
        const payloadValue = payload[condition.field];
        
        // If field is completely missing, condition fails
        if (payloadValue === undefined) {
          conditionsMet = false;
          break;
        }

        switch (condition.operator) {
          case "equals":
            if (String(payloadValue) !== String(condition.value)) conditionsMet = false;
            break;
          case "not_equals":
            if (String(payloadValue) === String(condition.value)) conditionsMet = false;
            break;
          case "greater_than":
            if (Number(payloadValue) <= Number(condition.value)) conditionsMet = false;
            break;
          case "less_than":
            if (Number(payloadValue) >= Number(condition.value)) conditionsMet = false;
            break;
          case "contains":
            if (!String(payloadValue).toLowerCase().includes(String(condition.value).toLowerCase())) conditionsMet = false;
            break;
        }

        if (!conditionsMet) break; // Optimization: fail fast
      }

      if (conditionsMet) {
        // Log the execution start
        const log = await WorkflowLog.create({
          companyId: workflow.companyId,
          workflowId: workflow._id,
          trigger: triggerName,
          targetId: String(targetId),
          status: "pending",
          details: "Queued for background execution"
        });

        // Push actions to BullMQ
        for (const action of workflow.actions) {
          if (action.type !== "Canvas") {
             await executionQueue.add(`action:${action.type}`, {
               workflowId: workflow._id,
               companyId: workflow.companyId,
               logId: log._id,
               action,
               payload,
               targetId,
               triggerName
             });
          }
        }
      }
    }
  } catch (error) {
    console.error("[Workflow Engine] Error evaluating workflows:", error);
  }
}
