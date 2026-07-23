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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<any | null>(null);
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
      const res = await fetch(`/api/leads?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}&dateFrom=${dateFrom}&dateTo=${dateTo}&filters=${filterStr}`);
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
    { header: "Lead Info", cell: (item) => {
        const phone = item.phone || item.customData?.phoneNumber || item.phoneNumber;
        const displayName = item.firstName === "WhatsApp Lead" || item.firstName === "Imported" 
            ? phone || item.firstName 
            : `${item.firstName} ${item.lastName !== "WhatsApp" && item.lastName !== "Lead" ? item.lastName : ""}`.trim();
        return (
          <div className="flex flex-col gap-1.5">
            <button 
              onClick={() => setSelectedLeadForDetails(item)}
              className="font-medium text-primary hover:text-primary/80 text-sm text-left transition-colors cursor-pointer"
            >
              {displayName}
            </button>
            {phone && (
              <a 
                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-full w-fit border border-green-200 transition-colors mt-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.124.552 4.17 1.6 5.986L.045 24l6.147-1.554c1.737.95 3.693 1.45 5.839 1.45 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.916c-1.802 0-3.57-.483-5.115-1.4l-.367-.217-3.8.966.98-3.7-.238-.378c-1.006-1.597-1.536-3.456-1.536-5.358 0-5.553 4.52-10.073 10.076-10.073 5.553 0 10.076 4.52 10.076 10.073 0 5.554-4.523 10.073-10.076 10.073zm5.526-7.55c-.303-.152-1.794-.886-2.072-.988-.278-.102-.48-.152-.682.152-.202.303-.782.988-.959 1.19-.177.202-.354.227-.657.076-1.844-.925-3.136-2.274-3.904-4.22-.076-.177.076-.278.227-.581.152-.303.303-.454.454-.757.076-.152.038-.278-.038-.429-.076-.152-.682-1.643-.935-2.25-.246-.593-.497-.512-.682-.52-.177-.008-.38-.008-.582-.008-.202 0-.53.076-.808.38C6.915 6.389 6 7.248 6 8.967c0 1.718 1.137 3.385 1.288 3.587.152.202 2.451 3.739 5.937 5.244.834.361 1.485.577 1.992.74.834.267 1.592.228 2.19.138.67-.101 2.072-.846 2.375-1.662.303-.816.303-1.516.215-1.662-.088-.146-.316-.222-.619-.374z"/></svg>
                Chat
              </a>
            )}
          </div>
        ) 
    }},
    { header: "Contact Details", cell: (item) => (
      <div className="flex flex-col text-sm text-muted-foreground gap-1.5">
        {item.email && !item.email.includes('@whatsapp.local') && <span>{item.email}</span>}
        {item.source && (
          <span className="inline-flex w-fit px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
            {item.source}
          </span>
        )}
      </div>
    )},
    { header: "Date Added", cell: (item) => <span className="text-muted-foreground text-xs">{new Date(item.createdAt).toLocaleDateString()}</span> },
    { header: "Status (Pipeline)", className: "min-w-[170px]", cell: (item) => (
      pipelineStages.length > 0 ? (
        <select
          value={item.status}
          onChange={(e) => updateLeadStatus(item._id, e.target.value)}
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