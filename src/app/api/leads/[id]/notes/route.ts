import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';

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
      // TODO: In a real environment, trigger SES/Nodemailer here
    } else if (channel === "WhatsApp") {
      activityType = 'WhatsApp Sent';
      // TODO: In a real environment, trigger Twilio API here
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
