"use client";

import { useState, useEffect } from "react";

interface Workflow {
  _id: string;
  title: string;
  description: string;
  active: boolean;
  trigger: string;
  conditions: any[];
  actions: any[];
}

export default function AutomationsClient() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("Lead Created");
  const [conditionField, setConditionField] = useState("status");
  const [conditionOperator, setConditionOperator] = useState("equals");
  const [conditionValue, setConditionValue] = useState("new");
  const [actionType, setActionType] = useState("Create Task");
  const [actionPayloadStr, setActionPayloadStr] = useState('{"title": "Follow up with lead"}');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    try {
      const res = await fetch("/api/workflows");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.workflows || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const toggleAutomation = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/workflows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus })
      });
      if (res.ok) {
        fetchWorkflows();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return;
    try {
      const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (res.ok) fetchWorkflows();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(actionPayloadStr);
      } catch (e) {
        alert("Invalid JSON payload for Action.");
        return;
      }

      const payload = {
        title,
        description,
        trigger,
        conditions: [
          { field: conditionField, operator: conditionOperator, value: conditionValue }
        ],
        actions: [
          { type: actionType, payload: parsedPayload }
        ],
        active: true
      };

      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchWorkflows();
        // Reset form
        setTitle("");
        setDescription("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Company Automations</h1>
          <p className="text-gray-600 mt-1">Configure systemic workflow rules for your entire organization.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg transition-all border border-gray-900"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Workflow
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading workflows...</p>
      ) : workflows.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-500">No automations configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workflows.map((auto) => (
            <div key={auto._id} className={`bg-white/50 backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all ${auto.active ? 'border-blue-500/30 shadow-blue-500/10' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${auto.active ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-100 text-gray-500'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${auto.active ? 'text-gray-900' : 'text-gray-600'}`}>{auto.title}</h3>
                    <p className="text-xs text-gray-500 font-medium">Trigger: {auto.trigger}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleAutomation(auto._id, auto.active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${auto.active ? 'bg-blue-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${auto.active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">{auto.description}</p>
              
              <div className="flex gap-3">
                <button onClick={() => deleteWorkflow(auto._id)} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-sm font-medium text-red-600 border border-red-200 rounded-lg transition-colors">
                  Delete
                </button>
                <button onClick={() => alert("Logs viewer in development.")} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 rounded-lg transition-colors">
                  View Logs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create Workflow Engine Rule</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border-gray-300 rounded-lg px-3 py-2 border outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border-gray-300 rounded-lg px-3 py-2 border outline-none" />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">1. Trigger</h3>
                  <select value={trigger} onChange={e => setTrigger(e.target.value)} className="w-full border-gray-300 rounded-lg px-3 py-2 border outline-none">
                    <option>Lead Created</option>
                    <option>Customer Converted</option>
                    <option>Invoice Created</option>
                  </select>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">2. Condition</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <input placeholder="Field (e.g. status)" value={conditionField} onChange={e => setConditionField(e.target.value)} className="border-gray-300 rounded-lg px-3 py-2 border outline-none" />
                    <select value={conditionOperator} onChange={e => setConditionOperator(e.target.value)} className="border-gray-300 rounded-lg px-3 py-2 border outline-none">
                      <option value="equals">Equals (==)</option>
                      <option value="not_equals">Not Equals (!=)</option>
                      <option value="greater_than">Greater (&gt;)</option>
                      <option value="contains">Contains</option>
                    </select>
                    <input placeholder="Value (e.g. new)" value={conditionValue} onChange={e => setConditionValue(e.target.value)} className="border-gray-300 rounded-lg px-3 py-2 border outline-none" />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">3. Action</h3>
                  <select value={actionType} onChange={e => setActionType(e.target.value)} className="w-full border-gray-300 rounded-lg px-3 py-2 border outline-none mb-3">
                    <option>Create Task</option>
                    <option>Send Email</option>
                  </select>
                  <label className="block text-xs font-medium text-gray-500 mb-1">JSON Payload</label>
                  <textarea value={actionPayloadStr} onChange={e => setActionPayloadStr(e.target.value)} rows={3} className="w-full font-mono text-sm border-gray-300 rounded-lg px-3 py-2 border outline-none" />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
                    Save Workflow
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
