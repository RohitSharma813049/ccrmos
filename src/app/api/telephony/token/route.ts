import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  return NextResponse.json({ error: "Use /api/twilio/token instead" }, { status: 400 });
}
