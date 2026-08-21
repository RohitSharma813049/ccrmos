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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-xl rounded-2xl shadow-xl border border-border flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-xl font-bold">New Campaign</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Summer Promo" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="Email">Email Blast</option>
                  <option value="SMS">SMS Blast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Lead Status</label>
                <select 
                  multiple 
                  value={formData.targetAudience.status} 
                  onChange={(e) => setFormData({...formData, targetAudience: { status: Array.from(e.target.selectedOptions, option => option.value) }})} 
                  className="w-full px-3 py-2 border rounded-lg h-24"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple. Leave unselected to target all.</p>
              </div>
              
              {formData.type === 'Email' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Email Subject</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Message Content</label>
                <textarea 
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg h-32"
                  placeholder={formData.type === 'Email' ? "Supports HTML..." : "Keep it under 160 characters..."}
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-2 bg-muted/20">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg">
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
