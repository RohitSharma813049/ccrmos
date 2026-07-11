import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import User from "@/modules/users/schemas/User";
import Lead from "@/modules/leads/schemas/Lead";
import Customer from "@/modules/customers/schemas/Customer";
import Project from "@/modules/projects/schemas/Project";
import Invoice from "@/modules/invoices/schemas/Invoice";
import Order from "@/modules/orders/schemas/Order";
import Task from "@/modules/tasks/schemas/Task";
import Company from "@/modules/companies/schemas/Company";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  await dbConnect();

  try {
    const currentUser = await requireAuthenticatedUser();
    
    // Only Platform Owners can see stats for arbitrary companies
    if (currentUser.hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Forbidden: Only Platform Owners can view tenant stats" }, { status: 403 });
    }

    const { id: companyId } = await context.params;
    const company = await Company.findById(companyId);

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Since users are tied to a founderId in this system (or companyId), 
    // let's fetch the founder for this company to scope the counts.
    const founder = await User.findOne({ companyId: companyId, hierarchyLevel: 2 });
    
    // The query scope for records is based on founderId
    const targetFounderId = founder ? founder._id : null;
    const recordQuery = targetFounderId ? { founderId: targetFounderId } : { _id: null };

    // Perform aggregations
    const [
      usersCount,
      leadsCount,
      customersCount,
      projectsCount,
      invoicesTotal,
      ordersTotal,
      tasksCount
    ] = await Promise.all([
      User.countDocuments(targetFounderId ? { $or: [{ _id: targetFounderId }, { founderId: targetFounderId }] } : { companyId }),
      Lead.countDocuments(recordQuery),
      Customer.countDocuments(recordQuery),
      Project.countDocuments(recordQuery),
      Invoice.aggregate([
        { $match: recordQuery },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Order.countDocuments(recordQuery),
      Task.countDocuments(recordQuery)
    ]);

    const revenue = invoicesTotal[0]?.total || 0;

    return NextResponse.json({
      company,
      founder: founder ? { _id: founder._id, name: founder.name, email: founder.email } : null,
      stats: {
        users: usersCount,
        leads: leadsCount,
        customers: customersCount,
        projects: projectsCount,
        orders: ordersTotal,
        tasks: tasksCount,
        revenue: revenue
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
