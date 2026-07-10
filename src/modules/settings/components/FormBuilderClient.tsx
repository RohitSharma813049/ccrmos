"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";

interface DynamicField {
  _id: string;
  name: string;
  target: string;
  type: string;
  required: boolean;
  tenantScope: string;
  section: string;
  order: number;
  options?: string[];
}

export default function FormBuilderClient() {
  const [activeTab, setActiveTab] = useState<"lead" | "customer" | "project" | "invoice">("lead");
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "Text String",
    required: false,
    section: "General",
    options: ""
  });
  const [hierarchyLevel, setHierarchyLevel] = useState<number | null>(null);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (hierarchyLevel === 1) {
      fetchFields();
    }
  }, [activeTab, hierarchyLevel]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      setHierarchyLevel(session?.user?.hierarchyLevel || 6);
    } catch (e) {
      console.error(e);
      setHierarchyLevel(6);
    }
  }

  async function fetchFields() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dynamic-fields?target=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setFields(data.fields || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        target: activeTab,
        tenantScope: "Global", // Only Platform owner can use this UI, so fields are Global by default
        options: formData.type === "Dropdown (Select)" ? formData.options.split(",").map(s => s.trim()).filter(Boolean) : [],
        order: fields.length
      };

      const res = await fetch("/api/dynamic-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchFields();
      } else {
        alert("Failed to save field. Ensure you have the right permissions.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string, scope: string) => {
    if (confirm("Delete this custom field?")) {
      const res = await fetch(`/api/dynamic-fields/${id}`, { method: "DELETE" });
      if (res.ok) fetchFields();
    }
  };

  // Group fields by section for drag and drop
  const sections = Array.from(new Set(fields.map(f => f.section || "General")));
  
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFields(items);
  };

  if (hierarchyLevel === null) {
    return <div className="p-8 text-center text-gray-500">Checking permissions...</div>;
  }

  if (hierarchyLevel !== 1) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-lg text-center border border-red-100 shadow-sm">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p className="text-red-700/80 font-medium">Database schema modification is restricted to Platform Owners only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Form Builder</h1>
          <p className="text-gray-600 mt-1">Design custom forms for your CRM modules (Platform Owner only).</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: "", type: "Text String", required: false, section: "General", options: "" });
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm"
        >
          + Add Custom Field
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        {["lead", "customer", "project", "invoice"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-4 text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab} Forms
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading form designer...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="space-y-8">
            {sections.map(sectionName => (
              <div key={sectionName} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{sectionName}</h3>
                
                <Droppable droppableId={sectionName}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 min-h-[50px]">
                      {fields.filter(f => f.section === sectionName).map((field, index) => (
                        <Draggable key={field._id} draggableId={field._id} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 border rounded-xl bg-gray-50 flex items-center justify-between ${snapshot.isDragging ? 'shadow-md border-indigo-400' : 'border-gray-200'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-gray-400 cursor-grab">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{field.name} {field.required && <span className="text-red-500">*</span>}</p>
                                  <p className="text-xs text-gray-500 font-medium mt-1">Type: {field.type} | Scope: {field.tenantScope}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleDelete(field._id, field.tenantScope)}
                                className="text-sm text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Custom Field</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-300 rounded-lg px-3 py-2 border outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border-gray-300 rounded-lg px-3 py-2 border outline-none focus:border-indigo-500">
                  <option>Text String</option>
                  <option>Number</option>
                  <option>Dropdown (Select)</option>
                  <option>Date</option>
                  <option>Checkbox</option>
                </select>
              </div>
              
              {formData.type === "Dropdown (Select)" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma separated)</label>
                  <input required type="text" placeholder="Yes, No, Maybe" value={formData.options} onChange={e => setFormData({...formData, options: e.target.value})} className="w-full border-gray-300 rounded-lg px-3 py-2 border outline-none focus:border-indigo-500" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input type="text" placeholder="e.g. General, Medical Info" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full border-gray-300 rounded-lg px-3 py-2 border outline-none focus:border-indigo-500" />
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="req" checked={formData.required} onChange={e => setFormData({...formData, required: e.target.checked})} className="rounded text-indigo-600" />
                <label htmlFor="req" className="text-sm text-gray-700">Make this field mandatory</label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">Save Field</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
