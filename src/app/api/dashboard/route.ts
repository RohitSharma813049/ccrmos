import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';
import { getRecordScopeFilter } from '@/lib/permissions';

import Lead from '@/modules/leads/schemas/Lead';
import Customer from '@/modules/customers/schemas/Customer';
import Project from '@/modules/projects/schemas/Project';
import Task from '@/modules/tasks/schemas/Task';
import Order from '@/modules/orders/schemas/Order';
import Invoice from '@/modules/invoices/schemas/Invoice';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const tenantQuery = buildTenantQuery(user);

    // Apply granular scoping if the user is not a Founder (hierarchyLevel > 2)
    const getQuery = async (moduleName: string) => {
      const query = { ...tenantQuery };
      if (user.hierarchyLevel > 2) {
        const scopeFilter = await getRecordScopeFilter(user, moduleName);
        Object.assign(query, scopeFilter);
      }
      return query;
    };

    const [
      leadsQuery,
      customersQuery,
      projectsQuery,
      tasksQuery,
      ordersQuery,
      invoicesQuery
    ] = await Promise.all([
      getQuery("Leads"),
      getQuery("Customers"),
      getQuery("Projects"),
      getQuery("Tasks"),
      getQuery("Orders"),
      getQuery("Invoices")
    ]);

    const [
      leadsCount,
      customersCount,
      projectsCount,
      tasksCount,
      ordersCount,
      invoicesCount
    ] = await Promise.all([
      Lead.countDocuments(leadsQuery),
      Customer.countDocuments(customersQuery),
      Project.countDocuments(projectsQuery),
      Task.countDocuments(tasksQuery),
      Order.countDocuments(ordersQuery),
      Invoice.countDocuments(invoicesQuery)
    ]);

    let teamBreakdown = [];
    if (user.hierarchyLevel <= 3) {
      // Founders and Directors can see team breakdowns
      teamBreakdown = await Lead.aggregate([
        { $match: leadsQuery },
        {
          $group: {
            _id: "$teamId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "teams",
            localField: "_id",
            foreignField: "_id",
            as: "team"
          }
        },
        { $unwind: { path: "$team", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ["$team.name", "Unassigned"] },
            count: 1
          }
        }
      ]);
    }

    const [leadsByStatus, tasksByStatus] = await Promise.all([
      Lead.aggregate([
        { $match: leadsQuery },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { name: { $ifNull: ["$_id", "Unknown"] }, value: "$count", _id: 0 } }
      ]),
      Task.aggregate([
        { $match: tasksQuery },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { name: { $ifNull: ["$_id", "Unknown"] }, count: 1, _id: 0 } }
      ])
    ]);

    return NextResponse.json({
      summary: {
        leads: leadsCount,
        customers: customersCount,
        projects: projectsCount,
        tasks: tasksCount,
        orders: ordersCount,
        invoices: invoicesCount
      },
      teamBreakdown,
      leadsByStatus,
      tasksByStatus
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
