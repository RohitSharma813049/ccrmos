"use client";

import { useState, useEffect } from "react";
import DynamicFormBuilder from "@/components/ui/DynamicFormBuilder";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

export default function LeadsClient() {
  const [leads, setLeads] = useState<any[]>([]);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedProjectForImport, setSelectedProjectForImport] = useState<string>("");

  // Configure fields that can be dynamically filtered
  const filterFields = [
    { name: "firstName", label: "First Name", type: "string" as const },
    { name: "lastName", label: "Last Name", type: "string" as const },
    { name: "email", label: "Email", type: "string" as const },
    { name: "phone", label: "Phone", type: "string" as const },
    { name: "source", label: "Lead Source", type: "string" as const },
    { name: "status", label: "Status", type: "string" as const },
    { name: "value", label: "Estimated Value", type: "number" as const },
    { name: "customData.campaign", label: "Campaign (Custom)", type: "string" as const },
    { name: "customData.budget", label: "Budget (Custom)", type: "number" as const },
    { name: "customData.formName", label: "Form Name", type: "string" as const },
    { name: "customData.projectId", label: "Project ID", type: "string" as const },
  ];

  useEffect(() => {
    fetchPipeline();
    fetchProjects();
    fetchLeads();
  }, [page, search, statusFilter, dateFrom, dateTo]);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects?limit=100");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchPipeline() {
    try {
      const res = await fetch("/api/pipelines?module=lead");
      if (res.ok) {
        const data = await res.json();
        setPipelineStages(data.pipeline?.stages || []);
      }
    } catch (e) {
      console.error("Failed to fetch pipeline", e);
    }
  }

  async function fetchLeads() {
    try {
      setLoading(true);
      const filterStr = encodeURIComponent(JSON.stringify(advancedFilters));
      const res = await fetch(`/api/leads?page=${page}&limit=10&search=${search}&status=${statusFilter}&dateFrom=${dateFrom}&dateTo=${dateTo}&filters=${filterStr}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        if (data.totalPages) setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (formData: any) => {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchLeads();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save lead");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: leadId, status: newStatus })
      });
      if (res.ok) {
        fetchLeads();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update lead status");
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

  const handleExport = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one lead to export.");
      return;
    }
    const selectedLeads = leads.filter(l => selectedIds.includes(l._id));
    if (!selectedLeads.length) return;
    
    // Simple CSV generation
    const headers = ["First Name", "Last Name", "Email", "Phone", "Status", "Date Added"];
    const rows = selectedLeads.map(l => [
      l.firstName || "",
      l.lastName || "",
      l.email || "",
      l.phone || "",
      l.status || "",
      new Date(l.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      if (rows.length < 2) throw new Error("CSV file must have a header row and data.");
      
      const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const importedLeads = rows.slice(1).map(row => {
        // Simple naive CSV splitting
        const cols = row.split(',').map(c => c.trim().replace(/"/g, ''));
        const lead: any = { customData: {} };
        headers.forEach((h, i) => {
          const val = cols[i];
          if (!val) return;
          const hLower = h.toLowerCase();
          if (hLower.includes('first')) lead.firstName = val;
          else if (hLower.includes('last')) lead.lastName = val;
          else if (hLower.includes('email')) lead.email = val;
          else if (hLower.includes('phone')) lead.phone = val;
          else if (hLower.includes('status')) lead.status = val;
          else lead.customData[h] = val; // everything else goes to custom data
        });
        // fallback required fields
        if (!lead.firstName) lead.firstName = "Imported";
        if (!lead.lastName) lead.lastName = "Lead";
        if (selectedProjectForImport) {
          lead.customData.projectId = selectedProjectForImport;
        }
        return lead;
      });

      const res = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: importedLeads })
      });

      if (res.ok) {
        setIsImportModalOpen(false);
        fetchLeads();
        alert(`Successfully imported ${importedLeads.length} leads.`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to import leads");
      }
    } catch (err: any) {
      alert("Import error: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    { header: "Name", cell: (item) => <span className="font-medium text-gray-900">{item.firstName} {item.lastName}</span> },
    { header: "Email", accessorKey: "email", cell: (item) => <span className="text-gray-600">{item.email || '-'}</span> },
    { header: "Date Added", cell: (item) => <span className="text-gray-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span> },
    { header: "Status (Pipeline)", className: "min-w-[200px]", cell: (item) => (
      pipelineStages.length > 0 ? (
        <select
          value={item.status}
          onChange={(e) => updateLeadStatus(item._id, e.target.value)}
          className="w-full text-sm border-gray-300 rounded-lg shadow-sm py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 border bg-white text-gray-700 font-medium cursor-pointer"
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
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
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
    )}
  ];

  const filterControls = (
    <>
      <select
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        className="py-2 pl-3 pr-8 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 bg-white"
      >
        <option value="">All Statuses</option>
        {pipelineStages.sort((a,b) => a.order - b.order).map(stage => (
          <option key={stage.name} value={stage.name}>{stage.name}</option>
        ))}
      </select>
      
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
        <label>From:</label>
        <input 
          type="date" 
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="bg-transparent border-none p-0 focus:ring-0 text-sm outline-none cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Leads</h1>
          <p className="text-gray-600 mt-1">Manage your pipeline and dynamic lead data.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasPermission("Leads", "Create") && (
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all shadow-sm text-sm"
            >
              Import CSV
            </button>
          )}

          {hasPermission("Leads", "Create") && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
          )}
        </div>
      </div>

      <DataTable 
        data={leads}
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
        onApplyAdvancedFilters={fetchLeads}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        actions={
          selectedIds.length > 0 && (
            <button 
              onClick={handleExport}
              className="text-sm font-medium px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm"
            >
              Export Selected ({selectedIds.length})
            </button>
          )
        }
        emptyTitle="No leads found"
        emptyDescription={search || statusFilter || dateFrom || dateTo || advancedFilters.length > 0 ? "No leads matched your search or filters." : "You haven't added any leads yet."}
        emptyAction={
          !search && !statusFilter && !dateFrom && !dateTo && advancedFilters.length === 0 ? 
            <Button size="sm" onClick={() => setIsModalOpen(true)}>Add Lead</Button> 
            : null
        }
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Lead</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <DynamicFormBuilder 
                targetModule="lead" 
                onSubmit={handleSave} 
                onCancel={() => setIsModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Import Leads from CSV</h2>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
                  <p>Upload a CSV file with your leads.</p>
                  <p className="mt-1 font-medium">Standard columns:</p>
                  <p className="text-xs">First Name, Last Name, Email, Phone, Status</p>
                  <p className="mt-1 text-xs text-blue-600">Any other columns will be stored automatically in custom data!</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Project (Optional)</label>
                  <select
                    value={selectedProjectForImport}
                    onChange={(e) => setSelectedProjectForImport(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None (Standalone)</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select CSV File</label>
                  <input 
                    type="file" 
                    name="file" 
                    accept=".csv"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={importing} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                    {importing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Importing...
                      </>
                    ) : "Upload & Import"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}