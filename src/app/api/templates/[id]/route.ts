import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Template from '@/modules/documents/schemas/Template';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const data = await req.json();
    
    const template = await Template.findOneAndUpdate(
      { _id: params.id, companyId: user.companyId },
      { ...data, updatedBy: user._id },
      { new: true }
    );
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const template = await Template.findOneAndDelete({ 
      _id: params.id, 
      companyId: user.companyId 
    });
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
