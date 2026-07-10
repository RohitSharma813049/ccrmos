import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request, { params }: { params: { key: string } }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const key = params.key;

    // For Platform Owners (Level 1), they manage global settings (companyId = null)
    // For other tenants, we look up settings specific to their companyId, falling back to global if not found
    const companyId = user.hierarchyLevel === 1 ? null : user.companyId;

    let setting = await SystemSetting.findOne({ key, companyId });
    if (!setting && companyId !== null) {
       // fallback to global if not found for tenant
       setting = await SystemSetting.findOne({ key, companyId: null });
    }

    return NextResponse.json({ value: setting ? setting.value : null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { key: string } }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const key = params.key;
    const body = await req.json();
    
    // Determine scope based on user level or request body (if they explicitly pass global=true)
    const isGlobalReq = body.global === true && user.hierarchyLevel === 1;
    const companyId = isGlobalReq ? null : user.companyId;

    let setting = await SystemSetting.findOne({ key, companyId });

    if (setting) {
      setting.value = body.value;
      await setting.save();
    } else {
      setting = await SystemSetting.create({
        key,
        companyId,
        value: body.value
      });
    }

    return NextResponse.json({ setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
