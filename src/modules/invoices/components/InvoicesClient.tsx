"use client";

import { useState, useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DynamicFormBuilder from "@/components/ui/DynamicFormBuilder";
import { formatCurrency } from "@/utils/currency";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

export default function InvoicesClient() {
  const [items, setItems] = useState<any[]>([]);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  
  // New Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hasPermission, session } = usePermissions();

  const [advancedFilters, setAdvancedFilters] = useState<any[]>([]);

  // Configure fields that can be dynamically filtered
  const filterFields = [
    { name: "invoiceNumber", label: "Invoice #", type: "string" as const },
    { name: "amount", label: "Amount", type: "number" as const },
    { name: "status", label: "Status", type: "string" as const },
    { name: "customData.notes", label: "Notes (Custom)", type: "string" as const },
  ];

  useEffect(() => {
    fetchPipeline();
    fetchItems();
  }, [page, search, statusFilter, dateFrom, dateTo]);

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
      }
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (formData: any) => {
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchItems();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
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

  const columns: ColumnDef<any>[] = [
    { header: "Invoice #", accessorKey: "invoiceNumber", className: "font-medium text-foreground" },
    { header: "Amount", cell: (item) => formatCurrency(item.amount, item.currency || 'USD') },
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
    { header: "Status (Pipeline)", className: "min-w-[200px]", cell: (item) => (
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
    { header: "Custom Data", cell: (item) => (
      <div className="text-xs text-muted-foreground">
        {item.customData && Object.keys(item.customData).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(item.customData).map(([k, v]) => (
              <span key={k} className="bg-muted border border-border px-2 py-1 rounded text-foreground">
                <strong className="text-foreground">{k}:</strong> {String(v)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground/50">None</span>
        )}
      </div>
    )},
    { header: "Actions", className: "text-right", cell: (item) => (
      <div className="flex items-center justify-end gap-2">
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
        description="Manage invoices and dynamic fields."
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
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold text-foreground">Add Invoice</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <DynamicFormBuilder 
                targetModule="invoice" 
                onSubmit={handleSave} 
                onCancel={() => setIsModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
