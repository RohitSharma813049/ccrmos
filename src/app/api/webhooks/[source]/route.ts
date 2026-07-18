import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import User from '@/modules/users/schemas/User';

export async function POST(req: Request, { params }: { params: { source: string } }) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId query parameter for integration." }, { status: 400 });
    }

    // Find the founder of this company to map the lead properly
    // We assume the first admin/founder of this company is the owner
    const founder = await User.findOne({ companyId, hierarchyLevel: 2 });
    
    if (!founder) {
      return NextResponse.json({ error: "Invalid companyId or company has no founder." }, { status: 400 });
    }

    const body = await req.json();
    
    // We expect the payload from Zapier/Facebook/etc to have some lead data.
    // If it's a generic array, we insert many. If it's a single object, we insert one.
    
    const dataArr = Array.isArray(body) ? body : [body];
    
    const docsToInsert = dataArr.map((item: any) => ({
      firstName: item.firstName || item.first_name || item.name?.split(' ')[0] || 'Unknown',
      lastName: item.lastName || item.last_name || item.name?.split(' ').slice(1).join(' ') || '',
      email: item.email || null,
      phone: item.phone || item.phone_number || null,
      source: params.source || 'webhook', // 'meta', 'whatsapp', 'generic'
      status: 'New',
      companyId: companyId,
      founderId: founder._id,
      customData: {
        ...item
      }
    }));

    const inserted = await Lead.insertMany(docsToInsert);

    return NextResponse.json({ 
      message: 'Integration payload received successfully', 
      insertedCount: inserted.length 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Webhook integration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
