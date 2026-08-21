"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import { FileText, Download, X } from "lucide-react";
import toast from "react-hot-toast";

// @ts-ignore
import html2pdf from "html2pdf.js";

interface Props {
  customerId?: string;
  projectId?: string;
  onClose: () => void;
}

export default function DocumentGeneratorModal({ customerId, projectId, onClose }: Props) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [recordData, setRecordData] = useState<any>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTemplates();
    fetchData();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
        if (data.templates.length > 0) {
          setSelectedTemplateId(data.templates[0]._id);
        }
      }
    } catch (e) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    // In a real implementation, we would fetch the exact Customer/Project by ID here.
    // For this demonstration, we'll fetch a list and filter, or just fetch the first matching.
    if (customerId) {
      try {
        const res = await fetch(`/api/customers?limit=100`);
        const data = await res.json();
        const customer = data.customers?.find((c: any) => c._id === customerId);
        setRecordData({ customer });
      } catch(e) {}
    }
  };

  useEffect(() => {
    if (!selectedTemplateId || !recordData || !templates.length) return;

    const template = templates.find(t => t._id === selectedTemplateId);
    if (!template) return;

    let html = template.content;

    // Interpolate general variables
    html = html.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
    
    // Interpolate customer variables
    if (recordData.customer) {
      html = html.replace(/\{\{customer\.companyName\}\}/g, recordData.customer.companyName || '');
      html = html.replace(/\{\{customer\.contactName\}\}/g, recordData.customer.contactName || '');
      html = html.replace(/\{\{customer\.email\}\}/g, recordData.customer.email || '');
      html = html.replace(/\{\{customer\.phone\}\}/g, recordData.customer.phone || '');
    }

    setPreviewHtml(html);
  }, [selectedTemplateId, recordData, templates]);

  const handleDownload = () => {
    if (!contentRef.current) return;
    setGenerating(true);

    const template = templates.find(t => t._id === selectedTemplateId);
    const fileName = `${template?.name || 'Document'}.pdf`;

    const opt = {
      margin:       10,
      filename:     fileName,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(contentRef.current).save().then(() => {
      setGenerating(false);
      toast.success("Document downloaded!");
      onClose();
    }).catch(() => {
      setGenerating(false);
      toast.error("Failed to generate PDF");
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <FileText size={20} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Generate Document</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 border-r border-border bg-muted/10 p-4 shrink-0 overflow-y-auto">
            <h3 className="text-sm font-semibold text-foreground mb-3">Settings</h3>
            
            {loading ? (
              <div className="text-sm text-muted-foreground animate-pulse">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="text-sm text-muted-foreground">No templates available. Create one in Settings.</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Select Template</label>
                  <select 
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full border border-border rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-card text-foreground"
                  >
                    {templates.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-zinc-200 dark:bg-zinc-900 p-8 overflow-y-auto custom-scrollbar flex justify-center">
            {previewHtml ? (
              <div 
                ref={contentRef}
                className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-10 shadow-lg"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <div className="text-muted-foreground self-center">Select a template to view preview</div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-border bg-muted/30 shrink-0 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleDownload} disabled={!previewHtml || generating} className="gap-2">
            {generating ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
            ) : (
              <Download size={16} />
            )}
            Download PDF
          </Button>
        </div>
        
      </div>
    </div>
  );
}
