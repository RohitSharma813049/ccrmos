"use client";

import { useState, useEffect } from "react";
import DynamicFormBuilder from "@/components/ui/DynamicFormBuilder";

export default function LeadsClient() {
  const [leads, setLeads] = useState<any[]>([]);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPipeline();
    fetchLeads();
  }, []);

  async function fetchPipeline() {
    try {
      const res = await fetch("/api/pipelines?module=lead");
      if (res.ok) {
        const data = await res.json();
        setPipelineStages(data.pipeline?.stages || []);
      }
    } catch (e) {
      console.error("Failed to fetch pipeline", e);
    }
  }

  async function fetchLeads() {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (formData: any) => {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchLeads();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save lead");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: leadId, status: newStatus })
      });
      if (res.ok) {
        fetchLeads();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update lead status");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to determine if a stage should be disabled (forward-only logic)
  const isStageDisabled = (currentStatus: string, targetStage: any) => {
    const currentIndex = pipelineStages.findIndex(s => s.name === currentStatus);
    // If current status not found in pipeline, allow everything or nothing (allowing for now)
    if (currentIndex === -1) return false;
    // Disable if the target stage's order is less than the current status's order
    return targetStage.order < pipelineStages[currentIndex].order;
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Leads</h1>
          <p className="text-gray-600 mt-1">Manage your pipeline and dynamic lead data.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Lead
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 min-w-[200px]">Status (Pipeline)</th>
                <th className="px-6 py-4">Custom Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No leads found.</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{lead.firstName} {lead.lastName}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.email || '-'}</td>
                    <td className="px-6 py-4">
                      {pipelineStages.length > 0 ? (
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                          className="w-full text-sm border-gray-300 rounded-lg shadow-sm py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 border bg-white text-gray-700 font-medium cursor-pointer"
                        >
                          {/* If current status is not in the pipeline, add it temporarily */}
                          {!pipelineStages.find(s => s.name === lead.status) && (
                            <option value={lead.status} disabled>{lead.status}</option>
                          )}
                          
                          {pipelineStages.sort((a,b) => a.order - b.order).map(stage => (
                            <option 
                              key={stage.name} 
                              value={stage.name}
                              disabled={isStageDisabled(lead.status, stage)}
                            >
                              {stage.name} {isStageDisabled(lead.status, stage) ? '(Locked)' : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {lead.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {lead.customData && Object.keys(lead.customData).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(lead.customData).map(([k, v]) => (
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Lead</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <DynamicFormBuilder 
                targetModule="lead" 
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