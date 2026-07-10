import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Invoice from '@/modules/invoices/schemas/Invoice';

export async function GET(req: Request) {
  try {
    if (!mongoose.connection.readyState) await mongoose.connect(process.env.MONGODB_URI!);
    const items = await Invoice.find({ status: { $ne: 'Archived' } }).sort({ createdAt: -1 });
    return NextResponse.json({ invoices: items }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!mongoose.connection.readyState) await mongoose.connect(process.env.MONGODB_URI!);
    const body = await req.json();
    const item = await Invoice.create(body);
    return NextResponse.json({ message: 'Created successfully', invoice: item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
