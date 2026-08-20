import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/modules/core/schemas/AuditLog';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    
    // STRICT SECURITY: Only Founders or users with AUDIT_MANAGEMENT can view logs
    // In auth-utils.ts, Founders automatically bypass this check for "AUDIT_MANAGEMENT".
    await requirePermission('AUDIT_MANAGEMENT', 'view');

    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const targetModel = searchParams.get('targetModel');
    const targetId = searchParams.get('targetId');
    const actorId = searchParams.get('actorId');
    const action = searchParams.get('action');
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const query: any = { companyId: user.companyId };
    if (targetModel) query.targetModel = targetModel;
    if (targetId) query.targetId = targetId;
    if (actorId) query.actorId = actorId;
    if (action) query.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actorId', 'name email avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return NextResponse.json({ 
      logs, 
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } 
    });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    // This is an internal endpoint that frontend/backend services can call
    // It shouldn't strictly require AUDIT_MANAGEMENT to *write* logs, just to *read* them.
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const { action, targetModel, targetId, changes } = await req.json();

    const log = await AuditLog.create({
      companyId: user.companyId,
      actorId: user.id,
      action,
      targetModel,
      targetId,
      changes,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown',
      userAgent: req.headers.get('user-agent') || 'Unknown'
    });

    return NextResponse.json({ log });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
