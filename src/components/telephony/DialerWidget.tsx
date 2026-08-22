"use client";

import { useEffect, useState, useRef } from "react";
import { Device } from "@twilio/voice-sdk";
import { Phone, PhoneOff, Mic, MicOff, Settings, Users, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function DialerWidget() {
  const [device, setDevice] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callStatus, setCallStatus] = useState("Disconnected");
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function initDevice() {
      try {
        const res = await fetch("/api/twilio/token");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to get token");
        }
        const { token } = await res.json();

        const newDevice = new Device(token, {
          logLevel: 1
        });

        newDevice.on("ready", () => {
          setIsReady(true);
          setCallStatus("Ready");
        });

        newDevice.on("error", (error) => {
          console.error("Twilio Device Error:", error);
          toast.error(`Dialer Error: ${error.message}`);
        });

        newDevice.on("disconnect", () => {
          setActiveCall(null);
          setCallStatus("Ready");
          setIsMuted(false);
        });

        newDevice.on("incoming", (call) => {
          setCallStatus("Incoming call...");
          call.on("accept", () => {
            setActiveCall(call);
            setCallStatus("Connected");
            setIsExpanded(true);
          });
          call.on("disconnect", () => {
            setActiveCall(null);
            setCallStatus("Ready");
          });
          call.on("reject", () => {
            setCallStatus("Ready");
          });
          
          // Auto-show dialer on incoming
          setIsExpanded(true);
          
          // For a simple UI, we'll auto-accept or show a modal in a real app,
          // here we just save it to state so the user can click "Accept"
          setActiveCall(call); 
        });

        newDevice.register();
        setDevice(newDevice);
      } catch (e) {
        console.error("Dialer init failed", e);
      }
    }
    
    // In a real app we might only init if the user is an agent
    initDevice();

    return () => {
      if (device) {
        device.destroy();
      }
    };
  }, []);

  const handleCall = async () => {
    if (!device) return;
    if (activeCall) {
      if (activeCall.status() === "pending") {
        activeCall.accept();
      }
      return;
    }
    
    if (!phoneNumber) return toast.error("Enter a number to call");
    
    try {
      setCallStatus("Dialing...");
      const call = await device.connect({
        params: { To: phoneNumber }
      });
      
      call.on("accept", () => {
        setActiveCall(call);
        setCallStatus("Connected");
      });
      
      call.on("disconnect", () => {
        setActiveCall(null);
        setCallStatus("Ready");
      });
      
      call.on("error", (error: any) => {
        console.error(error);
        toast.error("Call failed");
        setActiveCall(null);
        setCallStatus("Ready");
      });

      setActiveCall(call);
    } catch (e: any) {
      toast.error("Failed to connect call");
      setCallStatus("Ready");
    }
  };

  const handleHangup = () => {
    if (activeCall) {
      if (activeCall.status() === "pending") {
        activeCall.reject();
      } else {
        activeCall.disconnect();
      }
    }
  };

  const toggleMute = () => {
    if (activeCall) {
      const muted = !isMuted;
      activeCall.mute(muted);
      setIsMuted(muted);
    }
  };

  if (!isExpanded) {
    return (
      <div 
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-xl cursor-pointer hover:bg-primary/90 transition-all z-50 flex items-center gap-3 group"
        onClick={() => setIsExpanded(true)}
      >
        <Phone className="w-6 h-6" />
        <span className="font-semibold hidden group-hover:block whitespace-nowrap overflow-hidden transition-all max-w-xs">
          {callStatus === "Ready" ? "Open Dialer" : callStatus}
        </span>
        {activeCall && callStatus === "Incoming call..." && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="bg-muted p-4 border-b border-border flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(false)}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isReady ? (activeCall ? 'bg-orange-500' : 'bg-green-500') : 'bg-red-500'}`} />
          <span className="font-semibold text-foreground text-sm">
            Agent Softphone
          </span>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-4">
        <div className="text-center">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{callStatus}</span>
        </div>

        {!activeCall || (activeCall && activeCall.status() !== "pending" && activeCall.status() !== "open") ? (
          <div>
            <input 
              type="text" 
              placeholder="+1234567890" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full text-center text-xl tracking-widest font-mono bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary mb-4"
            />
          </div>
        ) : (
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-foreground font-mono mb-1">
              {activeCall.parameters?.From || phoneNumber || "Unknown"}
            </div>
            <div className="text-sm text-muted-foreground">00:00</div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 mt-2">
          {activeCall && activeCall.status() === "open" && (
            <button 
              onClick={toggleMute}
              className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-orange-500 text-white' : 'bg-muted text-foreground hover:bg-muted/80'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          )}

          {!activeCall || (activeCall && activeCall.status() === "pending" && callStatus !== "Dialing...") ? (
            <button 
              onClick={handleCall}
              disabled={!isReady}
              className="p-5 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50"
            >
              <Phone className="w-7 h-7" />
            </button>
          ) : null}

          {activeCall && (
            <button 
              onClick={handleHangup}
              className="p-5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          )}
          
          {activeCall && activeCall.status() === "open" && (
            <button className="p-4 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors">
              <ArrowRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
      
      {/* Footer Tools */}
      <div className="bg-muted/30 p-3 border-t border-border flex justify-around">
        <button className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground" title="Conference & Coaching">
          <Users className="w-4 h-4" />
          <span>Whisper</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
