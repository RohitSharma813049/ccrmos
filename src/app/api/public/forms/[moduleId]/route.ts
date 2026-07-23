import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomModule from '@/modules/settings/schemas/CustomModule';
import CustomRecord from '@/modules/settings/schemas/CustomRecord';
import User from '@/modules/users/schemas/User';
import { sendPushNotification } from '@/modules/notifications/services/notifications.service';
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
    const moduleDoc = await CustomModule.findOne({ _id: moduleId, active: true }).lean();
    
    if (!moduleDoc) {
      return NextResponse.json({ error: "Form not found or is currently inactive" }, { status: 404 });
    }

    if (!moduleDoc.companyId) {
      return NextResponse.json({ error: "Public forms are only available for tenant-specific modules." }, { status: 400 });
    }

    // Process relational fields to inject options safely
    let processedFields = [...moduleDoc.fields] as any[];
    
    // Dynamic import to avoid circular or missing dependencies at top level if needed,
    // but we can just import Project at top. Wait, let's import it at the top.
    
    for (const field of processedFields) {
      if (field.type === 'relation') {
        if (field.relationTarget === 'Project') {
          const { default: Project } = await import('@/modules/projects/schemas/Project');
          const projects = await Project.find({ companyId: moduleDoc.companyId }).select('_id name displayId').lean();
          field.relationOptions = projects.map((p: any) => ({
            label: `${p.displayId ? p.displayId + ' - ' : ''}${p.name}`,
            value: p._id.toString()
          }));
        } else if (field.relationTarget === 'Lead') {
          const { default: Lead } = await import('@/modules/leads/schemas/Lead');
          const leads = await Lead.find({ companyId: moduleDoc.companyId }).select('_id firstName lastName').lean();
          field.relationOptions = leads.map((l: any) => ({
            label: `${l.firstName} ${l.lastName || ''}`.trim(),
            value: l._id.toString()
          }));
        } else if (field.relationTarget === 'Customer') {
          const { default: Customer } = await import('@/modules/customers/schemas/Customer');
          const customers = await Customer.find({ companyId: moduleDoc.companyId }).select('_id name').lean();
          field.relationOptions = customers.map((c: any) => ({
            label: c.name,
            value: c._id.toString()
          }));
        }
      }
    }

    // Only return safe public data (name, fields)
    return NextResponse.json({
      name: moduleDoc.name,
      fields: processedFields,
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

    // Notify the founder
    try {
      const founder = await User.findOne({ companyId: moduleDoc.companyId, hierarchyLevel: 2 });
      if (founder) {
        await sendPushNotification(
          founder._id.toString(),
          "New Form Submission",
          `A new response was submitted to your form: ${moduleDoc.name}`,
          { link: `/f/custom/${moduleDoc._id}` }
        );
      }
    } catch (e) {
      console.error("Failed to notify on form submission", e);
    }

    return NextResponse.json({ success: true, recordId: newRecord._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
