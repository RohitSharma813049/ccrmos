import dbConnect from '@/lib/db';
import RoutingRule from '@/modules/leads/schemas/RoutingRule';
import mongoose from 'mongoose';

/**
 * Evaluates a new Lead against active Routing Rules for the Company
 * and returns the ObjectId of the agent it should be assigned to.
 * If no rules match, returns null.
 */
export async function assignLeadViaRoutingRules(
  companyId: mongoose.Types.ObjectId | string, 
  leadData: any
): Promise<mongoose.Types.ObjectId | null> {
  await dbConnect();

  // Fetch all active rules sorted by highest priority (lowest number first)
  const rules = await RoutingRule.find({ 
    companyId, 
    isActive: true 
  }).sort({ priority: 1 });

  for (const rule of rules) {
    // 1. Evaluate Criteria
    let matches = true;
    
    if (rule.criteria.source && rule.criteria.source !== leadData.source) matches = false;
    if (rule.criteria.propertyType && rule.criteria.propertyType !== leadData.propertyType) matches = false;
    if (rule.criteria.location && rule.criteria.location !== leadData.location) matches = false;
    if (rule.criteria.minBudget && (leadData.budget || 0) < rule.criteria.minBudget) matches = false;
    if (rule.criteria.maxBudget && (leadData.budget || 0) > rule.criteria.maxBudget) matches = false;

    if (matches && rule.agentPool.length > 0) {
      
      // 2. Direct Assignment
      if (rule.assignmentMethod === "DIRECT_ASSIGNMENT") {
        return rule.agentPool[0]; // Assign to the first (and only) agent
      }
      
      // 3. Round Robin Distribution
      if (rule.assignmentMethod === "ROUND_ROBIN") {
        // We use an atomic findOneAndUpdate with $inc to prevent race conditions 
        // when 50 webhooks hit the server at the exact same millisecond.
        const updatedRule = await RoutingRule.findOneAndUpdate(
          { _id: rule._id },
          { $inc: { currentPoolIndex: 1 } },
          { new: true } // Return the document AFTER the increment
        );

        if (updatedRule) {
          // Calculate the correct agent index using modulo math
          const nextIndex = (updatedRule.currentPoolIndex - 1) % updatedRule.agentPool.length;
          return updatedRule.agentPool[nextIndex];
        }
      }
    }
  }

  // If no rules matched, return null (fallback to a default assignee or unassigned)
  return null;
}
