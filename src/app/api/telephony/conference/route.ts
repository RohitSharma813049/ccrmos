import { NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const room = params.get("Room") || "Support_Room";
    const mode = params.get("Mode") || "Standard"; // Whisper, Barge, Standard

    const response = new VoiceResponse();
    const dial = response.dial();

    // Mode handling for supervisors
    let muted = false;
    let beep: any = "false";
    let coach = "";

    if (mode === "Whisper") {
      // The supervisor is muted to the customer, but the agent can hear them.
      // In Twilio this uses the "coach" attribute pointing to the agent's CallSid
      const agentCallSid = params.get("AgentCallSid");
      if (agentCallSid) {
        coach = agentCallSid;
        muted = false; // Twilio handles muting to others if coach is set
      } else {
        muted = true; // Fallback: just mute them in the conference
      }
    } else if (mode === "Listen") {
      muted = true;
    } else if (mode === "Barge") {
      muted = false;
      beep = "true";
    }

    dial.conference({
      beep,
      startConferenceOnEnter: true,
      endConferenceOnExit: mode !== "Listen" && mode !== "Whisper" && mode !== "Barge",
      muted,
      ...(coach ? { coach } : {})
    }, room);

    return new NextResponse(response.toString(), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error: any) {
    console.error("Conference TwiML Error:", error);
    return NextResponse.json({ error: "Failed to generate TwiML" }, { status: 500 });
  }
}
