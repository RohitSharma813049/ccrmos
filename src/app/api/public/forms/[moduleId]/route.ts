import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomModule from '@/modules/settings/schemas/CustomModule';
import CustomRecord from '@/modules/settings/schemas/CustomRecord';
import mongoose from 'mongoose';

// Public GET endpoint to fetch the form schema (to render the form publicly)
export async function GET(req: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    await dbConnect();
    const { moduleId } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return NextResponse.json({ error: "Invalid form ID" }, { status: 400 });
    }
    
    // Fetch the module definition
    const moduleDoc = await CustomModule.findOne({ _id: moduleId, active: true });
    
    if (!moduleDoc) {
      return NextResponse.json({ error: "Form not found or is currently inactive" }, { status: 404 });
    }

    if (!moduleDoc.companyId) {
      return NextResponse.json({ error: "Public forms are only available for tenant-specific modules." }, { status: 400 });
    }

    // Only return safe public data (name, fields)
    return NextResponse.json({
      name: moduleDoc.name,
      fields: moduleDoc.fields,
      companyId: moduleDoc.companyId 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Public POST endpoint to accept form submissions
export async function POST(req: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    await dbConnect();
    const { moduleId } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return NextResponse.json({ error: "Invalid form ID" }, { status: 400 });
    }
    
    const body = await req.json();

    const moduleDoc = await CustomModule.findOne({ _id: moduleId, active: true });

    if (!moduleDoc) {
      return NextResponse.json({ error: "Form not found or is currently inactive" }, { status: 404 });
    }

    if (!moduleDoc.companyId) {
      return NextResponse.json({ error: "Public forms are only available for tenant-specific modules." }, { status: 400 });
    }

    // Validate required fields
    for (const field of moduleDoc.fields) {
      if (field.required && !body.data?.[field.name]) {
        return NextResponse.json({ error: `Field '${field.name}' is required.` }, { status: 400 });
      }
    }

    // Create the record. Associate it with the module's companyId
    const newRecord = await CustomRecord.create({
      moduleId: moduleDoc._id as any,
      companyId: moduleDoc.companyId as any,
      data: body.data || {}
    });

    return NextResponse.json({ success: true, recordId: newRecord._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
