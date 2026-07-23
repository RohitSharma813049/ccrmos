"use client";

import { useState, useEffect } from "react";
import DynamicFormBuilder from "@/components/ui/DynamicFormBuilder";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import KanbanBoard, { KanbanCard } from "@/components/ui/KanbanBoard";

export default function LeadsClient() {
  const [leads, setLeads] = useState<any[]>([]);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  
  // New Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<any | null>(null);
  const { hasPermission, session } = usePermissions();

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
  }, [page, search, statusFilter, dateFrom, dateTo, viewMode]);

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
      const limit = viewMode === "board" ? 200 : 10;
      const appliedStatus = showRecycleBin ? "Archived" : statusFilter;
      const res = await fetch(`/api/leads?page=${page}&limit=${limit}&search=${search}&status=${appliedStatus}&dateFrom=${dateFrom}&dateTo=${dateTo}&filters=${filterStr}`);
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
    // Allow moving to next stages, or backwards. For now, allow all.
    return false;
  };

  const getStageColorClass = (stageName: string, allStages: any[]) => {
    if (stageName === 'Archived') return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    if (!allStages || allStages.length === 0) return 'bg-primary/10 text-primary border-primary/20';
    const sorted = [...allStages].sort((a,b) => a.order - b.order);
    const index = sorted.findIndex(s => s.name === stageName);
    if (index === -1) return 'bg-primary/10 text-primary border-primary/20';
    
    const progress = index / (sorted.length - 1);
    if (progress <= 0.33) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    if (progress <= 0.66) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
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

  const handleBulkDelete = async (ids: string[]) => {
    const confirmation = window.prompt(`Are you sure you want to permanently delete ${ids.length} leads?\n\nType DELETE to confirm:`);
    if (confirmation !== "DELETE") return;
    
    try {
      const res = await fetch("/api/leads/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchLeads();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to bulk delete leads");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkStatusChange = async (ids: string[]) => {
    const newStatus = window.prompt(`Enter new status for ${ids.length} leads:\n(Available statuses: ${pipelineStages.map(s => s.name).join(", ")})`);
    if (!newStatus) return;
    
    if (!pipelineStages.some(s => s.name.toLowerCase() === newStatus.toLowerCase())) {
      alert("Invalid status entered.");
      return;
    }
    
    try {
      const res = await fetch("/api/leads/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, data: { status: pipelineStages.find(s => s.name.toLowerCase() === newStatus.toLowerCase())?.name } })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchLeads();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to bulk update leads");
      }
    } catch (e) {
      console.error(e);
    }
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
          else lead.customData[h] = val; 
        });
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
    {
      id: "select",
      header: (
        <input 
          type="checkbox" 
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(leads.map(l => l._id));
            } else {
              setSelectedIds([]);
            }
          }}
          checked={selectedIds.length > 0 && selectedIds.length === leads.length}
          className="rounded border-border text-primary focus:ring-primary/20"
        />
      ),
      cell: (item) => (
        <input 
          type="checkbox"
          checked={selectedIds.includes(item._id)}
          onChange={(e) => {
            if (e.target.checked) setSelectedIds(prev => [...prev, item._id]);
            else setSelectedIds(prev => prev.filter(id => id !== item._id));
          }}
          className="rounded border-border text-primary focus:ring-primary/20"
        />
      )
    },
    { header: "Lead Info", cell: (item) => (
      <div>
        <div className="font-medium text-primary hover:underline cursor-pointer" onClick={() => setSelectedLeadForDetails(item)}>
          {item.firstName} {item.lastName}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Score: <span className="font-semibold text-foreground">{item.leadScore || 5}/10</span>
        </div>
      </div>
    )},
    { header: "Contact Details", cell: (item) => (
      <div className="flex flex-col gap-1 text-sm text-foreground">
        <span>{item.email}</span>
        {item.phone && <span className="text-muted-foreground">{item.phone}</span>}
        <div className="flex gap-2 mt-1">
          {item.phone && (
            <>
              <a href={`tel:${item.phone}`} title="Call" className="text-muted-foreground hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </a>
              <a href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </a>
            </>
          )}
          {item.email && (
            <a href={`mailto:${item.email}`} title="Email" className="text-muted-foreground hover:text-rose-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </a>
          )}
        </div>
      </div>
    )},
    { header: "Date Added", cell: (item) => <span className="text-muted-foreground text-xs">{new Date(item.createdAt).toLocaleDateString()}</span> },
    { header: "Status (Pipeline)", className: "min-w-[200px]", cell: (item) => (
      pipelineStages.length > 0 ? (
        <select
          value={item.status}
          onChange={(e) => updateLeadStatus(item._id, e.target.value)}
          className={`w-full text-xs font-semibold rounded-lg shadow-sm py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary focus:border-primary border cursor-pointer ${getStageColorClass(item.status, pipelineStages)}`}
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
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStageColorClass(item.status, [])}`}>
          {item.status}
        </span>
      )
    )},
    { header: "Incoming / Custom Data", cell: (item) => (
      <div className="text-xs text-muted-foreground max-w-sm">
        {item.customData?.lastMessage && (
          <div className="mb-2 p-2.5 bg-accent/10 border border-accent/20 text-accent-foreground rounded-lg whitespace-pre-wrap break-words shadow-sm">
            <strong className="flex items-center gap-1.5 text-accent-foreground mb-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Latest Message
            </strong>
            <span className="text-[13px]">{item.customData.lastMessage}</span>
          </div>
        )}
        {item.customData && Object.keys(item.customData).filter(k => k !== 'lastMessage' && k !== 'whatsappOptIn' && !k.startsWith('_')).length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(item.customData)
              .filter(([k]) => k !== 'lastMessage' && k !== 'whatsappOptIn' && !k.startsWith('_'))
              .map(([k, v]) => (
              <span key={k} className="bg-muted border border-border px-2 py-1 rounded-md text-foreground">
                <strong className="text-foreground capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</strong> {String(v)}
              </span>
            ))}
          </div>
        ) : (
          !item.customData?.lastMessage && <span className="text-muted-foreground/50">No additional data</span>
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
      
      <button 
        onClick={() => setShowRecycleBin(!showRecycleBin)}
        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${showRecycleBin ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-card text-muted-foreground border-border hover:bg-muted'}`}
      >
        {showRecycleBin ? "Exit Recycle Bin" : "Recycle Bin"}
      </button>

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
        title="Sales Leads"
        description="Manage your pipeline and dynamic lead data."
      >
          <div className="flex bg-muted p-1 rounded-xl">
            <button
              onClick={() => { setViewMode("list"); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              List View
            </button>
            <button
              onClick={() => { setViewMode("board"); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'board' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Board View
            </button>
          </div>

          {hasPermission("Leads", "Create") && (
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-card border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-all shadow-sm text-sm"
            >
              Import CSV
            </button>
          )}

          {hasPermission("Leads", "Create") && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
          )}
      </PageHeader>

      {viewMode === "list" ? (
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
          bulkActions={[
            { label: "Update Status", onClick: handleBulkStatusChange },
            { label: "Delete Selected", onClick: handleBulkDelete, variant: "destructive" }
          ]}
          actions={
            selectedIds.length > 0 && (
              <button 
                onClick={handleExport}
                className="text-sm font-medium px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted text-foreground shadow-sm"
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
      ) : (
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-4">
            {filterControls}
          </div>
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading board...</div>
          ) : (
            <KanbanBoard 
              columns={pipelineStages.sort((a,b) => a.order - b.order).map(s => s.name)}
              cards={leads.map(l => {
                const phone = l.phone || l.customData?.phoneNumber || l.phoneNumber;
                const displayName = l.firstName === "WhatsApp Lead" || l.firstName === "Imported" 
                  ? phone || l.firstName 
                  : `${l.firstName} ${l.lastName !== "WhatsApp" && l.lastName !== "Lead" ? l.lastName : ""}`.trim();
                return {
                  id: l._id,
                  title: displayName,
                  subtitle: l.email && !l.email.includes('@whatsapp') ? l.email : phone,
                  status: l.status || "New Lead",
                };
              })}
              onCardMoved={updateLeadStatus}
              onCardClick={(id) => {
                const lead = leads.find(l => l._id === id);
                if (lead) setSelectedLeadForDetails(lead);
              }}
            />
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold text-foreground">Create New Lead</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
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
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold text-foreground">Import Leads from CSV</h2>
              <button onClick={() => setIsImportModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div className="p-4 bg-primary/10 text-primary-foreground text-sm rounded-lg border border-primary/20">
                  <p>Upload a CSV file with your leads.</p>
                  <p className="mt-1 font-medium">Standard columns:</p>
                  <p className="text-xs">First Name, Last Name, Email, Phone, Status</p>
                  <p className="mt-1 text-xs text-primary">Any other columns will be stored automatically in custom data!</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Assign to Project (Optional)</label>
                  <select
                    value={selectedProjectForImport}
                    onChange={(e) => setSelectedProjectForImport(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-card"
                  >
                    <option value="">None (Standalone)</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Select CSV File</label>
                  <input 
                    type="file" 
                    name="file" 
                    accept=".csv"
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 bg-card"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={importing} className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
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

      {selectedLeadForDetails && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedLeadForDetails(null)} />
          <div className="relative w-full max-w-md bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedLeadForDetails.firstName} {selectedLeadForDetails.lastName}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedLeadForDetails.email}</p>
              </div>
              <button onClick={() => setSelectedLeadForDetails(null)} className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-card custom-scrollbar">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Activity Timeline
              </h3>
              
              <div className="relative border-l-2 border-border ml-3 space-y-8 pb-8">
                {(!selectedLeadForDetails.activities || selectedLeadForDetails.activities.length === 0) ? (
                  <div className="ml-6 text-sm text-muted-foreground italic">No activities recorded yet.</div>
                ) : (
                  [...selectedLeadForDetails.activities].reverse().map((activity: any, index: number) => (
                    <div key={index} className="relative ml-6">
                      <span className="absolute -left-[35px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-card bg-primary"></span>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-foreground">{activity.type}</span>
                        <span className="text-sm text-muted-foreground">{activity.description}</span>
                        <span className="text-xs font-medium text-muted-foreground/70 mt-1 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-6 border-t border-border bg-muted/30 shrink-0">
              <button 
                onClick={() => setSelectedLeadForDetails(null)} 
                className="w-full px-4 py-2 bg-card border border-border hover:bg-muted text-foreground font-medium rounded-xl shadow-sm transition-colors text-sm"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}