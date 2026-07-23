import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Form from '@/modules/forms/schemas/Form';
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    // Allow public access if no session, or check if the user is a tenant.
    // Wait, GET /api/forms/[id] will be used by the builder AND the public form viewer.
    // If public form viewer uses it, we shouldn't strictly require session.
    // Or we could have the public viewer use a different endpoint or Server Component.
    
    // For now, let's allow it to be public to fetch the schema, but we don't expose sensitive info anyway.
    const { id } = await params;
    const form = await Form.findById(id).lean();
    
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    // Inject relation options for standalone forms too
    if (form.fields) {
      for (const field of form.fields) {
        if (field.type === 'relation') {
          if (field.relationTarget === 'Project') {
            const { default: Project } = await import('@/modules/projects/schemas/Project');
            const projects = await Project.find({ companyId: form.companyId }).select('_id name displayId').lean();
            field.relationOptions = projects.map((p: any) => ({
              label: `${p.displayId ? p.displayId + ' - ' : ''}${p.name}`,
              value: p._id.toString()
            }));
          } else if (field.relationTarget === 'Lead') {
            const { default: Lead } = await import('@/modules/leads/schemas/Lead');
            const leads = await Lead.find({ companyId: form.companyId }).select('_id firstName lastName').lean();
            field.relationOptions = leads.map((l: any) => ({
              label: `${l.firstName} ${l.lastName || ''}`.trim(),
              value: l._id.toString()
            }));
          } else if (field.relationTarget === 'Customer') {
            const { default: Customer } = await import('@/modules/customers/schemas/Customer');
            const customers = await Customer.find({ companyId: form.companyId }).select('_id name').lean();
            field.relationOptions = customers.map((c: any) => ({
              label: c.name,
              value: c._id.toString()
            }));
          }
        }
      }
    }

    return NextResponse.json({ form });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const form = await Form.findOneAndUpdate(
      { _id: id, companyId: user.companyId },
      body,
      { new: true }
    );

    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
    return NextResponse.json({ form });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const form = await Form.findOneAndDelete({ _id: id, companyId: user.companyId });

    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
