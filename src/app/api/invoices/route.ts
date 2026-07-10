import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/modules/invoices/schemas/Invoice';
import Pipeline from '@/modules/settings/schemas/Pipeline';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Invoices', 'view');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    
    const queryObj: any = { ...buildTenantQuery(user) };
    
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchOr = ['invoiceNumber', 'status'].map(field => ({ [field]: searchRegex }));
      queryObj.$or = queryObj.$or ? [...queryObj.$or, ...searchOr] : searchOr;
    }

    const skip = (page - 1) * limit;
    const total = await Invoice.countDocuments(queryObj);
    const invoices = await Invoice.find(queryObj).sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    return NextResponse.json({ invoices, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Invoices', 'create');
    const body = await req.json();

    if (user) {
      body.companyId = user.companyId;
      body.founderId = user.hierarchyLevel === 2 ? user.id : user.founderId;
    }

    const newInvoice = await Invoice.create(body);
    return NextResponse.json({ invoice: newInvoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Invoices', 'edit');

    const body = await req.json();
    const { _id, status, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Missing Invoice ID" }, { status: 400 });

    const invoice = await Invoice.findOne({ _id, ...buildTenantQuery(user) });
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
