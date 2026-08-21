"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";

export default function ConversionsClient() {
  const [rules, setRules] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<any>({
    sourceModule: "Leads",
    targetModule: "Projects",
    buttonLabel: "Convert to Project",
    fieldMappings: [{ sourceField: "", targetField: "" }]
  });

  const stdModules = ["Leads", "Projects", "Bookings", "Tasks", "Invoices"];

  useEffect(() => {
    fetchModules();
    fetchRules();
  }, []);

  async function fetchModules() {
    try {
      const res = await fetch("/api/settings/custom-modules");
      if (res.ok) {
        const data = await res.json();
        const customNames = data.modules.map((m: any) => m.name);
        setModules([...stdModules, ...customNames]);
      } else {
        setModules(stdModules);
      }
    } catch (e) {
      setModules(stdModules);
    }
  }

  async function fetchRules() {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/conversion-rules`);
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveRule(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Filter out empty mappings
      const cleanedMappings = formData.fieldMappings.filter((m: any) => m.sourceField && m.targetField);
      
      const res = await fetch("/api/settings/conversion-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, fieldMappings: cleanedMappings })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchRules();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteRule(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`/api/settings/conversion-rules/${id}`, { method: "DELETE" });
      fetchRules();
    } catch (error) {
      console.error(error);
    }
  }

  const addMapping = () => {
    setFormData({
      ...formData,
      fieldMappings: [...formData.fieldMappings, { sourceField: "", targetField: "" }]
    });
  };

  const updateMapping = (index: number, field: string, value: string) => {
    const newMappings = [...formData.fieldMappings];
    newMappings[index][field] = value;
    setFormData({ ...formData, fieldMappings: newMappings });
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader
        title="Conversion Rules"
        description="Configure how records can be converted between modules (e.g. Lead -> Project)."
      >
        <button 
          onClick={() => {
            setFormData({
              sourceModule: "Leads",
              targetModule: "Projects",
              buttonLabel: "Convert to Project",
              fieldMappings: [{ sourceField: "", targetField: "" }]
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all"
        >
          + Add Rule
        </button>
      </PageHeader>

      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading...</div>
        ) : rules.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-zinc-500">
            <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-lg font-medium text-zinc-300">No Conversion Rules Configured</h3>
            <p className="mt-1 text-sm">Create mappings to convert data across modules.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900/80 border-b border-zinc-800/60 text-zinc-400 font-medium">
              <tr>
                <th className="px-6 py-4">Source Module</th>
                <th className="px-6 py-4">Target Module</th>
                <th className="px-6 py-4">Button Label</th>
                <th className="px-6 py-4">Mapped Fields</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {rules.map((rule) => (
                <tr key={rule._id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-100">{rule.sourceModule}</td>
                  <td className="px-6 py-4 font-medium text-zinc-100">
                    <span className="text-primary mr-2">→</span>{rule.targetModule}
                  </td>
                  <td className="px-6 py-4 text-zinc-300 bg-zinc-800/30 rounded inline-block mt-3 px-2 py-1">{rule.buttonLabel}</td>
                  <td className="px-6 py-4 text-zinc-400">{rule.fieldMappings.length} mappings</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteRule(rule._id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-6">Create Conversion Rule</h2>
            <form className="space-y-6" onSubmit={saveRule}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Source Module</label>
                  <select value={formData.sourceModule} onChange={e => setFormData({...formData, sourceModule: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100">
                    {modules.map(m => <option key={`source-${m}`} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Target Module</label>
                  <select value={formData.targetModule} onChange={e => setFormData({...formData, targetModule: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100">
                    {modules.map(m => <option key={`target-${m}`} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Button Label</label>
                <input required type="text" value={formData.buttonLabel} onChange={e => setFormData({...formData, buttonLabel: e.target.value})} placeholder="e.g. Convert to Project" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100" />
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h3 className="text-sm font-semibold text-zinc-100 mb-4">Field Mapping</h3>
                
                <div className="space-y-3">
                  {formData.fieldMappings.map((map: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="flex-1">
                        <input type="text" placeholder="Source Field (e.g. name)" value={map.sourceField} onChange={e => updateMapping(idx, 'sourceField', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 text-sm" />
                      </div>
                      <span className="text-zinc-500">→</span>
                      <div className="flex-1">
                        <input type="text" placeholder="Target Field (e.g. title)" value={map.targetField} onChange={e => updateMapping(idx, 'targetField', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 text-sm" />
                      </div>
                      <button type="button" onClick={() => {
                        const newMappings = formData.fieldMappings.filter((_: any, i: number) => i !== idx);
                        setFormData({ ...formData, fieldMappings: newMappings });
                      }} className="text-red-400 hover:text-red-300 p-2">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                
                <button type="button" onClick={addMapping} className="mt-4 text-sm text-primary hover:text-primary/80 font-medium">+ Add Field Mapping</button>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-zinc-200">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
