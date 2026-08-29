"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Phone, PhoneOff, FastForward, CheckCircle, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function CampaignDialerPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialerMode, setDialerMode] = useState("preview"); // preview | progressive
  const [isActive, setIsActive] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCallStatus, setCurrentCallStatus] = useState("Idle"); // Idle, Dialing, Connected, WrapUp

  useEffect(() => {
    async function fetchLeads() {
      try {
        // In a real campaign we might filter by FollowUpDate = today or Campaign ID
        const res = await fetch("/api/leads");
        if (res.ok) {
          const data = await res.json();
          // Filter out leads without phone numbers for the dialer
          const dialableLeads = data.leads.filter((l: any) => !!l.phone);
          setLeads(dialableLeads);
        }
      } catch (e) {
        toast.error("Failed to load campaign leads");
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const currentLead = leads[currentIndex];

  const handleStartCampaign = () => {
    if (leads.length === 0) {
      toast.error("No dialable leads found.");
      return;
    }
    setIsActive(true);
    setCurrentCallStatus("Idle");
  };

  const handlePauseCampaign = () => {
    setIsActive(false);
  };

  const handleNextLead = () => {
    if (currentIndex < leads.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentCallStatus("Idle");
    } else {
      toast.success("Campaign Completed!");
      setIsActive(false);
    }
  };

  const handleCall = () => {
    if (!currentLead) return;
    setCurrentCallStatus("Dialing");
    
    // Simulate calling via Twilio Softphone
    // In a real integration, this would emit an event to the DialerWidget
    // window.dispatchEvent(new CustomEvent('DIALER_CALL', { detail: { phone: currentLead.phone } }));
    
    setTimeout(() => {
      setCurrentCallStatus("Connected");
    }, 1500);
  };

  const handleHangup = () => {
    setCurrentCallStatus("WrapUp");
    
    // Auto-advance in Progressive Mode
    if (dialerMode === "progressive") {
      setTimeout(() => {
        handleNextLead();
        // The next Call would be triggered automatically
        // setTimeout(() => handleCall(), 1000);
      }, 3000); // 3 seconds wrap up time
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading campaign data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full gap-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaign Dialer</h1>
          <p className="text-muted-foreground mt-1">
            {leads.length} leads in queue. Mode: {dialerMode === "preview" ? "Preview Dialing" : "Progressive Dialing"}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={dialerMode}
            onChange={(e) => setDialerMode(e.target.value)}
            disabled={isActive}
            className="bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="preview">Preview Mode (Manual)</option>
            <option value="progressive">Progressive Mode (Auto-Dial)</option>
          </select>

          {isActive ? (
            <button onClick={handlePauseCampaign} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
              <Pause className="w-5 h-5" /> Pause Campaign
            </button>
          ) : (
            <button onClick={handleStartCampaign} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold transition-colors">
              <Play className="w-5 h-5" /> Start Campaign
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6 h-full min-h-[500px]">
        {/* Left Side: Current Lead Profile */}
        <div className="flex-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
          {currentLead ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{currentLead.firstName} {currentLead.lastName}</h2>
                  <div className="text-xl font-mono text-primary mt-2 flex items-center gap-2">
                    <Phone className="w-5 h-5" /> {currentLead.phone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Lead Score</div>
                  <div className="text-2xl font-bold text-orange-500">{currentLead.leadScore || "N/A"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Info className="w-4 h-4"/> Basic Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Email:</span> <span className="font-medium">{currentLead.email}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Location:</span> <span className="font-medium">{currentLead.city || "N/A"}, {currentLead.state || "N/A"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Budget:</span> <span className="font-medium">{currentLead.budget ? `$${currentLead.budget}` : "N/A"}</span></div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Pipeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Priority:</span> <span className="font-medium">{currentLead.priority}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Status:</span> <span className="font-medium">{currentLead.status || "New"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Next Follow-up:</span> <span className="font-medium text-orange-500">{currentLead.nextFollowUpDate ? new Date(currentLead.nextFollowUpDate).toLocaleDateString() : "None"}</span></div>
                  </div>
                </div>
              </div>

              {/* Disposition / Wrap-up Form */}
              {currentCallStatus === "WrapUp" && (
                <div className="mt-8 bg-green-500/10 border border-green-500/20 p-5 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="font-bold text-green-700 mb-3">Call Wrap-up</h3>
                  <textarea 
                    className="w-full bg-background border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500 text-sm h-24 mb-3"
                    placeholder="Enter call notes..."
                  />
                  <div className="flex justify-end">
                    <button onClick={handleNextLead} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                      Save & Continue
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <PhoneOff className="w-16 h-16 mb-4 opacity-20" />
              <p>No active lead selected.</p>
            </div>
          )}

          {/* Active Call Controls */}
          {isActive && currentLead && (
            <div className="bg-muted p-6 border-t border-border flex justify-center items-center gap-6">
              {currentCallStatus === "Idle" && (
                <button onClick={handleCall} className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-green-500/20 transition-all hover:scale-105">
                  <Phone className="w-6 h-6" /> Dial Now
                </button>
              )}
              
              {(currentCallStatus === "Dialing" || currentCallStatus === "Connected") && (
                <div className="flex items-center gap-6">
                  <div className="text-lg font-bold text-primary animate-pulse">
                    {currentCallStatus === "Dialing" ? "Ringing..." : "00:14 Connected"}
                  </div>
                  <button onClick={handleHangup} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-red-500/20 transition-all hover:scale-105">
                    <PhoneOff className="w-6 h-6" /> End Call
                  </button>
                </div>
              )}
              
              {dialerMode === "preview" && currentCallStatus === "Idle" && (
                <button onClick={handleNextLead} className="flex items-center gap-2 bg-background border border-border text-foreground hover:bg-muted px-6 py-4 rounded-full font-semibold transition-colors">
                  Skip <FastForward className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Dialer Queue */}
        <div className="w-80 bg-card rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="p-4 border-b border-border bg-muted/50 rounded-t-2xl">
            <h3 className="font-bold text-foreground">Up Next</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {leads.map((l, idx) => (
              <div 
                key={l._id} 
                className={`p-3 rounded-xl mb-2 flex flex-col gap-1 ${idx === currentIndex ? "bg-primary text-primary-foreground shadow-md" : idx < currentIndex ? "bg-muted/50 opacity-50 text-muted-foreground" : "bg-background border border-border text-foreground"}`}
              >
                <div className="font-semibold text-sm">{l.firstName} {l.lastName}</div>
                <div className={`text-xs ${idx === currentIndex ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{l.phone}</div>
                {idx === currentIndex && currentCallStatus !== "Idle" && (
                  <div className="text-xs font-bold mt-1 uppercase tracking-wider">{currentCallStatus}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
