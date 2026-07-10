import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/modules/customers/schemas/Customer';
import Pipeline from '@/modules/settings/schemas/Pipeline';
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  await dbConnect();
  try {
    const customers = await Customer.find({ status: { $ne: 'Archived' } }).sort({ createdAt: -1 });
    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newCustomer = await Customer.create(body);
    return NextResponse.json({ customer: newCustomer }, { status: 201 });
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

    if (!_id) return NextResponse.json({ error: "Missing Customer ID" }, { status: 400 });

    const customer = await Customer.findById(_id);
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    // Enforce "forward-only" logic if status is changing
    if (status && customer.status !== status) {
      let pipeline = await Pipeline.findOne({ companyId: user.companyId, module: "customer" });
      
      // Fallback for default pipeline stages
      let stages = pipeline?.stages || [
        { name: "Onboarding", order: 0 },
        { name: "Active", order: 1 },
        { name: "At Risk", order: 2 },
        { name: "Churned", order: 3 },
      ];

      const currentStage = stages.find(s => s.name === customer.status);
      const newStage = stages.find(s => s.name === status);

      // If both stages are in the pipeline, enforce ordering
      if (currentStage && newStage) {
        if (newStage.order < currentStage.order) {
          return NextResponse.json({ 
            error: "Status can only move forward in the pipeline." 
          }, { status: 400 });
        }
      }
      
      customer.status = status;
    }

    Object.assign(customer, updateData);
    await customer.save();

    return NextResponse.json({ customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
