import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ModuleStatus from '@/modules/settings/schemas/ModuleStatus';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!userCompanyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    await dbConnect();
    await ModuleStatus.findOneAndDelete({ _id: params.id, companyId: userCompanyId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!userCompanyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const body = await req.json();
    await dbConnect();
    
    const updated = await ModuleStatus.findOneAndUpdate(
      { _id: params.id, companyId: userCompanyId },
      body,
      { new: true }
    );
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
