import { NextResponse } from 'next/server';
import Order from '@/modules/orders/schemas/Order';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Orders', 'view');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    
    const queryObj: any = { ...buildTenantQuery(user) };
    
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchOr = ['orderNumber', 'status'].map(field => ({ [field]: searchRegex }));
      queryObj.$or = queryObj.$or ? [...queryObj.$or, ...searchOr] : searchOr;
    }

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(queryObj);
    const orders = await Order.find(queryObj).sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    await requirePermission('Orders', 'create');
    const body = await req.json();
    body.companyId = user.companyId;
    body.founderId = user.hierarchyLevel === 2 ? user.id : user.founderId;
    const item = await Order.create(body);
    return NextResponse.json({ message: 'Created successfully', order: item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
