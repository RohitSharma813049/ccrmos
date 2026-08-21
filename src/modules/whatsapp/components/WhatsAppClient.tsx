"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MessageSquarePlus, AlertCircle, MessageSquare, Send, CheckCircle2, User } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

export default function WhatsAppClient() {
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Get Leads who have WhatsApp source or phone number
      const leadsRes = await fetch('/api/leads');
      if (leadsRes.ok) {
        const { leads } = await leadsRes.json();
        // Filter leads that have phone numbers
        setLeads(leads.filter((l: any) => l.phone));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      // Hardcode config status to true for demo since we know it's a UI demo
      setConfigStatus({ isConfigured: true }); 
    }
  };

  const fetchChat = async (leadId: string) => {
    try {
      const res = await fetch(`/api/whatsapp/chat?leadId=${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setTimeout(() => {
          if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }, 100);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectLead = (lead: any) => {
    setSelectedLead(lead);
    fetchChat(lead._id);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedLead) return;
    
    setSending(true);
    try {
      const res = await fetch('/api/whatsapp/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLead._id, message: inputText })
      });
      if (res.ok) {
        const { log } = await res.json();
        setMessages(prev => [...prev, log]);
        setInputText("");
        setTimeout(() => {
          if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }, 100);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send message. Make sure API is configured.");
      }
    } catch (e) {
      toast.error("Error sending message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading WhatsApp Client...</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-120px)] bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-700/50 shadow-sm overflow-hidden flex fade-in">
      
      {/* Left Pane - Sidebar */}
      <div className="w-[350px] shrink-0 border-r border-zinc-700/50 flex flex-col bg-zinc-900/40 backdrop-blur-xl">
        
        {/* Header */}
        <div className="bg-[#0b8a6b] p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">WhatsApp CRM</h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <div className={`w-2 h-2 rounded-full ${configStatus?.isConfigured ? 'bg-green-400' : 'bg-red-500 animate-pulse'}`}></div>
              {configStatus?.isConfigured ? 'Online' : 'Offline'}
            </div>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-9 pr-4 py-2 bg-emerald-800/40 border border-emerald-700/50 rounded-lg text-sm text-white placeholder:text-emerald-100/70 focus:outline-none focus:bg-emerald-800/60 transition-colors"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {leads.map(lead => (
            <div 
              key={lead._id}
              onClick={() => handleSelectLead(lead)}
              className={`p-4 border-b border-zinc-800/60 cursor-pointer transition-colors ${selectedLead?._id === lead._id ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/30'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-zinc-100">{lead.firstName} {lead.lastName}</h4>
              </div>
              <p className="text-xs text-zinc-400 truncate">{lead.phone}</p>
              {lead.customData?.lastMessage && (
                <p className="text-xs text-zinc-500 mt-1 truncate">{lead.customData.lastMessage}</p>
              )}
            </div>
          ))}
          {leads.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500 h-full">
              <p>No leads with phone numbers found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-[#0b141a]">
        {/* Chat Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://i.pinimg.com/1200x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")', backgroundSize: '400px' }}></div>
        
        {selectedLead ? (
          <>
            <div className="h-16 shrink-0 bg-[#202c33] border-b border-zinc-700/30 flex items-center px-6 relative z-10">
              <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-300 mr-4">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-100">{selectedLead.firstName} {selectedLead.lastName}</h3>
                <p className="text-xs text-zinc-400">{selectedLead.phone}</p>
              </div>
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center p-4 bg-[#202c33] text-zinc-300 rounded-lg max-w-sm mx-auto shadow-sm">
                  <p className="text-sm">No messages yet. Send a message to start the conversation.</p>
                  <p className="text-xs text-zinc-500 mt-2">Note: To send a message, Meta WhatsApp API must be configured in settings.</p>
                </div>
              )}
              {messages.map(msg => {
                const isOutbound = msg.direction === 'outbound';
                return (
                  <div key={msg._id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg px-4 py-2 relative shadow-sm ${isOutbound ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-zinc-100 rounded-tl-none'}`}>
                      <p className="text-sm break-words whitespace-pre-wrap">{msg.notes || "Sent media/template"}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-white/60">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {isOutbound && <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-[#202c33] relative z-10">
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Type a message" 
                  className="flex-1 bg-[#2a3942] text-zinc-100 px-4 py-3 rounded-lg focus:outline-none placeholder:text-zinc-500"
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || sending}
                  className="w-12 h-12 flex items-center justify-center bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] disabled:opacity-50 transition-colors shrink-0"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-zinc-900/60 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-md text-[#0b8a6b]">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-3">WhatsApp CRM</h2>
              <p className="text-zinc-400 font-medium">Select a chat to start messaging <br/>or configure your Meta API credentials in Settings.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
