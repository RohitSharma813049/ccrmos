"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

interface LeadStage {
  _id: string;
  name: string;
  color: string;
  order: number;
}

interface LeadStatus {
  _id: string;
  name: string;
  stageId: string;
  active: boolean;
}

export default function LeadStagesClient() {
  const [stages, setStages] = useState<LeadStage[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingStage, setEditingStage] = useState<LeadStage | null>(null);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [stageForm, setStageForm] = useState({ name: '', color: '#3B82F6', order: 0 });

  const [editingStatus, setEditingStatus] = useState<LeadStatus | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({ name: '', stageId: '', active: true });

  const fetchData = async () => {
    try {
      const [stagesRes, statusesRes] = await Promise.all([
        fetch('/api/settings/lead-stages').then(r => r.json()),
        fetch('/api/lead-status').then(r => r.json())
      ]);
      setStages(stagesRes);
      setStatuses(statusesRes.statuses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveStage = async () => {
    const url = editingStage ? `/api/settings/lead-stages/${editingStage._id}` : '/api/settings/lead-stages';
    const method = editingStage ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stageForm)
    });
    setIsStageModalOpen(false);
    fetchData();
  };

  const handleDeleteStage = async (id: string) => {
    if(!confirm("Delete this stage?")) return;
    await fetch(`/api/settings/lead-stages/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSaveStatus = async () => {
    const url = editingStatus ? `/api/lead-status/${editingStatus._id}` : '/api/lead-status';
    const method = editingStatus ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusForm)
    });
    setIsStatusModalOpen(false);
    fetchData();
  };

  const handleDeleteStatus = async (id: string) => {
    if(!confirm("Delete this status?")) return;
    await fetch(`/api/lead-status/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
        <p className="text-muted-foreground text-sm">Organize your pipeline by Stages, and define Statuses for each Stage.</p>
        <button 
          onClick={() => { setEditingStage(null); setStageForm({ name: '', color: '#3B82F6', order: stages.length + 1 }); setIsStageModalOpen(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Add Stage
        </button>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => {
          const stageStatuses = statuses.filter(s => {
            const sId = typeof s.stageId === 'object' ? (s.stageId as any)._id : s.stageId;
            return sId === stage._id;
          });
          
          return (
            <div key={stage._id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }} />
                  <h3 className="font-bold text-foreground text-lg">{stage.name}</h3>
                  <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Order: {stage.order}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditingStage(stage); setStageForm({ name: stage.name, color: stage.color, order: stage.order }); setIsStageModalOpen(true); }}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  ><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteStage(stage._id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="p-4 flex flex-wrap gap-2 items-center">
                {stageStatuses.map(status => (
                  <div key={status._id} className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-border bg-background shadow-sm hover:shadow transition-shadow">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className={status.active ? "text-foreground" : "text-muted-foreground line-through"}>{status.name}</span>
                    <div className="hidden group-hover:flex items-center gap-1 ml-2">
                      <button 
                        onClick={() => { setEditingStatus(status); setStatusForm({ name: status.name, stageId: stage._id, active: status.active }); setIsStatusModalOpen(true); }}
                        className="text-muted-foreground hover:text-blue-500"
                      ><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => handleDeleteStatus(status._id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => { setEditingStatus(null); setStatusForm({ name: '', stageId: stage._id, active: true }); setIsStatusModalOpen(true); }}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary px-3 py-1.5 rounded-full border border-dashed border-border hover:border-primary transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Status
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isStageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-xl border border-border">
            <h3 className="text-lg font-bold mb-4">{editingStage ? 'Edit Stage' : 'New Stage'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase">Name</label>
                <input type="text" value={stageForm.name} onChange={e => setStageForm({...stageForm, name: e.target.value})} className="w-full mt-1 p-2 bg-background border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground uppercase">Color</label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={stageForm.color} onChange={e => setStageForm({...stageForm, color: e.target.value})} className="h-10 w-10 rounded cursor-pointer" />
                  <input type="text" value={stageForm.color} onChange={e => setStageForm({...stageForm, color: e.target.value})} className="flex-1 p-2 bg-background border border-border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground uppercase">Order (Sequence)</label>
                <input type="number" value={stageForm.order} onChange={e => setStageForm({...stageForm, order: parseInt(e.target.value) || 0})} className="w-full mt-1 p-2 bg-background border border-border rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsStageModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleSaveStage} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save</button>
            </div>
          </div>
        </div>
      )}

      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-xl border border-border">
            <h3 className="text-lg font-bold mb-4">{editingStatus ? 'Edit Status' : 'New Status'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase">Status Name</label>
                <input type="text" value={statusForm.name} onChange={e => setStatusForm({...statusForm, name: e.target.value})} className="w-full mt-1 p-2 bg-background border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground uppercase">Parent Stage</label>
                <select value={statusForm.stageId} onChange={e => setStatusForm({...statusForm, stageId: e.target.value})} className="w-full mt-1 p-2 bg-background border border-border rounded-lg text-sm">
                  <option value="">Select a Stage...</option>
                  {stages.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={statusForm.active} onChange={e => setStatusForm({...statusForm, active: e.target.checked})} className="rounded text-primary" />
                <span className="text-sm font-medium text-foreground">Active (Available for selection)</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleSaveStatus} disabled={!statusForm.name || !statusForm.stageId} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
