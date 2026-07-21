"use client";

import { useState, useEffect } from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

export default function AuditClient({ 
  title = "Global Audit Logs", 
  description = "Immutable record of all critical actions performed across the platform." 
}: { 
  title?: string, 
  description?: string 
}) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Filtering state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (search) params.append("search", search);
      if (moduleFilter) params.append("module", moduleFilter);
      if (actionFilter) params.append("action", actionFilter);

      const res = await fetch(`/api/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.totalPages) setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, [page, search, moduleFilter, actionFilter]);

  const exportCSV = () => {
    if (logs.length === 0) {
      alert("No logs to export.");
      return;
    }

    const headers = ["Timestamp", "User", "Action", "Module", "Record ID", "IP Address"];
    const csvRows = [headers.join(",")];

    for (const log of logs) {
      const row = [
        new Date(log.createdAt).toLocaleString(),
        log.userId?.email || log.userId?.name || "System",
        log.action,
        log.module,
        log.recordId,
        log.ipAddress || ""
      ];
      // Escape commas and quotes
      const escapedRow = row.map(v => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(escapedRow.join(","));
    }

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Timestamp",
      cell: (log) => <span className="text-gray-600 font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</span>
    },
    {
      header: "User / Actor",
      cell: (log) => (
        <span className="text-blue-500 font-medium font-mono text-xs">
          {log.userId?.email || log.userId?.name || "System"} 
          {log.ipAddress && <span className="text-gray-400 text-[10px] ml-1">({log.ipAddress})</span>}
        </span>
      )
    },
    {
      header: "Action Taken",
      cell: (log) => <span className="text-gray-900 font-semibold font-mono text-xs">{log.action}</span>
    },
    {
      header: "Target Resource",
      cell: (log) => <span className="text-gray-600 font-mono text-xs">{log.recordId}</span>
    },
    {
      header: "Module",
      className: "text-right",
      cell: (log) => (
        <div className="flex justify-end">
          <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
            {log.module}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV} 
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-sm font-medium text-white rounded-lg transition-colors border border-gray-900"
          >
            Export CSV
          </button>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${isFilterOpen ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            Filter Logs
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Module Filter</label>
            <input 
              type="text" 
              placeholder="e.g., LEADS, SETTINGS" 
              value={moduleFilter}
              onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Action Filter</label>
            <input 
              type="text" 
              placeholder="e.g., UPDATE, DELETE" 
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border outline-none"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { setModuleFilter(""); setActionFilter(""); setPage(1); }}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <DataTable 
        data={logs}
        columns={columns}
        loading={loading}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle="No logs found"
        emptyDescription="There are no audit logs matching your criteria."
      />
    </div>
  );
}
