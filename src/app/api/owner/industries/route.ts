import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Industry from '@/modules/settings/schemas/Industry';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const industries = await Industry.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json({ data: industries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: 'Only Platform Owner can create industries' }, { status: 403 });
    }

    const body = await req.json();
    const newIndustry = await Industry.create(body);
    return NextResponse.json({ data: newIndustry }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
