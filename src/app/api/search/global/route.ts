import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import Property from '@/modules/properties/schemas/Property';
import User from '@/modules/users/schemas/User';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const regex = new RegExp(q, 'i');

    // Run searches concurrently using Promise.all for speed
    const [leads, properties, users] = await Promise.all([
      Lead.find({ 
        companyId: user.companyId,
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
          { phone: regex }
        ]
      })
      .select('firstName lastName email phone status')
      .limit(5)
      .lean(),

      Property.find({ 
        companyId: user.companyId,
        $or: [
          { title: regex },
          { location: regex }
        ]
      })
      .select('title type status location price')
      .limit(5)
      .lean(),

      User.find({ 
        companyId: user.companyId,
        $or: [
          { name: regex },
          { email: regex }
        ]
      })
      .select('name email hierarchyLevel')
      .limit(5)
      .lean()
    ]);

    // Map results into a unified schema for a Command-K frontend menu
    const unifiedResults = [
      ...leads.map(l => ({ id: l._id, type: 'Lead', title: `${l.firstName} ${l.lastName}`, subtitle: l.email, url: `/leads/${l._id}` })),
      ...properties.map(p => ({ id: p._id, type: 'Property', title: p.title, subtitle: p.location, url: `/properties/${p._id}` })),
      ...users.map(u => ({ id: u._id, type: 'User', title: u.name || 'Unknown', subtitle: u.email, url: `/settings/users/${u._id}` }))
    ];

    return NextResponse.json({ results: unifiedResults });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
