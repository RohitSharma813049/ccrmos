"use client";

import { useState, useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";
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
  const { hasPermission } = usePermissions();

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

  const columns: ColumnDef<any>[] = [
    { header: "Invoice #", accessorKey: "invoiceNumber", className: "font-medium text-gray-900" },
    { header: "Amount", cell: (item) => formatCurrency(item.amount, item.currency || 'USD') },
    { header: "Date Added", cell: (item) => <span className="text-gray-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span> },
    { header: "Status (Pipeline)", className: "min-w-[200px]", cell: (item) => (
      pipelineStages.length > 0 ? (
        <select
          value={item.status}
          onChange={(e) => updateStatus(item._id, e.target.value)}
          className="w-full text-sm border-gray-300 rounded-lg shadow-sm py-1.5 pl-3 pr-8 focus:ring-pink-500 focus:border-pink-500 border bg-white text-gray-700 font-medium cursor-pointer"
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
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
          {item.status}
        </span>
      )
    )},
    { header: "Custom Data", cell: (item) => (
      <div className="text-xs text-gray-500">
        {item.customData && Object.keys(item.customData).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(item.customData).map(([k, v]) => (
              <span key={k} className="bg-gray-100 border border-gray-200 px-2 py-1 rounded text-gray-700">
                <strong className="text-gray-900">{k}:</strong> {String(v)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">None</span>
        )}
      </div>
    )},
    { header: "Actions", className: "text-right", cell: (item) => (
      <button 
        onClick={() => generateInvoicePDF(item)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-pink-50 text-pink-600 hover:text-pink-700 font-medium rounded-lg transition-colors text-xs"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        PDF
      </button>
    )}
  ];

  const filterControls = (
    <>
      <select
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        className="py-2 pl-3 pr-8 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-gray-700 bg-white"
      >
        <option value="">All Statuses</option>
        {pipelineStages.sort((a,b) => a.order - b.order).map(stage => (
          <option key={stage.name} value={stage.name}>{stage.name}</option>
        ))}
      </select>
      
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-pink-500">
        <label>From:</label>
        <input 
          type="date" 
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="bg-transparent border-none p-0 focus:ring-0 text-sm outline-none cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-pink-500">
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
          className="text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </>
  );

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage invoices and dynamic fields.</p>
        </div>
        {hasPermission("Invoices", "Create") && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Invoice
          </button>
        )}
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Invoice</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
