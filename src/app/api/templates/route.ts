import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Template from '@/modules/documents/schemas/Template';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    const query: any = { companyId: user.companyId };
    if (type) query.type = type;

    const templates = await Template.find(query).sort({ name: 1 });
    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const data = await req.json();
    
    const newTemplate = new Template({
      ...data,
      companyId: user.companyId,
      createdBy: user._id,
      updatedBy: user._id
    });

    await newTemplate.save();
    return NextResponse.json({ success: true, template: newTemplate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
