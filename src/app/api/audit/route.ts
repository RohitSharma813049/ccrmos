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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const moduleFilter = searchParams.get('module');
    const actionFilter = searchParams.get('action');

    const query: any = {};
    if (user.hierarchyLevel !== 1) {
      query.companyId = user.companyId;
    }
    
    if (moduleFilter) query.module = { $regex: moduleFilter, $options: "i" };
    if (actionFilter) query.action = { $regex: actionFilter, $options: "i" };

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [{ action: searchRegex }, { module: searchRegex }];
    }

    // Fetch logs and populate user data
    console.log("Audit API: Querying logs with", query);
    const skip = (page - 1) * limit;
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log("Audit API: Found", logs.length, "logs");
    return NextResponse.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
