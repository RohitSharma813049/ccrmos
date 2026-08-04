'use client'

import React from 'react'
import { Calendar, Info } from 'lucide-react'

export default function GoogleCalendarPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 font-sans text-[var(--ink)]">
      
      {/* Container */}
      <div className="max-w-2xl mx-auto">
        
        {/* Card */}
        <div className="bg-white rounded-[16px] border border-[var(--rule)] shadow-[var(--card-shadow)] overflow-hidden">
          
          {/* Header */}
          <div className="p-8 border-b border-[var(--rule)] flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[var(--ink)] mb-2">Google Calendar Integration</h1>
              <p className="text-[var(--ink-muted)] text-sm">Sync your meetings and site visits with Google Calendar</p>
            </div>
            <div className="w-12 h-12 bg-[var(--violet-soft)] text-[var(--violet)] rounded-2xl flex items-center justify-center shrink-0 border border-[var(--violet-line)]">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            {/* Status */}
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--rule)] border border-[var(--ink-muted)]"></div>
              <span className="font-semibold text-[var(--ink-mid)] text-sm uppercase tracking-wider">Not Connected</span>
            </div>

            {/* Benefits Box */}
            <div className="bg-[var(--violet-soft)] border border-[var(--violet-line)] rounded-[12px] p-5 text-[var(--violet)]">
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
              <button className="w-full py-3.5 bg-[var(--violet)] hover:bg-[var(--violet-mid)] text-white font-bold rounded-[12px] shadow-sm transition-colors flex items-center justify-center gap-2 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)] focus-visible:ring-offset-2">
                <span className="font-sans font-bold text-xl">G</span> Connect with Google Calendar
              </button>
              <p className="text-xs text-[var(--ink-muted)] mt-3 font-medium">
                You'll be redirected to Google to authorize access
              </p>
            </div>

            {/* How it works */}
            <div className="pt-8 border-t border-[var(--rule)] space-y-4">
              <div className="flex items-center gap-2 font-semibold text-[var(--ink)]">
                <Info className="w-4 h-4 text-[var(--violet)]" /> How it works:
              </div>
              <ol className="list-decimal list-inside space-y-2.5 text-sm font-medium text-[var(--ink-mid)]">
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
