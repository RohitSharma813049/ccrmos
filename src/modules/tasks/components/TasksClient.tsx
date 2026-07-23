"use client";

import { useState, useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DynamicFormBuilder from "@/components/ui/DynamicFormBuilder";
import KanbanBoard, { KanbanCard } from "@/components/ui/KanbanBoard";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import FilterBuilder from "@/components/ui/FilterBuilder";
import { usePermissions } from "@/hooks/usePermissions";
import { Tooltip } from "@/components/ui/Tooltip";

export default function TasksClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  
  // New Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cloningData, setCloningData] = useState<any>(null);
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const { hasPermission } = usePermissions();

  const [advancedFilters, setAdvancedFilters] = useState<any[]>([]);

  // Configure fields that can be dynamically filtered
  const filterFields = [
    { name: "title", label: "Title", type: "string" as const },
    { name: "status", label: "Status", type: "string" as const },
    { name: "customData.priority", label: "Priority (Custom)", type: "string" as const },
  ];

  useEffect(() => {
    fetchItems();
  }, [page, search, statusFilter, dateFrom, dateTo]);

  async function fetchItems() {
    try {
      setLoading(true);
      const filterStr = encodeURIComponent(JSON.stringify(advancedFilters));
      const res = await fetch(`/api/tasks?page=${page}&limit=10&search=${search}&status=${statusFilter}&dateFrom=${dateFrom}&dateTo=${dateTo}&filters=${filterStr}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.tasks || []);
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
      const isClone = formData._id === "CLONING";
      if (isClone) delete formData._id;

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setCloningData(null);
        fetchItems();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClone = (item: any) => {
    const clone = { ...item, title: `${item.title} (Copy)`, _id: "CLONING" };
    setCloningData(clone);
    setIsModalOpen(true);
  };

  const handleCardMoved = async (cardId: string, newStatus: string) => {
    // Optimistic update
    setItems(prev => prev.map(item => item._id === cardId ? { ...item, status: newStatus } : item));
    
    try {
      await fetch(`/api/tasks/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error("Failed to move card", e);
      fetchItems(); // Revert on failure
    }
  };

  const kanbanCards: KanbanCard[] = items.map(item => ({
    id: item._id,
    title: item.title,
    subtitle: item.description || "No description",
    status: item.status || "Active",
    ...item
  }));

  const kanbanCols = ["Active", "Pending", "Closed"];

  const columns: ColumnDef<any>[] = [
    { header: "Title", accessorKey: "title", className: "font-medium text-foreground" },
    { header: "Date Added", cell: (item) => <span className="text-muted-foreground text-xs">{new Date(item.createdAt).toLocaleDateString()}</span> },
    { header: "Status", cell: (item) => (
      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
        {item.status || "Active"}
      </span>
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
    { header: "Actions", cell: (item) => (
      <button
        onClick={() => handleClone(item)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-lg transition-colors whitespace-nowrap border border-border"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
        Clone
      </button>
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
        {kanbanCols.map(col => (
          <option key={col} value={col}>{col}</option>
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
        title="Tasks"
        description="Manage tasks and dynamic fields."
      >
          <div className="bg-muted p-1 flex rounded-lg">
            <button 
              onClick={() => setView("kanban")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Kanban
            </button>
            <button 
              onClick={() => setView("table")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'table' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Table
            </button>
          </div>
          <Tooltip content="You do not have permission to create tasks" disabled={hasPermission("Tasks", "Create")}>
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={!hasPermission("Tasks", "Create")}
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Task
            </button>
          </Tooltip>
      </PageHeader>

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
          emptyTitle="No tasks found"
          emptyDescription={search || statusFilter || dateFrom || dateTo || advancedFilters.length > 0 ? "No tasks matched your search or filters." : "You haven't added any tasks yet."}
          emptyAction={
            !search && !statusFilter && !dateFrom && !dateTo && advancedFilters.length === 0 ? 
              <Button size="sm" onClick={() => setIsModalOpen(true)}>Add Task</Button> 
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
                  <span key={f.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {fieldLabel} {f.operator.replace('_', ' ')} {f.operator !== 'exists' && f.operator !== 'not_exists' && f.value}
                    <button onClick={() => {
                      const newFilters = advancedFilters.filter(flt => flt.id !== f.id);
                      setAdvancedFilters(newFilters);
                      // Let useEffect or a timeout trigger fetch
                      setTimeout(() => fetchItems(), 0);
                    }} className="ml-1 text-primary/70 hover:text-primary">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
             <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Search Kanban..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all bg-card text-foreground"
                />
                <svg className="w-5 h-5 text-muted-foreground/50 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="flex h-full items-center justify-center text-muted-foreground">Loading Kanban...</div>
            ) : (
              <KanbanBoard columns={kanbanCols} cards={kanbanCards} onCardMoved={handleCardMoved} />
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); setCloningData(null); }} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold text-foreground">{cloningData ? "Clone Task" : "Add Task"}</h2>
              <button onClick={() => { setIsModalOpen(false); setCloningData(null); }} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <DynamicFormBuilder 
                targetModule="task" 
                initialData={cloningData}
                onSubmit={handleSave} 
                onCancel={() => { setIsModalOpen(false); setCloningData(null); }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
