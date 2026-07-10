"use client";

import { useState, useEffect } from "react";

export default function AuditClient() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, actionFilter]); // Refetch if filters change

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (moduleFilter) params.append("module", moduleFilter);
      if (actionFilter) params.append("action", actionFilter);

      const res = await fetch(`/api/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Global Audit Logs</h1>
          <p className="text-gray-600 mt-1">Immutable record of all critical actions performed across the platform.</p>
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
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Action Filter</label>
            <input 
              type="text" 
              placeholder="e.g., UPDATE, DELETE" 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border outline-none"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { setModuleFilter(""); setActionFilter(""); }}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100/50 text-xs uppercase text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User / Actor</th>
                <th className="px-6 py-4">Action Taken</th>
                <th className="px-6 py-4">Target Resource</th>
                <th className="px-6 py-4 text-right">Module</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 font-mono text-xs">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No logs found.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-100/30 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-blue-500 font-medium">
                      {log.userId?.email || log.userId?.name || "System"} 
                      {log.ipAddress && <span className="text-gray-400 text-[10px] ml-1">({log.ipAddress})</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">{log.action}</td>
                    <td className="px-6 py-4 text-gray-600">{log.recordId}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                        {log.module}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
