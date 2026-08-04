import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GlobalRole from '@/modules/owner/schemas/GlobalRole';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const roles = await GlobalRole.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json({ data: roles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: 'Only Platform Owner can create roles' }, { status: 403 });
    }

    const body = await req.json();
    const newRole = await GlobalRole.create(body);
    return NextResponse.json({ data: newRole }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
