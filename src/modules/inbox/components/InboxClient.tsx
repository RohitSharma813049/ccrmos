"use client";

import { useState, useEffect } from "react";
import { Mail, MessageSquare, Search, Filter, MoreVertical, Archive, Trash2, Reply, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function InboxClient() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState<"all" | "email" | "sms">("all");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/inbox");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(m => filter === "all" || m.channel.toLowerCase() === filter);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    try {
      setReplying(true);
      const res = await fetch("/api/inbox/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalMessageId: selectedMessage._id,
          channel: selectedMessage.channel,
          to: selectedMessage.from, // reverse
          content: replyText
        })
      });

      if (res.ok) {
        toast.success("Reply sent successfully");
        setReplyText("");
        fetchMessages();
      } else {
        toast.error("Failed to send reply");
      }
    } catch (e) {
      toast.error("Error sending reply");
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden fade-in">
      {/* Left Pane: Conversation List */}
      <div className="w-1/3 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Inbox</h2>
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"}`}>All</button>
            <button onClick={() => setFilter("email")} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === "email" ? "bg-blue-500 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"}`}>Email</button>
            <button onClick={() => setFilter("sms")} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === "sms" ? "bg-emerald-500 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"}`}>SMS</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Loading messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No messages found.</div>
          ) : (
            filteredMessages.map(msg => (
              <div 
                key={msg._id} 
                onClick={() => setSelectedMessage(msg)}
                className={`p-4 border-b border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors hover:bg-white dark:hover:bg-zinc-800 ${selectedMessage?._id === msg._id ? "bg-white dark:bg-zinc-800 border-l-2 border-l-primary" : ""}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {msg.channel === "Email" ? <Mail size={12} className="text-blue-500"/> : <MessageSquare size={12} className="text-emerald-500"/>}
                    {msg.senderName || msg.from}
                  </span>
                  <span className="text-xs text-zinc-500 whitespace-nowrap ml-2">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate mb-1">{msg.subject}</div>
                <p className="text-xs text-zinc-500 line-clamp-2">{msg.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Message Detail */}
      <div className="w-2/3 flex flex-col bg-white dark:bg-zinc-950">
        {selectedMessage ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-start bg-white dark:bg-zinc-900 sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{selectedMessage.subject || "No Subject"}</h3>
                <div className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                  <span className="font-medium text-zinc-900 dark:text-zinc-300">{selectedMessage.senderName || selectedMessage.from}</span>
                  <span>&lt;{selectedMessage.from}&gt;</span>
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  To: {selectedMessage.to} • {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 text-zinc-400">
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors tooltip" data-tip="Archive"><Archive size={16} /></button>
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors tooltip hover:text-red-500" data-tip="Delete"><Trash2 size={16} /></button>
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors tooltip" data-tip="More"><MoreVertical size={16} /></button>
              </div>
            </div>

            {/* Thread Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/30 dark:bg-zinc-950 custom-scrollbar">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
                {selectedMessage.content}
              </div>
            </div>

            {/* Reply Box */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-shadow">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <Reply size={14} /> Reply to {selectedMessage.from}
                </div>
                <textarea 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full p-4 text-sm bg-transparent border-none focus:outline-none focus:ring-0 resize-none min-h-[120px] text-zinc-900 dark:text-zinc-100"
                />
                <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    Powered by <span className="font-semibold text-primary">CRM OS Hub</span>
                  </div>
                  <Button onClick={handleSendReply} disabled={!replyText.trim() || replying} className="gap-2 h-8 px-4 text-xs">
                    <Send size={14} /> Send
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/10">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="font-medium text-zinc-600 dark:text-zinc-400">Select a message to read</p>
            <p className="text-xs mt-1">Unified view of all emails and SMS communications</p>
          </div>
        )}
      </div>
    </div>
  );
}
