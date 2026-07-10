import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/modules/invoices/schemas/Invoice';
import Pipeline from '@/modules/settings/schemas/Pipeline';
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  await dbConnect();
  try {
    const invoices = await Invoice.find({ status: { $ne: 'Archived' } }).sort({ createdAt: -1 });
    return NextResponse.json({ invoices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newInvoice = await Invoice.create(body);
    return NextResponse.json({ invoice: newInvoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { _id, status, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Missing Invoice ID" }, { status: 400 });

    const invoice = await Invoice.findById(_id);
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // Enforce "forward-only" logic if status is changing
    if (status && invoice.status !== status) {
      let pipeline = await Pipeline.findOne({ companyId: user.companyId, module: "invoice" });
      
      let stages = pipeline?.stages || [
        { name: "Draft", order: 0 },
        { name: "Sent", order: 1 },
        { name: "Overdue", order: 2 },
        { name: "Paid", order: 3 },
      ];

      const currentStage = stages.find(s => s.name === invoice.status);
      const newStage = stages.find(s => s.name === status);

      if (currentStage && newStage) {
        if (newStage.order < currentStage.order) {
          return NextResponse.json({ 
            error: "Status can only move forward in the pipeline." 
          }, { status: 400 });
        }
      }
      
      invoice.status = status;
    }

    Object.assign(invoice, updateData);
    await invoice.save();

    return NextResponse.json({ invoice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
