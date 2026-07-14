import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Form from '@/modules/forms/schemas/Form';
import FormSubmission from '@/modules/forms/schemas/FormSubmission';
import Lead from '@/modules/leads/schemas/Lead';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();

    const form = await Form.findById(id);
    if (!form || !form.isActive) {
      return NextResponse.json({ error: "Form is not active or does not exist" }, { status: 404 });
    }

    // Basic validation based on schema
    for (const field of form.fields) {
      if (field.required && !body[field.id]) {
        return NextResponse.json({ error: `Field ${field.label} is required` }, { status: 400 });
      }
    }

    const submission = await FormSubmission.create({
      formId: form._id,
      companyId: form.companyId,
      data: body
    });

    // Also create a Lead

    const leadData: any = {
      companyId: form.companyId,
      founderId: form.founderId,
      status: 'new',
      source: 'Form',
      customData: {
        formName: form.title,
        projectId: form.projectId,
        ...body
      }
    };

    // Try to extract standard fields
    for (const key of Object.keys(body)) {
      const val = body[key];
      const k = key.toLowerCase();
      if (k.includes('first')) leadData.firstName = val;
      else if (k.includes('last')) leadData.lastName = val;
      else if (k.includes('email')) leadData.email = val;
      else if (k.includes('phone')) leadData.phone = val;
      else if (k.includes('name') && !leadData.firstName) {
        leadData.firstName = val.split(' ')[0] || 'Unknown';
        leadData.lastName = val.split(' ').slice(1).join(' ') || '';
      }
    }

    if (!leadData.firstName) leadData.firstName = 'Form';
    if (!leadData.lastName) leadData.lastName = 'Submitter';
    if (!leadData.email) leadData.email = `no-email-${Date.now()}@example.com`; // Fallback to avoid strict validation error

    await Lead.create(leadData);

    return NextResponse.json({ success: true, submissionId: submission._id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
