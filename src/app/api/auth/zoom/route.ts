import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    
    const settingQuery = companyId ? { key: 'zoom_config', companyId } : { key: 'zoom_config' };
    const setting = await SystemSetting.findOne(settingQuery);

    if (!setting || !setting.value || !setting.value.clientId) {
      return NextResponse.json({ error: 'Zoom is not configured in settings.' }, { status: 400 });
    }

    const { clientId } = setting.value;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/zoom/callback`;

    // Construct the Zoom authorization URL
    // We pass the userId via the state parameter so we can associate the token with the correct user on callback
    const state = Buffer.from(JSON.stringify({ userId: user._id.toString() })).toString('base64');
    
    const url = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('Failed to initiate Zoom auth:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
