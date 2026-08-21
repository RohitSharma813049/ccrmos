import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ConversionRule from '@/modules/settings/schemas/ConversionRule';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!userCompanyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const sourceModule = searchParams.get('sourceModule');

    await dbConnect();
    const query: any = { companyId: userCompanyId };
    if (sourceModule) query.sourceModule = sourceModule;

    const rules = await ConversionRule.find(query);
    return NextResponse.json({ rules });
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
    
    const newRule = new ConversionRule({ ...body, companyId: userCompanyId });
    await newRule.save();

    return NextResponse.json(newRule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
