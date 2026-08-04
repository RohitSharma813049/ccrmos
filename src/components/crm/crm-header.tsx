'use client'

import React from 'react'
import { Search, Bell, Menu } from 'lucide-react'
import { useSidebar } from './sidebar-context'
import { useSession } from 'next-auth/react'

export function CrmHeader() {
  const { isOpen, setIsOpen } = useSidebar()
  const { data: session } = useSession()

  const userName = session?.user?.name || 'Admin User'
  const userRole = (session?.user as any)?.role || 'Admin'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
      {/* Left side actions (Mobile Menu) */}
      <div className="flex items-center gap-3 lg:hidden mr-3">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search leads, clients, properties..."
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          {session?.user?.image ? (
            <img src={session.user.image} alt={userName} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {userInitial}
            </div>
          )}
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-slate-900 leading-tight truncate max-w-[120px]">{userName}</span>
            <span className="text-xs text-slate-500 capitalize">{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
