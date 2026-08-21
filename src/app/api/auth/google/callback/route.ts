import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import dbConnect from '@/lib/db';
import User from '@/modules/users/schemas/User';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const userId = url.searchParams.get('state');

    if (!code || !userId) {
      return NextResponse.json({ error: 'Missing code or state in Google OAuth callback' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const companyId = user.companyId || user.founderId;
    const settingQuery = companyId ? { key: 'google_config', companyId } : { key: 'google_config' };
    const setting = await SystemSetting.findOne(settingQuery);

    if (!setting || !setting.value || !setting.value.clientId || !setting.value.clientSecret) {
      return NextResponse.json({ error: 'Google Workspace is not configured' }, { status: 400 });
    }

    const { clientId, clientSecret } = setting.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // We explicitly requested access_type: offline and prompt: consent, so refresh_token should be present
    if (tokens.refresh_token) {
      user.googleRefreshToken = tokens.refresh_token;
      await user.save();
    } else if (!user.googleRefreshToken) {
      // If no refresh token is provided and we didn't already have one, that's a problem.
      console.warn("No refresh token returned from Google OAuth, and user doesn't have one.");
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/settings/integrations?google_success=true`);
  } catch (error: any) {
    console.error('Failed to handle Google OAuth callback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
