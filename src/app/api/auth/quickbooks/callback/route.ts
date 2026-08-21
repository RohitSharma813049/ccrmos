import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const realmId = url.searchParams.get('realmId');

    if (!code || !state || !realmId) {
      return NextResponse.json({ error: 'Missing code, state, or realmId' }, { status: 400 });
    }

    let parsedState;
    try {
      parsedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
    } catch (e) {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    const { companyId } = parsedState;

    await dbConnect();
    const settingQuery = companyId ? { key: 'quickbooks_config', companyId } : { key: 'quickbooks_config' };
    const setting = await SystemSetting.findOne(settingQuery);

    if (!setting || !setting.value || !setting.value.clientId || !setting.value.clientSecret) {
      return NextResponse.json({ error: 'QuickBooks is not configured in settings.' }, { status: 400 });
    }

    const { clientId, clientSecret } = setting.value;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/quickbooks/callback`;
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
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
      return NextResponse.json({ error: data.reason || data.error_description || 'Failed to get QuickBooks token' }, { status: 400 });
    }

    // Save refresh token and realmId to SystemSetting
    setting.value = {
      ...setting.value,
      refreshToken: data.refresh_token,
      realmId
    };
    setting.markModified('value');
    await setting.save();

    return NextResponse.redirect(`${baseUrl}/dashboard/settings/integrations?quickbooks=success`);
  } catch (error: any) {
    console.error('Failed to handle QuickBooks callback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
