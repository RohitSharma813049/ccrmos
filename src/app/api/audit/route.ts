import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/modules/audit/schemas/AuditLog';
import { getSession } from "@/lib/auth-utils";
import User from '@/modules/users/schemas/User';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const moduleFilter = searchParams.get('module');
    const actionFilter = searchParams.get('action');

    const query: any = { companyId: user.companyId };
    
    if (moduleFilter) query.module = moduleFilter;
    if (actionFilter) query.action = actionFilter;

    // Fetch logs and populate user data
    const logs = await AuditLog.find(query)
      .populate('userId', 'email name')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
