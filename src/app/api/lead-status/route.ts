import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ModuleStatus from '@/modules/settings/schemas/ModuleStatus';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const queryObj = buildTenantQuery(user);
    queryObj.moduleName = 'Leads';

    const moduleStatuses = await ModuleStatus.find(queryObj).sort({ order: 1 });
    
    // Map the subStatuses strings into objects mimicking LeadStatus
    let statuses: any[] = [];
    moduleStatuses.forEach((ms: any) => {
      if (ms.subStatuses && ms.subStatuses.length > 0) {
        ms.subStatuses.forEach((subName: string, index: number) => {
          statuses.push({
            _id: `${ms._id}_${index}`,
            name: subName,
            stageId: ms._id,
            active: true,
            iconColor: 'bg-primary'
          });
        });
      }
    });

    return NextResponse.json({ statuses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return NextResponse.json({ error: "Deprecated endpoint. Use ModuleStatus." }, { status: 400 });
}
