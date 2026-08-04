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

  useEffect(() => {
    async function fetchFields() {
      try {
        const res = await fetch(`/api/dynamic-fields?target=${targetModule}`);
        if (res.ok) {
          const data = await res.json();
          setFields(data.fields || []);
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
    onSubmit(formData);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading form...</div>;
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
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

      {/* RENDER DYNAMIC CUSTOM FIELDS GROUPED BY SECTION */}
      {fields.length > 0 && (
        <div className="pt-4 mt-4 border-t border-border space-y-8">
          {Array.from(new Set(fields.map(f => f.section || "General"))).map(sectionName => {
            const sectionFields = fields.filter(f => (f.section || "General") === sectionName);
            if (sectionFields.length === 0) return null;
            
            return (
              <div key={sectionName}>
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider bg-muted px-3 py-1.5 rounded-lg inline-block">
                  {sectionName}
                </h3>
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
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors focus-visible:outline-none">
          Cancel
        </button>
        <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          Save Record
        </button>
      </div>
    </form>
  );
}
