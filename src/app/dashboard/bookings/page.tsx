'use client'

import React, { useState, useEffect } from 'react'
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
  Trash2,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Booking {
  _id: string;
  bookingId: string;
  name: string;
  status: string;
  contact: string;
  email: string;
  property: string;
  unit: string;
  totalValue: number;
  paidAmount: number;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [searchQuery, statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      let url = '/api/bookings?'
      if (searchQuery) url += `search=${searchQuery}&`
      if (statusFilter !== 'All') url += `status=${statusFilter}&`
      
      const res = await fetch(url)
      const data = await res.json()
      if (data.bookings) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Booking deleted')
        fetchBookings()
      } else {
        toast.error('Failed to delete booking')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error deleting booking')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const totalValue = bookings.reduce((sum, b) => sum + b.totalValue, 0)
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length
  const pendingCount = bookings.filter(b => b.status === 'Pending').length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Bookings Management</h1>
          <p className="text-slate-500 text-sm">Manage all property bookings and client information</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Booking
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Bookings</p>
            <h3 className="text-2xl font-bold text-slate-800">{bookings.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Confirmed</p>
            <h3 className="text-2xl font-bold text-green-600">{confirmedCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pending</p>
            <h3 className="text-2xl font-bold text-orange-600">{pendingCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Value</p>
            <h3 className="text-2xl font-bold text-purple-700">{formatCurrency(totalValue)}</h3>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div className="flex-1">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none bg-white font-medium text-slate-700"
          >
            <option value="All">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <Receipt className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusColor = booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                               booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                               'bg-orange-100 text-orange-700';

            return (
              <div key={booking._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  
                  {/* Left: Icon & Name */}
                  <div className="flex items-start gap-4 shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-slate-900">{booking.name} <span className="text-slate-400 text-sm font-normal">({booking.bookingId})</span></h3>
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${statusColor}`}>
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
                          <div className="font-medium text-slate-700 text-sm">{booking.email || 'N/A'}</div>
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
                          <div className="font-bold text-slate-800 text-sm">{formatCurrency(booking.totalValue)}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Wallet className="w-3.5 h-3.5" /> Paid</div>
                          <div className="font-bold text-green-600 text-sm">{formatCurrency(booking.paidAmount)}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><CalendarDays className="w-3.5 h-3.5" /> Booked</div>
                          <div className="font-medium text-slate-700 text-sm">{new Date(booking.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    <button 
                      onClick={() => handleDelete(booking._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Booking Modal */}
      {isModalOpen && (
        <BookingFormModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchBookings()
          }}
        />
      )}
    </div>
  )
}

function BookingFormModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    property: '',
    unit: 'N/A',
    totalValue: '',
    paidAmount: '',
    status: 'Pending'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalValue: Number(formData.totalValue),
          paidAmount: Number(formData.paidAmount)
        })
      })
      if (res.ok) {
        toast.success('Booking added successfully!')
        onSuccess()
      } else {
        toast.error('Failed to add booking')
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Add New Booking</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone *</label>
              <input required type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Property / Project *</label>
              <input required type="text" value={formData.property} onChange={e => setFormData({...formData, property: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit #</label>
              <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Value (₹) *</label>
              <input required type="number" min="0" value={formData.totalValue} onChange={e => setFormData({...formData, totalValue: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Paid Amount (₹)</label>
              <input type="number" min="0" value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-slate-700 font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
