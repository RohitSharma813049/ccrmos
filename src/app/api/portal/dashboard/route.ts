import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import Property from '@/modules/properties/schemas/Property';

// Simple middleware mock for client portal
async function requireClientPortalAuth(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/portal_session=client_portal_token_([^;]+)/);
  if (!match) {
    throw new Error("Unauthorized Portal Access");
  }
  return match[1]; // Returns the leadId
}

export async function GET(req: Request) {
  try {
    const leadId = await requireClientPortalAuth(req);
    await dbConnect();

    const lead = await Lead.findById(leadId)
      .populate('assignedUserId', 'name email phone avatarUrl')
      .populate('interestedPropertyId')
      .lean();

    if (!lead || !lead.hasPortalAccess) {
      return NextResponse.json({ error: "Portal access revoked" }, { status: 403 });
    }

    // Algorithmic Property Recommendation for the Client
    const recommendations = await Property.find({
      companyId: (lead as any).companyId,
      status: "Available",
      $or: [
        { price: { $lte: (lead as any).budget || 999999999 } },
        { location: (lead as any).preferredLocation || { $exists: true } }
      ]
    }).limit(3).lean();

    return NextResponse.json({
      client: {
        id: lead._id,
        name: `${(lead as any).firstName} ${(lead as any).lastName}`,
        email: (lead as any).email,
        phone: (lead as any).phone
      },
      agentContact: (lead as any).assignedUserId,
      primaryInterest: (lead as any).interestedPropertyId,
      recommendedProperties: recommendations
    });

  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
