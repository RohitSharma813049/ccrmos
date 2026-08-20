import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailCampaign from '@/modules/marketing/schemas/EmailCampaign';
import Lead from '@/modules/leads/schemas/Lead';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { emailQueue } from '@/lib/queue';

const getBaseUrl = (req: Request) => {
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
};

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const { campaignId } = await req.json();

    const campaign = await EmailCampaign.findOne({ _id: campaignId, companyId: user.companyId });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Fetch leads to send to
    const query: any = { companyId: user.companyId, email: { $exists: true, $ne: "" }, status: { $ne: 'Archived' } };
    if (campaign.targetStageId) {
      query.stageId = campaign.targetStageId;
    }

    const leads = await Lead.find(query).select('email firstName lastName _id').lean();
    const baseUrl = getBaseUrl(req);

    let queuedCount = 0;
    for (const lead of leads) {
      // Inject tracking pixel
      const trackingPixelUrl = `${baseUrl}/api/tracking/pixel?c=${campaign._id}&l=${lead._id}`;
      const pixelHtml = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
      const personalizedHtml = campaign.htmlBody
        .replace(/{{firstName}}/g, lead.firstName || '')
        .replace(/{{lastName}}/g, lead.lastName || '') 
        + pixelHtml;

      await emailQueue.add("Send Campaign Email", {
        to: lead.email,
        subject: campaign.subject,
        html: personalizedHtml,
        campaignId: campaign._id,
        companyId: user.companyId
      });
      queuedCount++;
    }

    campaign.status = 'Sending';
    await campaign.save();

    return NextResponse.json({ message: "Campaign queued successfully", queuedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
