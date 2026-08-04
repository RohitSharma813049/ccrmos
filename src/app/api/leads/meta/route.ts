import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CampaignSetting from '@/modules/marketing/schemas/CampaignSetting';
import Lead from '@/modules/leads/schemas/Lead';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = { ...buildTenantQuery(user) };

    // Fetch all campaigns for this company
    const campaigns = await CampaignSetting.find(queryObj).sort({ createdAt: -1 });
    
    // For each campaign, fetch the associated leads
    const campaignsWithLeads = await Promise.all(campaigns.map(async (campaign) => {
      // Assuming 'name' stores the Form ID or Campaign Name
      const leads = await Lead.find({
        ...queryObj,
        source: 'Meta',
        'customData.formId': campaign.name
      }).sort({ createdAt: -1 });

      return {
        _id: campaign._id,
        name: campaign.name,
        processed: campaign.processed,
        lastSynced: campaign.lastSynced,
        leads
      };
    }));
    
    return NextResponse.json({ campaigns: campaignsWithLeads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
