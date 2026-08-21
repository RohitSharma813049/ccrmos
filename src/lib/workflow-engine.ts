import dbConnect from '@/lib/db';
import Workflow from '@/modules/automation/schemas/Workflow';
import Lead from '@/modules/leads/schemas/Lead';
import { sendTwilioSMS } from '@/lib/twilioClient';
import { sendGmail } from '@/lib/googleClient';

/**
 * Triggers all active workflows listening for a specific event
 * @param companyId The active company
 * @param eventName The name of the event (e.g. 'LEAD_CREATED')
 * @param payload The data associated with the event (e.g. { leadId: '...' })
 */
export async function triggerWorkflows(companyId: string, eventName: string, payload: any) {
  try {
    await dbConnect();
    
    // Find all active workflows listening for this event
    const workflows = await Workflow.find({ companyId, trigger: eventName, active: true });
    
    if (workflows.length === 0) return; // No workflows listening for this event

    for (const workflow of workflows) {
      const { conditions, actions } = workflow;
      
      // Step 1: Evaluate conditions
      let conditionsMet = true;
      for (const condition of conditions) {
        if (!evaluateCondition(payload, condition)) {
          conditionsMet = false;
          break;
        }
      }

      if (!conditionsMet) continue; // Workflow doesn't apply to this payload

      // Step 2: Execute actions
      for (const action of actions) {
        await executeAction(companyId, action, payload);
      }
    }
  } catch (error) {
    console.error(`Workflow Engine Error for event ${eventName}:`, error);
  }
}

function evaluateCondition(payload: any, condition: any): boolean {
  // In a real robust engine, you would parse nested fields (e.g. 'lead.status')
  // For simplicity, we assume payload is a flat object (like the Lead document)
  const actualValue = payload[condition.field];
  
  if (actualValue === undefined) return false;

  switch (condition.operator) {
    case 'equals': return actualValue === condition.value;
    case 'not_equals': return actualValue !== condition.value;
    case 'contains': return String(actualValue).includes(condition.value);
    case 'greater_than': return Number(actualValue) > Number(condition.value);
    case 'less_than': return Number(actualValue) < Number(condition.value);
    default: return false;
  }
}

async function executeAction(companyId: string, action: any, payload: any) {
  try {
    switch (action.type) {
      case 'Send Email':
      case 'SEND_EMAIL': {
        const { toField, subject, body } = action.payload || {};
        const toEmail = payload[toField || 'email'];
        if (toEmail) {
          // Assume the owner or a system user is sending it
          // Wait, sendGmail needs a userId to get the refresh token. 
          // For workflows, you might need a "system user" or pass the userId in the payload.
          // Let's assume the payload has an assignedTo field we can use.
          const userId = payload.assignedTo || payload.createdBy;
          if (userId) {
            await sendGmail(userId.toString(), companyId, toEmail, subject, body);
          } else {
             console.warn('Cannot send email via workflow: No userId found in payload to use for OAuth.');
          }
        }
        break;
      }
      case 'SEND_SMS': {
        const { toField, body } = action.payload || {};
        const toPhone = payload[toField || 'phone'];
        if (toPhone) {
          await sendTwilioSMS(toPhone, body, companyId);
        }
        break;
      }
      case 'CREATE_TASK': {
        // Implement task creation
        break;
      }
      case 'ADD_TAG': {
        if (payload._id) {
           await Lead.findByIdAndUpdate(payload._id, { $addToSet: { tags: action.payload?.tag } });
        }
        break;
      }
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  } catch (error) {
    console.error(`Error executing action ${action.type}:`, error);
  }
}
