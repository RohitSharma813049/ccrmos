import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailCampaign from '@/modules/marketing/schemas/EmailCampaign';

// A transparent 1x1 pixel GIF (Base64 encoded)
const PIXEL_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('c');
    const leadId = searchParams.get('l');

    if (campaignId && leadId) {
      await dbConnect();
      // Add leadId to openedBy array if not already present
      await EmailCampaign.updateOne(
        { _id: campaignId },
        { $addToSet: { openedBy: leadId } }
      );
    }
  } catch (error) {
    console.error("Pixel tracking error:", error);
  }

  // Always return the transparent pixel regardless of database errors
  return new NextResponse(PIXEL_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache'
    },
  });
}
