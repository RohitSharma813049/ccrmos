"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";

export default function PipelinesClient() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState("Leads");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "status",
    color: "#3b82f6",
    order: 0,
    slaHours: 24,
    autoNotifyBeforeHours: 2,
    subStatuses: ""
  });

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [selectedModule]);

  async function fetchModules() {
    try {
      const res = await fetch("/api/settings/active-modules");
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || []);
        if (data.modules && data.modules.length > 0 && selectedModule === "Leads") {
          setSelectedModule(data.modules[0]);
        }
      } else {
        setModules(["Leads", "Projects", "Tasks", "Invoices"]);
      }
    } catch (e) {
      setModules(["Leads", "Projects", "Tasks", "Invoices"]);
    }
  }

  async function fetchStatuses() {
    if (!selectedModule) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/module-statuses?moduleName=${selectedModule}`);
      if (res.ok) {
        const data = await res.json();
        setStatuses(data.statuses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveStatus(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        moduleName: selectedModule,
        subStatuses: formData.subStatuses ? formData.subStatuses.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      
      const res = await fetch("/api/settings/module-statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
    setFormData({ name: "", type: "status", color: "#3b82f6", order: statuses.length, slaHours: 24, autoNotifyBeforeHours: 2, subStatuses: "" });
        fetchStatuses();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteStatus(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`/api/settings/module-statuses/${id}`, { method: "DELETE" });
      fetchStatuses();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader
        title="Pipelines & Statuses"
        description="Configure dynamic statuses and pipeline stages for your modules."
      >
        <button 
          onClick={() => {
        setFormData({ name: "", type: "status", color: "#3b82f6", order: statuses.length, slaHours: 24, autoNotifyBeforeHours: 2, subStatuses: "" });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all"
        >
          + Add Status/Stage
        </button>
      </PageHeader>

      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {modules.map(mod => (
          <button
            key={mod}
            onClick={() => setSelectedModule(mod)}
            className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedModule === mod ? 'bg-primary text-primary-foreground shadow-md' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'}`}
          >
            {mod}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading...</div>
        ) : statuses.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-zinc-500">
            <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-zinc-300">No Statuses Configured</h3>
            <p className="mt-1 text-sm">Add custom statuses for the {selectedModule} module.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-900/80 border-b border-zinc-800/60 text-zinc-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Color</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {statuses.map((status) => (
                  <tr key={status._id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 text-zinc-400">{status.order}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-100">{status.name}</div>
                      {status.subStatuses && status.subStatuses.length > 0 && (
                        <div className="text-xs text-zinc-500 mt-1 max-w-[200px] truncate" title={status.subStatuses.join(', ')}>
                          {status.subStatuses.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 capitalize text-zinc-400">{status.type}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color }}></div>
                        <span className="text-zinc-500 font-mono text-xs">{status.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteStatus(status._id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-6">Add Status to {selectedModule}</h2>
            <form className="space-y-4" onSubmit={saveStatus}>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100">
                  <option value="status">General Status</option>
                  <option value="stage">Pipeline Stage</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Order Index</label>
                  <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Color Code</label>
                  <div className="flex gap-2">
                    <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="h-10 w-10 rounded cursor-pointer bg-zinc-950 border border-zinc-800 p-1" />
                    <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 text-zinc-100 font-mono text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Sub-Statuses (Comma Separated)</label>
                <input type="text" placeholder="e.g. Call back, Busy, Invalid Number" value={formData.subStatuses} onChange={e => setFormData({...formData, subStatuses: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100" />
                <p className="text-xs text-zinc-500 mt-1">Leave blank if this stage doesn't have sub-stages.</p>
              </div>

              {formData.type === 'stage' && (
                <div className="pt-4 border-t border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-200 mb-3">Conversation & Workflow Rules (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">SLA Limit (Hours)</label>
                      <input type="number" placeholder="e.g. 24" value={formData.slaHours || ''} onChange={e => setFormData({...formData, slaHours: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Auto-Notify Before (Hours)</label>
                      <input type="number" placeholder="e.g. 2" value={formData.autoNotifyBeforeHours || ''} onChange={e => setFormData({...formData, autoNotifyBeforeHours: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100" />
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-zinc-200">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
