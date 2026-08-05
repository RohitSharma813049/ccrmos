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
    
    // Voice schema doesn't have founderId, only companyId. 
    // Remove founderId to prevent strictQuery errors in Mongoose 9.
    if (queryObj.founderId) {
      delete queryObj.founderId;
    }

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
    
    // Parse FormData
    const formData = await req.formData();
    const name = formData.get('name') as string || '';
    const category = formData.get('category') as string || 'Custom';
    const description = formData.get('description') as string || '';
    const file = formData.get('file') as File | null;

    let voiceId = '';

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

    if (elevenLabsKey && file) {
      // Create a FormData to send to ElevenLabs
      const elevenLabsData = new FormData();
      elevenLabsData.append('name', name);
      elevenLabsData.append('description', description);
      
      // Need to convert the File object to a Blob and append with a filename
      // The Next.js File object works seamlessly with fetch's FormData
      elevenLabsData.append('files', file);
      
      const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsKey
        },
        body: elevenLabsData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`ElevenLabs Error: ${errorData.detail?.status || response.statusText}`);
      }

      const data = await response.json();
      voiceId = data.voice_id;
    } else {
      // Fallback to mock voiceId
      voiceId = 'voice_' + Math.random().toString(36).substring(2, 10);
    }

    const body: any = {
      name,
      category,
      description,
      voiceId
    };

    if (user) {
      body.companyId = user.companyId;
    }

    const newVoice = await Voice.create(body);
    return NextResponse.json({ voice: newVoice }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding voice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
