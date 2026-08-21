import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;

    const settingQuery = companyId ? { key: 'google_config', companyId } : { key: 'google_config' };
    const setting = await SystemSetting.findOne(settingQuery);

    if (!setting || !setting.value || !setting.value.clientId || !setting.value.clientSecret) {
      return NextResponse.json({ error: 'Google Workspace is not configured for this CRM instance.' }, { status: 400 });
    }

    const { clientId, clientSecret } = setting.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Ensures we get a refresh token
      prompt: 'consent', // Force consent prompt to guarantee refresh token is returned
      scope: scopes,
      state: user._id.toString(), // Pass the user ID so we know who they are when they return
    });

    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('Failed to initiate Google OAuth:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
