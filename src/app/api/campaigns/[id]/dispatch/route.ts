import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import Campaign from '@/modules/campaigns/schemas/Campaign';
import Lead from '@/modules/leads/schemas/Lead';
import { sendGmail } from '@/lib/googleClient';
import { sendTwilioSMS } from '@/lib/twilioClient';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    
    if (!companyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const { id } = await params;
    const campaign = await Campaign.findOne({ _id: id, companyId });
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    if (campaign.status === 'Sending' || campaign.status === 'Completed') {
      return NextResponse.json({ error: 'Campaign already sent or sending' }, { status: 400 });
    }

    // Mark as sending
    campaign.status = 'Sending';
    await campaign.save();

    // Build Lead Query
    const query: any = { companyId };
    
    if (campaign.targetAudience.status && campaign.targetAudience.status.length > 0) {
      query.status = { $in: campaign.targetAudience.status };
    }
    if (campaign.targetAudience.tags && campaign.targetAudience.tags.length > 0) {
      query.tags = { $in: campaign.targetAudience.tags };
    }

    const leads = await Lead.find(query).lean();
    let targeted = 0;
    let successful = 0;
    let failed = 0;

    for (const lead of leads as any[]) {
      try {
        if (campaign.type === 'Email') {
          if (lead.email) {
            targeted++;
            await sendGmail(user._id.toString(), companyId.toString(), lead.email, campaign.subject || 'Campaign', campaign.content);
            successful++;
          }
        } else if (campaign.type === 'SMS') {
          if (lead.phone) {
            targeted++;
            const { sendTwilioSMS } = await import('@/lib/twilioClient');
            await sendTwilioSMS(lead.phone, campaign.content, companyId);
            successful++;
          }
        }
      } catch (e) {
        failed++;
        console.error(`Failed to send campaign to lead ${lead._id}`, e);
      }
    }

    campaign.status = 'Completed';
    campaign.sentAt = new Date();
    campaign.stats = { totalTargeted: targeted, successful, failed };
    await campaign.save();

    return NextResponse.json({ success: true, stats: campaign.stats });
  } catch (error: any) {
    console.error('Failed to dispatch campaign:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
