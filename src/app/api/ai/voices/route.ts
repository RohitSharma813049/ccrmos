import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Voice from '@/modules/ai/schemas/Voice';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = { ...buildTenantQuery(user) };

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    
    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    const voices = await Voice.find(queryObj).sort({ createdAt: -1 });
    
    return NextResponse.json({ voices });
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

    // Auto-generate voiceId for mock
    if (!body.voiceId) {
      body.voiceId = 'voice_' + Math.random().toString(36).substring(2, 10);
    }

    const newVoice = await Voice.create(body);
    return NextResponse.json({ voice: newVoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
