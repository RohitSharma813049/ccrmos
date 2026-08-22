import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // companyId
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=${error}`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=Invalid_OAuth_Callback`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google Token Exchange Error:", tokenData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=Token_Exchange_Failed`);
    }

    await dbConnect();

    // Save token to SystemSettings
    const settingQuery = { key: 'google_calendar_config', companyId: state };
    let setting = await SystemSetting.findOne(settingQuery);

    if (!setting) {
      setting = new SystemSetting({
        companyId: state,
        key: 'google_calendar_config',
        value: tokenData,
      });
    } else {
      // If refresh_token is missing in new response, preserve the old one
      setting.value = {
        ...setting.value,
        access_token: tokenData.access_token,
        expiry_date: Date.now() + (tokenData.expires_in * 1000),
        ...(tokenData.refresh_token && { refresh_token: tokenData.refresh_token })
      };
      setting.markModified('value');
    }

    await setting.save();

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=google_connected`);
  } catch (error: any) {
    console.error("Google Callback Error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=Internal_Server_Error`);
  }
}
