import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const body = await req.json();
    const { text, duration_seconds } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text prompt is required' }, { status: 400 });
    }

    let setting = await SystemSetting.findOne({ key: 'elevenlabs_api_key', companyId: user.companyId });
    if (!setting && user.companyId) {
      setting = await SystemSetting.findOne({ key: 'elevenlabs_api_key', companyId: null });
    }
    const apiKey = setting?.value || process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      // Return a 503 Service Unavailable if API key is not configured, allowing the frontend to mock if desired
      return NextResponse.json({ error: 'ElevenLabs API key is not configured' }, { status: 503 });
    }

    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        duration_seconds: duration_seconds || 5,
        prompt_influence: 0.3
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`ElevenLabs API Error: ${err.detail?.status || response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="sound-effect.mp3"'
      }
    });

  } catch (error: any) {
    console.error("Sound Effect Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
