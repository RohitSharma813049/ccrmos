import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import Campaign from '@/modules/campaigns/schemas/Campaign';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    
    if (!companyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const campaigns = await Campaign.find({ companyId }).sort({ createdAt: -1 });
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('Failed to get campaigns:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    
    if (!companyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const body = await req.json();
    
    const campaign = new Campaign({
      ...body,
      companyId,
      createdBy: user._id
    });

    await campaign.save();

    return NextResponse.json({ campaign });
  } catch (error: any) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
