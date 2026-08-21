"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DynamicFormBuilder from "@/components/ui/DynamicFormBuilder";
import { formatCurrency } from "@/utils/currency";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

export default function InvoicesClient() {
  const [items, setItems] = useState<any[]>([]);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"standard" | "line_items">("line_items");

  // Line items state for backend calculation
  const [lineItems, setLineItems] = useState<ILineItem[]>([
    { description: "Item 1", quantity: 1, unitPrice: 100 }
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");

  // Backend calculation state
  const [calculation, setCalculation] = useState<any>({
    subtotal: 100,
    taxAmount: 0,
    discountAmount: 0,
    shippingFee: 0,
    amount: 100,
    items: lineItems
  });
  const [calcLoading, setCalcLoading] = useState(false);

  const { hasPermission, session } = usePermissions();
  const [advancedFilters, setAdvancedFilters] = useState<any[]>([]);

  const filterFields = [
    { name: "invoiceNumber", label: "Invoice #", type: "string" as const },
    { name: "amount", label: "Amount", type: "number" as const },
    { name: "status", label: "Status", type: "string" as const },
    { name: "customData.notes", label: "Notes (Custom)", type: "string" as const },
  ];

  const [summary, setSummary] = useState<any>({
    totalAmount: 0,
    totalSubtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    count: 0
  });

  useEffect(() => {
    fetchPipeline();
    fetchItems();
  }, [page, search, statusFilter, dateFrom, dateTo]);

  // Request backend calculation whenever items/rates change
  const fetchBackendCalculation = useCallback(async () => {
    try {
      setCalcLoading(true);
      const res = await fetch("/api/invoices/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lineItems,
          taxRate,
          discountRate,
          shippingFee,
          currency
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.calculation) {
          setCalculation(data.calculation);
        }
      }
    } catch (e) {
      console.error("Backend calculation error", e);
    } finally {
      setCalcLoading(false);
    }
  }, [lineItems, taxRate, discountRate, shippingFee, currency]);

  useEffect(() => {
    if (isModalOpen && activeTab === "line_items") {
      fetchBackendCalculation();
    }
  }, [lineItems, taxRate, discountRate, shippingFee, currency, isModalOpen, activeTab, fetchBackendCalculation]);

  async function fetchPipeline() {
    try {
      const res = await fetch("/api/pipelines?module=invoice");
      if (res.ok) {
        const data = await res.json();
        setPipelineStages(data.pipeline?.stages || []);
      }
    } catch (e) {
      console.error("Failed to fetch pipeline", e);
    }
  }

  async function fetchItems() {
    try {
      setLoading(true);
      const filterStr = encodeURIComponent(JSON.stringify(advancedFilters));
      const res = await fetch(`/api/invoices?page=${page}&limit=10&search=${search}&status=${statusFilter}&dateFrom=${dateFrom}&dateTo=${dateTo}&filters=${filterStr}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.invoices || []);
        if (data.totalPages) setTotalPages(data.totalPages);
        if (data.summary) setSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (formData: any) => {
    try {
      const payload = activeTab === "line_items" ? {
        invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
        items: calculation.items || lineItems,
        taxRate,
        discountRate,
        shippingFee,
        currency,
        subtotal: calculation.subtotal,
        taxAmount: calculation.taxAmount,
        discountAmount: calculation.discountAmount,
        amount: calculation.amount
      } : formData;

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchItems();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save invoice");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status: newStatus })
      });
      if (res.ok) {
        fetchItems();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update status");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isStageDisabled = (currentStatus: string, targetStage: any) => {
    const currentIndex = pipelineStages.findIndex(s => s.name === currentStatus);
    if (currentIndex === -1) return false;
    return targetStage.order < pipelineStages[currentIndex].order;
  };

  const handleApproveReject = async (id: string, newApprovalStatus: string) => {
    try {
      const res = await fetch("/api/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, approvalStatus: newApprovalStatus })
      });
      if (res.ok) {
        fetchItems();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update approval status");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/share`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        navigator.clipboard.writeText(data.shareUrl);
        alert(`Share link copied to clipboard:\n${data.shareUrl}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to generate share link");
      }
    } catch (e) {
      console.error(e);
      alert("Error sharing invoice");
    }
  };

  const handleStripePay = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/pay`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to initiate Stripe checkout");
      }
    } catch (e) {
      console.error(e);
      alert("Error initiating payment");
    }
  };

  // Item management helper methods
  const addLineItem = () => {
    setLineItems(prev => [...prev, { description: `Item ${prev.length + 1}`, quantity: 1, unitPrice: 0 }]);
  };

  const updateLineItem = (index: number, field: keyof ILineItem, value: any) => {
    setLineItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const columns: ColumnDef<any>[] = [
    { 
      header: "Invoice #", 
      cell: (item) => (
        <div>
          <span className="font-semibold text-foreground">{item.invoiceNumber || item.displayId}</span>
          {item.displayId && <span className="text-xs text-muted-foreground block">{item.displayId}</span>}
        </div>
      )
    },
    { 
      header: "Subtotal", 
      cell: (item) => (
        <span className="text-muted-foreground text-sm font-medium">
          {formatCurrency(item.subtotal || item.amount || 0, item.currency || 'USD')}
        </span>
      )
    },
    { 
      header: "Tax / Disc", 
      cell: (item) => (
        <div className="text-xs text-muted-foreground">
          {item.taxRate > 0 && <span className="text-emerald-600 font-medium block">Tax ({item.taxRate}%): +{formatCurrency(item.taxAmount || 0, item.currency || 'USD')}</span>}
          {item.discountRate > 0 && <span className="text-amber-600 font-medium block">Disc ({item.discountRate}%): -{formatCurrency(item.discountAmount || 0, item.currency || 'USD')}</span>}
          {!item.taxRate && !item.discountRate && <span>None</span>}
        </div>
      )
    },
    { 
      header: "Grand Total", 
      cell: (item) => (
        <span className="font-bold text-foreground text-base">
          {formatCurrency(item.amount, item.currency || 'USD')}
        </span>
      ) 
    },
    { header: "Approval", cell: (item) => (
      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
        item.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
        item.approvalStatus === 'Rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
        'bg-amber-500/10 text-amber-600 border-amber-500/20'
      }`}>
        {item.approvalStatus || 'Pending'}
      </span>
    )},
    { header: "Date Added", cell: (item) => <span className="text-muted-foreground text-xs">{new Date(item.createdAt).toLocaleDateString()}</span> },
    { header: "Status (Pipeline)", className: "min-w-[180px]", cell: (item) => (
      pipelineStages.length > 0 ? (
        <select
          value={item.status}
          onChange={(e) => updateStatus(item._id, e.target.value)}
          className="w-full text-sm border-border rounded-lg shadow-sm py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary border bg-card text-foreground font-medium cursor-pointer"
        >
          {!pipelineStages.find(s => s.name === item.status) && (
            <option value={item.status} disabled>{item.status}</option>
          )}
          
          {pipelineStages.sort((a,b) => a.order - b.order).map(stage => (
            <option 
              key={stage.name} 
              value={stage.name}
              disabled={isStageDisabled(item.status, stage)}
            >
              {stage.name} {isStageDisabled(item.status, stage) ? '(Locked)' : ''}
            </option>
          ))}
        </select>
      ) : (
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          {item.status}
        </span>
      )
    )},
    { header: "Actions", className: "text-right", cell: (item) => (
      <div className="flex items-center justify-end gap-2">
        {item.status !== 'Paid' && (
          <button 
            onClick={() => handleStripePay(item._id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-xs shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Pay Now
          </button>
        )}
        <button 
          onClick={() => handleShare(item._id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-primary/10 text-primary hover:text-primary/80 font-medium rounded-lg transition-colors text-xs border border-transparent hover:border-primary/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          Share
        </button>
        <button 
          onClick={() => generateInvoicePDF(item)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-primary/10 text-primary hover:text-primary/80 font-medium rounded-lg transition-colors text-xs border border-transparent hover:border-primary/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF
        </button>
        {session?.user?.hierarchyLevel <= 2 && (!item.approvalStatus || item.approvalStatus === 'Pending') && (
          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-border">
            <button onClick={() => handleApproveReject(item._id, "Approved")} className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </button>
            <button onClick={() => handleApproveReject(item._id, "Rejected")} className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </div>
    )}
  ];

  const filterControls = (
    <>
      <select
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        className="py-2 pl-3 pr-8 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground bg-card"
      >
        <option value="">All Statuses</option>
        {pipelineStages.sort((a,b) => a.order - b.order).map(stage => (
          <option key={stage.name} value={stage.name}>{stage.name}</option>
        ))}
      </select>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary">
        <label>From:</label>
        <input 
          type="date" 
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="bg-transparent border-none p-0 focus:ring-0 text-sm outline-none cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary">
        <label>To:</label>
        <input 
          type="date" 
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="bg-transparent border-none p-0 focus:ring-0 text-sm outline-none cursor-pointer"
        />
      </div>

      {(statusFilter || dateFrom || dateTo) && (
        <button 
          onClick={() => {
            setStatusFilter("");
            setDateFrom("");
            setDateTo("");
            setPage(1);
          }}
          className="text-sm text-destructive hover:text-destructive/80 font-medium px-2 py-1 rounded hover:bg-destructive/10 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </>
  );

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader
        title="Invoices"
        description="Manage invoices with automated backend billing calculations."
      >
        {hasPermission("Invoices", "Create") && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Invoice
          </button>
        )}
      </PageHeader>

      {/* Backend Aggregation Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium block">Total Filtered Invoices</span>
          <span className="text-2xl font-bold text-foreground mt-1 block">{summary.count || items.length}</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium block">Total Revenue (Backend Aggregated)</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{formatCurrency(summary.totalAmount || 0, 'USD')}</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium block">Total Subtotal</span>
          <span className="text-2xl font-bold text-foreground mt-1 block">{formatCurrency(summary.totalSubtotal || 0, 'USD')}</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium block">Total Taxes & Discounts</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-emerald-600">Tax: +{formatCurrency(summary.totalTax || 0, 'USD')}</span>
            <span className="text-sm font-bold text-amber-600">Disc: -{formatCurrency(summary.totalDiscount || 0, 'USD')}</span>
          </div>
        </div>
      </div>

      <DataTable 
        data={items}
        columns={columns}
        loading={loading}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        filters={filterControls}
        filterFields={filterFields}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={setAdvancedFilters}
        onApplyAdvancedFilters={fetchItems}
        emptyTitle="No invoices found"
        emptyDescription={search || statusFilter || dateFrom || dateTo || advancedFilters.length > 0 ? "No invoices matched your search or filters." : "You haven't added any invoices yet."}
        emptyAction={
          !search && !statusFilter && !dateFrom && !dateTo && advancedFilters.length === 0 ? 
            <Button size="sm" onClick={() => setIsModalOpen(true)}>Add Invoice</Button> 
            : null
        }
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h2 className="text-xl font-bold text-foreground">Create Invoice</h2>
                <p className="text-xs text-muted-foreground">Calculations calculated real-time by backend API</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mode selector */}
            <div className="flex border-b border-border bg-muted/20 px-6 pt-2">
              <button
                onClick={() => setActiveTab("line_items")}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === "line_items" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Line Items Builder (Backend Engine)
              </button>
              <button
                onClick={() => setActiveTab("standard")}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === "standard" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Custom Dynamic Form
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {activeTab === "standard" ? (
                <DynamicFormBuilder 
                  targetModule="invoice" 
                  onSubmit={handleSave} 
                  onCancel={() => setIsModalOpen(false)} 
                />
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSave({}); }} className="space-y-6">
                  {/* Invoice Header details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Invoice Number <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={invoiceNumber} 
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        placeholder={`INV-${Date.now().toString().slice(-4)}`}
                        className="w-full h-10 px-3 border border-border rounded-xl text-sm bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Currency</label>
                      <select 
                        value={currency} 
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full h-10 px-3 border border-border rounded-xl text-sm bg-background text-foreground"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground">Line Items</h3>
                      <button 
                        type="button" 
                        onClick={addLineItem}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="space-y-2 border border-border rounded-xl p-3 bg-muted/10">
                      {lineItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                            className="flex-1 h-9 px-3 border border-border rounded-lg text-sm bg-background"
                          />
                          <input 
                            type="number" 
                            min="1"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(idx, "quantity", Number(e.target.value))}
                            className="w-16 h-9 px-2 border border-border rounded-lg text-sm bg-background text-center"
                          />
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            placeholder="Unit Price"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(idx, "unitPrice", Number(e.target.value))}
                            className="w-24 h-9 px-2 border border-border rounded-lg text-sm bg-background text-right"
                          />
                          <div className="w-24 text-right text-xs font-semibold text-foreground">
                            {formatCurrency((item.quantity || 1) * (item.unitPrice || 0), currency)}
                          </div>
                          {lineItems.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeLineItem(idx)}
                              className="text-destructive hover:text-destructive/80 p-1"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Taxes, Discounts, Shipping */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Tax Rate (%)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={taxRate} 
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="w-full h-9 px-3 border border-border rounded-xl text-sm bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Discount Rate (%)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={discountRate} 
                        onChange={(e) => setDiscountRate(Number(e.target.value))}
                        className="w-full h-9 px-3 border border-border rounded-xl text-sm bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Shipping Fee</label>
                      <input 
                        type="number" 
                        min="0" 
                        value={shippingFee} 
                        onChange={(e) => setShippingFee(Number(e.target.value))}
                        className="w-full h-9 px-3 border border-border rounded-xl text-sm bg-background text-foreground"
                      />
                    </div>
                  </div>

                  {/* Backend Calculation Output Card */}
                  <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Backend Calculated Subtotal:</span>
                      <span className="font-semibold text-foreground">{formatCurrency(calculation.subtotal || 0, currency)}</span>
                    </div>

                    {calculation.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-xs text-amber-600">
                        <span>Discount ({calculation.discountRate}%):</span>
                        <span className="font-semibold">-{formatCurrency(calculation.discountAmount, currency)}</span>
                      </div>
                    )}

                    {calculation.taxAmount > 0 && (
                      <div className="flex justify-between items-center text-xs text-emerald-600">
                        <span>Tax ({calculation.taxRate}%):</span>
                        <span className="font-semibold">+{formatCurrency(calculation.taxAmount, currency)}</span>
                      </div>
                    )}

                    {calculation.shippingFee > 0 && (
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Shipping Fee:</span>
                        <span className="font-semibold text-foreground">+{formatCurrency(calculation.shippingFee, currency)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-primary/20 flex justify-between items-center">
                      <span className="text-sm font-bold text-foreground">Grand Total (Backend):</span>
                      <span className="text-lg font-bold text-primary">{formatCurrency(calculation.amount || 0, currency)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={calcLoading}>
                      {calcLoading ? "Calculating..." : "Save Invoice"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
