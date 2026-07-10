import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Project from '@/modules/projects/schemas/Project';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!mongoose.connection.readyState) await mongoose.connect(process.env.MONGODB_URI!);
    const body = await req.json();
    const item = await Project.findByIdAndUpdate((await params).id, body, { new: true });
    return NextResponse.json({ message: 'Updated successfully', project: item }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!mongoose.connection.readyState) await mongoose.connect(process.env.MONGODB_URI!);
    // Soft delete instead of hard delete
    await Project.findByIdAndUpdate((await params).id, { status: 'Archived' });
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
