import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { getTwilioConfig } from '@/lib/twilio-config';

// This endpoint receives call status updates from Twilio (e.g., when a call ends or fails)
export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    
    const callStatus = params.get("CallStatus");
    const to = params.get("To");
    const from = params.get("From");
    const duration = params.get("CallDuration");

    // If the TL/Agent didn't answer (no-answer, busy, failed)
    if (callStatus === "no-answer" || callStatus === "busy" || callStatus === "failed") {
      console.log(`Call to ${to} failed/no-answer. Triggering fallback.`);
      
      // Look up fallback agent or team leader from database
      // For this example, we'll assume we look it up and send a WhatsApp message to the fallback agent
      
      const twilioConfig = await getTwilioConfig();
      const accountSid = twilioConfig.accountSid;
      const authToken = twilioConfig.authToken;
      const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER || twilioConfig.phoneNumber;

      if (accountSid && authToken && whatsappFrom) {
        const client = twilio(accountSid, authToken);
        
        // Let's assume we have a designated fallback number
        const fallbackNumber = process.env.FALLBACK_WHATSAPP_NUMBER || to; // Replace with actual logic
        
        if (fallbackNumber) {
          await client.messages.create({
            body: `Urgent: You missed a lead call from ${from}. Please call them back immediately.`,
            from: whatsappFrom,
            to: `whatsapp:${fallbackNumber}`
          });
          console.log("Fallback WhatsApp message sent to", fallbackNumber);
        }
      }
    }

    // You can also log the call duration to the Lead document if it completed successfully
    if (callStatus === "completed" && duration) {
      console.log(`Call completed. Duration: ${duration}s. Logging to DB...`);
      // Update Lead activities with Call Duration...
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    console.error("Twilio Status Webhook Error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
