"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SharedInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/shared/invoice/${token}`);
        if (res.ok) {
          const data = await res.json();
          setInvoice(data.invoice);
        } else {
          const err = await res.json();
          setError(err.error || "Failed to load invoice");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    
    if (token) fetchInvoice();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-lg">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive font-semibold bg-destructive/10 p-6 rounded-xl border border-destructive/20 shadow-sm max-w-md w-full text-center">
          <svg className="w-12 h-12 text-destructive mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h1 className="text-xl mb-2">Invalid or Expired Link</h1>
          <p className="text-sm opacity-80">{error || "This invoice could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-primary/5 p-8 sm:p-12 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">INVOICE</h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">#{invoice.displayId || invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold ${
                invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 
                invoice.status === 'Overdue' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 
                'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">Bill To</h3>
              <p className="text-foreground font-medium">{invoice.customData?.customerName || "Customer"}</p>
              <p className="text-muted-foreground text-sm mt-1">{invoice.customData?.customerEmail || ""}</p>
            </div>
            <div className="sm:text-right">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">Invoice Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground">{new Date(invoice.createdAt).toLocaleDateString()}</span></p>
                {invoice.customData?.dueDate && (
                  <p><span className="text-muted-foreground">Due Date:</span> <span className="font-medium text-foreground">{new Date(invoice.customData.dueDate).toLocaleDateString()}</span></p>
                )}
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl overflow-hidden mb-12">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium py-3 px-4">Description</th>
                  <th className="text-right font-medium py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Simplified single item for now, robust implementations would map line items */}
                <tr>
                  <td className="py-4 px-4 text-foreground font-medium">Service Rendered</td>
                  <td className="py-4 px-4 text-right text-foreground font-medium">${invoice.amount}</td>
                </tr>
              </tbody>
              <tfoot className="bg-muted/30">
                <tr>
                  <td className="py-4 px-4 text-right font-bold text-foreground">Total</td>
                  <td className="py-4 px-4 text-right font-bold text-primary text-xl">${invoice.amount}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="pt-8 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none" onClick={() => window.print()}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
