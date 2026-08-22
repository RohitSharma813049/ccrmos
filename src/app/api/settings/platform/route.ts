import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    
    // Only Platform Owners can access this route
    if (user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: 'Unauthorized: Platform Owners only' }, { status: 403 });
    }

    const keysToFetch = ['twilio_config', 'stripe_config', 'meta_config'];
    
    // companyId: null ensures we fetch global settings, not company-specific overrides
    const settings = await SystemSetting.find({ key: { $in: keysToFetch }, companyId: null }).lean();
    
    const config: Record<string, any> = {
      twilio_config: {},
      stripe_config: {},
      meta_config: {}
    };

    settings.forEach((setting: any) => {
      if (setting.key && setting.value) {
        config[setting.key] = setting.value;
      }
    });

    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    
    if (user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: 'Unauthorized: Platform Owners only' }, { status: 403 });
    }

    const body = await req.json();
    const { twilio_config, stripe_config, meta_config } = body;

    const updates = [
      { key: 'twilio_config', value: twilio_config || {} },
      { key: 'stripe_config', value: stripe_config || {} },
      { key: 'meta_config', value: meta_config || {} },
    ];

    for (const update of updates) {
      await SystemSetting.findOneAndUpdate(
        { key: update.key, companyId: null },
        { $set: { value: update.value } },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true, message: 'Platform credentials updated securely' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
