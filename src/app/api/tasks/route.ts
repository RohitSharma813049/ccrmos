import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Task from '@/modules/tasks/schemas/Task';

export async function GET(req: Request) {
  try {
    if (!mongoose.connection.readyState) await mongoose.connect(process.env.MONGODB_URI!);
    const items = await Task.find({ status: { $ne: 'Archived' } }).sort({ createdAt: -1 });
    return NextResponse.json({ tasks: items }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!mongoose.connection.readyState) await mongoose.connect(process.env.MONGODB_URI!);
    const body = await req.json();
    const item = await Task.create(body);
    return NextResponse.json({ message: 'Created successfully', task: item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
