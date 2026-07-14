import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/modules/customers/schemas/Customer';
import Pipeline from '@/modules/settings/schemas/Pipeline';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";
import { parseFiltersToMongo } from "@/utils/parseFilters";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Customers', 'view');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const filtersJson = searchParams.get("filters");
    const dynamicQuery = parseFiltersToMongo(filtersJson);

    const statusFilter = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    
    const queryObj: any = { ...buildTenantQuery(user), ...dynamicQuery };

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
      const searchOr = ['name', 'email', 'company'].map(field => ({ [field]: searchRegex }));
      queryObj.$or = queryObj.$or ? [...queryObj.$or, ...searchOr] : searchOr;
    }

    const skip = (page - 1) * limit;
    const total = await Customer.countDocuments(queryObj);
    const customers = await Customer.find(queryObj).sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    return NextResponse.json({ customers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Customers', 'create');
    const body = await req.json();

    if (user) {
      body.companyId = user.companyId;
      body.founderId = user.hierarchyLevel === 2 ? user.id : user.founderId;
    }

    const newCustomer = await Customer.create(body);
    return NextResponse.json({ customer: newCustomer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Customers', 'edit');

    const body = await req.json();
    const { _id, status, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Missing Customer ID" }, { status: 400 });

    const customer = await Customer.findOne({ _id, ...buildTenantQuery(user) });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    // Enforce "forward-only" logic if status is changing
    if (status && customer.status !== status) {
      let pipeline = await Pipeline.findOne({ companyId: user.companyId, module: "customer" });
      
      // Fallback for default pipeline stages
      let stages = pipeline?.stages || [
        { name: "Onboarding", order: 0 },
        { name: "Active", order: 1 },
        { name: "At Risk", order: 2 },
        { name: "Churned", order: 3 },
      ];

      const currentStage = stages.find(s => s.name === customer.status);
      const newStage = stages.find(s => s.name === status);

      // If both stages are in the pipeline, enforce ordering
      if (currentStage && newStage) {
        if (newStage.order < currentStage.order) {
          return NextResponse.json({ 
            error: "Status can only move forward in the pipeline." 
          }, { status: 400 });
        }
      }
      
      customer.status = status;
    }

    Object.assign(customer, updateData);
    await customer.save();

    return NextResponse.json({ customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
