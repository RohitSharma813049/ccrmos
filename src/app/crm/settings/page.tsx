'use client'

import React from 'react'
import { 
  User, 
  Building2, 
  Users, 
  Bell, 
  Link as LinkIcon, 
  ShieldCheck,
  Camera,
  Save,
  Mail,
  Phone
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your CRM configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pt-2 border-b border-slate-200 pb-4">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-sm transition-colors">
          <User className="w-4 h-4" /> My Profile
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-full text-sm font-medium transition-colors">
          <Building2 className="w-4 h-4" /> Company Profile
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-full text-sm font-medium transition-colors">
          <Users className="w-4 h-4" /> Team Management
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-full text-sm font-medium transition-colors">
          <Bell className="w-4 h-4" /> Notifications
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-full text-sm font-medium transition-colors">
          <LinkIcon className="w-4 h-4" /> API Integration
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-full text-sm font-medium transition-colors">
          <ShieldCheck className="w-4 h-4" /> Security
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800">Profile Information</h2>
        </div>
        
        <div className="p-8 space-y-8">
          
          {/* Avatar Area */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#0B1E43] flex items-center justify-center text-white border-4 border-white shadow-md">
                {/* Simulated Logo inside avatar */}
                <span className="font-serif italic font-bold text-yellow-500 text-sm tracking-widest">DARPAN</span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-slate-200 shadow-sm text-slate-600 hover:text-blue-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Darpann Investment</h3>
              <p className="text-slate-500 text-sm mb-3">Admin</p>
              <button className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-semibold transition-colors">
                Change Photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  defaultValue="Darpann Investment" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  defaultValue="webesidetechnologyindia@gmail.com" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Phone
              </label>
              <div className="relative flex">
                <div className="px-3 border border-r-0 border-slate-200 rounded-l-xl bg-slate-50 flex items-center justify-center">
                   <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  defaultValue="8860876087" 
                  className="w-full px-4 py-3 rounded-r-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Timezone
              </label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-800 appearance-none bg-white">
                <option>India (IST)</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <label className="block text-sm font-medium text-slate-500 mb-1">
              Your Role
            </label>
            <div className="font-bold text-slate-900">Admin</div>
          </div>

        </div>

      </div>

      <div className="flex justify-end pt-2">
        <button className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

    </div>
  )
}
