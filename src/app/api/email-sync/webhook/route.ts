import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailSyncConfig from '@/modules/core/schemas/EmailSyncConfig';
import Lead from '@/modules/leads/schemas/Lead';

// This webhook is triggered by Google Pub/Sub, Microsoft Graph webhooks, or Nylas
export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // Example Payload from an email webhook provider
    const { toEmail, fromEmail, subject, body, receivedAt } = await req.json();

    if (!toEmail || !fromEmail || !body) {
      return NextResponse.json({ error: "Invalid email payload" }, { status: 400 });
    }

    // 1. Check if the "To" email belongs to one of our active agents
    const config = await EmailSyncConfig.findOne({ emailAddress: toEmail, syncStatus: "ACTIVE" });
    
    if (!config) {
      // Not an email address we are syncing. Ignore.
      return NextResponse.json({ message: "Ignored: Inbox not tracked" });
    }

    // 2. We found the agent. Now check if the "From" email belongs to a Lead!
    const lead = await Lead.findOne({ 
      companyId: config.companyId, 
      email: fromEmail.toLowerCase() 
    });

    if (lead) {
      // 3. MAGIC! The lead replied to the agent. Automatically log it to the timeline.
      await Lead.findByIdAndUpdate(lead._id, {
        $push: {
          activities: {
            type: "EMAIL",
            description: `Email Received: ${subject || "No Subject"}\n\n${body.substring(0, 500)}...`,
            timestamp: new Date(receivedAt || Date.now())
          }
        },
        $set: { lastFollowUpDate: new Date() } // Automatically bump follow up date
      });

      // Update sync timestamp
      config.lastSyncedAt = new Date();
      await config.save();

      return NextResponse.json({ message: "Email logged to Lead timeline", leadId: lead._id });
    } else {
      // The sender is not a lead in the CRM. We just ignore it so we don't spam the database.
      return NextResponse.json({ message: "Ignored: Sender is not a Lead" });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
