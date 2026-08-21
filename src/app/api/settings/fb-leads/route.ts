import { NextResponse } from 'next/server';
import { getSession } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import SystemSetting from "@/modules/settings/schemas/SystemSetting";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.companyId || user.impersonatedFounderId;
    if (!companyId) return NextResponse.json({ error: "Company ID required" }, { status: 400 });

    await dbConnect();
    
    const setting = await SystemSetting.findOne({ 
      key: 'fb_leads_config', 
      companyId: companyId 
    });

    if (!setting) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({ config: setting.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.companyId || user.impersonatedFounderId;
    if (!companyId) return NextResponse.json({ error: "Company ID required" }, { status: 400 });

    const body = await req.json();
    const { accessToken, verifyToken } = body;

    await dbConnect();

    const updatedSetting = await SystemSetting.findOneAndUpdate(
      { key: 'fb_leads_config', companyId: companyId },
      { 
        $set: { 
          value: { 
            accessToken: accessToken || '',
            verifyToken: verifyToken || ''
          } 
        } 
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, config: updatedSetting.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
