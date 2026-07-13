import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Form from '@/modules/forms/schemas/Form';
import FormSubmission from '@/modules/forms/schemas/FormSubmission';

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

    return NextResponse.json({ success: true, submissionId: submission._id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
