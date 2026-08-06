import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MediaLibrary from '@/modules/ai/schemas/MediaLibrary';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = { ...buildTenantQuery(user) };

    const media = await MediaLibrary.find(queryObj).sort({ createdAt: -1 });
    
    return NextResponse.json({ media });
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
      body.companyId = user.companyId || (user.hierarchyLevel === 2 ? user.id : user.founderId) || user.id;
      body.founderId = user.hierarchyLevel === 2 ? user.id : user.founderId || user.id;
    }

    const newMedia = await MediaLibrary.create(body);
    return NextResponse.json({ media: newMedia }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
