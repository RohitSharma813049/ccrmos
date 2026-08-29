import { getPortalSession } from "@/lib/portal-auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Invoice from "@/modules/invoices/schemas/Invoice";
import Project from "@/modules/projects/schemas/Project";
import Task from "@/modules/tasks/schemas/Task";
import Link from "next/link";
import { ArrowRight, FileText, Briefcase, CheckSquare } from "lucide-react";

export default async function PortalDashboard() {
  const session = await getPortalSession();
  
  if (!session) {
    redirect("/portal/login");
  }

  await dbConnect();

  // Fetch summary stats
  const activeProjects = await Project.countDocuments({ 
    "customData.customerId": session.customerId,
    status: { $in: ["In Progress", "Planning"] }
  });

  const unpaidInvoices = await Invoice.find({
    "customData.customerId": session.customerId,
    status: { $in: ["Sent", "Overdue"] }
  });
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  const pendingTasks = await Task.countDocuments({
    "customData.customerId": session.customerId,
    status: { $ne: "Completed" }
  });

  // Recent invoices for preview
  const recentInvoices = await Invoice.find({ "customData.customerId": session.customerId })
    .sort({ issueDate: -1 })
    .limit(3)
    .lean();

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome back,</h1>
        <p className="text-zinc-500 mt-1">Here is a summary of your account activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Unpaid Balance</p>
              <h3 className="text-2xl font-bold text-zinc-900">${totalUnpaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>
          <Link href="/portal/invoices" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 group">
            View all invoices <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Active Projects</p>
              <h3 className="text-2xl font-bold text-zinc-900">{activeProjects}</h3>
            </div>
          </div>
          <Link href="/portal/projects" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 group">
            View all projects <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
              <CheckSquare size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Pending Tasks</p>
              <h3 className="text-2xl font-bold text-zinc-900">{pendingTasks}</h3>
            </div>
          </div>
          <span className="text-sm text-zinc-400 font-medium">Internal tracking</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-900">Recent Invoices</h2>
          <Link href="/portal/invoices" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">View all</Link>
        </div>
        
        {recentInvoices.length > 0 ? (
          <ul className="divide-y divide-zinc-200">
            {recentInvoices.map((inv: any) => (
              <li key={inv._id.toString()} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div>
                  <p className="font-semibold text-zinc-900">{inv.displayId}</p>
                  <p className="text-sm text-zinc-500">{new Date(inv.issueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-zinc-900">${(inv.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    inv.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <p className="text-zinc-500">You have no recent invoices.</p>
          </div>
        )}
      </div>
    </div>
  );
}
