import { NextResponse } from "next/server";
import twilio from "twilio";
import { getTwilioConfig } from "@/lib/twilio-config";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const to = params.get("To");
    
    // You could pass custom parameters like From, LeadId, etc.
    // e.g. using a customized prefix in `To` if you were dialing from the browser
    
    // Fetch global twilio config to retrieve the phone number
    const twilioConfig = await getTwilioConfig();
    const defaultCallerId = twilioConfig.phoneNumber || "+1234567890";
    
    const response = new VoiceResponse();
    
    if (to) {
      // If the destination is a phone number, use the <Dial> tag
      const dial = response.dial({
        callerId: defaultCallerId, // Must be a verified Twilio number
        action: "/api/telephony/call/status", // To catch if it failed/no answer
      });

      // Simple regex to check if it's a phone number or a client ID
      const isPhoneNumber = /^[\d\+\-\(\) ]+$/.test(to);
      if (isPhoneNumber) {
        dial.number(to);
      } else {
        // Dial another client by identity
        dial.client(to);
      }
    } else {
      response.say("Thanks for calling. Please wait for an agent.");
    }
    
    return new NextResponse(response.toString(), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error: any) {
    console.error("Twilio Call Error:", error);
    return NextResponse.json({ error: "Failed to generate TwiML" }, { status: 500 });
  }
}
