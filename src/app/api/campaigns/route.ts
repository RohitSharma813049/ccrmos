import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Campaign from '@/modules/campaigns/schemas/Campaign';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();
    
    const campaigns = await Campaign.find({ companyId }).sort({ createdAt: -1 });
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();
    
    const body = await req.json();
    
    const campaign = await Campaign.create({
      ...body,
      companyId,
      createdBy: user._id,
      status: 'Draft',
      stats: { totalTargeted: 0, successful: 0, failed: 0 }
    });
    
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    await Campaign.findOneAndDelete({ _id: id, companyId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
