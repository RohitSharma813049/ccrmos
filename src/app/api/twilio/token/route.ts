import { NextResponse } from 'next/server';
import twilio from 'twilio';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    const settingQuery = companyId ? { key: 'twilio_config', companyId } : { key: 'twilio_config' };
    
    let setting = await SystemSetting.findOne(settingQuery);
    if (!setting || !setting.value || !setting.value.accountSid || !setting.value.authToken) {
      return NextResponse.json({ error: 'Twilio is not configured.' }, { status: 400 });
    }

    const { accountSid, authToken } = setting.value;
    const client = twilio(accountSid, authToken);
    
    let twimlAppSid = setting.value.twimlAppSid;

    // Auto-create a TwiML App if it doesn't exist so the user doesn't have to manually configure it
    if (!twimlAppSid) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Needs to be a public URL for production
      const app = await client.applications.create({
        friendlyName: 'CRM In-Browser Dialer',
        voiceUrl: `${baseUrl}/api/twilio/voice`,
      });
      twimlAppSid = app.sid;
      
      setting.value = { ...setting.value, twimlAppSid };
      setting.markModified('value');
      await setting.save();
    }

    // Generate Access Token
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // Provide a random API Key and Secret, or we can use the account SID. Actually, AccessToken requires a Twilio API Key, not just Account Auth Token.
    // Wait, Twilio requires an API Key SID and API Key Secret to create a token.
    // If we don't have one, we can generate one dynamically too!
    
    let apiKeySid = setting.value.apiKeySid;
    let apiKeySecret = setting.value.apiKeySecret;
    
    if (!apiKeySid || !apiKeySecret) {
      const newKey = await client.newKeys.create({ friendlyName: 'CRM Dialer API Key' });
      apiKeySid = newKey.sid;
      apiKeySecret = newKey.secret;
      
      setting.value = { ...setting.value, apiKeySid, apiKeySecret };
      setting.markModified('value');
      await setting.save();
    }

    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity: user._id.toString()
    });

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: false, // For now, only outgoing
    });

    token.addGrant(voiceGrant);

    return NextResponse.json({ token: token.toJwt() });
  } catch (error: any) {
    console.error('Failed to generate Twilio Token:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
