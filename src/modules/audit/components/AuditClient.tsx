"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
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
      cell: (log) => <span className="text-muted-foreground font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</span>
    },
    {
      header: "User / Actor",
      cell: (log) => (
        <span className="text-primary font-medium font-mono text-xs">
          {log.userId?.email || log.userId?.name || "System"} 
          {log.ipAddress && <span className="text-muted-foreground/60 text-[10px] ml-1">({log.ipAddress})</span>}
        </span>
      )
    },
    {
      header: "Action Taken",
      cell: (log) => <span className="text-foreground font-semibold font-mono text-xs">{log.action}</span>
    },
    {
      header: "Target Resource",
      cell: (log) => <span className="text-muted-foreground font-mono text-xs">{log.recordId}</span>
    },
    {
      header: "Module",
      className: "text-right",
      cell: (log) => (
        <div className="flex justify-end">
          <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground border border-border">
            {log.module}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader
        title={title}
        description={description}
      >
          <button 
            onClick={exportCSV} 
            className="px-4 py-2 bg-foreground hover:bg-foreground/90 text-sm font-medium text-background rounded-lg transition-colors border border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Export CSV
          </button>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isFilterOpen ? 'bg-primary/10 text-primary border-primary/20' : 'bg-background text-foreground border-border hover:bg-muted'}`}
          >
            Filter Logs
          </button>
      </PageHeader>

      {isFilterOpen && (
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Module Filter</label>
            <select 
              value={moduleFilter}
              onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
              className="w-full bg-background border-border text-foreground rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border outline-none transition-colors"
            >
              <option value="">All Modules</option>
              <option value="Leads">LEADS</option>
              <option value="Projects">PROJECTS</option>
              <option value="Settings">SETTINGS</option>
              <option value="Forms">FORMS</option>
              <option value="Users">USERS</option>
              <option value="Auth">AUTH</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Action Filter</label>
            <select 
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full bg-background border-border text-foreground rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border outline-none transition-colors"
            >
              <option value="">All Actions</option>
              <option value="Create">CREATE</option>
              <option value="Update">UPDATE</option>
              <option value="Delete">DELETE</option>
              <option value="Login">LOGIN</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { setModuleFilter(""); setActionFilter(""); setPage(1); }}
              className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
