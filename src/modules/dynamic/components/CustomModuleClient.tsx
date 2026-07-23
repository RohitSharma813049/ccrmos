"use client";

import { useState, useEffect } from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";

export default function CustomModuleClient({ moduleSchema }: { moduleSchema: any }) {
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
      const res = await fetch(`/api/custom-modules/${moduleSchema._id}/records?page=${page}&limit=10`);
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
        ? `/api/custom-modules/${moduleSchema._id}/records/${editingRecordId}`
        : `/api/custom-modules/${moduleSchema._id}/records`;
        
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
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await fetch(`/api/custom-modules/${moduleSchema._id}/records/${recordId}`, {
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
      const val = record.data?.[field.name];
      return <span className="text-gray-700">{val?.toString() || "-"}</span>;
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

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader 
        title={moduleSchema.name} 
        description="Manage data for your custom module."
      >
        <button 
          onClick={openCreateModal}
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-sm transition-all w-full sm:w-auto flex items-center justify-center gap-2"
        >
          + Add New {moduleSchema.name}
        </button>
      </PageHeader>

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
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{editingRecordId ? 'Edit' : 'Create'} {moduleSchema.name}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {moduleSchema.fields.map((field: any, idx: number) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.name} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea 
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  ) : field.type === 'number' ? (
                    <input 
                      type="number"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: parseFloat(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  ) : (
                    <input 
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={saveRecord} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
