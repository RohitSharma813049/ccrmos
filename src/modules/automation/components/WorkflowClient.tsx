"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function WorkflowClient() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTrigger, setNewTrigger] = useState("EVENT");

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    try {
      const res = await fetch("/api/automation/workflows");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.workflows || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function createWorkflow() {
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/automation/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newTitle, 
          description: newDesc, 
          trigger: newTrigger, 
          active: false 
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle("");
        setNewDesc("");
        setNewTrigger("EVENT");
        fetchWorkflows();
      } else {
        alert("Failed to create workflow");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleStatus(wf: any) {
    try {
      await fetch(`/api/automation/workflows/${wf._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !wf.active })
      });
      fetchWorkflows();
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteWorkflow(id: string) {
    if (!confirm("Are you sure you want to delete this workflow?")) return;
    try {
      await fetch(`/api/automation/workflows/${id}`, {
        method: "DELETE"
      });
      fetchWorkflows();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Workflow Engine Configurator</h1>
        <p className="text-muted-foreground mt-1">Design global event triggers, execution queues, and background jobs.</p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-foreground">Execution Pipelines</h2>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-sm font-semibold text-primary-foreground rounded-lg transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            + New Pipeline
          </button>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground text-sm text-center py-4 animate-pulse">Loading pipelines...</p>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">No pipelines configured yet.</p>
            </div>
          ) : (
            workflows.map((wf) => (
              <div 
                key={wf._id} 
                className="border border-border rounded-xl p-4 bg-card flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
                onClick={() => window.location.href = `/owner/workflow/${wf._id}`}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = `/owner/workflow/${wf._id}`; }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${wf.trigger === 'EVENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-500'}`}>
                    {wf.trigger === 'EVENT' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{wf.title}</h3>
                    <p className="text-xs text-muted-foreground">{wf.description || `Trigger: ${wf.trigger}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleStatus(wf); }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${wf.active ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >
                    {wf.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                    {wf.active ? 'Active' : 'Idle'}
                  </button>
                  <Link
                    href={`/owner/workflow/${wf._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Canvas
                  </Link>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteWorkflow(wf._id); }} 
                    className="text-destructive/70 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive rounded"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Pipeline Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Create New Pipeline</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Pipeline Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Nightly Database Sync" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g., Syncs core models to warehouse" 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Trigger Type</label>
                <select 
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none appearance-none shadow-sm"
                >
                  <option value="EVENT">Event-Driven (Webhooks / Real-time)</option>
                  <option value="CRON">CRON (Scheduled Batch)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Cancel</button>
              <button 
                onClick={createWorkflow} 
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? "Creating..." : "Create Pipeline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
