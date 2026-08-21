import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const companyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!companyId) return new NextResponse('Company ID not found', { status: 400 });

    await dbConnect();
    const setting = await SystemSetting.findOne({ key: 'whatsapp_meta', companyId });
    
    return NextResponse.json({
      config: setting?.value || null
    });
  } catch (error) {
    console.error('Error fetching WhatsApp config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const companyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!companyId) return new NextResponse('Company ID not found', { status: 400 });

    const body = await req.json();
    
    await dbConnect();
    
    await SystemSetting.findOneAndUpdate(
      { key: 'whatsapp_meta', companyId },
      { value: body },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving WhatsApp config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
