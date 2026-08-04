'use client'

import React from 'react'
import { 
  RefreshCcw, 
  History, 
  User, 
  Users, 
  Phone, 
  ChevronRight,
  AlertCircle
} from 'lucide-react'

export default function MergeLeadPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Merge Duplicate Leads</h1>
          <p className="text-slate-500 text-sm">Same Mobile Number + Same Assignee</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <History className="w-4 h-4" /> View History
          </button>
        </div>
      </div>

      {/* Top Section - Duplicates by Sales Person */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-slate-800">Duplicates by Sales Person</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Sales Person</th>
                <th className="px-6 py-4 text-center">Role</th>
                <th className="px-6 py-4 text-center">Duplicate Groups</th>
                <th className="px-6 py-4 text-center">Total Duplicate Leads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                      S
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Shivani Saini</div>
                      <div className="text-xs text-slate-500">shivanisaini110@gmail.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    Sales
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                    26
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                    52
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Split View */}
      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        
        {/* Left Pane - Duplicate Groups List */}
        <div className="w-full lg:w-[400px] shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-orange-100 bg-orange-50/50 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            <h2 className="font-bold text-slate-800">Duplicate Groups (26)</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
            
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <div className="p-4 border-b border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-purple-600">
                  <User className="w-3.5 h-3.5" /> Assigned to: Shivani Saini
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Phone className="w-4 h-4 text-slate-400" /> 7042416001
                  </div>
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    2 Duplicates
                  </span>
                </div>
              </div>
              <div className="p-3 bg-slate-50/50 space-y-2 text-sm text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-400" /> Krishan Sharma
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-400" /> Krishan Sharma
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <div className="p-4 border-b border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-purple-600">
                  <User className="w-3.5 h-3.5" /> Assigned to: Shivani Saini
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Phone className="w-4 h-4 text-slate-400" /> 9999077764
                  </div>
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    2 Duplicates
                  </span>
                </div>
              </div>
              <div className="p-3 bg-slate-50/50 space-y-2 text-sm text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-400" /> Manish Guptav
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-400" /> Mansi Sunil
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Pane - Empty State */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center p-8">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Select a Group</h2>
          <p className="text-slate-500 font-medium">Choose a duplicate group from the left to start merging...</p>
        </div>

      </div>

    </div>
  )
}
