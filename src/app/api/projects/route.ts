import { NextResponse } from 'next/server';

import dbConnect from '@/lib/db';
import Project from '@/modules/projects/schemas/Project';
import Pipeline from '@/modules/settings/schemas/Pipeline';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";
import { getRecordScopeFilter } from "@/lib/permissions";
import { parseFiltersToMongo } from "@/utils/parseFilters";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Projects', 'view');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const filtersJson = searchParams.get("filters");
    const dynamicQuery = parseFiltersToMongo(filtersJson);

    const statusFilter = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    
    const queryScope = getRecordScopeFilter(user, "Projects");
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
      const searchOr = ['name', 'description'].map(field => ({ [field]: searchRegex }));
      queryObj.$or = queryObj.$or ? [...queryObj.$or, ...searchOr] : searchOr;
    }

    const skip = (page - 1) * limit;
    const total = await Project.countDocuments(queryObj);
    const projects = await Project.find(queryObj).sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    return NextResponse.json({ projects, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Projects', 'create');
    const body = await req.json();

    if (user) {
      body.companyId = user.companyId;
      body.founderId = user.hierarchyLevel === 2 ? user.id : user.founderId;
      body.createdBy = user._id;
    }

    const newProject = await Project.create(body);
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Projects', 'edit');

    const body = await req.json();
    const { _id, status, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });

    const project = await Project.findOne({ _id, ...buildTenantQuery(user) });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Enforce "forward-only" logic if status is changing
    if (status && project.status !== status) {
      let pipeline = await Pipeline.findOne({ companyId: user.companyId, module: "project" });
      
      let stages = pipeline?.stages || [
        { name: "Planning", order: 0 },
        { name: "In Progress", order: 1 },
        { name: "Review", order: 2 },
        { name: "Completed", order: 3 },
      ];

      const currentStage = stages.find(s => s.name === project.status);
      const newStage = stages.find(s => s.name === status);

      if (currentStage && newStage) {
        if (newStage.order < currentStage.order) {
          return NextResponse.json({ 
            error: "Status can only move forward in the pipeline." 
          }, { status: 400 });
        }
      }
      
      project.status = status;
    }

    Object.assign(project, updateData);
    await project.save();

    return NextResponse.json({ project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
