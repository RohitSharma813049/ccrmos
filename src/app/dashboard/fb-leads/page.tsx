'use client'

import React, { useState, useEffect } from 'react'
import { 
  Megaphone, 
  Users, 
  CheckCircle2, 
  Zap,
  Plus,
  RefreshCw,
  RefreshCcw,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Settings,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  customData?: any;
}

interface CampaignWithLeads {
  _id: string;
  name: string; // Form ID
  processed: number;
  lastSynced?: string;
  leads: Lead[];
}

export default function FbLeadsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithLeads[]>([])
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [accessToken, setAccessToken] = useState("")
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/leads/meta')
      const data = await res.json()
      if (data.campaigns) {
        setCampaigns(data.campaigns)
        if (data.campaigns.length > 0 && !expandedCampaign) {
          setExpandedCampaign(data.campaigns[0].name)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load Meta leads')
    } finally {
      setLoading(false)
    }
  }

  const toggleCampaign = (name: string) => {
    if (expandedCampaign === name) {
      setExpandedCampaign(null)
    } else {
      setExpandedCampaign(name)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/leads/meta/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Successfully synced ${data.imported || 0} new leads from Meta!`);
        fetchData();
      } else {
        const err = await res.json();
        if (err.error === "Meta API Access Token not configured.") {
          toast.error("Please configure your Meta API Access Token first.");
          setIsConfigOpen(true);
        } else {
          toast.error(err.error || 'Sync failed');
        }
      }
    } catch (error) {
      toast.error('An error occurred during sync');
    } finally {
      setIsSyncing(false);
    }
  }

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/settings/fb-leads');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setAccessToken(data.config.accessToken || "");
        }
      }
    } catch (e) {}
  }

  const saveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/settings/fb-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      if (res.ok) {
        toast.success('Configuration saved');
        setIsConfigOpen(false);
      } else {
        toast.error('Failed to save configuration');
      }
    } catch (e) {
      toast.error('Error saving config');
    } finally {
      setIsSavingConfig(false);
    }
  }

  useEffect(() => {
    if (isConfigOpen) loadConfig();
  }, [isConfigOpen]);

  const totalLeads = campaigns.reduce((acc, c) => acc + c.leads.length, 0)
  const totalProcessed = campaigns.reduce((acc, c) => acc + c.processed, 0)
  const pendingLeads = totalLeads - totalProcessed

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* Left Sidebar - Summary */}
      <div className="w-full md:w-64 shrink-0 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center text-primary shadow-sm shadow-primary/10">
            <Megaphone className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-lg text-foreground tracking-tight">Meta Ads</h2>
        </div>

        <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-5 border border-border shadow-sm hover:border-primary/50 transition-colors">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Leads</p>
          <h3 className="text-3xl font-semibold tracking-tight text-foreground">{totalLeads}</h3>
        </div>

        <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-5 border border-border shadow-sm hover:border-green-500/50 transition-colors">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Processed</p>
          <h3 className="text-3xl font-semibold tracking-tight text-green-500">{totalProcessed}</h3>
        </div>

        <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-5 border border-border shadow-sm hover:border-amber-500/50 transition-colors">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Pending Sync</p>
          <h3 className="text-3xl font-semibold tracking-tight text-amber-500">{pendingLeads > 0 ? pendingLeads : 0}</h3>
        </div>

        <div className="bg-muted/30 rounded-xl p-4 border border-border flex gap-3 shadow-sm">
          <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Auto-sync checks Meta every 20 minutes for new leads mapped to your campaigns.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        
        {/* Header & Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card/40 backdrop-blur-xl border border-border p-4 rounded-2xl">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Campaign Database</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage leads captured directly from Meta forms</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-card hover:bg-muted border border-border text-foreground rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <Settings className="w-4 h-4" />
              API Config
            </button>
            <Link href="/dashboard/campaign-settings" className="flex items-center justify-center gap-2 px-4 py-2 bg-card hover:bg-muted border border-border text-foreground rounded-xl text-sm font-medium transition-all shadow-sm">
              <Plus className="w-4 h-4" />
              Manage Maps
            </Link>
            <button 
              disabled={isSyncing}
              onClick={handleSync}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-all shadow-sm shadow-primary/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Meta
            </button>
          </div>
        </div>

        {/* Campaign List */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-card/50 backdrop-blur-xl rounded-2xl border border-border shadow-sm p-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No Campaigns Configured</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">You have not mapped any Facebook Form IDs yet. Set up a campaign mapping to begin importing leads.</p>
            <Link href="/dashboard/campaign-settings" className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-semibold transition-colors">
              Go to Settings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="bg-card/40 backdrop-blur-xl rounded-2xl shadow-sm border border-border overflow-hidden transition-all duration-200">
                <div 
                  onClick={() => toggleCampaign(campaign.name)}
                  className="bg-card/60 hover:bg-muted/50 cursor-pointer text-foreground p-5 flex items-center gap-4 transition-colors border-b border-border"
                >
                  <div className="p-1 bg-muted rounded-md text-muted-foreground">
                    {expandedCampaign === campaign.name ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{campaign.name}</h3>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground mt-1.5">
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> {campaign.leads.length} Leads</span>
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {campaign.processed} Processed</span>
                      {campaign.leads.length - campaign.processed > 0 && (
                        <span className="flex items-center gap-1.5 text-amber-500">
                          <AlertTriangle className="w-3.5 h-3.5" /> {campaign.leads.length - campaign.processed} Pending
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-muted rounded-md border border-border/50">Form ID: {campaign.name}</span>
                    </div>
                  </div>
                </div>
                
                {expandedCampaign === campaign.name && (
                  <div className="p-5 space-y-3 bg-background/30">
                    {campaign.leads.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm bg-card/20 rounded-xl border border-border/50 border-dashed">
                        No leads have been received from Meta for this form yet.
                      </div>
                    ) : (
                      campaign.leads.map((lead) => (
                        <div key={lead._id} className="bg-card/80 backdrop-blur-md rounded-xl border border-border/60 p-4 shadow-sm relative transition-all hover:border-primary/40 group">
                          {lead.status === 'processed' ? (
                             <div className="absolute top-4 right-4 bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                               <CheckCircle2 className="w-3 h-3" /> Processed
                             </div>
                          ) : (
                             <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                               <AlertTriangle className="w-3 h-3" /> Pending
                             </div>
                          )}
                         
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full border border-border bg-muted flex items-center justify-center shrink-0">
                              {lead.status === 'processed' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Users className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="pt-0.5">
                              <h4 className="font-semibold text-sm text-foreground">{lead.firstName} {lead.lastName}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{new Date(lead.createdAt).toLocaleString()}</p>
                              
                              <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                                {lead.phone && <div className="flex items-center gap-1.5"><span className="text-foreground/50">Phone:</span> <span className="text-foreground">{lead.phone}</span></div>}
                                {lead.email && <div className="flex items-center gap-1.5"><span className="text-foreground/50">Email:</span> <span className="text-foreground">{lead.email}</span></div>}
                                {lead.customData && lead.customData.city && (
                                  <div className="flex items-center gap-1.5"><span className="text-foreground/50">City:</span> <span className="text-foreground">{lead.customData.city}</span></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-bold">Meta Graph API Config</h3>
              <button onClick={() => setIsConfigOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">System User Access Token</label>
                <textarea
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full h-32 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary font-mono"
                  placeholder="EAAGm0PX4ZC... (Long lived access token with leads_retrieval and pages_manage_metadata permissions)"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This token requires <code className="bg-muted px-1 py-0.5 rounded">leads_retrieval</code> and <code className="bg-muted px-1 py-0.5 rounded">pages_manage_metadata</code> permissions.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border bg-muted/20">
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button 
                onClick={saveConfig}
                disabled={isSavingConfig}
                className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingConfig ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
