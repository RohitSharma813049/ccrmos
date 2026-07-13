"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FormBuilderClient({ formId }: { formId: string }) {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const [fieldData, setFieldData] = useState({
    id: "",
    type: "text",
    label: "",
    required: false,
    options: "",
    placeholder: ""
  });

  const router = useRouter();

  useEffect(() => {
    fetchForm();
  }, [formId]);

  async function fetchForm() {
    try {
      const res = await fetch(`/api/forms/${formId}`);
      if (res.ok) {
        const data = await res.json();
        setForm(data.form);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveForm(updatedForm = form) {
    setSaving(true);
    try {
      await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm)
      });
      setForm(updatedForm);
    } catch (e) {
      console.error(e);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const openNewField = () => {
    setFieldData({
      id: `field_${Date.now()}`,
      type: "text",
      label: "",
      required: false,
      options: "",
      placeholder: ""
    });
    setEditingFieldId(null);
    setIsFieldModalOpen(true);
  };

  const openEditField = (field: any) => {
    setFieldData({
      ...field,
      options: field.options?.join(", ") || ""
    });
    setEditingFieldId(field.id);
    setIsFieldModalOpen(true);
  };

  const saveField = (e: React.FormEvent) => {
    e.preventDefault();
    const newFields = [...(form.fields || [])];
    const fieldObj = {
      ...fieldData,
      options: fieldData.type === "select" || fieldData.type === "radio" ? fieldData.options.split(",").map(s => s.trim()).filter(Boolean) : []
    };

    if (editingFieldId) {
      const idx = newFields.findIndex(f => f.id === editingFieldId);
      if (idx !== -1) newFields[idx] = fieldObj;
    } else {
      newFields.push(fieldObj);
    }

    const updatedForm = { ...form, fields: newFields };
    saveForm(updatedForm);
    setIsFieldModalOpen(false);
  };

  const removeField = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove this field?")) return;
    const newFields = form.fields.filter((f: any) => f.id !== id);
    saveForm({ ...form, fields: newFields });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(form.fields || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    saveForm({ ...form, fields: items });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading builder...</div>;
  if (!form) return <div className="p-8 text-center text-red-500">Form not found.</div>;

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/f/${form._id}` : "";

  return (
    <div className="space-y-6 fade-in pb-20 max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/forms')} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 line-clamp-1">{form.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${form.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                {form.isActive ? "Accepting Responses" : "Draft (Closed)"}
              </span>
              <span className="text-xs text-gray-400">{saving ? "Saving..." : "Saved"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => saveForm({ ...form, isActive: !form.isActive })}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            {form.isActive ? "Close Form" : "Publish"}
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share
          </button>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Canvas */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Header Editor */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-indigo-500">
            <input 
              type="text" 
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              onBlur={() => saveForm()}
              className="w-full text-3xl font-bold text-gray-900 border-none outline-none focus:ring-0 px-0 bg-transparent placeholder-gray-300"
              placeholder="Form Title"
            />
            <textarea 
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              onBlur={() => saveForm()}
              rows={2}
              className="w-full mt-3 text-gray-600 border-none outline-none focus:ring-0 px-0 bg-transparent resize-none placeholder-gray-400"
              placeholder="Form description (optional)"
            />
          </div>

          {/* Fields List */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {(!form.fields || form.fields.length === 0) ? (
                    <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-500">
                      No questions added yet.
                    </div>
                  ) : (
                    form.fields.map((field: any, index: number) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white rounded-2xl border transition-all ${snapshot.isDragging ? 'shadow-lg border-indigo-500 z-50 ring-2 ring-indigo-200' : 'shadow-sm border-gray-200 hover:border-gray-300'}`}
                          >
                            <div className="flex">
                              <div {...provided.dragHandleProps} className="w-10 flex flex-col items-center justify-center border-r border-gray-100 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing bg-gray-50 rounded-l-2xl">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                              </div>
                              
                              <div className="flex-1 p-5 cursor-pointer" onClick={() => openEditField(field)}>
                                <div className="flex justify-between items-start">
                                  <div className="pr-4">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                      {field.label || "Untitled Question"}
                                      {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </h3>
                                    
                                    {/* Field Preview */}
                                    <div className="mt-4 opacity-70 pointer-events-none">
                                      {field.type === 'textarea' ? (
                                        <div className="h-20 w-full border border-gray-200 rounded-lg bg-gray-50 p-3 text-sm text-gray-400">{field.placeholder || "Long answer text"}</div>
                                      ) : field.type === 'select' ? (
                                        <div className="h-10 w-full md:w-64 border border-gray-200 rounded-lg bg-gray-50 px-3 flex items-center justify-between text-sm text-gray-400">
                                          <span>Select option...</span>
                                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                      ) : field.type === 'radio' ? (
                                        <div className="space-y-2">
                                          {(field.options || []).slice(0,3).map((opt: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2"><div className="w-4 h-4 border border-gray-300 rounded-full" /><span className="text-sm text-gray-500">{opt}</span></div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="h-10 w-full md:w-64 border border-gray-200 rounded-lg bg-gray-50 p-3 text-sm text-gray-400 flex items-center">{field.placeholder || "Short answer text"}</div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{field.type}</span>
                                    <button onClick={(e) => removeField(field.id, e)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                  
                  <button 
                    onClick={openNewField}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-semibold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Question
                  </button>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Settings Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-6">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Form Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Submit Button Text</label>
                <input 
                  type="text" 
                  value={form.submitButtonText || "Submit"}
                  onChange={(e) => setForm({...form, submitButtonText: e.target.value})}
                  onBlur={() => saveForm()}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Success Message</label>
                <textarea 
                  value={form.successMessage || "Thank you for your submission!"}
                  onChange={(e) => setForm({...form, successMessage: e.target.value})}
                  onBlur={() => saveForm()}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-2">
              <Link href={`/dashboard/forms/${form._id}/submissions`} className="w-full flex items-center justify-between px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors">
                View Submissions
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Field Editor Modal */}
      {isFieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFieldModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">{editingFieldId ? "Edit Question" : "New Question"}</h3>
              <button onClick={() => setIsFieldModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="fieldForm" onSubmit={saveField} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Question Title</label>
                  <input required type="text" value={fieldData.label} onChange={e => setFieldData({...fieldData, label: e.target.value})} className="w-full border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. What is your name?" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Answer Type</label>
                  <select value={fieldData.type} onChange={e => setFieldData({...fieldData, type: e.target.value})} className="w-full border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    <option value="text">Short Text</option>
                    <option value="textarea">Long Text (Paragraph)</option>
                    <option value="email">Email Address</option>
                    <option value="number">Number</option>
                    <option value="select">Dropdown</option>
                    <option value="radio">Multiple Choice (Single Answer)</option>
                  </select>
                </div>

                {(fieldData.type === "select" || fieldData.type === "radio") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Options</label>
                    <textarea required rows={3} value={fieldData.options} onChange={e => setFieldData({...fieldData, options: e.target.value})} placeholder="Option 1, Option 2, Option 3" className="w-full border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" />
                    <p className="text-xs text-gray-500 mt-1">Separate options with commas.</p>
                  </div>
                )}
                
                {["text", "textarea", "email", "number"].includes(fieldData.type) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Placeholder Text (Optional)</label>
                    <input type="text" value={fieldData.placeholder} onChange={e => setFieldData({...fieldData, placeholder: e.target.value})} className="w-full border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-4">
                  <span className="text-sm font-semibold text-gray-700">Required Question</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={fieldData.required} onChange={e => setFieldData({...fieldData, required: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button onClick={() => setIsFieldModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-200 font-semibold rounded-xl transition-colors">Cancel</button>
              <button form="fieldForm" type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-colors">Save Question</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Share Form</h2>
                <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {!form.isActive && (
                <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm flex gap-3">
                  <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p>This form is currently marked as <strong>Draft</strong>. It must be Published to receive submissions.</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Link */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Direct Link</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={publicUrl} 
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none" 
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(publicUrl);
                        alert("Link copied!");
                      }}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                    >
                      Copy
                    </button>
                    <a 
                      href={publicUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-xl transition-colors flex items-center justify-center"
                      title="Open in new tab"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </div>
                </div>
                
                {/* Iframe */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Embed on Website (Iframe)</label>
                  <div className="relative">
                    <pre className="bg-slate-900 text-gray-300 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap">
                      {`<iframe\n  src="${publicUrl}?embed=true"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border:none; border-radius:12px; overflow:hidden;"\n></iframe>`}
                    </pre>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`<iframe src="${publicUrl}?embed=true" width="100%" height="600" frameborder="0" style="border:none; border-radius:12px; overflow:hidden;"></iframe>`);
                        alert("Embed code copied!");
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                      title="Copy code"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
