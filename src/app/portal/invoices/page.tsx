import { getPortalSession } from "@/lib/portal-auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Invoice from "@/modules/invoices/schemas/Invoice";

export default async function PortalInvoices() {
  const session = await getPortalSession();
  
  if (!session) {
    redirect("/portal/login");
  }

  await dbConnect();

  const invoices = await Invoice.find({ "customData.customerId": session.customerId })
    .sort({ issueDate: -1 })
    .lean();

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Invoices</h1>
        <p className="text-zinc-500 mt-1 text-sm">View your billing history and outstanding balances.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {invoices.map((inv: any) => (
                  <tr key={inv._id.toString()} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-900">{inv.displayId}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{new Date(inv.issueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-zinc-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-zinc-900">
                      ${(inv.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900">No invoices</h3>
            <p className="text-zinc-500 mt-1">You don't have any invoices yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
