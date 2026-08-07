"use client";

import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface DynamicField {
  _id: string;
  name: string;
  type: string;
  required: boolean;
  section?: string;
  order?: number;
  options?: string[];
}

interface DynamicFormBuilderProps {
  targetModule: "lead" | "customer" | "project" | "task" | "order" | "invoice";
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
}

export default function DynamicFormBuilder({ targetModule, initialData, onSubmit, onCancel }: DynamicFormBuilderProps) {
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [leadStages, setLeadStages] = useState<any[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    async function fetchFields() {
      try {
        const res = await fetch(`/api/dynamic-fields?target=${targetModule}`);
        if (res.ok) {
          const data = await res.json();
          // Sort fields by order
          const sortedFields = (data.fields || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          setFields(sortedFields);
        }

        if (targetModule === "lead") {
          const [stageRes, statusRes] = await Promise.all([
            fetch('/api/settings/lead-stages'),
            fetch('/api/lead-status')
          ]);
          if (stageRes.ok && statusRes.ok) {
            const stages = await stageRes.json();
            const { statuses } = await statusRes.json();
            setLeadStages(stages);
            setLeadStatuses(statuses || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dynamic fields", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFields();
  }, [targetModule]);

  const handleCustomDataChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customData: {
        ...(prev.customData || {}),
        [name]: value
      }
    }));
  };

  const handleFixedDataChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onSubmit(formData);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading form...</div>;
  }

  // Group fields by section for the wizard steps
  // Step 0 is always the "Default Fields" (hardcoded ones)
  // Step 1+ are the dynamic sections
  const sections = Array.from(new Set(fields.map(f => f.section || "General")));
  const totalSteps = 1 + sections.length;
  
  const renderDefaultFields = () => {
    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
        <h3 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">Basic Details</h3>
        
        {targetModule === "lead" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">First Name *</label>
              <input 
                type="text" 
                name="firstName"
                required 
                value={formData.firstName || ""}
                onChange={(e) => handleFixedDataChange("firstName", e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Last Name *</label>
              <input 
                type="text" 
                name="lastName"
                required 
                value={formData.lastName || ""}
                onChange={(e) => handleFixedDataChange("lastName", e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email || ""}
                  onChange={(e) => handleFixedDataChange("email", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                <div className="phone-input-wrapper">
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={formData.phone || ""}
                    onChange={(val) => handleFixedDataChange("phone", val)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus-within:ring-2 focus-within:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Priority Score (1-10)</label>
                <input 
                  type="number" 
                  min="1" max="10"
                  value={formData.leadScore || 5}
                  onChange={(e) => handleFixedDataChange("leadScore", parseInt(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Stage *</label>
                <select 
                  value={formData.stageId || ""}
                  onChange={(e) => handleFixedDataChange("stageId", e.target.value)}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
                >
                  <option value="">Select a Stage</option>
                  {leadStages.map((stage: any) => (
                    <option key={stage._id} value={stage._id}>{stage.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                <select 
                  value={formData.status || ""}
                  onChange={(e) => handleFixedDataChange("status", e.target.value)}
                  disabled={!formData.stageId}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none disabled:opacity-50" 
                >
                  <option value="">Select a Status</option>
                  {leadStatuses
                    .filter(s => {
                      const sStageId = typeof s.stageId === 'object' ? s.stageId._id : s.stageId;
                      return sStageId === formData.stageId && s.active;
                    })
                    .map((status: any) => (
                    <option key={status._id} value={status.name}>{status.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {targetModule === "customer" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Company Name *</label>
              <input 
                type="text" 
                required 
                value={formData.companyName || ""}
                onChange={(e) => handleFixedDataChange("companyName", e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Contact Name *</label>
              <input 
                type="text" 
                required 
                value={formData.contactName || ""}
                onChange={(e) => handleFixedDataChange("contactName", e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input 
                type="email" 
                value={formData.email || ""}
                onChange={(e) => handleFixedDataChange("email", e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
              <div className="phone-input-wrapper">
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={formData.phone || ""}
                  onChange={(val) => handleFixedDataChange("phone", val)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus-within:ring-2 focus-within:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {targetModule === "project" && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Project Name *</label>
              <input 
                type="text" 
                required 
                value={formData.name || ""}
                onChange={(e) => handleFixedDataChange("name", e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
          </div>
        )}

        {targetModule === "task" && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Task Title *</label>
              <input 
                type="text" 
                required 
                value={formData.title || ""}
                onChange={(e) => handleFixedDataChange("title", e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
          </div>
        )}

        {targetModule === "order" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Order Number *</label>
              <input 
                type="text" 
                required 
                value={formData.orderNumber || ""}
                onChange={(e) => handleFixedDataChange("orderNumber", e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Amount *</label>
              <input 
                type="number" 
                required 
                value={formData.amount || ""}
                onChange={(e) => handleFixedDataChange("amount", parseFloat(e.target.value))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
          </div>
        )}

        {targetModule === "invoice" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Invoice Number *</label>
              <input 
                type="text" 
                required 
                value={formData.invoiceNumber || ""}
                onChange={(e) => handleFixedDataChange("invoiceNumber", e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Amount *</label>
              <input 
                type="number" 
                required 
                value={formData.amount || ""}
                onChange={(e) => handleFixedDataChange("amount", parseFloat(e.target.value))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDynamicSection = (sectionName: string) => {
    const sectionFields = fields.filter(f => (f.section || "General") === sectionName);
    
    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
        <h3 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2 capitalize">{sectionName}</h3>
        <div className="space-y-4">
          {sectionFields.map((field: any) => (
            <div key={field._id}>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {field.name} {field.required && <span className="text-red-500">*</span>}
              </label>
              {(field.type === "Text String" || field.type === "text" || field.type === "url") && (
                <input 
                  type="text" 
                  required={field.required}
                  value={formData.customData?.[field.name] || ""}
                  onChange={(e) => handleCustomDataChange(field.name, e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
                />
              )}
              {(field.type === "Number" || field.type === "number") && (
                <input 
                  type="number" 
                  required={field.required}
                  value={formData.customData?.[field.name] || ""}
                  onChange={(e) => handleCustomDataChange(field.name, parseFloat(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
                />
              )}
              {(field.type === "Date" || field.type === "date") && (
                <input 
                  type="date" 
                  required={field.required}
                  value={formData.customData?.[field.name] || ""}
                  onChange={(e) => handleCustomDataChange(field.name, e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none" 
                />
              )}
              {(field.type === "Checkbox" || field.type === "checkbox") && (
                <div className="flex items-center mt-2">
                  <input 
                    type="checkbox"
                    checked={formData.customData?.[field.name] || false}
                    onChange={(e) => handleCustomDataChange(field.name, e.target.checked)}
                    className="w-5 h-5 text-primary bg-background border-border rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-foreground">Yes / True</span>
                </div>
              )}
              {(field.type === "Dropdown (Select)" || field.type === "select") && (
                <select
                  required={field.required}
                  value={formData.customData?.[field.name] || ""}
                  onChange={(e) => handleCustomDataChange(field.name, e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="" disabled>Select an option...</option>
                  {field.options?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
              {field.type === "Phone" && (
                <div className="phone-input-wrapper">
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={formData.customData?.[field.name] || ""}
                    onChange={(val) => handleCustomDataChange(field.name, val)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus-within:ring-2 focus-within:ring-primary outline-none"
                  />
                </div>
              )}
              {field.type === "File Upload" && (
                <div className="mt-1">
                  <input 
                    type="file" 
                    required={field.required && !formData.customData?.[field.name]}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const uploadFormData = new FormData();
                        uploadFormData.append("file", file);
                        try {
                          // Simple state for UI indication could go here, but for now just upload
                          const res = await fetch("/api/upload", {
                            method: "POST",
                            body: uploadFormData
                          });
                          if (res.ok) {
                            const data = await res.json();
                            handleCustomDataChange(field.name, data.url);
                          } else {
                            alert("Upload failed.");
                          }
                        } catch (error) {
                          console.error("Upload error", error);
                          alert("Upload failed.");
                        }
                      }
                    }}
                    className="w-full text-sm text-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                  />
                  {formData.customData?.[field.name] && (
                    <a href={formData.customData[field.name]} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-blue-600 hover:underline">
                      View Uploaded File
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-[400px]">
      {/* Wizard Progress Header */}
      {totalSteps > 1 && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const stepName = idx === 0 ? "Basic" : sections[idx - 1];
              const isActive = currentStep === idx;
              const isPast = currentStep > idx;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold relative z-10 transition-colors ${
                    isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                    isPast ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border-2 border-border"
                  }`}>
                    {isPast ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : idx + 1}
                  </div>
                  <span className={`mt-2 text-xs font-medium capitalize ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {stepName}
                  </span>
                  {idx < totalSteps - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 ${isPast ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <form className="flex-1 flex flex-col" onSubmit={handleSubmit}>
        <div className="flex-1 overflow-y-auto pb-4 px-1">
          {currentStep === 0 ? renderDefaultFields() : renderDynamicSection(sections[currentStep - 1])}
        </div>

        <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
          <button 
            type="button" 
            onClick={() => currentStep === 0 ? onCancel() : setCurrentStep(s => s - 1)} 
            className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors focus-visible:outline-none"
          >
            {currentStep === 0 ? "Cancel" : "Previous"}
          </button>
          
          <button 
            type="submit" 
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center gap-2"
          >
            {currentStep < totalSteps - 1 ? (
              <>
                Next Step
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </>
            ) : "Save Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
