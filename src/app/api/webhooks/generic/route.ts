import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import { evaluateWorkflows } from "@/modules/automation/services/workflow.service";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const projectId = searchParams.get('projectId');
    const source = searchParams.get('source') || 'API Bulk Import';

    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId query parameter for authentication" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // Check if body is an array for bulk import
    const leadsData = Array.isArray(body) ? body : [body];

    if (leadsData.length === 0) {
      return NextResponse.json({ error: "No lead data provided" }, { status: 400 });
    }

    // Process leads, enforcing companyId and source
    const processedLeads = leadsData.map((lead: any) => ({
      ...lead,
      companyId,
      status: lead.status || 'New',
      source,
      // Store any unmapped fields in customData
      customData: {
        ...lead.customData,
        ...(projectId ? { projectId } : {}),
        _importDate: new Date().toISOString(),
      }
    }));

    // Insert many leads
    const insertedLeads = await Lead.insertMany(processedLeads, { ordered: false }).catch(err => {
      // If some inserts fail (e.g., duplicate emails), we still want to return the successful ones.
      if (err.code === 11000) {
        console.warn("Some leads were skipped due to duplicate constraints during bulk import.");
        return err.insertedDocs || [];
      }
      throw err;
    });

    // Trigger workflows for each inserted lead asynchronously
    insertedLeads.forEach(lead => {
      evaluateWorkflows(companyId, "Lead Created", lead._id.toString(), {
        ...lead.toObject(),
        ...lead.customData
      }).catch(console.error);
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${insertedLeads.length} leads.`,
      count: insertedLeads.length
    }, { status: 201 });

  } catch (error: any) {
    console.error("Bulk Import API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
