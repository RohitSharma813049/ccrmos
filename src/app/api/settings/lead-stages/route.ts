import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ModuleStatus from '@/modules/settings/schemas/ModuleStatus';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    // ModuleStatus schema only contains companyId, not founderId
    const companyId = user.impersonatedCompanyId || user.companyId;
    if (!companyId) return NextResponse.json([]);
    
    const queryObj: any = { companyId, moduleName: 'Leads' };
    const stages = await ModuleStatus.find(queryObj).sort({ order: 1 });
    return NextResponse.json(stages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return NextResponse.json({ error: "Deprecated. Use /api/settings/module-statuses instead." }, { status: 400 });
}
