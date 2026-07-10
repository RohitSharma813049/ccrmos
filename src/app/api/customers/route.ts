import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/modules/customers/schemas/Customer';

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
