import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SystemSetting from "@/modules/settings/schemas/SystemSetting";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    await dbConnect();
    
    // Attempt to get tenant-specific config first
    let setting = await SystemSetting.findOne({ key: "twilio_config", companyId });
    if (!setting && (session.user as any).hierarchyLevel === 1) {
       // If platform owner, try global config
       setting = await SystemSetting.findOne({ key: "twilio_config", companyId: null });
    }

    return NextResponse.json({ value: setting?.value || {} });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    let companyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    
    // If platform owner, save as global
    if ((session.user as any).hierarchyLevel === 1) {
      companyId = null;
    }

    await dbConnect();
    const updated = await SystemSetting.findOneAndUpdate(
      { key: "twilio_config", companyId },
      { key: "twilio_config", companyId, value: body.value },
      { upsert: true, new: true }
    );

    return NextResponse.json({ value: updated.value });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
