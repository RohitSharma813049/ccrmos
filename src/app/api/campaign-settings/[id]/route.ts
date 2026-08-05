import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CampaignSetting from '@/modules/marketing/schemas/CampaignSetting';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const body = await req.json();
    const { _id, ...updateData } = body;

    const setting = await CampaignSetting.findOneAndUpdate(
      { _id: params.id, ...buildTenantQuery(user) },
      updateData,
      { new: true }
    );

    if (!setting) return NextResponse.json({ error: "Campaign Setting not found" }, { status: 404 });

    return NextResponse.json({ setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const setting = await CampaignSetting.findOneAndDelete({ 
      _id: params.id, 
      ...buildTenantQuery(user) 
    });

    if (!setting) return NextResponse.json({ error: "Campaign Setting not found" }, { status: 404 });

    return NextResponse.json({ message: "Campaign Setting deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
