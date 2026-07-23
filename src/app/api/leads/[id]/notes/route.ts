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
    const { message } = await req.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const lead = await Lead.findOne({ _id: id, ...buildTenantQuery(user) });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    
    if (!lead.activities) lead.activities = [];
    lead.activities.push({
      type: 'Note',
      description: message,
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
