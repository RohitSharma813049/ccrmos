"use client";

import { useState, useEffect } from "react";
import DynamicFormBuilder from "@/components/ui/DynamicFormBuilder";
import KanbanBoard, { KanbanCard } from "@/components/ui/KanbanBoard";

export default function ProjectsClient() {
  const [items, setItems] = useState<any[]>([]);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<"table" | "kanban">("kanban");

  useEffect(() => {
    fetchPipeline();
    fetchItems();
  }, []);

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
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setItems(data.projects || []);
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
    const currentIndex = pipelineStages.findIndex(s => s.name === currentStatus);
    if (currentIndex === -1) return false;
    return targetStage.order < pipelineStages[currentIndex].order;
  };

  const kanbanCards: KanbanCard[] = items.map(item => ({
    id: item._id,
    title: item.name,
    subtitle: item.description || "No description",
    status: item.status || "Planning",
    ...item
  }));

  const columns = pipelineStages.length > 0 ? pipelineStages.sort((a,b) => a.order - b.order).map(s => s.name) : ["Planning", "In Progress", "Review", "Completed"];

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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-all"
          >
            Add Project
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4 min-w-[200px]">Status (Pipeline)</th>
                  <th className="px-6 py-4">Custom Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No items found.</td></tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4">
                        {pipelineStages.length > 0 ? (
                          <select
                            value={item.status}
                            onChange={(e) => updateStatus(item._id, e.target.value)}
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
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {item.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
