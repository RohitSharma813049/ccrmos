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

  useEffect(() => {
    fetchRecords();
  }, [page]);

  async function fetchRecords() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dynamic-records/?page=${page}&limit=10`);
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
        ? `/api/dynamic-records//${editingRecordId}`
        : `/api/dynamic-records/`;
        
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
      await fetch(`/api/dynamic-records//${recordId}`, {
        method: "DELETE"
      });
      fetchRecords();
    } catch (e) {
      console.error(e);
    }
  }

  // Generate DataTable columns based on module schema fields
  const columns: ColumnDef<any>[] = moduleSchema.fields.map((field: any) => ({
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
    <div className="space-y-6 fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <PageHeader 
          title={moduleSchema.name} 
          description={moduleSchema.description || `Manage records for ${moduleSchema.name}`} 
        />
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={copyPublicLink}
            className="px-5 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-ring focus:outline-none flex-1 sm:flex-none flex items-center justify-center gap-2 border border-border"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share Form Link
          </button>
          <button 
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-primary focus:outline-none flex-1 sm:flex-none flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Record
          </button>
        </div>
      </div>

      <DataTable 
        data={records}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyTitle={`No ${moduleSchema.name} found`}
        emptyDescription={`Get started by creating your first ${moduleSchema.name}.`}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-zinc-800/60 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-100">{editingRecordId ? 'Edit' : 'Create'} {moduleSchema.name}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-zinc-400">
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
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={saveRecord} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
