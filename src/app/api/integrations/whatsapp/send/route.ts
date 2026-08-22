import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import twilio from 'twilio';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import Lead from '@/modules/leads/schemas/Lead';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    
    // Extract body
    const body = await req.json();
    const { leadId, message } = body;
    
    if (!leadId || !message) {
      return NextResponse.json({ error: "leadId and message are required" }, { status: 400 });
    }

    const companyId = user.companyId || user.impersonatedFounderId;
    
    // Fetch Lead
    const lead = await Lead.findOne({ _id: leadId, companyId });
    if (!lead || !lead.phone) {
      return NextResponse.json({ error: "Lead not found or has no phone number" }, { status: 404 });
    }

    // Fetch Twilio Config
    const settingQuery = companyId ? { key: 'twilio_config', companyId } : { key: 'twilio_config' };
    const setting = await SystemSetting.findOne(settingQuery);
    
    if (!setting || !setting.value || !setting.value.accountSid || !setting.value.authToken || !setting.value.fromNumber) {
      return NextResponse.json({ error: "Twilio is not configured. Please set it up in Integrations." }, { status: 400 });
    }

    const { accountSid, authToken, fromNumber } = setting.value;
    
    // Ensure fromNumber is formatted for WhatsApp if not standard SMS
    // Twilio WhatsApp numbers must be prefixed with 'whatsapp:'
    const from = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;
    const to = lead.phone.startsWith('whatsapp:') ? lead.phone : `whatsapp:${lead.phone}`;

    const client = twilio(accountSid, authToken);

    const twilioMessage = await client.messages.create({
      body: message,
      from,
      to,
    });

    // Log the message in CallLog
    const CallLog = (await import('@/modules/core/schemas/CallLog')).default;
    await CallLog.create({
      companyId,
      leadId: lead._id,
      channel: "WhatsApp",
      direction: "outbound",
      status: "completed",
      notes: message,
      fromNumber: from,
      externalId: twilioMessage.sid
    });

    return NextResponse.json({ success: true, messageId: twilioMessage.sid }, { status: 200 });

  } catch (error: any) {
    console.error("WhatsApp Send Error:", error);
    return NextResponse.json({ error: error.message || "Failed to send WhatsApp message" }, { status: 500 });
  }
}
