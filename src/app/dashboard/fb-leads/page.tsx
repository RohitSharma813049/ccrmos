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
  AlertTriangle
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
    // Simulate sync
    setTimeout(() => {
      setIsSyncing(false)
      toast.success('Synced successfully with Meta')
      fetchData()
    }, 1500)
  }

  const totalLeads = campaigns.reduce((acc, c) => acc + c.leads.length, 0)
  const totalProcessed = campaigns.reduce((acc, c) => acc + c.processed, 0)
  const pendingLeads = totalLeads - totalProcessed

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
      
      {/* Left Sidebar - Summary */}
      <div className="w-full md:w-64 shrink-0 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Megaphone className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg text-slate-800">Meta Ads</h2>
        </div>

        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Leads (All Time)</p>
          <h3 className="text-2xl font-bold text-blue-600">{totalLeads}</h3>
        </div>

        <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Processed Automatically</p>
          <h3 className="text-2xl font-bold text-green-600">{totalProcessed}</h3>
        </div>

        <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Pending Sync</p>
          <h3 className="text-2xl font-bold text-orange-600">{pendingLeads > 0 ? pendingLeads : 0}</h3>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex gap-2 shadow-sm">
          <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Auto-sync checks Meta every 20 minutes for new leads mapped to your campaigns.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        
        {/* Header & Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Meta Leads Database</h1>
            <p className="text-slate-500 text-sm">Leads synced automatically from connected Meta campaigns</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/campaign-settings" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm text-center">
              <Plus className="w-4 h-4" />
              Manage<br/>Campaigns
            </Link>
            <button 
              disabled={isSyncing}
              onClick={handleSync}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm text-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync from<br/>Meta
            </button>
            <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Campaign List */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <Megaphone className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Campaigns Configured</h3>
            <p className="text-slate-500 mb-4 max-w-sm">You have not mapped any Facebook Form IDs yet. Set up a campaign mapping to begin importing leads.</p>
            <Link href="/dashboard/campaign-settings" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              Go to Campaign Settings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div 
                  onClick={() => toggleCampaign(campaign.name)}
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white p-4 flex items-center gap-3 transition-colors"
                >
                  {expandedCampaign === campaign.name ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  <div>
                    <h3 className="font-bold text-lg">{campaign.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-blue-100 mt-1">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {campaign.leads.length} Leads</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {campaign.processed} Processed</span>
                      {campaign.leads.length - campaign.processed > 0 && (
                        <span className="flex items-center gap-1 bg-amber-500/20 text-amber-100 px-2 rounded-md py-0.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> {campaign.leads.length - campaign.processed} Pending
                        </span>
                      )}
                      <span>Form ID / Campaign: {campaign.name}</span>
                    </div>
                  </div>
                </div>
                
                {expandedCampaign === campaign.name && (
                  <div className="p-4 space-y-4 bg-slate-50">
                    {campaign.leads.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-sm">
                        No leads have been received from Meta for this form yet.
                      </div>
                    ) : (
                      campaign.leads.map((lead) => (
                        <div key={lead._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative transition-all hover:border-blue-200">
                          {lead.status === 'processed' ? (
                             <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded flex items-center gap-1">
                               <CheckCircle2 className="w-3 h-3" /> Processed
                             </div>
                          ) : (
                             <div className="absolute top-4 right-4 bg-orange-100 text-orange-700 border border-orange-200 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded flex items-center gap-1">
                               Pending
                             </div>
                          )}
                         
                          <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${lead.status === 'processed' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                              {lead.status === 'processed' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Users className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">{lead.firstName} {lead.lastName}</h4>
                              <p className="text-xs text-slate-500">{new Date(lead.createdAt).toLocaleString()}</p>
                              <div className="mt-2 space-y-1 text-sm text-slate-600">
                                <div className="flex items-center gap-2"><span className="text-slate-400 w-24">Phone:</span> {lead.phone || 'N/A'}</div>
                                <div className="flex items-center gap-2"><span className="text-slate-400 w-24">Email:</span> {lead.email || 'N/A'}</div>
                                {lead.customData && lead.customData.city && (
                                  <div className="flex items-center gap-2"><span className="text-slate-400 w-24">City:</span> {lead.customData.city}</div>
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
    </div>
  )
}
