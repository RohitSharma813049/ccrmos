import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Property from '@/modules/properties/schemas/Property';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radiusInMeters = parseInt(searchParams.get('radius') || '5000'); // Default 5km

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: "Valid lat and lng query parameters are required" }, { status: 400 });
    }

    // Build the GeoJSON query using the powerful $near operator
    // MongoDB requires coordinates in [longitude, latitude] format
    const properties = await Property.find({
      companyId: user.companyId,
      geo: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: radiusInMeters // MongoDB calculates physical distance on the sphere
        }
      },
      status: { $in: ["Available", "Rented"] } // Ignore sold/off-market for map search
    }).limit(100).lean();

    return NextResponse.json({ 
      count: properties.length,
      radiusInMeters,
      center: { lat, lng },
      properties 
    });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
