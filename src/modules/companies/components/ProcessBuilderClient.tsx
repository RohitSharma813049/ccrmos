"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

export default function ProcessBuilderClient({ processId, processName }: { processId: string, processName: string }) {
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [assignedToRole, setAssignedToRole] = useState("");
  const [slaHours, setSlaHours] = useState(24);
  const [autoNotifyBeforeHours, setAutoNotifyBeforeHours] = useState(2);

  useEffect(() => {
    fetchStages();
  }, []);

  async function fetchStages() {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/processes/${processId}/stages`);
      if (res.ok) {
        const data = await res.json();
        setStages(data.stages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addStage(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/companies/processes/${processId}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          assignedToRole,
          slaHours,
          autoNotifyBeforeHours
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName("");
        setAssignedToRole("");
        setSlaHours(24);
        setAutoNotifyBeforeHours(2);
        fetchStages();
      } else {
        const err = await res.json();
        alert(`Failed to add stage: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="mb-4">
        <Link href="/dashboard/processes" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors">
          &larr; Back to Process Management
        </Link>
      </div>
      
      <PageHeader
        title={`Workflow Builder: ${processName}`}
        description="Define the sequential stages, assignments, and SLAs for this process."
      >
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          + Add Stage
        </button>
      </PageHeader>

      <div className="space-y-4">
        {loading ? (
          <p className="text-zinc-500">Loading stages...</p>
        ) : stages.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800/60 border-dashed rounded-2xl">
            <p className="text-zinc-400 mb-4">No stages defined for this process yet.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-primary hover:text-primary/80 font-medium"
            >
              + Add First Stage
            </button>
          </div>
        ) : (
          <div className="space-y-4 relative">
            <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-zinc-800/60 z-0"></div>
            {stages.map((stage, idx) => (
              <div key={stage._id} className="relative z-10 flex gap-6 items-start">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-primary text-primary flex items-center justify-center font-bold text-xl shadow-lg shrink-0">
                  {stage.sequenceOrder}
                </div>
                <div className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-100">{stage.name}</h3>
                      <p className="text-sm text-zinc-400 mt-1">Assigned to: <span className="text-zinc-200 font-medium">{stage.assignedToRole || 'Unassigned'}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-amber-400">SLA: {stage.slaHours} Hours</p>
                      <p className="text-xs text-zinc-500 mt-1">Warn before {stage.autoNotifyBeforeHours}h</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-700/50">
              <h2 className="text-xl font-bold text-zinc-100">Add Process Stage</h2>
              <p className="text-sm text-zinc-400 mt-1">Define the requirements for Step {stages.length + 1}</p>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={addStage}>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Stage Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Manager Review"
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Assign to Role</label>
                <input 
                  type="text" 
                  value={assignedToRole}
                  onChange={(e) => setAssignedToRole(e.target.value)}
                  placeholder="e.g. Sales Rep, Approver"
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">SLA (Hours)</label>
                  <input 
                    type="number" 
                    required
                    value={slaHours}
                    onChange={(e) => setSlaHours(Number(e.target.value))}
                    className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Auto-Notify Before (Hours)</label>
                  <input 
                    type="number" 
                    required
                    value={autoNotifyBeforeHours}
                    onChange={(e) => setAutoNotifyBeforeHours(Number(e.target.value))}
                    className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800/60 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl shadow-lg transition-all">
                  Save Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
