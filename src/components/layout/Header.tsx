'use client';

import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import NotificationBell from '@/components/ui/NotificationBell';

export function Header() {
  return (
    <header className="h-16 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Left: Mobile Menu Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-800/50">
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative max-w-md w-full hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Search leads, properties, or projects..."
            className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs text-zinc-500 font-medium px-1.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="h-8 w-px bg-zinc-800"></div>

        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-medium text-white shadow-sm ring-1 ring-white/10">
            JD
          </div>
        </button>
      </div>
    </header>
  );
}
