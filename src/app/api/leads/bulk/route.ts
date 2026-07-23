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

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'update');

    const body = await req.json();
    const { ids, data } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No lead IDs provided for update." }, { status: 400 });
    }

    const tenantQuery = user.hierarchyLevel === 2 
      ? { companyId: user.companyId }
      : { founderId: user.founderId };

    const updated = await Lead.updateMany(
      { _id: { $in: ids }, ...tenantQuery },
      { $set: data }
    );

    return NextResponse.json({ 
      message: 'Updated successfully', 
      count: updated.modifiedCount 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'delete');

    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No lead IDs provided for deletion." }, { status: 400 });
    }

    const tenantQuery = user.hierarchyLevel === 2 
      ? { companyId: user.companyId }
      : { founderId: user.founderId };

    const deleted = await Lead.deleteMany(
      { _id: { $in: ids }, ...tenantQuery }
    );

    return NextResponse.json({ 
      message: 'Deleted successfully', 
      count: deleted.deletedCount 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

