"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { Plus, Trash2, Edit2, FileText, Code } from "lucide-react";
import toast from "react-hot-toast";

export default function TemplatesSettings() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("quote");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
      }
    } catch (e) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (template?: any) => {
    if (template) {
      setEditingTemplate(template);
      setName(template.name);
      setType(template.type);
      setContent(template.content);
    } else {
      setEditingTemplate(null);
      setName("");
      setType("quote");
      setContent(`<h1>Proposal for {{customer.companyName}}</h1>\n<p>Date: {{date}}</p>\n<p>Dear {{customer.contactName}},</p>\n<p>...</p>`);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTemplate ? `/api/templates/${editingTemplate._id}` : "/api/templates";
      const method = editingTemplate ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, content })
      });

      if (res.ok) {
        toast.success(editingTemplate ? "Template updated" : "Template created");
        setIsModalOpen(false);
        fetchTemplates();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save template");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Template deleted");
        fetchTemplates();
      }
    } catch (e) {
      toast.error("Failed to delete template");
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-6xl mx-auto">
      <PageHeader 
        title="Document Templates" 
        description="Create reusable HTML templates for quotes, contracts, and proposals."
      >
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={16} /> New Template
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
          <div className="inline-flex bg-primary/10 p-4 rounded-full text-primary mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground">No templates yet</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            Create your first document template to start automatically generating PDFs for your customers.
          </p>
          <Button onClick={() => handleOpenModal()}>Create Template</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template._id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                  <FileText size={20} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(template)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(template._id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{template.name}</h3>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted inline-block px-2 py-1 rounded">
                {template.type}
              </p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
              <h2 className="text-xl font-bold text-foreground">{editingTemplate ? "Edit Template" : "New Template"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                
                {/* Editor Side */}
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Template Name</label>
                      <input 
                        required
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:ring-2 focus:ring-primary focus:border-primary bg-card text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                      <select 
                        value={type} 
                        onChange={e => setType(e.target.value)} 
                        className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:ring-2 focus:ring-primary focus:border-primary bg-card text-foreground"
                      >
                        <option value="quote">Quote</option>
                        <option value="contract">Contract / NDA</option>
                        <option value="proposal">Proposal</option>
                        <option value="invoice">Invoice</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-foreground">HTML Template Content</label>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Code size={12}/> Edit HTML directly</span>
                    </div>
                    <textarea 
                      required
                      value={content} 
                      onChange={e => setContent(e.target.value)} 
                      className="w-full flex-1 border border-border rounded-lg shadow-sm py-3 px-3 focus:ring-2 focus:ring-primary focus:border-primary bg-zinc-950 text-zinc-100 font-mono text-sm resize-none custom-scrollbar"
                      placeholder="<h1>Proposal</h1>"
                    />
                  </div>
                </div>

                {/* Cheat Sheet Side */}
                <div className="w-full lg:w-72 bg-muted/30 border-l border-border p-6 overflow-y-auto shrink-0 custom-scrollbar">
                  <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Variables Reference</h3>
                  <p className="text-xs text-muted-foreground mb-6">Use these tags in your HTML. They will be replaced with live data when generating a PDF.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-foreground mb-2 border-b border-border pb-1">General</h4>
                      <ul className="space-y-2 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                        <li>{`{{date}}`}</li>
                        <li>{`{{companyName}}`}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-foreground mb-2 border-b border-border pb-1">Customer</h4>
                      <ul className="space-y-2 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                        <li>{`{{customer.companyName}}`}</li>
                        <li>{`{{customer.contactName}}`}</li>
                        <li>{`{{customer.email}}`}</li>
                        <li>{`{{customer.phone}}`}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-foreground mb-2 border-b border-border pb-1">Project</h4>
                      <ul className="space-y-2 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                        <li>{`{{project.name}}`}</li>
                        <li>{`{{project.status}}`}</li>
                        <li>{`{{project.value}}`}</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="p-4 border-t border-border bg-muted/30 shrink-0 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Template</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
