import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import { evaluateWorkflows } from "@/modules/automation/services/workflow.service";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const projectId = searchParams.get('projectId');
    
    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId query parameter for authentication" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // In a real Meta integration, body contains an entry[] array with changes[] containing value.leadgen_id.
    // We would then call Meta Graph API to fetch lead details using leadgen_id.
    // For this example or if using Zapier/Make.com, we assume parsed data:
    const leadData = body.entry?.[0]?.changes?.[0]?.value || body;
    
    // Attempt to extract typical Meta Lead Gen fields
    const email = leadData.email || leadData.Email || "";
    const name = leadData.full_name || leadData.name || leadData.Name || "Meta Lead";
    const phone = leadData.phone_number || leadData.Phone || "";
    const campaignId = leadData.campaign_id || "";

    if (!email && !phone) {
      return NextResponse.json({ success: true, message: "Webhook received but no valid contact info found." }, { status: 200 });
    }

    // Check if lead already exists by email or phone
    const query: any = { companyId };
    if (email) {
      query.email = email;
    } else if (phone) {
      query.phone = phone;
    }

    let lead = await Lead.findOne(query);

    if (!lead) {
      lead = await Lead.create({
        companyId,
        firstName: name,
        email,
        phone: phone,
        status: "New",
        source: "Meta Ads",
        customData: {
          metaCampaignId: campaignId,
          ...(projectId ? { projectId } : {}),
          _importDate: new Date().toISOString()
        }
      });

      // Trigger workflows
      evaluateWorkflows(companyId, "Lead Created", lead._id.toString(), {
        ...lead.toObject(),
        ...lead.customData
      }).catch(console.error);
    } else {
      // Opt to update existing or skip. For now, we skip creation to avoid duplicates
      console.log(`Lead from Meta already exists: ${lead._id}`);
    }

    return NextResponse.json({ success: true, message: "Meta lead processed." }, { status: 200 });

  } catch (error: any) {
    console.error("Meta Webhook Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// Verification endpoint for Meta webhook configuration
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = searchParams.get('hub.verify_token');

  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ status: 'active' }, { status: 200 });
}
