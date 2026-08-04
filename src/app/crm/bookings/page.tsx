'use client'

import React from 'react'
import { 
  Plus, 
  Search, 
  RefreshCcw,
  Download,
  Filter,
  Receipt,
  CreditCard,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
  Building2,
  Hash,
  Wallet,
  CalendarDays,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react'

const bookings = [
  {
    id: '4C7443',
    name: 'Yash Jain',
    status: 'Pending',
    statusColor: 'bg-orange-100 text-orange-700',
    contact: '9810095752',
    email: '2101.yjain@gmail.com',
    property: 'Residential',
    unit: 'N/A',
    total: '₹5,15,151',
    paid: '₹151',
    date: '18 Dec 2025'
  }
]

export default function BookingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Bookings Management</h1>
          <p className="text-slate-500 text-sm">Manage all property bookings and client information</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Booking
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Bookings</p>
            <h3 className="text-2xl font-bold text-slate-800">1</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Confirmed</p>
            <h3 className="text-2xl font-bold text-green-600">0</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pending</p>
            <h3 className="text-2xl font-bold text-orange-600">1</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Value</p>
            <h3 className="text-2xl font-bold text-purple-700">₹5,15,151</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-[2]">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, email, phone, ID..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div className="flex-1">
          <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none bg-white font-medium text-slate-700">
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Pending</option>
          </select>
        </div>
        <div className="flex-1">
          <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none bg-white font-medium text-slate-700">
            <option>All Bookings</option>
          </select>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shrink-0">
          <Filter className="w-4 h-4" /> More Filters
        </button>
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        {bookings.map((booking, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              {/* Left: Icon & Name */}
              <div className="flex items-start gap-4 shrink-0">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{booking.name} <span className="text-slate-400 text-sm font-normal">({booking.id})</span></h3>
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${booking.statusColor}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  {/* Detailed Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4 mt-6">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Phone className="w-3.5 h-3.5" /> Contact</div>
                      <div className="font-medium text-slate-700 text-sm">{booking.contact}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Mail className="w-3.5 h-3.5" /> Email</div>
                      <div className="font-medium text-slate-700 text-sm">{booking.email}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Building2 className="w-3.5 h-3.5" /> Property</div>
                      <div className="font-medium text-slate-700 text-sm">{booking.property}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Hash className="w-3.5 h-3.5" /> Unit</div>
                      <div className="font-medium text-slate-700 text-sm">{booking.unit}</div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><IndianRupee className="w-3.5 h-3.5" /> Total</div>
                      <div className="font-bold text-slate-800 text-sm">{booking.total}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Wallet className="w-3.5 h-3.5" /> Paid</div>
                      <div className="font-bold text-green-600 text-sm">{booking.paid}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><CalendarDays className="w-3.5 h-3.5" /> Booked</div>
                      <div className="font-medium text-slate-700 text-sm">{booking.date}</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg text-sm font-medium transition-colors shadow-sm">
                  <Eye className="w-4 h-4" /> View
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg text-sm font-medium transition-colors shadow-sm">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
