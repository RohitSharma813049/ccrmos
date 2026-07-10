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
    return <div className="p-8 text-center text-gray-500">Loading form...</div>;
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {targetModule === "lead" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
            <input 
              type="text" 
              required 
              value={formData.firstName || ""}
              onChange={(e) => handleFixedDataChange("firstName", e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
            <input 
              type="text" 
              required 
              value={formData.lastName || ""}
              onChange={(e) => handleFixedDataChange("lastName", e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input 
              type="email" 
              value={formData.email || ""}
              onChange={(e) => handleFixedDataChange("email", e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>
      )}

      {targetModule === "customer" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
            <input 
              type="text" 
              required 
              value={formData.companyName || ""}
              onChange={(e) => handleFixedDataChange("companyName", e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Name *</label>
            <input 
              type="text" 
              required 
              value={formData.contactName || ""}
              onChange={(e) => handleFixedDataChange("contactName", e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input 
              type="email" 
              value={formData.email || ""}
              onChange={(e) => handleFixedDataChange("email", e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <div className="phone-input-wrapper">
              <PhoneInput
                international
                defaultCountry="US"
                value={formData.phone || ""}
                onChange={(val) => handleFixedDataChange("phone", val)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus-within:ring-2 focus-within:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {targetModule === "project" && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name *</label>
            <input 
              type="text" 
              required 
              value={formData.name || ""}
              onChange={(e) => handleFixedDataChange("name", e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>
      )}

      {targetModule === "task" && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Title *</label>
            <input 
              type="text" 
              required 
              value={formData.title || ""}
              onChange={(e) => handleFixedDataChange("title", e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>
      )}

      {targetModule === "order" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Number *</label>
            <input 
              type="text" 
              required 
              value={formData.orderNumber || ""}
              onChange={(e) => handleFixedDataChange("orderNumber", e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount *</label>
            <input 
              type="number" 
              required 
              value={formData.amount || ""}
              onChange={(e) => handleFixedDataChange("amount", parseFloat(e.target.value))}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>
      )}

      {targetModule === "invoice" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Invoice Number *</label>
            <input 
              type="text" 
              required 
              value={formData.invoiceNumber || ""}
              onChange={(e) => handleFixedDataChange("invoiceNumber", e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount *</label>
            <input 
              type="number" 
              required 
              value={formData.amount || ""}
              onChange={(e) => handleFixedDataChange("amount", parseFloat(e.target.value))}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC CUSTOM FIELDS GROUPED BY SECTION */}
      {fields.length > 0 && (
        <div className="pt-4 mt-4 border-t border-gray-100 space-y-8">
          {Array.from(new Set(fields.map(f => f.section || "General"))).map(sectionName => {
            const sectionFields = fields.filter(f => (f.section || "General") === sectionName);
            if (sectionFields.length === 0) return null;
            
            return (
              <div key={sectionName}>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                  {sectionName}
                </h3>
                <div className="space-y-4">
                  {sectionFields.map((field: any) => (
                    <div key={field._id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field.name} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === "Text String" && (
                        <input 
                          type="text" 
                          required={field.required}
                          value={formData.customData?.[field.name] || ""}
                          onChange={(e) => handleCustomDataChange(field.name, e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      )}
                      {field.type === "Number" && (
                        <input 
                          type="number" 
                          required={field.required}
                          value={formData.customData?.[field.name] || ""}
                          onChange={(e) => handleCustomDataChange(field.name, parseFloat(e.target.value))}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      )}
                      {field.type === "Date" && (
                        <input 
                          type="date" 
                          required={field.required}
                          value={formData.customData?.[field.name] || ""}
                          onChange={(e) => handleCustomDataChange(field.name, e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      )}
                      {field.type === "Checkbox" && (
                        <div className="flex items-center mt-2">
                          <input 
                            type="checkbox"
                            checked={formData.customData?.[field.name] || false}
                            onChange={(e) => handleCustomDataChange(field.name, e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Yes / True</span>
                        </div>
                      )}
                      {field.type === "Dropdown (Select)" && (
                        <select
                          required={field.required}
                          value={formData.customData?.[field.name] || ""}
                          onChange={(e) => handleCustomDataChange(field.name, e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
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
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus-within:ring-2 focus-within:ring-blue-500 outline-none"
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
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
          Save Record
        </button>
      </div>
    </form>
  );
}
