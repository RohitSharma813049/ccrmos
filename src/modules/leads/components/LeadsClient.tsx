"use client";

import { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DynamicFormBuilder from "@/components/ui/DynamicFormBuilder";
import Link from "next/link";
import LeadForm from "./LeadForm";
import ScheduleFollowUpModal from "@/components/telephony/ScheduleFollowUpModal";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import NotesPanel from "@/components/ui/NotesPanel";
import KanbanBoard, { KanbanCard } from "@/components/ui/KanbanBoard";
import { Device, Call } from "@twilio/voice-sdk";

export default function LeadsClient({ initialShowRecycleBin = false }: { initialShowRecycleBin?: boolean }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [leadStages, setLeadStages] = useState<any[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);
  const [conversionRules, setConversionRules] = useState<any[]>([]);
  
  // New Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showRecycleBin, setShowRecycleBin] = useState(initialShowRecycleBin);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<any | null>(null);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<any | null>(null);

  // Custom Modal States
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState("");
  const [scheduleFollowUpModalOpen, setScheduleFollowUpModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState<string | null>(null);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { hasPermission, session } = usePermissions();

  const [advancedFilters, setAdvancedFilters] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedProjectForImport, setSelectedProjectForImport] = useState<string>("");

  // Configure fields that can be dynamically filtered
  const filterFields = [
    { name: "firstName", label: "First Name", type: "string" as const },
    { name: "lastName", label: "Last Name", type: "string" as const },
    { name: "email", label: "Email", type: "string" as const },
    { name: "phone", label: "Phone", type: "string" as const },
    { name: "source", label: "Lead Source", type: "string" as const },
    { name: "status", label: "Status", type: "string" as const },
    { name: "value", label: "Estimated Value", type: "number" as const },
    { name: "customData.campaign", label: "Campaign (Custom)", type: "string" as const },
    { name: "customData.budget", label: "Budget (Custom)", type: "number" as const },
    { name: "customData.formName", label: "Form Name", type: "string" as const },
    { name: "customData.projectId", label: "Project ID", type: "string" as const },
  ];

  useEffect(() => {
    fetchLeadStages();
    fetchLeadStatuses();
    fetchProjects();
    fetchLeads();
    fetchDynamicFields();
    fetchConversionRules();
  }, [page, search, statusFilter, dateFrom, dateTo, viewMode]);

  async function fetchConversionRules() {
    try {
      const res = await fetch("/api/settings/conversion-rules?sourceModule=Leads");
      if (res.ok) {
        const data = await res.json();
        setConversionRules(data.rules || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchDynamicFields() {
    try {
      const res = await fetch(`/api/dynamic-fields?target=lead&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setDynamicFields(data.fields || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects?limit=100");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchLeadStages() {
    try {
      const res = await fetch("/api/settings/lead-stages");
      if (res.ok) {
        const data = await res.json();
        setLeadStages(data || []);
      }
    } catch (e) {
      console.error("Failed to fetch lead stages", e);
    }
  }

  async function fetchLeadStatuses() {
    try {
      const res = await fetch("/api/lead-status");
      if (res.ok) {
        const data = await res.json();
        setLeadStatuses(data.statuses || []);
      }
    } catch (e) {
      console.error("Failed to fetch lead statuses", e);
    }
  }

  async function fetchLeads() {
    try {
      setLoading(true);
      const filterStr = encodeURIComponent(JSON.stringify(advancedFilters));
      const limit = viewMode === "board" ? 200 : 10;
      const appliedStage = showRecycleBin ? "Archived" : statusFilter;
      const res = await fetch(`/api/leads?page=${page}&limit=${limit}&search=${search}&stageId=${appliedStage}&dateFrom=${dateFrom}&dateTo=${dateTo}&filters=${filterStr}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        if (data.totalPages) setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (formData: any) => {
    try {
      const url = selectedLeadForEdit ? `/api/leads/${selectedLeadForEdit._id}` : "/api/leads";
      const method = selectedLeadForEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setSelectedLeadForEdit(null);
        fetchLeads();
        toast.success(selectedLeadForEdit ? "Lead updated successfully" : "Lead created successfully");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save lead");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while saving the lead.");
    }
  };

  const updateLeadStatusAndStage = async (leadId: string, newStageId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: leadId, stageId: newStageId, status: newStatus })
      });
      if (res.ok) {
        fetchLeads();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update lead");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleFollowUp = async (date: string, remark: string) => {
    if (!selectedLeadForDetails) return;
    try {
      const res = await fetch("/api/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          _id: selectedLeadForDetails._id, 
          nextFollowUpDate: new Date(date).toISOString(),
          lastRemark: remark 
        })
      });
      if (res.ok) {
        toast.success("Follow-up scheduled!");
        fetchLeads();
      } else {
        toast.error("Failed to schedule follow-up");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    }
  };

  const isStageDisabled = (currentStatus: string, targetStage: any) => {
    const currentIndex = leadStages.findIndex((s: any) => s.name === currentStatus);
    if (currentIndex === -1) return false;
    // Allow moving to next stages, or backwards. For now, allow all.
    return false;
  };

  const getStageColorClass = (stageId: any, allStages: any[]) => {
    if (!stageId) return 'bg-gray-500/10 text-zinc-400 border-gray-500/20';
    const id = typeof stageId === 'object' ? stageId._id : stageId;
    const stage = allStages.find(s => s._id === id);
    if (!stage || !stage.color) return 'bg-primary/10 text-primary border-primary/20';
    return { backgroundColor: `${stage.color}1A`, color: stage.color, borderColor: `${stage.color}33` };
  };

  const handleExport = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one lead to export.");
      return;
    }
    const selectedLeads = leads.filter(l => selectedIds.includes(l._id));
    if (!selectedLeads.length) return;
    
    // Simple CSV generation
    const headers = ["First Name", "Last Name", "Email", "Phone", "Status", "Date Added"];
    const rows = selectedLeads.map(l => [
      l.firstName || "",
      l.lastName || "",
      l.email || "",
      l.phone || "",
      l.status || "",
      new Date(l.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkDelete = () => setBulkDeleteModalOpen(true);
  
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState("");

  const handleSummarize = async () => {
    if (!selectedLeadForDetails) return;
    setIsSummarizing(true);
    try {
      const res = await fetch(`/api/leads/${selectedLeadForDetails._id}/summarize`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setSummary(data.summary);
      else toast.error("Summarization failed");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const executeBulkDelete = async () => {
    try {
      const res = await fetch("/api/leads/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setSelectedIds([]);
        setBulkDeleteModalOpen(false);
        fetchLeads();
        toast.success("Leads deleted successfully");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to bulk delete leads");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkStatusChange = () => setBulkStatusModalOpen(true);

  const executeBulkStatusChange = async () => {
    if (!bulkStatusValue) {
      toast.error("Please select a status");
      return;
    }
    
    try {
      const res = await fetch("/api/leads/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, data: { status: bulkStatusValue } })
      });
      if (res.ok) {
        setSelectedIds([]);
        setBulkStatusModalOpen(false);
        fetchLeads();
        toast.success("Status updated successfully");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to bulk update leads");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [newNote, setNewNote] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [communicationChannel, setCommunicationChannel] = useState<"Note"|"Email"|"WhatsApp"|"SMS"|"Call"|"Inbox">("Note");
  const [emailSubject, setEmailSubject] = useState("");
  
  // Inbox State
  const [leadEmails, setLeadEmails] = useState<any[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  // Dialer State
  const [twilioDevice, setTwilioDevice] = useState<Device | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState("Idle");

  // Initialize Twilio Device when switching to Call tab
  useEffect(() => {
    if (communicationChannel === "Call" && !twilioDevice) {
      setCallStatus("Initializing Dialer...");
      fetch("/api/twilio/token")
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            const device = new Device(data.token, {
              codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU]
            });
            device.on('ready', () => setCallStatus("Ready to Call"));
            device.on('error', (err) => {
              console.error(err);
              setCallStatus(`Error: ${err?.message || "Unknown error"}`);
            });
            device.register();
            setTwilioDevice(device);
          } else {
            setCallStatus("Failed to get Twilio token.");
          }
        })
        .catch(() => setCallStatus("Error connecting to dialer."));
    }
  }, [communicationChannel, twilioDevice]);

  // Fetch emails when switching to Inbox tab
  useEffect(() => {
    if (communicationChannel === "Inbox" && selectedLeadForDetails) {
      setLoadingEmails(true);
      fetch(`/api/leads/${selectedLeadForDetails._id}/emails`)
        .then(res => res.json())
        .then(data => {
          if (data.emails) {
            setLeadEmails(data.emails);
          } else {
            toast.error(data.error || "Failed to load emails");
          }
        })
        .catch(err => {
          console.error(err);
          toast.error("Failed to load emails");
        })
        .finally(() => setLoadingEmails(false));
    }
  }, [communicationChannel, selectedLeadForDetails]);

  const handleDial = async () => {
    if (!twilioDevice || !selectedLeadForDetails) return;
    const phone = selectedLeadForDetails.phone || selectedLeadForDetails.customData?.phoneNumber || selectedLeadForDetails.customData?.phone;
    if (!phone) {
      toast.error("Lead has no phone number");
      return;
    }
    try {
      const call = await twilioDevice.connect({
        params: {
          To: phone
        }
      });
      setActiveCall(call);
      setCallStatus("Dialing...");
      
      call.on('accept', () => setCallStatus("In Call"));
      call.on('disconnect', () => {
        setCallStatus("Ready to Call");
        setActiveCall(null);
        // Log the call automatically
        handleAddNote(selectedLeadForDetails._id, "Call", `Outbound call to ${phone} completed.`);
      });
      call.on('error', (err) => {
        setCallStatus(`Call Error: ${err.message}`);
        setActiveCall(null);
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to make call");
    }
  };

  const handleHangup = () => {
    if (activeCall) {
      activeCall.disconnect();
    }
  };

  // Generic note addition helper
  const handleAddNote = async (leadId: string, overrideChannel?: string, overrideMessage?: string) => {
    const channelToUse = overrideChannel || communicationChannel;
    const msgToUse = overrideMessage || newNote;
    if (!msgToUse.trim() && !attachmentFile) return;
    setSubmittingNote(true);
    try {
      let attachmentUrl = "";
      if (attachmentFile) {
        const formData = new FormData();
        formData.append("file", attachmentFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachmentUrl = uploadData.url;
        } else {
          toast.error("Failed to upload attachment");
          setSubmittingNote(false);
          return;
        }
      }

      const payload = {
        message: newNote,
        attachmentUrl,
        channel: communicationChannel,
        subject: emailSubject
      };

      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const updatedLead = { ...selectedLeadForDetails, activities: data.activities, customData: data.customData };
        setSelectedLeadForDetails(updatedLead);
        setLeads(leads.map(l => l._id === leadId ? updatedLead : l));
        
        // Only clear message if it's the manual note channel
        if (!overrideMessage) {
          setNewNote("");
          setAttachmentFile(null);
          setEmailSubject("");
        }
        
        if (channelToUse !== "Note" && !overrideMessage) {
          toast.success(`${channelToUse} Sent!`);
        } else if (!overrideMessage) {
          toast.success("Note Added");
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add note");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setSubmittingNote(false);
    }
  };

  const executeConvert = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, {
        method: "POST"
      });
      if (res.ok) {
        setConvertModalOpen(null);
        fetchLeads();
        toast.success("Lead converted to Customer successfully!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to convert lead");
      }
    } catch (e) {
      toast.error("An error occurred during conversion");
    }
  };

  const executeDynamicConvert = async (leadId: string, ruleId: string, buttonLabel: string) => {
    try {
      const toastId = toast.loading(`Executing ${buttonLabel}...`);
      const res = await fetch("/api/settings/conversion-rules/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId, sourceRecordId: leadId })
      });
      if (res.ok) {
        setActiveDropdown(null);
        fetchLeads();
        toast.success(`${buttonLabel} successful!`, { id: toastId });
      } else {
        const err = await res.json();
        toast.error(err.error || `Failed to ${buttonLabel}`, { id: toastId });
      }
    } catch (e) {
      toast.error("An error occurred during conversion");
    }
  };

  const handleImportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      if (rows.length < 2) throw new Error("CSV file must have a header row and data.");
      
      const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const importedLeads = rows.slice(1).map(row => {
        const cols = row.split(',').map(c => c.trim().replace(/"/g, ''));
        const lead: any = { customData: {} };
        headers.forEach((h, i) => {
          const val = cols[i];
          if (!val) return;
          const hLower = h.toLowerCase();
          if (hLower.includes('first')) lead.firstName = val;
          else if (hLower.includes('last')) lead.lastName = val;
          else if (hLower.includes('email')) lead.email = val;
          else if (hLower.includes('phone')) lead.phone = val;
          else if (hLower.includes('status')) lead.status = val;
          else lead.customData[h] = val; 
        });
        if (!lead.firstName) lead.firstName = "Imported";
        if (!lead.lastName) lead.lastName = "Lead";
        if (selectedProjectForImport) {
          lead.customData.projectId = selectedProjectForImport;
        }
        return lead;
      });

      const res = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: importedLeads })
      });

      if (res.ok) {
        setIsImportModalOpen(false);
        fetchLeads();
        toast.success(`Successfully imported ${importedLeads.length} leads.`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to import leads");
      }
    } catch (err: any) {
      toast.error("Import error: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: (
        <input 
          type="checkbox" 
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(leads.map(l => l._id));
            } else {
              setSelectedIds([]);
            }
          }}
          checked={selectedIds.length > 0 && selectedIds.length === leads.length}
          className="rounded border-border text-primary focus:ring-primary/20"
        />
      ),
      cell: (item) => (
        <input 
          type="checkbox"
          checked={selectedIds.includes(item._id)}
          onChange={(e) => {
            if (e.target.checked) setSelectedIds(prev => [...prev, item._id]);
            else setSelectedIds(prev => prev.filter(id => id !== item._id));
          }}
          className="rounded border-border text-primary focus:ring-primary/20"
        />
      )
    },
    { header: "Lead Info", cell: (item) => (
      <div>
        <div className="font-medium text-primary hover:underline cursor-pointer" onClick={() => setSelectedLeadForDetails(item)}>
          {item.firstName} {item.lastName}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Score: <span className="font-semibold text-foreground">{item.leadScore || 5}/10</span>
        </div>
      </div>
    )},
    { header: "Contact Details", cell: (item) => (
      <div className="flex flex-col gap-1 text-sm text-foreground">
        <span>{item.email}</span>
        {item.phone && <span className="text-muted-foreground">{item.phone}</span>}
        <div className="flex gap-2 mt-1">
          {item.phone && (
            <>
              <a href={`tel:${item.phone}`} title="Call" className="text-muted-foreground hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </a>
              <a href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </a>
            </>
          )}
          {item.email && (
            <a 
              href={`mailto:${item.email}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(item.email);
                toast.success("Email copied to clipboard!");
              }} 
              title="Email (Copied on click)" 
              className="text-muted-foreground hover:text-rose-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </a>
          )}
        </div>
      </div>
    )},
    { header: "Date Added", cell: (item) => <span className="text-muted-foreground text-xs">{new Date(item.createdAt).toLocaleDateString()}</span> },
    { header: "Stage & Status", className: "min-w-[200px]", cell: (item) => {
      const stageObj = item.stageId || {};
      const currentStageId = stageObj._id || item.stageId;
      const stageStyle = getStageColorClass(currentStageId, leadStages);
      
      const availableStatuses = leadStatuses.filter(s => {
        const sStageId = typeof s.stageId === 'object' ? s.stageId._id : s.stageId;
        return sStageId === currentStageId && s.active;
      });

      return (
        <div className="flex flex-col gap-2">
          {leadStages.length > 0 ? (
            <select
              value={currentStageId || ""}
              onChange={(e) => updateLeadStatusAndStage(item._id, e.target.value, "")}
              style={typeof stageStyle === 'object' ? stageStyle : undefined}
              className={`w-full text-xs font-semibold rounded-lg shadow-sm py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary focus:border-primary border cursor-pointer ${typeof stageStyle === 'string' ? stageStyle : ''}`}
            >
              <option value="" disabled>Select Stage</option>
              {leadStages.sort((a,b) => a.order - b.order).map(stage => (
                <option key={stage._id} value={stage._id}>
                  {stage.name}
                </option>
              ))}
            </select>
          ) : (
            <span style={typeof stageStyle === 'object' ? stageStyle : undefined} className={`px-2.5 py-1 rounded-md text-xs font-semibold border inline-block text-center ${typeof stageStyle === 'string' ? stageStyle : ''}`}>
              {stageObj.name || "No Stage"}
            </span>
          )}

          {currentStageId && availableStatuses.length > 0 && (() => {
            const selectedStatusObj = availableStatuses.find((s: any) => s.name === item.status);
            const statusClass = selectedStatusObj?.iconColor ? `${selectedStatusObj.iconColor} text-white` : "bg-background text-foreground";
            
            return (
              <select
                value={item.status || ""}
                onChange={(e) => updateLeadStatusAndStage(item._id, currentStageId, e.target.value)}
                className={`w-full text-xs font-medium rounded-lg shadow-sm py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary focus:border-primary border cursor-pointer ${statusClass}`}
              >
                <option value="" disabled className="bg-background text-foreground">Select Status</option>
                {availableStatuses.map((status: any) => (
                  <option key={status._id} value={status.name} className="bg-background text-foreground">{status.name}</option>
                ))}
              </select>
            );
          })()}
        </div>
      );
    }},
    { header: "Incoming / Custom Data", cell: (item) => (
      <div className="text-xs text-muted-foreground max-w-sm">
        {item.customData?.lastMessage && (
          <div className="mb-2 p-2.5 bg-accent/10 border border-accent/20 text-accent-foreground rounded-lg whitespace-pre-wrap break-words shadow-sm">
            <strong className="flex items-center gap-1.5 text-accent-foreground mb-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Latest Message
            </strong>
            <span className="text-[13px]">{item.customData.lastMessage}</span>
          </div>
        )}
        {item.customData && Object.keys(item.customData).filter(k => k !== 'lastMessage' && k !== 'whatsappOptIn' && !k.startsWith('_')).length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(item.customData)
              .filter(([k]) => k !== 'lastMessage' && k !== 'whatsappOptIn' && !k.startsWith('_'))
              .map(([k, v]) => {
                const df = dynamicFields.find(f => f.name === k);
                if (df && df.type === "Dropdown (Select)") {
                  const color = df.optionColors?.[String(v)] || "#6b7280";
                  return (
                    <span key={k} className="border px-2 py-1 rounded-md text-foreground shadow-sm" style={{ backgroundColor: `${color}1A`, borderColor: `${color}33` }}>
                      <strong className="capitalize" style={{ color: color }}>{k.replace(/([A-Z])/g, ' $1').trim()}:</strong> <span style={{ color: color }}>{String(v)}</span>
                    </span>
                  );
                }
                return (
                  <span key={k} className="bg-muted border border-border px-2 py-1 rounded-md text-foreground">
                    <strong className="text-foreground capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</strong> {String(v)}
                  </span>
                );
              })}
          </div>
        ) : (
          !item.customData?.lastMessage && <span className="text-muted-foreground/50">No additional data</span>
        )}
      </div>
    )},
    { header: "Actions", cell: (item) => (
      <div className="relative" ref={dropdownRef}>
        <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === item._id ? null : item._id); }} className="p-2 hover:bg-muted rounded-full">
          <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
        </button>
        {activeDropdown === item._id && (
          <div className="absolute right-8 top-0 w-48 bg-card border border-border rounded-xl shadow-lg z-50 py-1 animate-in fade-in zoom-in-95">
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); setSelectedLeadForDetails(item); }}
              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Quick View
            </button>
            {item.status !== "Converted" && conversionRules.map(rule => (
              <button 
                key={rule._id}
                onClick={(e) => { e.stopPropagation(); executeDynamicConvert(item._id, rule._id, rule.buttonLabel); }}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {rule.buttonLabel}
              </button>
            ))}
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); setSelectedLeadForEdit(item); setIsModalOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit Lead
            </button>
          </div>
        )}
      </div>
    )}
  ];

  const filterControls = (
    <>
      {!initialShowRecycleBin && (
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="py-2 pl-3 pr-8 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-foreground bg-card"
        >
          <option value="">All Stages</option>
          {leadStages.sort((a,b) => a.order - b.order).map(stage => (
            <option key={stage._id} value={stage._id}>{stage.name}</option>
          ))}
        </select>
      )}
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary">
        <label>From:</label>
        <input 
          type="datetime-local" 
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="bg-transparent border-none p-0 focus:ring-0 text-sm outline-none cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary">
        <label>To:</label>
        <input 
          type="datetime-local" 
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="bg-transparent border-none p-0 focus:ring-0 text-sm outline-none cursor-pointer"
        />
      </div>

      {(statusFilter || dateFrom || dateTo) && (
        <button 
          onClick={() => {
            setStatusFilter("");
            setDateFrom("");
            setDateTo("");
            setPage(1);
          }}
          className="text-sm text-destructive hover:text-destructive/80 font-medium px-2 py-1 rounded hover:bg-destructive/10 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </>
  );

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader 
        title="Sales Leads"
        description="Manage your pipeline and dynamic lead data."
      >
          <div className="flex bg-muted p-1 rounded-xl">
            <button
              onClick={() => { setViewMode("list"); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              List View
            </button>
            <button
              onClick={() => { setViewMode("board"); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'board' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Board View
            </button>
          </div>

          {hasPermission("Leads", "Create") && (
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-card border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-all shadow-sm text-sm"
            >
              Import CSV
            </button>
          )}

          {hasPermission("Leads", "Create") && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
          )}
      </PageHeader>

      {viewMode === "list" ? (
        <DataTable 
          data={leads}
          columns={columns}
          loading={loading}
          search={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          filters={filterControls}
          filterFields={filterFields}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={setAdvancedFilters}
          onApplyAdvancedFilters={fetchLeads}
          selectable={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          bulkActions={[
            { label: "Update Status", onClick: handleBulkStatusChange },
            { label: "Delete Selected", onClick: handleBulkDelete, variant: "destructive" }
          ]}
          actions={
            selectedIds.length > 0 && (
              <button 
                onClick={handleExport}
                className="text-sm font-medium px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted text-foreground shadow-sm"
              >
                Export Selected ({selectedIds.length})
              </button>
            )
          }
          emptyTitle="No leads found"
          emptyDescription={search || statusFilter || dateFrom || dateTo || advancedFilters.length > 0 ? "No leads matched your search or filters." : "You haven't added any leads yet."}
          emptyAction={
            !search && !statusFilter && !dateFrom && !dateTo && advancedFilters.length === 0 ? 
              <Button size="sm" onClick={() => setIsModalOpen(true)}>Add Lead</Button> 
              : null
          }
        />
      ) : (
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-4">
            {filterControls}
          </div>
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading board...</div>
          ) : (
            <KanbanBoard 
              columns={leadStages.sort((a,b) => a.order - b.order).map(s => s.name)}
              cards={leads.map(l => {
                const phone = l.phone || l.customData?.phoneNumber || l.phoneNumber;
                const displayName = l.firstName === "WhatsApp Lead" || l.firstName === "Imported" 
                  ? phone || l.firstName 
                  : `${l.firstName} ${l.lastName !== "WhatsApp" && l.lastName !== "Lead" ? l.lastName : ""}`.trim();
                
                const stageObj = l.stageId || {};
                const stageName = stageObj.name || "No Stage";

                return {
                  id: l._id,
                  title: displayName,
                  subtitle: l.email && !l.email.includes('@whatsapp') ? l.email : phone,
                  status: stageName,
                };
              })}
              onCardMoved={(id, newStageName) => {
                const targetStage = leadStages.find(s => s.name === newStageName);
                if (targetStage) {
                  updateLeadStatusAndStage(id, targetStage._id, "");
                }
              }}
              onCardClick={(id) => {
                const lead = leads.find(l => l._id === id);
                if (lead) setSelectedLeadForDetails(lead);
              }}
            />
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); setSelectedLeadForEdit(null); }} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold text-foreground">{selectedLeadForEdit ? "Edit Lead" : "Create New Lead"}</h2>
              <button onClick={() => { setIsModalOpen(false); setSelectedLeadForEdit(null); }} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <LeadForm 
                initialData={selectedLeadForEdit}
                onSubmit={handleSave} 
                onCancel={() => { setIsModalOpen(false); setSelectedLeadForEdit(null); }} 
              />
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold text-foreground">Import Leads from CSV</h2>
              <button onClick={() => setIsImportModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div className="p-4 bg-primary/10 text-primary text-sm rounded-lg border border-primary/20">
                  <p>Upload a CSV file with your leads.</p>
                  <p className="mt-1 font-medium">Standard columns:</p>
                  <p className="text-xs">First Name, Last Name, Email, Phone, Status</p>
                  <p className="mt-1 text-xs font-semibold">Any other columns will be stored automatically in custom data!</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Assign to Project (Optional)</label>
                  <select
                    value={selectedProjectForImport}
                    onChange={(e) => setSelectedProjectForImport(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-card"
                  >
                    <option value="">None (Standalone)</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Select CSV File</label>
                  <input 
                    type="file" 
                    name="file" 
                    accept=".csv"
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 bg-card"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={importing} className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                    {importing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Importing...
                      </>
                    ) : "Upload & Import"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedLeadForDetails && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => { setSelectedLeadForDetails(null); setAiSummary(null); }} />
          <div className="relative w-full max-w-md bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedLeadForDetails.firstName || selectedLeadForDetails.lastName 
                    ? `${selectedLeadForDetails.firstName || ''} ${selectedLeadForDetails.lastName || ''}`.trim() 
                    : (selectedLeadForDetails.email?.split('@')[0] || selectedLeadForDetails.phone || 'Unknown Lead')}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedLeadForDetails.email}</p>
              </div>
              <button onClick={() => setSelectedLeadForDetails(null)} className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-card custom-scrollbar">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Activity Timeline
              </h3>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    AI Agent Insights
                  </h4>
                  {!aiSummary && (
                    <button 
                      onClick={async () => {
                        setAiLoading(true);
                        try {
                          const res = await fetch("/api/ai/summarize-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: selectedLeadForDetails._id }) });
                          const data = await res.json();
                          if (res.ok) setAiSummary(data.summary);
                          else toast.error("Failed to generate summary");
                        } catch (e) { toast.error("Error generating summary"); } 
                        finally { setAiLoading(false); }
                      }}
                      disabled={aiLoading}
                      className="text-xs px-3 py-1.5 bg-purple-500/10 text-purple-500 font-semibold rounded-md hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                    >
                      {aiLoading ? "Analyzing..." : "Generate AI Summary"}
                    </button>
                  )}
                </div>
                {aiSummary && (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <p className="text-sm text-purple-900 dark:text-purple-100 leading-relaxed">{aiSummary}</p>
                  </div>
                )}
              </div>
              
              <div className="relative border-l-2 border-border ml-3 space-y-8 pb-8">
                {(!selectedLeadForDetails.activities || selectedLeadForDetails.activities.length === 0) ? (
                  <div className="ml-6 text-sm text-muted-foreground italic">No activities recorded yet.</div>
                ) : (
                  [...selectedLeadForDetails.activities].reverse().map((activity: any, index: number) => (
                    <div key={index} className="relative ml-6">
                      <span className="absolute -left-[35px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-card bg-primary"></span>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-foreground">{activity.type}</span>
                        {activity.description && <span className="text-sm text-muted-foreground">{activity.description}</span>}
                        {activity.attachmentUrl && (
                          <div className="mt-1">
                            <a href={activity.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                              View Attachment
                            </a>
                            {/* If it's an image, optionally render a small preview: */}
                            {activity.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) && (
                              <img src={activity.attachmentUrl} alt="Attachment preview" className="mt-2 max-h-32 rounded border border-border object-cover" />
                            )}
                          </div>
                        )}
                        <span className="text-xs font-medium text-muted-foreground/70 mt-1 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Quick Notes Input */}
            <div className="p-4 bg-muted/20 border-t border-border flex flex-col gap-3 shrink-0">
              <div className="flex items-center gap-2 mb-1 border-b border-border pb-2 overflow-x-auto">
                {(["Note", "Email", "WhatsApp", "SMS", "Call", "Inbox"] as const).map(channel => (
                  <button
                    key={channel}
                    onClick={() => setCommunicationChannel(channel)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                      communicationChannel === channel
                        ? channel === "WhatsApp" ? "bg-green-100 text-green-700 border border-green-200" 
                        : channel === "Email" ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : channel === "SMS" ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : channel === "Call" ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : channel === "Inbox" ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-primary text-primary-foreground border border-primary"
                        : "bg-transparent text-muted-foreground hover:bg-muted whitespace-nowrap"
                    }`}
                  >
                    {channel === "Note" && "Internal Note"}
                    {channel === "Email" && "Send Email"}
                    {channel === "WhatsApp" && "Send WhatsApp"}
                    {channel === "SMS" && "Send SMS"}
                    {channel === "Call" && "Dialer"}
                    {channel === "Inbox" && "Inbox"}
                  </button>
                ))}
              </div>

              {communicationChannel === "Email" && (
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email Subject..."
                  className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              )}

              {communicationChannel === "Call" && (
                <div className="flex flex-col items-center justify-center py-4 bg-zinc-950 rounded-xl border border-zinc-800">
                  <div className="text-zinc-400 text-xs mb-2">Status: <span className="font-medium text-zinc-100">{callStatus}</span></div>
                  {activeCall ? (
                    <button onClick={handleHangup} className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 shadow-lg shadow-red-900/50 transition-transform active:scale-95">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" /></svg>
                    </button>
                  ) : (
                    <button onClick={handleDial} disabled={callStatus !== "Ready to Call"} className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/50 transition-transform active:scale-95 disabled:opacity-50">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </button>
                  )}
                </div>
              )}

              {communicationChannel === "Inbox" && (
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                  {loadingEmails ? (
                    <div className="flex justify-center p-4">
                      <span className="text-muted-foreground text-sm">Loading emails...</span>
                    </div>
                  ) : leadEmails.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground text-sm bg-card border border-border rounded-lg">
                      No emails found.
                    </div>
                  ) : (
                    leadEmails.map((email: any) => (
                      <div key={email.id} className="bg-card border border-border rounded-lg p-3 shadow-sm text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-foreground truncate max-w-[70%]">{email.subject}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(email.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2 truncate">
                          From: {email.from}
                        </div>
                        <p className="text-foreground/80 line-clamp-3 leading-relaxed">{email.snippet}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {communicationChannel !== "Call" && communicationChannel !== "Inbox" && (
                <div className="flex gap-2">
                  <textarea 
                    value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={
                    communicationChannel === "Note" ? "Type an internal note..." :
                    communicationChannel === "Email" ? "Type your email message..." :
                    communicationChannel === "SMS" ? "Type your SMS message..." :
                    "Type your WhatsApp message..."
                  }
                  className="flex-1 px-3 py-2 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none min-h-[60px]"
                />
                <button 
                  onClick={() => handleAddNote(selectedLeadForDetails._id)}
                  disabled={submittingNote || (!newNote.trim() && !attachmentFile)}
                  className={`px-4 font-medium rounded-lg disabled:opacity-50 transition-colors flex flex-col items-center justify-center gap-1 ${
                    communicationChannel === "WhatsApp" ? "bg-[#25D366] hover:bg-[#128C7E] text-white" :
                    communicationChannel === "Email" ? "bg-blue-600 hover:bg-blue-700 text-white" :
                    communicationChannel === "SMS" ? "bg-purple-600 hover:bg-purple-700 text-white" :
                    "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {submittingNote ? '...' : 'Send'}
                </button>
              </div>
              )}
              {communicationChannel !== "Call" && communicationChannel !== "Inbox" && (
                <div className="flex items-center gap-2 mt-1">
                  <label className="cursor-pointer text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    Attach File
                    <input type="file" className="hidden" onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)} />
                  </label>
                  {attachmentFile && <span className="text-xs text-primary truncate max-w-[200px]">{attachmentFile.name}</span>}
                </div>
              )}
              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => setScheduleFollowUpModalOpen(true)}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Schedule Follow-up
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/30 shrink-0">
              <button 
                onClick={() => setSelectedLeadForDetails(null)} 
                className="w-full px-4 py-2 bg-card border border-border hover:bg-muted text-foreground font-medium rounded-xl shadow-sm transition-colors text-sm"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {convertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-2xl shadow-xl max-w-sm w-full border border-border animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-foreground">Convert to Customer</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">Are you sure you want to convert this lead into a customer? This will change their status to Converted and add them to the Customers directory.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConvertModalOpen(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">Cancel</button>
              <button onClick={() => executeConvert(convertModalOpen)} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">Convert Lead</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Modal */}
      {bulkStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-2xl shadow-xl max-w-sm w-full border border-border animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-foreground">Update Status ({selectedIds.length} leads)</h3>
            <div className="mt-4 mb-6">
              <select
                value={bulkStatusValue}
                onChange={(e) => setBulkStatusValue(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card focus:ring-2 focus:ring-primary"
              >
                <option value="">Select new status</option>
                {leadStages.sort((a: any, b: any) => a.order - b.order).map((stage: any) => (
                  <option key={stage.name} value={stage.name}>{stage.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setBulkStatusModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">Cancel</button>
              <button onClick={executeBulkStatusChange} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">Update Status</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-2xl shadow-xl max-w-sm w-full border border-border animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-foreground">Delete {selectedIds.length} Leads?</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">Are you sure you want to delete the selected leads? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setBulkDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">Cancel</button>
              <button onClick={executeBulkDelete} className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Follow up Modal */}
      {scheduleFollowUpModalOpen && (
        <ScheduleFollowUpModal 
          onClose={() => setScheduleFollowUpModalOpen(false)}
          onSave={handleScheduleFollowUp}
        />
      )}
    </div>
  );
}