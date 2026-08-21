import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';
import { sendWhatsAppMessage } from '@/lib/whatsappClient';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'edit');
    const { id } = await params;
    const { message, attachmentUrl, channel = "Note", subject = "" } = await req.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const lead = await Lead.findOne({ _id: id, ...buildTenantQuery(user) });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    
    if (!lead.activities) lead.activities = [];
    
    let activityType = attachmentUrl ? 'Note with Attachment' : 'Note';
    let activityDescription = message;

    if (channel === "Email") {
      activityType = 'Email Sent';
      activityDescription = subject ? `Subject: ${subject}\n\n${message}` : message;
      // TODO: Simulated Email send logic
      console.log(`[SMTP SIMULATION] Sending email to ${lead.email} with subject: ${subject}`);
    } else if (channel === "WhatsApp") {
      activityType = 'WhatsApp Sent';
      try {
        const phone = lead.phone || lead.customData?.phoneNumber || lead.customData?.phone;
        if (!phone) {
          return NextResponse.json({ error: 'Lead does not have a valid phone number' }, { status: 400 });
        }
        await sendWhatsAppMessage(user.companyId || user.impersonatedFounderId, phone, message);
      } catch (waError: any) {
        return NextResponse.json({ error: waError.message || 'Failed to send WhatsApp message' }, { status: 500 });
      }
    } else if (channel === "Call") {
      activityType = 'Call Logged';
      // message will contain call details (duration, status, etc)
    }

    lead.activities.push({
      type: activityType,
      description: activityDescription,
      attachmentUrl: attachmentUrl || undefined,
      timestamp: new Date()
    });

    if (!lead.customData) lead.customData = {};
    lead.customData.lastMessage = message;

    await lead.save();

    return NextResponse.json({ success: true, activities: lead.activities, customData: lead.customData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
