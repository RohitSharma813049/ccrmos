"use client";

import { useState, useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import DynamicFormBuilder from "@/components/ui/DynamicFormBuilder";
import KanbanBoard, { KanbanCard } from "@/components/ui/KanbanBoard";

export default function TasksClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<"table" | "kanban">("kanban");

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setItems(data.tasks || []);
      }
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (formData: any) => {
    try {
      const res = await fetch("/api/tasks", {
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

  const columns = ["Active", "Pending", "Closed"];

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage tasks and dynamic fields.</p>
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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-all"
          >
            Add Task
          </button>
        </div>
      </div>

      {view === "table" ? (
        
      <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Title</th><th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Custom Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr>
                  <td colSpan={3} className="p-0">
                    <EmptyState 
                      title="No items found" 
                      description="You haven't added any items yet. Create your first item to get started."
                      action={<Button size="sm" onClick={() => setIsModalOpen(true)}>Add Item</Button>}
                    />
                  </td>
                </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">{item.title}</td><td className="px-6 py-4">{item.status}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {item.customData ? Object.entries(item.customData).map(([k, v]) => `${k}: ${v}`).join(', ') : 'None'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      </>
      ) : (
        <div className="h-[600px]">
          {loading ? (
             <div className="flex h-full items-center justify-center text-gray-500">Loading Kanban...</div>
          ) : (
            <KanbanBoard columns={columns} cards={kanbanCards} onCardMoved={handleCardMoved} />
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Add Task</h2>
            </div>
            <div className="p-6">
              <DynamicFormBuilder 
                targetModule="task" 
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
