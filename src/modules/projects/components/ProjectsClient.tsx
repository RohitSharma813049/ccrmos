"use client";

import { useState, useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import DynamicFormBuilder from "@/components/ui/DynamicFormBuilder";
import KanbanBoard, { KanbanCard } from "@/components/ui/KanbanBoard";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import FilterBuilder from "@/components/ui/FilterBuilder";

export default function ProjectsClient() {
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
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const { hasPermission } = usePermissions();

  const [advancedFilters, setAdvancedFilters] = useState<any[]>([]);

  // Configure fields that can be dynamically filtered
  const filterFields = [
    { name: "name", label: "Name", type: "string" as const },
    { name: "status", label: "Status", type: "string" as const },
    { name: "customData.priority", label: "Priority (Custom)", type: "string" as const },
  ];

  useEffect(() => {
    fetchPipeline();
    fetchItems();
  }, [page, search, statusFilter, dateFrom, dateTo]);

  async function fetchPipeline() {
    try {
      const res = await fetch("/api/pipelines?module=project");
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
      const res = await fetch(`/api/projects?page=${page}&limit=10&search=${search}&status=${statusFilter}&dateFrom=${dateFrom}&dateTo=${dateTo}&filters=${filterStr}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.projects || []);
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
      const res = await fetch("/api/projects", {
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
      const res = await fetch("/api/projects", {
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

  const handleCardMoved = async (cardId: string, newStatus: string) => {
    // Optimistic update
    setItems(prev => prev.map(item => item._id === cardId ? { ...item, status: newStatus } : item));
    
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: cardId, status: newStatus })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to move card (Forward only)");
        fetchItems(); // revert
      }
    } catch (e) {
      console.error("Failed to move card", e);
      fetchItems();
    }
  };

  const isStageDisabled = (currentStatus: string, targetStage: any) => {
    if (pipelineStages.length > 0) {
      const currentIndex = pipelineStages.findIndex(s => s.name === currentStatus);
      if (currentIndex === -1) return false;
      return targetStage.order < pipelineStages[currentIndex].order;
    } else {
      const defaultStages = ["Planning", "In Progress", "Review", "Completed"];
      const currentIndex = defaultStages.indexOf(currentStatus);
      const targetIndex = defaultStages.indexOf(targetStage.name || targetStage);
      if (currentIndex === -1) return false;
      return targetIndex < currentIndex;
    }
  };

  const kanbanCards: KanbanCard[] = items.map(item => ({
    id: item._id,
    title: item.name,
    subtitle: item.description || "No description",
    status: item.status || "Planning",
    ...item
  }));

  const kanbanCols = pipelineStages.length > 0 ? pipelineStages.sort((a,b) => a.order - b.order).map(s => s.name) : ["Planning", "In Progress", "Review", "Completed"];

  const columns: ColumnDef<any>[] = [
    { header: "Name", accessorKey: "name", className: "font-medium text-gray-900" },
    { header: "Date Added", cell: (item) => <span className="text-gray-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span> },
    { header: "Status (Pipeline)", className: "min-w-[200px]", cell: (item) => (
      <select
        value={item.status}
        onChange={(e) => updateStatus(item._id, e.target.value)}
        className="w-full text-sm border-gray-300 rounded-lg shadow-sm py-1.5 pl-3 pr-8 focus:ring-purple-500 focus:border-purple-500 border bg-white text-gray-700 font-medium cursor-pointer"
      >
        {!kanbanCols.includes(item.status) && (
          <option value={item.status} disabled>{item.status}</option>
        )}
        
        {kanbanCols.map(stageName => (
          <option 
            key={stageName} 
            value={stageName}
            disabled={isStageDisabled(item.status, stageName)}
          >
            {stageName} {isStageDisabled(item.status, stageName) ? '(Locked)' : ''}
          </option>
        ))}
      </select>
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
    { header: "Actions", cell: (item) => (
      <a 
        href={`/dashboard/leads?filters=${encodeURIComponent(JSON.stringify([{ id: "proj_link", field: "customData.projectId", operator: "equals", value: item._id }]))}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        View Leads
      </a>
    )}
  ];

  const filterControls = (
    <>
      <select
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        className="py-2 pl-3 pr-8 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-700 bg-white"
      >
        <option value="">All Statuses</option>
        {kanbanCols.map(col => (
          <option key={col} value={col}>{col}</option>
        ))}
      </select>
      
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-purple-500">
        <label>From:</label>
        <input 
          type="date" 
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="bg-transparent border-none p-0 focus:ring-0 text-sm outline-none cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-purple-500">
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-gray-600 mt-1">Manage projects and dynamic fields.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 flex rounded-lg">
            <button 
              onClick={() => setView("kanban")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Kanban
            </button>
            <button 
              onClick={() => setView("table")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Table
            </button>
          </div>
          {hasPermission("Projects", "Create") && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Project
            </button>
          )}
        </div>
      </div>

      {view === "table" ? (
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
          emptyTitle="No projects found"
          emptyDescription={search || statusFilter || dateFrom || dateTo || advancedFilters.length > 0 ? "No projects matched your search or filters." : "You haven't added any projects yet."}
          emptyAction={
            !search && !statusFilter && !dateFrom && !dateTo && advancedFilters.length === 0 ? 
              <Button size="sm" onClick={() => setIsModalOpen(true)}>Add Project</Button> 
              : null
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Advanced Filter Tags for Kanban */}
          {advancedFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {advancedFilters.map(f => {
                const fieldLabel = filterFields?.find(field => field.name === f.field)?.label || f.field;
                return (
                  <span key={f.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    {fieldLabel} {f.operator.replace('_', ' ')} {f.operator !== 'exists' && f.operator !== 'not_exists' && f.value}
                    <button onClick={() => {
                      const newFilters = advancedFilters.filter(flt => flt.id !== f.id);
                      setAdvancedFilters(newFilters);
                      // Let useEffect or a timeout trigger fetch
                      setTimeout(() => fetchItems(), 0);
                    }} className="ml-1 text-purple-400 hover:text-purple-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
             <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Search Kanban..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm transition-all"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {filterControls}
              <div className="flex-shrink-0">
                <FilterBuilder 
                  fields={filterFields} 
                  filters={advancedFilters} 
                  onChange={setAdvancedFilters} 
                  onApply={fetchItems} 
                />
              </div>
          </div>
          <div className="h-[600px]">
            {loading ? (
               <div className="flex h-full items-center justify-center text-gray-500">Loading Kanban...</div>
            ) : (
              <KanbanBoard columns={kanbanCols} cards={kanbanCards} onCardMoved={handleCardMoved} />
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Add Project</h2>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <DynamicFormBuilder 
                targetModule="project" 
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
