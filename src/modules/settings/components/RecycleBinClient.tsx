"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

export default function RecycleBinClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/recycle-bin");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch recycle bin items");
    } finally {
      setLoading(false);
    }
  }

  const handleRestore = async (id: string) => {
    try {
      setIsRestoring(true);
      const res = await fetch(`/api/settings/recycle-bin/${id}/restore`, {
        method: "POST"
      });
      if (res.ok) {
        toast.success("Item restored successfully");
        fetchItems();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to restore item");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsRestoring(true);
      for (const id of selectedIds) {
        await fetch(`/api/settings/recycle-bin/${id}/restore`, { method: "POST" });
      }
      toast.success(`${selectedIds.length} items restored successfully`);
      setSelectedIds([]);
      fetchItems();
    } catch (e) {
      toast.error("Failed to restore all items");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteForever = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/settings/recycle-bin?ids=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Item permanently deleted");
        fetchItems();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete item");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDeleteForever = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} items? This action cannot be undone.`)) return;
    
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/settings/recycle-bin?ids=${selectedIds.join(',')}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success(`${selectedIds.length} items permanently deleted`);
        setSelectedIds([]);
        fetchItems();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete items");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: (
        <input 
          type="checkbox" 
          onChange={(e) => setSelectedIds(e.target.checked ? items.map(i => i._id) : [])}
          checked={selectedIds.length > 0 && selectedIds.length === items.length}
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
    { 
      header: "Item Details", 
      cell: (item) => (
        <div>
          <div className="font-medium text-foreground">
            {item.documentData?.name || item.documentData?.title || item.documentData?.firstName || `Record (${item.originalId})`}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Original ID: {item.originalId}
          </div>
        </div>
      )
    },
    { 
      header: "Collection (Type)", 
      cell: (item) => (
        <span className="px-2.5 py-1 bg-muted border border-border text-foreground text-xs rounded-lg font-medium">
          {item.collectionName}
        </span>
      )
    },
    { 
      header: "Deleted At", 
      cell: (item) => (
        <span className="text-sm text-muted-foreground">
          {new Date(item.deletedAt).toLocaleString()}
        </span>
      )
    },
    { 
      header: "Actions", 
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleRestore(item._id)}
            disabled={isRestoring || isDeleting}
            className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors title='Restore'"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button 
            onClick={() => handleDeleteForever(item._id)}
            disabled={isRestoring || isDeleting}
            className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors title='Delete Forever'"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader 
        title="Recycle Bin"
        description="View and restore deleted modules, dynamic forms, and other data."
      />

      <DataTable 
        data={items}
        columns={columns}
        loading={loading}
        search=""
        onSearchChange={() => {}}
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={[
          { label: "Restore Selected", onClick: handleBulkRestore },
          { label: "Delete Permanently", onClick: handleBulkDeleteForever, variant: "destructive" }
        ]}
        emptyTitle="Recycle Bin is empty"
        emptyDescription="No deleted items found."
      />
    </div>
  );
}
