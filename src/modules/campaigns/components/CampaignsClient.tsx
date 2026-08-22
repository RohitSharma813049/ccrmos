"use client";
import { useState, useEffect } from "react";

export default function CampaignsClient() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Draft State
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [targetStatus, setTargetStatus] = useState("New");
  const [isSending, setIsSending] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (res.ok) setCampaigns(data.campaigns);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const createAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      // 1. Create Campaign
      const createRes = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          type: "Email",
          content,
          targetAudience: {
            status: targetStatus === "All" ? [] : [targetStatus]
          }
        })
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error);
      
      const campaignId = createData.campaign._id;

      // 2. Dispatch Send
      const sendRes = await fetch("/api/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId })
      });
      const sendData = await sendRes.json();
      if (!sendRes.ok) throw new Error(sendData.error);
      
      alert(`Campaign Sent! ${sendData.campaign.stats.successful} emails delivered.`);
      setShowModal(false);
      fetchCampaigns();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-3xl shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">Design and broadcast emails to your leads.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm">
          + New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-muted-foreground p-6">Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <div className="col-span-3 text-center py-16 bg-card rounded-3xl border border-dashed border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">No Campaigns Yet</h3>
            <p className="text-muted-foreground text-sm">Create your first broadcast to engage your leads.</p>
          </div>
        ) : (
          campaigns.map((c) => (
            <div key={c._id} className="bg-card p-6 rounded-3xl shadow-sm border border-border flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-foreground line-clamp-1">{c.name}</h3>
                  <span className={\`text-xs px-2.5 py-1 rounded-full font-medium \${c.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}\`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{c.subject || "No subject"}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Targeted</span>
                    <span className="font-semibold text-foreground">{c.stats.totalTargeted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivered</span>
                    <span className="font-semibold text-emerald-500">{c.stats.successful}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Failed</span>
                    <span className="font-semibold text-destructive">{c.stats.failed}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground border-t border-border pt-4">
                Sent {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold text-foreground">Draft Email Campaign</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            
            <form onSubmit={createAndSend} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Internal Campaign Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background" placeholder="e.g. Q3 Newsletter" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email Subject Line</label>
                  <input required type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background" placeholder="Special Offer Inside!" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Target Audience</label>
                  <select value={targetStatus} onChange={e => setTargetStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background">
                    <option value="All">All Leads</option>
                    <option value="New">Status: New</option>
                    <option value="Contacted">Status: Contacted</option>
                    <option value="Qualified">Status: Qualified</option>
                    <option value="Lost">Status: Lost</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Email Content (HTML Supported)</label>
                <p className="text-xs text-muted-foreground mb-2">Use {'{{name}}'} to dynamically insert the lead's first name.</p>
                <textarea 
                  required 
                  rows={8} 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-sm leading-relaxed" 
                  placeholder="<h1>Hello {{name}},</h1><p>We have a special offer for you!</p>"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={isSending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-sm flex items-center gap-2">
                  {isSending ? "Dispatching..." : "Launch Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
