import { NextResponse } from "next/server";
import twilio from "twilio";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTwilioConfig } from "@/lib/twilio-config";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any)?.companyId || (session.user as any)?.impersonatedFounderId;
    const { accountSid, apiKeySid, apiKeySecret, twimlAppSid } = await getTwilioConfig(companyId);

    if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
      return NextResponse.json(
        { error: "Twilio credentials not configured. Please set them up in Integrations." },
        { status: 500 }
      );
    }

    const identity = session.user?.id || session.user?.email || "anonymous";

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true, // Allow incoming calls
    });

    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity,
    });
    token.addGrant(voiceGrant);

    return NextResponse.json({ token: token.toJwt(), identity }, { status: 200 });
  } catch (error: any) {
    console.error("Twilio Token Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
