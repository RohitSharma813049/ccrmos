import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    
    // Ensure the user has permission to create leads
    await requirePermission('Leads', 'create');

    const body = await req.json();
    const { leads } = body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "No leads provided for import." }, { status: 400 });
    }

    const companyId = user.companyId;
    const founderId = user.hierarchyLevel === 2 ? user.id : user.founderId;

    // Prepare leads for insertion
    const docsToInsert = leads.map((lead: any) => ({
      ...lead,
      companyId,
      founderId,
      status: lead.status || "New", // fallback status
      createdAt: new Date(),
    }));

    // Bulk insert the leads
    const inserted = await Lead.insertMany(docsToInsert);

    return NextResponse.json({ 
      message: 'Imported successfully', 
      count: inserted.length 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
