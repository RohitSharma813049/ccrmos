import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import Lead from "@/modules/leads/schemas/Lead";
import Customer from "@/modules/customers/schemas/Customer";
import Project from "@/modules/projects/schemas/Project";
import Invoice from "@/modules/invoices/schemas/Invoice";

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const regex = new RegExp(query, "i");
    const companyId = user.companyId;

    // Search Leads
    const leads = await Lead.find({
      companyId,
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }, { companyName: regex }, { displayId: regex }]
    }).limit(5).select("_id firstName lastName companyName email displayId status");

    // Search Customers
    const customers = await Customer.find({
      companyId,
      $or: [{ companyName: regex }, { contactName: regex }, { email: regex }]
    }).limit(5).select("_id companyName contactName email status");

    // Search Projects
    const projects = await Project.find({
      companyId,
      $or: [{ name: regex }, { description: regex }, { displayId: regex }]
    }).limit(5).select("_id name status displayId");

    // Search Invoices
    const invoices = await Invoice.find({
      companyId,
      $or: [{ invoiceNumber: regex }, { displayId: regex }]
    }).limit(5).select("_id invoiceNumber status amount displayId");

    const results = [
      ...leads.map(l => ({ id: l._id, type: "Lead", title: `${l.firstName || ''} ${l.lastName || ''} - ${l.companyName || ''}`.trim() || l.email, subtitle: l.displayId, url: `/dashboard/leads?id=${l._id}` })),
      ...customers.map(c => ({ id: c._id, type: "Customer", title: c.companyName || c.contactName || c.email, subtitle: c.email, url: `/dashboard/customers?id=${c._id}` })),
      ...projects.map(p => ({ id: p._id, type: "Project", title: p.name, subtitle: p.displayId, url: `/dashboard/projects?id=${p._id}` })),
      ...invoices.map(i => ({ id: i._id, type: "Invoice", title: i.invoiceNumber, subtitle: `$${i.amount || 0}`, url: `/dashboard/invoices?id=${i._id}` }))
    ];

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
