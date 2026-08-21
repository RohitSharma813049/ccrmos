import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    
    const settingQuery = companyId ? { key: 'quickbooks_config', companyId } : { key: 'quickbooks_config' };
    const setting = await SystemSetting.findOne(settingQuery);

    if (!setting || !setting.value || !setting.value.clientId) {
      return NextResponse.json({ error: 'QuickBooks is not configured in settings.' }, { status: 400 });
    }

    const { clientId } = setting.value;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/quickbooks/callback`;

    const state = Buffer.from(JSON.stringify({ companyId: companyId?.toString() })).toString('base64');
    
    // Intuit OAuth 2.0 Auth URL
    const url = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('Failed to initiate QuickBooks auth:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
