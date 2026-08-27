'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from "@/components/ui/PageHeader";
import { toast } from 'react-hot-toast';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Email',
    subject: '',
    content: '',
    targetAudience: { status: [] as string[] }
  });

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTargetStatus = (status: string) => {
    setFormData(prev => {
      const currentStatus = prev.targetAudience.status;
      if (currentStatus.includes(status)) {
        return { ...prev, targetAudience: { status: currentStatus.filter(s => s !== status) } };
      } else {
        return { ...prev, targetAudience: { status: [...currentStatus, status] } };
      }
    });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Campaign created!");
        setIsModalOpen(false);
        fetchCampaigns();
      } else {
        toast.error("Failed to create campaign");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleDispatch = async (id: string) => {
    toast.loading("Dispatching campaign...", { id: 'dispatch' });
    try {
      const res = await fetch(`/api/campaigns/${id}/dispatch`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Successfully dispatched to ${data.stats?.successful || 0} leads!`, { id: 'dispatch' });
        fetchCampaigns();
      } else {
        toast.error(data.error || "Failed to dispatch", { id: 'dispatch' });
      }
    } catch (e) {
      toast.error("Error dispatching campaign", { id: 'dispatch' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      toast.success("Campaign deleted");
      fetchCampaigns();
    } catch (e) {
      toast.error("Error deleting campaign");
    }
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Marketing Campaigns" 
          description="Build and dispatch targeted email and SMS campaigns at scale." 
        />
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm">
          + New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-muted-foreground">No campaigns found. Create one to get started!</p>
        ) : (
          campaigns.map((camp) => (
            <div key={camp._id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{camp.name}</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-muted text-muted-foreground rounded-full">
                      {camp.type}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                    camp.status === 'Draft' ? 'bg-zinc-100 text-zinc-700' : 
                    camp.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {camp.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{camp.subject || camp.content}</p>
                <div className="bg-muted/30 p-3 rounded-lg mb-4">
                  <p className="text-xs font-medium text-muted-foreground">Audience</p>
                  <p className="text-sm">Status: {camp.targetAudience?.status?.length > 0 ? camp.targetAudience.status.join(', ') : 'All Leads'}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                {camp.status === 'Draft' && (
                  <button onClick={() => handleDispatch(camp._id)} className="flex-1 px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm text-center">
                    Dispatch Now
                  </button>
                )}
                <button onClick={() => handleDelete(camp._id)} className="px-3 py-2 bg-red-50 text-red-600 font-semibold rounded-lg text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-zinc-950/80 backdrop-blur-xl w-full max-w-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-100">New Campaign</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Campaign Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner" placeholder="e.g. Summer Promo" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner">
                  <option value="Email">Email Blast</option>
                  <option value="SMS">SMS Blast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Target Lead Status</label>
                <div className="flex flex-wrap gap-2">
                  {['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleTargetStatus(status)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        formData.targetAudience.status.includes(status) 
                        ? 'bg-primary/20 text-primary border-primary/50' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-2">Click to select multiple. Leave unselected to target all.</p>
              </div>
              
              {formData.type === 'Email' && (
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Email Subject</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner" />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Message Content</label>
                <textarea 
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})} 
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner h-32"
                  placeholder={formData.type === 'Email' ? "Supports HTML..." : "Keep it under 160 characters..."}
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleCreate} className="px-6 py-2.5 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg transition-colors">
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
