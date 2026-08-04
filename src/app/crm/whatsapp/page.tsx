'use client'

import React from 'react'
import { 
  Search, 
  MessageSquarePlus, 
  AlertCircle,
  MessageSquare
} from 'lucide-react'

export default function WhatsAppPage() {
  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-120px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex">
      
      {/* Left Pane - Sidebar */}
      <div className="w-[350px] shrink-0 border-r border-slate-200 flex flex-col bg-white">
        
        {/* Header */}
        <div className="bg-[#0b8a6b] p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">WhatsApp CRM</h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              Offline
            </div>
          </div>
          
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-9 pr-4 py-2 bg-emerald-800/40 border border-emerald-700/50 rounded-lg text-sm text-white placeholder:text-emerald-100/70 focus:outline-none focus:bg-emerald-800/60 transition-colors"
            />
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-2 border border-white/20 hover:bg-white/10 rounded-lg text-sm font-semibold transition-colors">
            <MessageSquarePlus className="w-4 h-4" /> New Chat
          </button>
        </div>

        {/* Alert Banner */}
        <div className="p-4 border-b border-slate-100">
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-700">WhatsApp not connected</p>
          </div>
        </div>

        {/* Chats List (Empty State) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50">
          <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">No chats yet</h3>
          <p className="text-sm text-slate-500">Click "New Chat" to start</p>
        </div>
      </div>

      {/* Right Pane - Main Chat Area */}
      <div className="flex-1 bg-[#f0ebd8] flex items-center justify-center relative">
        {/* Decorative background pattern optional, but screenshot is plain beige */}
        <div className="text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-white/60 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <MessageSquare className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">WhatsApp CRM</h2>
          <p className="text-slate-500">Select a chat to start messaging <br/>or create a new chat</p>
        </div>
      </div>

    </div>
  )
}
