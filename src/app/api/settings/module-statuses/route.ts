import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ModuleStatus from '@/modules/settings/schemas/ModuleStatus';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!userCompanyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get('moduleName');

    await dbConnect();
    const query: any = { companyId: userCompanyId };
    if (moduleName) query.moduleName = moduleName;

    const statuses = await ModuleStatus.find(query).sort({ order: 1 });
    return NextResponse.json({ statuses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!userCompanyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const body = await req.json();
    await dbConnect();
    
    const newStatus = new ModuleStatus({ ...body, companyId: userCompanyId });
    await newStatus.save();

    return NextResponse.json(newStatus);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
