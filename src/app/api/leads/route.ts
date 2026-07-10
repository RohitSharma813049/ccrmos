import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';

export async function GET() {
  await dbConnect();
  try {
    const leads = await Lead.find({ status: { $ne: 'Archived' } }).sort({ createdAt: -1 });
    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newLead = await Lead.create(body);
    return NextResponse.json({ lead: newLead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
