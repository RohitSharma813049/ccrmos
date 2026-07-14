import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import { evaluateWorkflows } from "@/modules/automation/services/workflow.service";

// Endpoint to receive incoming WhatsApp messages (Webhooks)
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

    // Standard WhatsApp Business API or Twilio payload structure extraction
    // For demonstration, we'll try to extract common fields
    const phoneNumber = body.WaId || body.from || body.contacts?.[0]?.wa_id || null;
    const name = body.ProfileName || body.contacts?.[0]?.profile?.name || "WhatsApp Lead";
    const message = body.Body || body.messages?.[0]?.text?.body || "Opted in via WhatsApp";

    if (!phoneNumber) {
      return NextResponse.json({ success: true, message: "Webhook received but no valid lead data extracted." }, { status: 200 });
    }

    // Check if lead already exists
    let lead = await Lead.findOne({ companyId, phoneNumber });

    if (!lead) {
      lead = await Lead.create({
        companyId,
        firstName: name,
        phoneNumber,
        status: "New",
        source: "WhatsApp",
        customData: {
          lastMessage: message,
          whatsappOptIn: true,
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
      // Update existing lead with latest message
      lead.customData = { 
        ...lead.customData, 
        lastMessage: message, 
        whatsappOptIn: true,
        ...(projectId ? { projectId } : {}) 
      };
      await lead.save();
    }

    return NextResponse.json({ success: true, message: "WhatsApp lead processed." }, { status: 200 });

  } catch (error: any) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// Verification endpoint for WhatsApp webhook configuration
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = searchParams.get('hub.verify_token');

  // If you configure a specific verify token, validate it here
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ status: 'active' }, { status: 200 });
}
