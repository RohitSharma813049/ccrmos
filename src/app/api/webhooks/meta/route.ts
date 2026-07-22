import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lead from "@/modules/leads/schemas/Lead";
import { evaluateWorkflows } from "@/modules/automation/services/workflow.service";

// Verify Webhook for Meta (Facebook)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return new NextResponse(challenge, { status: 200 });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
}

// Handle incoming lead data from Meta
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "page") {
      await dbConnect();

      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.item === "leadgen") {
            const leadId = change.value.leadgen_id;
            const formId = change.value.form_id;
            
            // In a real production app, you would now make a GET request to the Graph API 
            // using the leadId and a Page Access Token to fetch the actual lead details (name, email, phone).
            // Example: GET https://graph.facebook.com/v19.0/{leadgen_id}?access_token={access_token}
            // For now, we will mock the fetched data or store the raw event.

            console.log(`Received Meta Lead: ${leadId} from Form: ${formId}`);

            // Mocking the fetched lead data
            const newLead = await Lead.create({
              firstName: "Meta",
              lastName: "Lead",
              email: `meta_${leadId}@example.com`,
              source: "Meta Ads",
              status: "New",
              customData: {
                metaLeadId: leadId,
                metaFormId: formId
              },
              activities: [{
                type: "Creation",
                description: "Lead was fetched via Meta Webhook.",
                timestamp: new Date()
              }]
            });

            // Trigger workflows (e.g. notifications)
            // Note: In a multi-tenant system, you'd need a way to map the Meta Page ID to your Company ID.
            evaluateWorkflows(newLead.companyId?.toString() || "", "Lead Created", newLead._id.toString(), {
              ...newLead.toObject(),
              ...newLead.customData
            }).catch(console.error);
          }
        }
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ error: "Not a page event" }, { status: 404 });
  } catch (error) {
    console.error("Meta Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
