import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import IntegrationSetting from '@/modules/integrations/schemas/IntegrationSetting';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Settings', 'view');
    await dbConnect();

    const setting = await IntegrationSetting.findOne({
      companyId: user.companyId,
      integrationType: 'Twilio',
      scopeType: 'COMPANY'
    });

    return NextResponse.json({ config: setting?.config || {} });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Settings', 'edit');
    await dbConnect();

    const { accountSid, authToken, fromNumber } = await req.json();

    const setting = await IntegrationSetting.findOneAndUpdate(
      { companyId: user.companyId, integrationType: 'Twilio', scopeType: 'COMPANY' },
      {
        scopeId: user.companyId,
        config: { accountSid, authToken, fromNumber },
        isActive: true
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
