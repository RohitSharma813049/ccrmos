import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ApiKey from '@/modules/core/schemas/ApiKey';
import Lead from '@/modules/leads/schemas/Lead';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized: Missing Bearer Token" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    await dbConnect();

    const apiKey = await ApiKey.findOne({ key: token, isActive: true });
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized: Invalid or inactive API Key" }, { status: 401 });
    }

    // Update last used timestamp
    apiKey.lastUsedAt = new Date();
    await apiKey.save();

    const data = await req.json();

    // Required basic fields for Lead
    if (!data.firstName || !data.lastName || !data.email) {
       return NextResponse.json({ error: "Missing required fields: firstName, lastName, email" }, { status: 400 });
    }

    const lead = await Lead.create({
      companyId: apiKey.companyId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      source: data.source || "API Integration",
      budget: data.budget,
      currency: data.currency || "USD",
      customData: data.customData || {}
    });

    return NextResponse.json({ message: "Lead created successfully", leadId: lead._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
