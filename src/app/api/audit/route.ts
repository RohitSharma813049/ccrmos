import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/modules/audit/schemas/AuditLog';
import { getSession } from "@/lib/auth-utils";
import User from '@/modules/users/schemas/User';

export async function GET(req: Request) {
  await dbConnect();
  try {
    console.log("Audit API: Connected to DB");
    const session = await getSession();
    console.log("Audit API: Got session", session?.user?.email);
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const moduleFilter = searchParams.get('module');
    const actionFilter = searchParams.get('action');

    const query: any = {};
    if (user.hierarchyLevel !== 1) {
      query.companyId = user.companyId;
    }
    
    if (moduleFilter) query.module = moduleFilter;
    if (actionFilter) query.action = actionFilter;

    // Fetch logs and populate user data
    console.log("Audit API: Querying logs with", query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'email name')
      .sort({ createdAt: -1 })
      .limit(100);

    console.log("Audit API: Found", logs.length, "logs");
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
