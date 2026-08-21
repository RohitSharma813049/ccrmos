import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // Twilio sends data as application/x-www-form-urlencoded
    const text = await req.text();
    const params = new URLSearchParams(text);
    
    const fromNumber = params.get('From'); // Format: +1234567890
    const body = params.get('Body');
    const to = params.get('To');

    if (!fromNumber || !body || !to) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Find the company that owns the "To" number
    // We'd look up SystemSetting where twilio_config.fromNumber === to
    // Since MongoDB doesn't easily query inside mixed objects without exact paths, let's search all and filter for now (or assume single tenant / specific setup).
    // Let's do a direct query assuming standard structure
    const settings = await SystemSetting.find({ key: 'twilio_config' });
    let companyId = null;
    for (const setting of settings) {
      if (setting.value && setting.value.fromNumber === to) {
        companyId = setting.companyId;
        break;
      }
    }

    if (!companyId) {
      // If we can't find the company, we can't process it securely
      console.warn(`Incoming SMS to ${to}, but no company has this Twilio number configured.`);
      return NextResponse.json({ received: true });
    }

    // 2. Find the lead by phone number
    // Phone formats can be tricky, so we might need a loose match
    const lead = await Lead.findOne({ companyId, phone: fromNumber });
    
    if (lead) {
      // 3. Log the incoming message in the Lead's timeline
      lead.activities = lead.activities || [];
      lead.activities.push({
        type: 'SMS Received',
        description: `Lead replied: "${body}"`,
        timestamp: new Date()
      });
      await lead.save();

      // 4. Trigger AI Auto-Responder if Groq is configured
      try {
        const { processAIAutoReply } = await import('@/lib/ai-auto-reply');
        await processAIAutoReply(lead._id.toString(), companyId.toString(), body);
      } catch (aiErr: any) {
        console.error('AI Auto-Responder Error:', aiErr.message);
      }
    } else {
      console.log(`Received SMS from unknown number: ${fromNumber}`);
    }

    // Twilio expects a TwiML response. Empty response means "do nothing".
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error: any) {
    console.error('Twilio Incoming SMS Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
