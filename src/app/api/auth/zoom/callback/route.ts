import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import User from '@/modules/users/schemas/User';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
    }

    let parsedState;
    try {
      parsedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
    } catch (e) {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    const { userId } = parsedState;

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const companyId = user.companyId || user.founderId;
    const settingQuery = companyId ? { key: 'zoom_config', companyId } : { key: 'zoom_config' };
    const setting = await SystemSetting.findOne(settingQuery);

    if (!setting || !setting.value || !setting.value.clientId || !setting.value.clientSecret) {
      return NextResponse.json({ error: 'Zoom is not configured in settings.' }, { status: 400 });
    }

    const { clientId, clientSecret } = setting.value;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/zoom/callback`;
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.reason || data.error_description || 'Failed to get Zoom token' }, { status: 400 });
    }

    // Save refresh token to user model
    user.zoomRefreshToken = data.refresh_token;
    await user.save();

    // Redirect back to integrations page
    return NextResponse.redirect(`${baseUrl}/dashboard/settings/integrations?zoom=success`);
  } catch (error: any) {
    console.error('Failed to handle Zoom callback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
