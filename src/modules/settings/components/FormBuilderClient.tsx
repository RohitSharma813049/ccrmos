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
  customCss?: string;
}

export default function FormBuilderClient() {
  const [activeTab, setActiveTab] = useState<string>("Leads");
  const [modules, setModules] = useState<string[]>(["Leads", "Customers", "Projects", "Invoices"]);
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [formStyle, setFormStyle] = useState<"single" | "steps">("single");
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    type: "Text String",
    required: false,
    section: "General",
    options: "",
    customCss: ""
  });
  const [hierarchyLevel, setHierarchyLevel] = useState<number | null>(null);

  useEffect(() => {
    fetchSession();
    fetchModules();
  }, []);

  async function fetchModules() {
    try {
      const res = await fetch("/api/settings/active-modules");
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || []);
        if (data.modules && data.modules.length > 0) {
          setActiveTab(data.modules[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (hierarchyLevel !== null && hierarchyLevel <= 2) {
      fetchFields();
      fetchFormStyle();
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

  async function fetchFormStyle() {
    try {
      const res = await fetch(`/api/settings/form_style_${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        if (data.value && (data.value === "single" || data.value === "steps")) {
          setFormStyle(data.value);
        } else {
          setFormStyle("single");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function saveFormStyle(style: "single" | "steps") {
    setFormStyle(style);
    try {
      await fetch(`/api/settings/form_style_${activeTab}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: true,
          value: style
        })
      });
    } catch (e) {
      console.error(e);
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        target: activeTab,
        tenantScope: hierarchyLevel === 1 ? "Global" : "Company",
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

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this field?")) return;
    try {
      const res = await fetch(`/api/dynamic-fields/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchFields();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete field");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRenameSection(oldSection: string) {
    const newName = prompt(`Rename section "${oldSection}" to:`, oldSection);
    if (!newName || newName === oldSection) return;
    
    const fieldsToUpdate = fields.filter(f => f.section === oldSection);
    
    try {
      await Promise.all(fieldsToUpdate.map(f => fetch(`/api/dynamic-fields/${f._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: newName })
      })));
      fetchFields();
    } catch (e) {
      console.error(e);
      alert("Failed to rename section");
    }
  }

  const sections = Array.from(new Set(fields.map(f => f.section || "General")));
  
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFields(items);
  };

  if (hierarchyLevel === null) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Checking permissions...</span>
      </div>
    );
  }

  if (hierarchyLevel > 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-destructive/10 text-destructive p-6 rounded-2xl max-w-lg text-center border border-destructive/20 shadow-sm">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p className="text-destructive/80 font-medium">Database schema modification is restricted to Platform Owners.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Form Builder</h1>
          <p className="text-muted-foreground mt-1">Design custom forms for your CRM modules (Platform Owner only).</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              setCurrentStep(0);
              setIsPreviewOpen(true);
            }}
            className="bg-background hover:bg-muted text-foreground border border-border px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Live Preview
          </button>
          <button 
            onClick={() => {
              setFormData({ name: "", type: "Text String", required: false, section: "General", options: "", customCss: "" });
              setIsModalOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            + Add Custom Field
          </button>
        </div>
      </div>

      <div className="flex border-b border-border overflow-x-auto">
        {modules.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-4 text-sm font-medium capitalize transition-colors relative whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab} Forms
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground font-medium">Loading form designer...</span>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border/50">Form Configuration</h3>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="formStyle" 
                  checked={formStyle === "single"} 
                  onChange={() => saveFormStyle("single")} 
                  className="w-4 h-4 text-primary focus:ring-primary border-border bg-background"
                />
                <span className="text-foreground font-medium">Single Page Form</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="formStyle" 
                  checked={formStyle === "steps"} 
                  onChange={() => saveFormStyle("steps")} 
                  className="w-4 h-4 text-primary focus:ring-primary border-border bg-background"
                />
                <span className="text-foreground font-medium">Step-by-step Wizard (Group by Section)</span>
              </label>
            </div>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-8">
              {sections.map(sectionName => (
                <div key={sectionName} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border/50">{sectionName}</h3>
                  
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
                                className={`p-4 border rounded-xl bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${snapshot.isDragging ? 'shadow-md border-primary' : 'border-border'}`}
                              >
                                <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto min-w-0">
                                  <div className="text-muted-foreground cursor-grab shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    </svg>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-foreground truncate">{field.name} {field.required && <span className="text-destructive">*</span>}</p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1 truncate">
                                      Type: {field.type} | Scope: {field.tenantScope} {field.customCss && `| CSS: ${field.customCss}`}
                                    </p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleDelete(field._id)}
                                  className="text-sm text-destructive hover:text-destructive/80 font-medium focus-visible:outline-none focus-visible:underline"
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
        </div>
      )}

      {/* Field Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card rounded-2xl shadow-xl border border-border w-full max-w-md p-6 max-h-[90vh] overflow-y-auto custom-scrollbar slide-up">
            <h2 className="text-xl font-bold text-foreground mb-6">Add Custom Field</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Field Name</label>
                <input required type="text" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border-border rounded-lg px-3 py-2 border outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Data Type</label>
                <select name="type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-background border-border rounded-lg px-3 py-2 border outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm">
                  <option>Text String</option>
                  <option>Number</option>
                  <option>Dropdown (Select)</option>
                  <option>Date</option>
                  <option>Checkbox</option>
                </select>
              </div>
              
              {formData.type === "Dropdown (Select)" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Options (comma separated)</label>
                  <input required type="text" placeholder="Yes, No, Maybe" value={formData.options} onChange={e => setFormData({...formData, options: e.target.value})} className="w-full bg-background border-border rounded-lg px-3 py-2 border outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Section (Used for Wizard Steps)</label>
                <input 
                  type="text" 
                  list="sections-list"
                  placeholder="e.g. General, Medical Info" 
                  value={formData.section} 
                  onChange={e => setFormData({...formData, section: e.target.value})} 
                  className="w-full bg-background border-border rounded-lg px-3 py-2 border outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm" 
                />
                <datalist id="sections-list">
                  {sections.map(sec => (
                    <option key={sec} value={sec} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Custom CSS Class (Optional)</label>
                <input type="text" placeholder="e.g. col-span-2 text-primary" value={formData.customCss} onChange={e => setFormData({...formData, customCss: e.target.value})} className="w-full bg-background border-border rounded-lg px-3 py-2 border outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm" />
                <p className="text-xs text-muted-foreground mt-1">Apply Tailwind classes to style this field specifically.</p>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="req" checked={formData.required} onChange={e => setFormData({...formData, required: e.target.checked})} className="rounded text-primary focus:ring-primary border-border bg-background" />
                <label htmlFor="req" className="text-sm text-foreground">Make this field mandatory</label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Save Field</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
          <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-border slide-up">
            <div className="px-6 py-4 border-b border-border bg-card flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground">Live Form Preview</h2>
                <p className="text-xs text-muted-foreground">{activeTab.toUpperCase()} FORM &bull; {formStyle === 'steps' ? 'WIZARD MODE' : 'SINGLE PAGE MODE'}</p>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-muted/30">
              <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
                
                {formStyle === "steps" && sections.length > 1 && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      {sections.map((sec, i) => (
                        <div key={sec} className={`text-xs font-semibold uppercase tracking-wider ${i === currentStep ? 'text-primary' : i < currentStep ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {sec}
                        </div>
                      ))}
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                      {sections.map((_, i) => (
                        <div key={i} className={`h-full flex-1 border-r border-background transition-colors duration-300 ${i <= currentStep ? 'bg-primary' : 'bg-transparent'}`} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {formStyle === "steps" ? (
                    <div>
                      <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
                        <h3 className="text-xl font-bold text-foreground">{sections[currentStep]}</h3>
                        <button onClick={() => handleRenameSection(sections[currentStep])} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Rename Section">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fields.filter(f => f.section === sections[currentStep]).map(field => (
                          <div key={field._id} className={field.customCss || "col-span-1 md:col-span-2"}>
                            <label className="block text-sm font-semibold text-foreground mb-1">
                              {field.name} {field.required && <span className="text-destructive">*</span>}
                            </label>
                            {field.type === "Dropdown (Select)" ? (
                              <select className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm">
                                <option>Select...</option>
                                {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                              </select>
                            ) : field.type === "Checkbox" ? (
                              <input type="checkbox" className="w-5 h-5 rounded text-primary border-border bg-background focus:ring-primary" />
                            ) : field.type === "Date" ? (
                              <input type="date" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm" />
                            ) : (
                              <input type="text" placeholder={`Enter ${field.name}`} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    sections.map(section => (
                      <div key={section} className="mb-10">
                        <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
                          <h3 className="text-lg font-bold text-foreground">{section}</h3>
                          <button onClick={() => handleRenameSection(section)} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Rename Section">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {fields.filter(f => f.section === section).map(field => (
                            <div key={field._id} className={field.customCss || "col-span-1 md:col-span-2"}>
                              <label className="block text-sm font-semibold text-foreground mb-1">
                                {field.name} {field.required && <span className="text-destructive">*</span>}
                              </label>
                              {field.type === "Dropdown (Select)" ? (
                                <select className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm">
                                  <option>Select...</option>
                                  {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                                </select>
                              ) : field.type === "Checkbox" ? (
                                <input type="checkbox" className="w-5 h-5 rounded text-primary border-border bg-background focus:ring-primary" />
                              ) : field.type === "Date" ? (
                                <input type="date" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm" />
                              ) : (
                                <input type="text" placeholder={`Enter ${field.name}`} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-foreground shadow-sm" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-border/50">
                  {formStyle === "steps" && currentStep > 0 && (
                    <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-2.5 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      Previous
                    </button>
                  )}
                  {formStyle === "steps" && currentStep < sections.length - 1 ? (
                    <button onClick={() => setCurrentStep(prev => prev + 1)} className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      Next Step
                    </button>
                  ) : (
                    <button className="px-8 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      Submit Form
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
