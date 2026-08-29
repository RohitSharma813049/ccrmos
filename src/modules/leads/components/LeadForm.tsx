"use client";

import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface LeadFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function LeadForm({ initialData, onSubmit, onCancel }: LeadFormProps) {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [activeTab, setActiveTab] = useState("basic");
  
  const [leadStages, setLeadStages] = useState<any[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<any[]>([]);
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [stageRes, statusRes, fieldsRes] = await Promise.all([
          fetch('/api/settings/lead-stages'),
          fetch('/api/lead-status'),
          fetch('/api/dynamic-fields?target=lead')
        ]);
        if (stageRes.ok && statusRes.ok && fieldsRes.ok) {
          setLeadStages(await stageRes.json());
          setLeadStatuses((await statusRes.json()).statuses || []);
          setDynamicFields((await fieldsRes.json()).fields || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCustomChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      customData: { ...(prev.customData || {}), [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "realestate", label: "Real Estate" },
    { id: "pipeline", label: "Pipeline" },
    { id: "telephony", label: "Telephony & Media" },
    { id: "custom", label: "Custom Fields" },
  ];

  return (
    <div className="flex flex-col min-h-[500px]">
      <div className="flex border-b border-border mb-6 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto pb-6 px-1 space-y-4">
          
          {/* BASIC INFO */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">First Name *</label>
                <input required type="text" value={formData.firstName || ""} onChange={e => handleChange("firstName", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Last Name *</label>
                <input required type="text" value={formData.lastName || ""} onChange={e => handleChange("lastName", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                <input required type="email" value={formData.email || ""} onChange={e => handleChange("email", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                <div className="phone-input-wrapper">
                  <PhoneInput 
                    international 
                    defaultCountry="US" 
                    value={formData.phone ? (formData.phone.startsWith('+') ? formData.phone : `+1${formData.phone.replace(/\D/g, '')}`) : ""} 
                    onChange={val => handleChange("phone", val)} 
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus-within:ring-2 focus-within:ring-primary" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Stage *</label>
                <select required value={formData.stageId || ""} onChange={e => handleChange("stageId", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select Stage</option>
                  {leadStages.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                <select value={formData.status || ""} onChange={e => handleChange("status", e.target.value)} disabled={!formData.stageId} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
                  <option value="">Select Status</option>
                  {leadStatuses.filter(s => (s.stageId?._id || s.stageId) === formData.stageId && s.active).map(s => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                <input type="text" value={formData.city || ""} onChange={e => handleChange("city", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">State</label>
                <input type="text" value={formData.state || ""} onChange={e => handleChange("state", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          )}

          {/* REAL ESTATE */}
          {activeTab === "realestate" && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Budget</label>
                <input type="number" value={formData.budget || ""} onChange={e => handleChange("budget", parseFloat(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Timeline</label>
                <input type="text" value={formData.timeline || ""} onChange={e => handleChange("timeline", e.target.value)} placeholder="e.g. 3 Months" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Location</label>
                <input type="text" value={formData.preferredLocation || ""} onChange={e => handleChange("preferredLocation", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">BHK / Plot Size</label>
                <input type="text" value={formData.bhkOrPlotSize || ""} onChange={e => handleChange("bhkOrPlotSize", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Possession Status</label>
                <select value={formData.possessionStatus || ""} onChange={e => handleChange("possessionStatus", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select...</option>
                  <option value="Ready to Move">Ready to Move</option>
                  <option value="Under Construction">Under Construction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Requirement Type</label>
                <select value={formData.requirementType || ""} onChange={e => handleChange("requirementType", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select...</option>
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                  <option value="Invest">Invest</option>
                </select>
              </div>
            </div>
          )}

          {/* PIPELINE */}
          {activeTab === "pipeline" && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
                <select value={formData.priority || "Medium"} onChange={e => handleChange("priority", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Lead Score (1-10)</label>
                <input type="number" min="1" max="10" value={formData.leadScore || 5} onChange={e => handleChange("leadScore", parseInt(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Deal Value</label>
                <input type="number" value={formData.dealValue || ""} onChange={e => handleChange("dealValue", parseFloat(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Expected Closing Date</label>
                <input type="date" value={formData.expectedClosingDate ? new Date(formData.expectedClosingDate).toISOString().split('T')[0] : ""} onChange={e => handleChange("expectedClosingDate", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Next Follow-up Date</label>
                <input type="datetime-local" value={formData.nextFollowUpDate ? new Date(formData.nextFollowUpDate).toISOString().slice(0, 16) : ""} onChange={e => handleChange("nextFollowUpDate", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Lost Reason</label>
                <input type="text" value={formData.lostReason || ""} onChange={e => handleChange("lostReason", e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          )}

          {/* TELEPHONY & MEDIA */}
          {activeTab === "telephony" && (
            <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">WhatsApp Status</label>
                <input type="text" value={formData.whatsAppStatus || ""} readOnly className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 outline-none cursor-not-allowed text-muted-foreground" placeholder="Will be updated by system" />
              </div>
              <div className="text-sm text-muted-foreground bg-primary/5 p-4 rounded-xl border border-primary/10">
                <p className="font-semibold text-primary mb-1">Advanced Telephony</p>
                <p>Call recordings, documents, and dialer statuses will be populated automatically by the dialer integrations once connected in Phase 2.</p>
              </div>
            </div>
          )}

          {/* CUSTOM FIELDS */}
          {activeTab === "custom" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {dynamicFields.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">No custom fields configured for Leads.</p>
              ) : (
                dynamicFields.map(field => (
                  <div key={field._id}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      {field.name} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {(field.type === "Text String" || field.type === "text" || field.type === "url") && (
                      <input required={field.required} type="text" value={formData.customData?.[field.name] || ""} onChange={e => handleCustomChange(field.name, e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
                    )}
                    {(field.type === "Number" || field.type === "number") && (
                      <input required={field.required} type="number" value={formData.customData?.[field.name] || ""} onChange={e => handleCustomChange(field.name, parseFloat(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
                    )}
                    {(field.type === "Date" || field.type === "date") && (
                      <input required={field.required} type="date" value={formData.customData?.[field.name] || ""} onChange={e => handleCustomChange(field.name, e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
                    )}
                    {(field.type === "Checkbox" || field.type === "checkbox") && (
                      <div className="flex items-center mt-2">
                        <input type="checkbox" checked={formData.customData?.[field.name] || false} onChange={e => handleCustomChange(field.name, e.target.checked)} className="w-5 h-5" />
                        <span className="ml-2 text-sm text-foreground">Yes / True</span>
                      </div>
                    )}
                    {(field.type === "Dropdown (Select)" || field.type === "select") && (
                      <select required={field.required} value={formData.customData?.[field.name] || ""} onChange={e => handleCustomChange(field.name, e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary">
                        <option value="" disabled>Select...</option>
                        {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>
        
        <div className="pt-6 mt-4 border-t border-border flex items-center justify-between shrink-0">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow-sm">
            Save Lead
          </button>
        </div>
      </form>
    </div>
  );
}
