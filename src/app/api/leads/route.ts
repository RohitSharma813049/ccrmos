import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import Pipeline from '@/modules/settings/schemas/Pipeline';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { evaluateWorkflows } from "@/modules/automation/services/workflow.service";
import { buildTenantQuery } from "@/lib/access-control";
import { logActivity } from "@/modules/audit/services/audit.service";
import { getRecordScopeFilter, filterFields } from "@/lib/permissions";
import { parseFiltersToMongo } from "@/utils/parseFilters";
import { sendPushNotification } from "@/modules/notifications/services/notifications.service";
import { createGoogleCalendarEvent } from "@/lib/googleClient";

function errorResponse(error: any) {
  const message = error?.message || "Internal server error";
  if (message === "Unauthorized" || message.startsWith("Unauthorized:")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (message.startsWith("Forbidden:") || message.includes("permission")) {
    return NextResponse.json({ error: message }, { status: 403 });
  }
  if (error?.code === 11000) {
    return NextResponse.json({ error: "A lead with this email already exists in this tenant." }, { status: 409 });
  }
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'view');
    await dbConnect();

    const queryScope = getRecordScopeFilter(user, "Leads");

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const filtersJson = searchParams.get("filters");
    const dynamicQuery = parseFiltersToMongo(filtersJson);
    
    // We still support standard specific search params if passed directly
    const stageIdFilter = searchParams.get("stageId") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    
    const queryObj: any = { ...queryScope, status: { $ne: 'Archived' }, ...dynamicQuery };

    if (stageIdFilter) {
      if (stageIdFilter === 'Archived') {
        queryObj.status = 'Archived';
      } else {
        queryObj.stageId = stageIdFilter;
      }
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
      const searchOr = ['firstName', 'lastName', 'email'].map(field => ({ [field]: searchRegex }));
      queryObj.$or = queryObj.$or ? [...queryObj.$or, ...searchOr] : searchOr;
    }

    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments(queryObj);
    const leads = await Lead.find(queryObj).populate('stageId').sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    
    // Apply Field-Level Permissions
    const filteredLeads = leads.map(lead => filterFields(lead, user, "Leads"));
    
    return NextResponse.json({ leads: filteredLeads, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) { return errorResponse(error); }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'create');
    await dbConnect();
    const companyId = user?.companyId || null;

    const body = await req.json();

    // Auto-assign hierarchical ownership based on creator
    if (user) {
      body.companyId = user.companyId;
      body.founderId = user.hierarchyLevel === 2 ? user.id : user.founderId;
      body.createdBy = user._id;
      if (!body.assignedUserId) body.assignedUserId = user.id;
      if (user.departmentId) body.departmentId = user.departmentId;
      if (user.teamLeaderId) body.teamLeaderId = user.teamLeaderId;
      if (user.managerId) body.managerId = user.managerId;
      if (user.directorId) body.directorId = user.directorId;
    }

    body.activities = [{
      type: "Creation",
      description: "Lead was created.",
      timestamp: new Date()
    }];

    const newLead = await Lead.create(body);

    if (companyId) {
      // Log the creation
      logActivity({
        companyId,
        userId: user.id,
        module: "Leads",
        recordId: newLead._id.toString(),
        action: "Lead Created",
        req
      }).catch(console.error);

      // Background execution of workflows
      evaluateWorkflows(companyId, "Lead Created", newLead._id.toString(), {
        ...newLead.toObject(),
        ...newLead.customData
      }).catch(console.error);

      // Trigger Push Notification to assigned user if they are not the creator
      if (newLead.assignedUserId && newLead.assignedUserId.toString() !== user.id) {
        sendPushNotification(
          newLead.assignedUserId.toString(),
          "New Lead Assigned",
          `A new lead (${newLead.firstName} ${newLead.lastName || ''}) has been assigned to you by ${user.name || 'a teammate'}.`,
          { leadId: newLead._id.toString(), type: 'LEAD_ASSIGNED' }
        ).catch(console.error);
      }
    }

    return NextResponse.json({ lead: newLead }, { status: 201 });
  } catch (error: any) { return errorResponse(error); }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'edit');
    await dbConnect();

    const body = await req.json();
    const { _id, status, stageId, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Missing Lead ID" }, { status: 400 });

    const lead = await Lead.findOne({ _id, ...buildTenantQuery(user) });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    // Handle Stage and Status Change
    let activityDesc = [];
    if (stageId && lead.stageId?.toString() !== stageId) {
      activityDesc.push(`Stage changed`);
      lead.stageId = stageId;
    }
    
    if (status && lead.status !== status) {
      activityDesc.push(`Status changed from ${lead.status} to ${status}`);
      lead.status = status;
    }

    if (activityDesc.length > 0) {
      lead.activities = lead.activities || [];
      lead.activities.push({
        type: "Status Change",
        description: activityDesc.join(' and '),
        timestamp: new Date()
      });

      // Workflow Hook
      evaluateWorkflows(user.companyId, "Lead Updated", lead._id.toString(), {
        ...lead.toObject(),
        status,
        stageId
      }).catch(console.error);
    }

    if (updateData.nextFollowUpDate && updateData.nextFollowUpDate !== lead.nextFollowUpDate?.toISOString()) {
      try {
        const companyIdStr = user.companyId ? user.companyId.toString() : (user.impersonatedFounderId ? user.impersonatedFounderId.toString() : undefined);
        const startTime = updateData.nextFollowUpDate;
        const endDate = new Date(new Date(startTime).getTime() + 30 * 60000).toISOString(); // 30 min duration
        
        await createGoogleCalendarEvent(user._id.toString(), companyIdStr || '', {
          summary: `Follow up with ${lead.firstName} ${lead.lastName || ''}`,
          description: updateData.lastRemark || 'CRM Scheduled Follow-up',
          startTime,
          endTime: endDate
        });
        console.log(`[Google Calendar] Follow up created for lead ${lead._id}`);
      } catch (err: any) {
        console.warn(`[Google Calendar Error] Could not create event: ${err.message}`);
      }
    }

    Object.assign(lead, updateData);
    await lead.save();

    return NextResponse.json({ lead });
  } catch (error: any) { return errorResponse(error); }
}
