'use client'

import React from 'react'
import { 
  PhoneForwarded, 
  RefreshCcw, 
  Users, 
  Download, 
  Upload, 
  Plus, 
  Lock,
  Search,
  Settings2,
  Filter,
  MoreVertical,
  Calendar,
  Building2,
  Mail,
  MessageCircle,
  ChevronDown
} from 'lucide-react'

const leads = [
  {
    id: 'A2309C', sno: 1, date: '01 Aug 26',
    name: 'Atul', source: '09-July-2026 Channel Partner', initial: 'A', bgColor: 'bg-blue-100 text-blue-600',
    phone: '+917505352104', email: 'sachinrajput2003@gmail.com',
    category: 'N/A', enquiry: 'Client', assigned: 'Not assigned', property: 'No property'
  },
  {
    id: 'A22D07', sno: 2, date: '01 Aug 26',
    name: 'satvik', source: '09-July-2026 Channel Partner', initial: 's', bgColor: 'bg-blue-100 text-blue-600',
    phone: '+919625977690', email: 'kumaralpana890@gmail.com',
    category: 'N/A', enquiry: 'Client', assigned: 'Not assigned', property: 'No property'
  },
  {
    id: 'A22A4F', sno: 3, date: '01 Aug 26',
    name: 'OrganiCulturist', source: '08-july-2026 Gurugram-copy', initial: 'O', bgColor: 'bg-blue-100 text-blue-600',
    phone: '+919625936360', email: 'organiculturist@gmail.com',
    category: 'N/A', enquiry: 'Client', assigned: 'Not assigned', property: 'No property'
  },
  {
    id: 'A22641', sno: 4, date: '01 Aug 26',
    name: 'Sandeep', source: '08-july-2026 Gurugram-copy', initial: 'S', bgColor: 'bg-blue-100 text-blue-600',
    phone: '+917678254400', email: 'sandeeptoni88@gmail.com',
    category: 'N/A', enquiry: 'Client', assigned: 'Not assigned', property: 'No property'
  },
  {
    id: 'A224DE', sno: 5, date: '01 Aug 26',
    name: 'Yahoodakhan', source: '08-july-2026 Gurugram-copy', initial: 'Y', bgColor: 'bg-blue-100 text-blue-600',
    phone: '+918397973500', email: 'Yahoodakhan785@gmail.com',
    category: 'N/A', enquiry: 'Client', assigned: 'Not assigned', property: 'No property'
  }
]

export default function LeadsPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">All Leads</h1>
        <p className="text-slate-500 text-sm">Manage and track all your leads</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-2 px-5 py-3 bg-indigo-400 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <PhoneForwarded className="w-4 h-4" /> Start AI Calling
        </button>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Users className="w-4 h-4" /> Bulk Assign
        </button>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Upload className="w-4 h-4" /> Import
        </button>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Export
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
        <div className="flex-1"></div>
        <button className="flex items-center gap-2 px-5 py-3 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Lock className="w-4 h-4 text-orange-500" /> View Closed Leads
        </button>
      </div>

      {/* Summary Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Leads</p>
          <h3 className="text-xl font-bold text-blue-600">3330</h3>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-500 mb-1">Hot Leads</p>
          <h3 className="text-xl font-bold text-red-500">115</h3>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-500 mb-1">Warm Leads</p>
          <h3 className="text-xl font-bold text-orange-500">443</h3>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-500 mb-1">Cold Leads</p>
          <h3 className="text-xl font-bold text-blue-500">43</h3>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-500 mb-1">Fresh Leads</p>
          <h3 className="text-xl font-bold text-green-500">2764</h3>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-500 mb-1">Follow-ups</p>
          <h3 className="text-xl font-bold text-blue-600">163</h3>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-medium text-slate-500 mb-1">Not Assigned</p>
          <h3 className="text-xl font-bold text-red-500">10</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-2xl">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, phone, ID..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Filter Accordions */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-green-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Settings2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Table Columns</h4>
                <p className="text-xs text-slate-500">13 of 13 columns selected</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-green-600/50" />
          </div>
          
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">All Filters</h4>
                <p className="text-xs text-slate-500">3330 Total Leads</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-blue-600/50" />
          </div>
        </div>

        {/* Data Table Wrapper */}
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 font-semibold bg-white border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 w-10"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="px-2 py-4">Act.</th>
                <th className="px-2 py-4">Schedule</th>
                <th className="px-2 py-4">F-up</th>
                <th className="px-4 py-4 text-center">Last<br/>Follow-up</th>
                <th className="px-4 py-4 text-center">S.No</th>
                <th className="px-4 py-4">ID</th>
                <th className="px-4 py-4 flex items-center gap-1">Date <ChevronDown className="w-3 h-3"/></th>
                <th className="px-6 py-4">Lead Info</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-4 py-4 text-center">Cat.</th>
                <th className="px-4 py-4 text-center">Enq.</th>
                <th className="px-4 py-4 text-center">Assigned</th>
                <th className="px-4 py-4 text-center">Property</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {leads.map((lead, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="px-2 py-4 text-slate-400 hover:text-slate-600 cursor-pointer"><MoreVertical className="w-4 h-4" /></td>
                  
                  {/* Schedule Icons */}
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Calendar className="w-4 h-4" /></button>
                      <button className="text-purple-500 hover:bg-purple-50 p-1 rounded"><Building2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                  
                  <td className="px-2 py-4">
                    <button className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Calendar className="w-4 h-4" /></button>
                  </td>
                  
                  <td className="px-4 py-4 text-center text-xs text-slate-400 italic">No<br/>follow-up</td>
                  <td className="px-4 py-4 text-center font-medium text-slate-700">{lead.sno}</td>
                  <td className="px-4 py-4 font-bold text-slate-800">{lead.id}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{lead.date}</td>
                  
                  {/* Lead Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${lead.bgColor}`}>
                        {lead.initial}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.source}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Contact Info */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600">
                        {lead.phone} <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </div>
                    </div>
                  </td>
                  
                  {/* Category Dropdown */}
                  <td className="px-4 py-4 text-center">
                    <select className="bg-purple-100 text-purple-700 text-xs font-bold rounded-md px-2 py-1.5 border-none outline-none appearance-none text-center min-w-[60px]">
                      <option>{lead.category}</option>
                    </select>
                  </td>
                  
                  {/* Enquiry Dropdown */}
                  <td className="px-4 py-4 text-center">
                    <select className="bg-green-100 text-green-700 text-xs font-bold rounded-md px-2 py-1.5 border-none outline-none appearance-none text-center min-w-[70px]">
                      <option>{lead.enquiry}</option>
                    </select>
                  </td>
                  
                  <td className="px-4 py-4 text-center text-slate-400 italic text-xs">
                    {lead.assigned}
                  </td>
                  
                  <td className="px-4 py-4 text-center text-slate-400 text-xs">
                    {lead.property}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
