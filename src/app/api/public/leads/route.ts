import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ApiKey from '@/modules/settings/schemas/ApiKey';
import Lead from '@/modules/leads/schemas/Lead';

// CORS Headers for public access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  await dbConnect();
  
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401, headers: corsHeaders });
    }

    const keyString = authHeader.split(" ")[1];
    
    // Find valid active API key
    const apiKey = await ApiKey.findOne({ key: keyString, isActive: true });
    
    if (!apiKey) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401, headers: corsHeaders });
    }

    const body = await req.json();

    // Prepare lead data, forcing the founderId and companyId to match the API key
    const leadData = {
      ...body,
      founderId: apiKey.founderId,
      companyId: apiKey.companyId,
      createdBy: apiKey.founderId, // Assign creation to the founder
      source: body.source || "Public API",
    };

    const newLead = await Lead.create(leadData);
    
    return NextResponse.json({ 
      success: true, 
      message: "Lead created successfully",
      leadId: newLead.displayId
    }, { status: 201, headers: corsHeaders });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
