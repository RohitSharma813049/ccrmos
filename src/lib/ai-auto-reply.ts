import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import Lead from '@/modules/leads/schemas/Lead';

/**
 * Sends a prompt to the Groq API using Llama
 */
async function generateGroqResponse(companyId: string, prompt: string): Promise<string> {
  const settingQuery = companyId ? { key: 'groq_config', companyId } : { key: 'groq_config' };
  const setting = await SystemSetting.findOne(settingQuery);
  
  if (!setting || !setting.value || !setting.value.apiKey) {
    throw new Error('Groq is not configured for this workspace.');
  }

  const { apiKey } = setting.value;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192', // or llama3-8b-8192
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to generate AI response');
  }

  return data.choices[0].message.content.trim();
}

/**
 * Processes an incoming message and determines whether to Auto-Reply or save as Draft.
 */
export async function processAIAutoReply(leadId: string, companyId: string, incomingMessage: string) {
  await dbConnect();
  
  const lead = await Lead.findById(leadId);
  if (!lead) throw new Error('Lead not found');

  // Build the context for the AI
  const leadContext = `
You are a helpful, professional sales assistant. 
You are speaking to a lead named ${lead.firstName} ${lead.lastName || ''}.
Their current status in the pipeline is: ${lead.status || 'New'}.
Previous notes/remarks about them: ${lead.lastRemark || 'None'}.

The lead just sent this message: "${incomingMessage}"

Draft a polite, concise, and helpful response (under 2 sentences) that answers their question or pushes the conversation forward. Do not use placeholders.
`;

  try {
    const aiResponse = await generateGroqResponse(companyId, leadContext);

    // Save as a "Draft Reply" in the Lead's timeline so a human can approve it or send it.
    lead.activities = lead.activities || [];
    lead.activities.push({
      type: 'AI Draft Reply',
      description: `AI suggested response: "${aiResponse}"`,
      timestamp: new Date()
    });

    // In a fully autonomous mode, we would call sendTwilioSMS here. 
    // For safety, we just log it as a draft.
    await lead.save();

    console.log(`[AI Auto-Responder] Generated draft reply for Lead ${lead._id}`);
  } catch (error: any) {
    console.error(`[AI Auto-Responder Error] ${error.message}`);
  }
}
