import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CampaignSetting from '@/modules/marketing/schemas/CampaignSetting';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = { ...buildTenantQuery(user) };

    const settings = await CampaignSetting.find(queryObj)
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();

    if (user) {
      body.companyId = user.companyId;
    }

    const newSetting = await CampaignSetting.create(body);
    return NextResponse.json({ setting: newSetting }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
