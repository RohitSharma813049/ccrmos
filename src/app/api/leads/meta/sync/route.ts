import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CampaignSetting from '@/modules/marketing/schemas/CampaignSetting';
import Lead from '@/modules/leads/schemas/Lead';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    const queryObj = { ...buildTenantQuery(user) };

    // Get FB Config
    const setting = await SystemSetting.findOne({ 
      key: 'fb_leads_config', 
      companyId: companyId 
    });

    if (!setting || !setting.value || !setting.value.accessToken) {
      return NextResponse.json({ error: "Meta API Access Token not configured." }, { status: 400 });
    }

    const { accessToken } = setting.value;

    // Fetch all campaigns for this company (assuming 'name' is the Form ID)
    const campaigns = await CampaignSetting.find(queryObj);
    let totalImported = 0;
    
    for (const campaign of campaigns) {
      const formId = campaign.name; // In this setup, Campaign name is mapping to FB Form ID.
      
      try {
        const fbRes = await fetch(`https://graph.facebook.com/v19.0/${formId}/leads?access_token=${accessToken}`);
        
        if (!fbRes.ok) {
          console.error(`FB API Error for form ${formId}:`, await fbRes.text());
          continue; // Skip this form if it fails (e.g. invalid form id)
        }

        const data = await fbRes.json();
        const fbLeads = data.data || [];

        let newLeadsCount = 0;

        for (const fbLead of fbLeads) {
          // Check if lead already exists
          const exists = await Lead.findOne({
            companyId: companyId,
            source: 'Meta',
            'customData.fbLeadId': fbLead.id
          });

          if (!exists) {
            // Extract standard fields
            let firstName = 'Unknown';
            let lastName = 'Lead';
            let email = '';
            let phone = '';
            const customData: any = {
              fbLeadId: fbLead.id,
              formId: formId,
              createdTime: fbLead.created_time
            };

            if (fbLead.field_data) {
              for (const field of fbLead.field_data) {
                const val = field.values && field.values.length > 0 ? field.values[0] : '';
                if (field.name === 'first_name') firstName = val;
                else if (field.name === 'last_name') lastName = val;
                else if (field.name === 'full_name') {
                  const parts = val.split(' ');
                  firstName = parts[0];
                  lastName = parts.slice(1).join(' ') || 'Lead';
                }
                else if (field.name === 'email') email = val;
                else if (field.name === 'phone_number') phone = val;
                else {
                  customData[field.name] = val;
                }
              }
            }

            // Create lead
            await Lead.create({
              firstName,
              lastName,
              email,
              phone,
              source: 'Meta',
              status: 'New', // Default status
              companyId,
              customData
            });

            newLeadsCount++;
            totalImported++;
          }
        }

        // Update campaign processed count and last synced
        await CampaignSetting.findByIdAndUpdate(campaign._id, {
          $inc: { processed: newLeadsCount },
          lastSynced: new Date()
        });

      } catch (err) {
        console.error(`Error syncing form ${formId}:`, err);
      }
    }

    return NextResponse.json({ success: true, imported: totalImported });
  } catch (error: any) {
    console.error("Meta Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
