"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { ArrowLeft, GripVertical, Plus, Trash2, Save } from "lucide-react";

export default function ModuleBuilderClient({ moduleData }: { moduleData: any }) {
  const [fields, setFields] = useState<any[]>(moduleData.fields || []);
  const [isSaving, setIsSaving] = useState(false);

  // Generates a random id for new fields that haven't been saved yet
  const generateTempId = () => Math.random().toString(36).substring(2, 11);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFields(items);
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        _id: generateTempId(),
        name: "",
        type: "text",
        required: false,
        options: [],
        relationTarget: null
      }
    ]);
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const saveModule = async () => {
    setIsSaving(true);
    try {
      // Strip temporary _id from newly added fields before saving
      const cleanFields = fields.map(f => {
        const field = { ...f };
        // If the ID isn't a 24 char hex string, it's our temp ID and Mongoose will reject it
        if (field._id && field._id.length !== 24) {
          delete field._id;
        }
        return field;
      });

      const res = await fetch(`/api/settings/modules/${moduleData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: cleanFields })
      });

      if (res.ok) {
        alert("Module schema saved successfully!");
      } else {
        const data = await res.json();
        alert(`Failed to save: ${data.error || "Unknown error"}`);
      }
    } catch (e: any) {
      alert(`Error saving module: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/owner/modules" className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Builder: {moduleData.name}</h1>
            <p className="text-muted-foreground">Configure the schema fields for this dynamic module.</p>
          </div>
        </div>
        <button
          onClick={saveModule}
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving..." : "Save Schema"}
        </button>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Schema Fields</h2>
          <button
            onClick={addField}
            className="flex items-center gap-2 text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-4"
              >
                {fields.length === 0 ? (
                  <div className="text-center py-12 bg-muted/50 rounded-xl border border-dashed border-border">
                    <p className="text-muted-foreground">No fields configured yet. Click "Add Field" to begin.</p>
                  </div>
                ) : (
                  fields.map((field, index) => (
                    <Draggable key={field._id || `temp-${index}`} draggableId={field._id || `temp-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                            snapshot.isDragging 
                              ? 'bg-muted/80 border-primary/50 shadow-lg' 
                              : 'bg-background border-border hover:border-border/80'
                          }`}
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="pt-3 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-muted-foreground uppercase">Field Name</label>
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => updateField(index, "name", e.target.value)}
                                placeholder="e.g. Property Price"
                                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                              />
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-muted-foreground uppercase">Type</label>
                              <select
                                value={field.type}
                                onChange={(e) => updateField(index, "type", e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="select">Select Dropdown</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="phone">Phone</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="score">Score/Rating</option>
                                <option value="relation">Relation (Link to Record)</option>
                              </select>
                            </div>

                            {field.type === 'select' && (
                              <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Options (Comma separated)</label>
                                <input
                                  type="text"
                                  value={field.options?.join(", ") || ""}
                                  onChange={(e) => updateField(index, "options", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                                  placeholder="e.g. Option A, Option B"
                                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                              </div>
                            )}

                            {field.type === 'relation' && (
                              <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Target Collection</label>
                                <input
                                  type="text"
                                  value={field.relationTarget || ""}
                                  onChange={(e) => updateField(index, "relationTarget", e.target.value)}
                                  placeholder="e.g. Leads, Properties, Companies"
                                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                              </div>
                            )}
                            
                            {/* Require Toggle positioned at end */}
                            <div className={`flex items-center gap-2 pt-8 ${['select', 'relation'].includes(field.type) ? 'lg:col-span-4' : ''}`}>
                              <input
                                type="checkbox"
                                id={`req-${index}`}
                                checked={field.required}
                                onChange={(e) => updateField(index, "required", e.target.checked)}
                                className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-muted/50"
                              />
                              <label htmlFor={`req-${index}`} className="text-sm font-medium text-foreground cursor-pointer">
                                Required Field
                              </label>
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => removeField(index)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Remove Field"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
