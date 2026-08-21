'use client'

import React, { useState } from 'react'
import { Calendar, Info, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function GoogleCalendarPage() {
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)

  const handleConnect = () => {
    setConnecting(true)
    setTimeout(() => {
      setConnecting(false)
      setConnected(true)
      toast.success('Successfully connected to Google Calendar!')
    }, 2500)
  }

  return (
    <div className="max-w-4xl mx-auto py-8 font-sans text-zinc-100">
      
      {/* Container */}
      <div className="max-w-2xl mx-auto">
        
        {/* Card */}
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-700/50 shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="p-8 border-b border-zinc-800/60 flex items-start justify-between bg-zinc-950/50/50">
            <div>
              <h1 className="text-3xl font-serif font-bold text-zinc-100 mb-2">Google Calendar</h1>
              <p className="text-zinc-400 text-sm">Sync your meetings and site visits with Google Calendar</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            {/* Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              <span className={`font-semibold text-sm uppercase tracking-wider ${connected ? 'text-green-700' : 'text-zinc-400'}`}>
                {connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            {/* Benefits Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-blue-800">
              <div className="flex items-center gap-2 font-bold mb-3">
                <Calendar className="w-4 h-4" /> Benefits:
              </div>
              <ul className="space-y-2 text-sm font-medium">
                <li>• Never miss a meeting or site visit</li>
                <li>• Automatic calendar sync</li>
                <li>• Email reminders to all attendees</li>
                <li>• Mobile notifications via Google Calendar app</li>
              </ul>
            </div>

            {/* Action */}
            <div className="text-center">
              {connected ? (
                <button 
                  onClick={() => {
                    setConnected(false)
                    toast.success('Disconnected from Google Calendar')
                  }}
                  className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-lg border border-red-200"
                >
                  Disconnect
                </button>
              ) : (
                <>
                  <button 
                    disabled={connecting}
                    onClick={handleConnect}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                  >
                    {connecting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <><span className="font-sans font-bold text-xl">G</span> Connect with Google Calendar</>
                    )}
                  </button>
                  <p className="text-xs text-zinc-400 mt-3 font-medium">
                    You'll be redirected to Google to authorize access
                  </p>
                </>
              )}
            </div>

            {/* How it works */}
            <div className="pt-8 border-t border-zinc-800/60 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-zinc-100">
                <Info className="w-4 h-4 text-blue-600" /> How it works:
              </div>
              <ol className="list-decimal list-inside space-y-2.5 text-sm font-medium text-zinc-400">
                <li>Click "Connect with Google Calendar"</li>
                <li>Sign in with your Google account</li>
                <li>Grant calendar access permissions</li>
                <li>All future meetings & site visits will auto-sync!</li>
              </ol>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
