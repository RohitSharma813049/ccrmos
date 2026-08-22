"use client";

import { useState, useEffect } from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";

export default function DynamicModuleClient({ moduleSchema }: { moduleSchema: any }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // UI Enhancements mimicking Sales Leads
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [page, search]);

  async function fetchRecords() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dynamic-records/${moduleSchema._id}?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        if (data.totalPages) setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingRecordId(null);
    setFormData({});
    setIsModalOpen(true);
  }

  function openEditModal(record: any) {
    setEditingRecordId(record._id);
    setFormData(record.data || {});
    setIsModalOpen(true);
  }

  async function saveRecord() {
    try {
      const url = editingRecordId 
        ? `/api/dynamic-records/${moduleSchema._id}/${editingRecordId}`
        : `/api/dynamic-records/${moduleSchema._id}`;
        
      const method = editingRecordId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData })
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchRecords();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save record");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteRecord(recordId: string) {
    const confirmation = window.prompt("Are you sure you want to delete this record?\n\nType DELETE to confirm:");
    if (confirmation !== "DELETE") return;
    try {
      await fetch(`/api/dynamic-records/${moduleSchema._id}/${recordId}`, {
        method: "DELETE"
      });
      fetchRecords();
    } catch (e) {
      console.error(e);
    }
  }

  const handleExport = () => {
    if (selectedIds.length === 0) return;
    const selectedRecords = records.filter(r => selectedIds.includes(r._id));
    if (!selectedRecords.length) return;
    
    const headers = moduleSchema.fields.map((f: any) => f.name);
    const rows = selectedRecords.map(r => headers.map((h: string) => `"${String(r.data?.[h] || "").replace(/"/g, '""')}"`));
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${moduleSchema.name.toLowerCase()}_export_${new Date().getTime()}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkDelete = () => setBulkDeleteModalOpen(true);

  const executeBulkDelete = async () => {
    // Note: To implement a real bulk delete we would need a /bulk API endpoint.
    // For now, we simulate it by looping over DELETE endpoints or just alerting.
    alert("Bulk Delete requires a dedicated API endpoint which can be added later. For now, please delete one by one.");
    setBulkDeleteModalOpen(false);
  };

  // Generate DataTable columns based on module schema fields
  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: (
        <input 
          type="checkbox" 
          onChange={(e) => setSelectedIds(e.target.checked ? records.map(r => r._id) : [])}
          checked={selectedIds.length > 0 && selectedIds.length === records.length}
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
    ...moduleSchema.fields.map((field: any) => ({
    header: field.name,
    cell: (record: any) => {
      let val = record.data?.[field.name];
      if (field.type === 'checkbox') {
        return <span className="text-zinc-300">{val ? '✅ Yes' : '❌ No'}</span>;
      }
      if (field.type === 'score') {
        return <span className="text-zinc-300 font-medium">{val ? `${val}/10` : '-'}</span>;
      }
      if (field.type === 'relation' && field.relationOptions) {
        const match = field.relationOptions.find((opt: any) => opt.value === val);
        val = match ? match.label : val;
      }
      return <span className="text-zinc-300">{val?.toString() || "-"}</span>;
    }
  }));

  columns.push({
    header: "Actions",
    className: "text-right",
    cell: (record) => (
      <div className="flex justify-end gap-2">
        <button onClick={() => openEditModal(record)} className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors text-sm">Edit</button>
        <button onClick={() => deleteRecord(record._id)} className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors text-sm">Delete</button>
      </div>
    )
  });

  function copyPublicLink() {
    const url = `${window.location.origin}/m/${moduleSchema._id}`;
    navigator.clipboard.writeText(url);
    alert("Public Form Link copied to clipboard!\n\n" + url);
  }

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader 
        title={moduleSchema.name} 
        description={moduleSchema.description || `Manage records for ${moduleSchema.name}`} 
      >
        <button 
          onClick={copyPublicLink}
          className="px-4 py-2 bg-card border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-all shadow-sm text-sm"
        >
          Share Form Link
        </button>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Record
        </button>
      </PageHeader>

      <DataTable 
        data={records.filter(r => {
          if (!search) return true;
          return Object.values(r.data || {}).some(val => 
            String(val).toLowerCase().includes(search.toLowerCase())
          );
        })}
        columns={columns}
        loading={loading}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={[
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
        emptyTitle={`No ${moduleSchema.name} found`}
        emptyDescription={search ? "No records matched your search." : `Get started by creating your first ${moduleSchema.name}.`}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-zinc-800/60 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-100">{editingRecordId ? 'Edit' : 'Create'} {moduleSchema.name}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {moduleSchema.fields.map((field: any, idx: number) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    {field.name} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea 
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Select an option</option>
                      {(field.options || []).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'date' ? (
                    <input 
                      type="date"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  ) : field.type === 'number' || field.type === 'score' ? (
                    <input 
                      type={field.type === 'score' ? 'range' : 'number'}
                      min={field.type === 'score' ? 1 : undefined}
                      max={field.type === 'score' ? 10 : undefined}
                      value={formData[field.name] || (field.type === 'score' ? 5 : '')}
                      onChange={(e) => setFormData({ ...formData, [field.name]: parseFloat(e.target.value) })}
                      className={`w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${field.type === 'score' ? 'accent-blue-500' : ''}`}
                    />
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="checkbox"
                        checked={!!formData[field.name]}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                        className="w-5 h-5 rounded border-zinc-700/50 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-300">Yes</span>
                    </div>
                  ) : field.type === 'relation' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Select {field.relationTarget || 'an option'}</option>
                      {(field.relationOptions || []).map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'phone' || field.type === 'whatsapp' ? (
                    <input 
                      type="tel"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder={field.type === 'whatsapp' ? 'WhatsApp Number' : 'Phone Number'}
                    />
                  ) : (
                    <input 
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-zinc-800/60 flex justify-end gap-3 bg-zinc-950/50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:bg-zinc-700/50 rounded-lg">Cancel</button>
              <button onClick={saveRecord} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-2xl shadow-xl max-w-sm w-full border border-border animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-foreground">Delete {selectedIds.length} Records?</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">Are you sure you want to delete the selected records? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setBulkDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">Cancel</button>
              <button onClick={executeBulkDelete} className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
