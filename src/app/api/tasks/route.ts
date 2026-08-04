import { NextResponse } from 'next/server';

import mongoose from 'mongoose';
import Task from '@/modules/tasks/schemas/Task';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';
import { getRecordScopeFilter } from "@/lib/permissions";
import { parseFiltersToMongo } from "@/utils/parseFilters";

export async function GET(req: Request) {
  try {
    if (!mongoose.connection.readyState) await mongoose.connect(process.env.MONGODB_URI!);
    const user = await requireAuthenticatedUser();
    await requirePermission('Tasks', 'view');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const filtersJson = searchParams.get("filters");
    const dynamicQuery = parseFiltersToMongo(filtersJson);

    const statusFilter = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    
    const queryScope = getRecordScopeFilter(user, "Tasks");
    const queryObj: any = { ...buildTenantQuery(user), ...dynamicQuery, ...queryScope };

    if (statusFilter) {
      queryObj.status = statusFilter;
    }

    if (dateFrom || dateTo) {
      queryObj.createdAt = {};
      if (dateFrom) queryObj.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        queryObj.createdAt.$lte = toDate;
      }
    }
    
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchOr = ['title', 'description'].map(field => ({ [field]: searchRegex }));
      queryObj.$or = queryObj.$or ? [...queryObj.$or, ...searchOr] : searchOr;
    }

    const skip = (page - 1) * limit;
    const total = await Task.countDocuments(queryObj);
    const tasks = await Task.find(queryObj).sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    return NextResponse.json({ tasks, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!mongoose.connection.readyState) await mongoose.connect(process.env.MONGODB_URI!);
    
    const user = await requireAuthenticatedUser();
    await requirePermission('Tasks', 'create');
    
    const body = await req.json();

    if (user) {
      body.companyId = user.companyId;
      body.founderId = user.hierarchyLevel === 2 ? user.id : user.founderId;
      body.createdBy = user._id;
    }

    const item = await Task.create(body);
    return NextResponse.json({ message: 'Created successfully', task: item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
