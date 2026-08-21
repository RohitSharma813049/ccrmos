import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import CallLog from '@/modules/core/schemas/CallLog';
import Lead from '@/modules/leads/schemas/Lead';
import { sendWhatsAppMessage } from '@/lib/whatsappClient';

// GET /api/whatsapp/chat?leadId=xxx
export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    const query: any = { companyId, channel: 'WhatsApp' };
    if (leadId) query.leadId = leadId;

    const messages = await CallLog.find(query).sort({ timestamp: 1 }).populate('leadId', 'firstName lastName phone');
    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/whatsapp/chat
// Body: { leadId: string, message: string }
export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    
    if (!companyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const { leadId, message } = await req.json();

    const lead = await Lead.findOne({ _id: leadId, companyId });
    if (!lead || !lead.phone) {
      return NextResponse.json({ error: 'Lead not found or has no phone number' }, { status: 404 });
    }

    // Send via Meta API
    await sendWhatsAppMessage(companyId, lead.phone, message);

    // Log the outbound message
    const log = await CallLog.create({
      companyId,
      leadId,
      channel: 'WhatsApp',
      direction: 'outbound',
      status: 'sent',
      notes: message,
      toNumber: lead.phone
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
