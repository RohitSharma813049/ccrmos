"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react";
import toast from "react-hot-toast";

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper to get the starting day of the month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface Event {
  _id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  status: string;
}

export default function CalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [systemUsers, setSystemUsers] = useState<{name: string, email: string}[]>([]);
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Event Form State
  const [formData, setFormData] = useState({
    title: "",
    type: "Meeting",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    attendees: ""
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Generate grid cells
  const gridCells = [];
  for (let i = 0; i < firstDay; i++) {
    gridCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    gridCells.push(i);
  }
  const totalCells = Math.ceil(gridCells.length / 7) * 7;
  while (gridCells.length < totalCells) {
    gridCells.push(null);
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const start = new Date(year, month, 1).toISOString();
      const end = new Date(year, month + 1, 0).toISOString();
      const res = await fetch(`/api/tasks?startDate=${start}&endDate=${end}&limit=100`);
      const data = await res.json();
      if (res.ok) {
        setEvents(data.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [year, month]);

  useEffect(() => {
    fetch('/api/users?limit=100').then(r => r.json()).then(data => {
      if (data.users) {
        setSystemUsers(data.users.map((u: any) => ({ name: `${u.firstName} ${u.lastName}`, email: u.email })));
      }
    }).catch(e => console.error("Failed to load users", e));
  }, []);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      return toast.error("Please fill all required fields");
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);

    const payload = {
      title: formData.title,
      type: formData.type,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      location: formData.location,
      attendees: formData.attendees.split(",").map(a => a.trim()).filter(Boolean),
      status: "Pending",
      description: "" // required by Task schema
    };

    try {
      const url = selectedEvent ? `/api/tasks?id=${selectedEvent._id}` : "/api/tasks";
      const method = selectedEvent ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(`Event ${selectedEvent ? 'updated' : 'scheduled'} successfully!`);
        setIsModalOpen(false);
        setIsSidePanelOpen(false);
        setSelectedEvent(null);
        fetchEvents();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (err) {
      toast.error("Failed to save event");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/tasks?id=${selectedEvent._id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Event deleted!");
        setIsSidePanelOpen(false);
        setSelectedEvent(null);
        fetchEvents();
      } else {
        toast.error("Failed to delete event");
      }
    } catch (err) {
      toast.error("Error deleting event");
    }
  };

  const openNewEventModal = (day: number) => {
    setSelectedEvent(null);
    setFormData({
      title: "",
      type: "Meeting",
      date: `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      attendees: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    if (!selectedEvent) return;
    const start = new Date(selectedEvent.startTime);
    const end = new Date(selectedEvent.endTime);
    setFormData({
      title: selectedEvent.title,
      type: selectedEvent.type,
      date: `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`,
      startTime: `${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}`,
      endTime: `${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`,
      location: selectedEvent.location || "",
      attendees: selectedEvent.attendees ? selectedEvent.attendees.join(", ") : ""
    });
    setIsSidePanelOpen(false);
    setIsModalOpen(true);
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      if (!e.startTime) return false;
      const d = new Date(e.startTime);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              {currentDate.toLocaleString("default", { month: "long" })} {year}
            </h1>
            <p className="text-slate-500 text-sm font-medium">Manage your schedule and meetings</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium hover:bg-white rounded hover:shadow-sm text-slate-700">
              Today
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => openNewEventModal(new Date().getDate())}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Schedule Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 bg-slate-100 gap-[1px]">
          {gridCells.map((day, idx) => {
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const dayEvents = day ? getEventsForDay(day) : [];
            
            return (
              <div 
                key={idx} 
                className={`min-h-[120px] bg-white p-2 ${!day ? 'bg-slate-50' : 'hover:bg-slate-50 cursor-pointer transition-colors'} ${isToday ? 'ring-2 ring-inset ring-purple-600' : ''}`}
                onClick={() => {
                  if (day) openNewEventModal(day);
                }}
              >
                {day && (
                  <div className="flex flex-col h-full">
                    <span className={`text-sm font-semibold mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-purple-600 text-white' : 'text-slate-700'}`}>
                      {day}
                    </span>
                    <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar pr-1">
                      {dayEvents.map(ev => {
                        const isMeeting = ev.type === 'Meeting';
                        const isSiteVisit = ev.type === 'Site Visit';
                        const time = new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div 
                            key={ev._id} 
                            title={ev.title}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(ev);
                              setIsSidePanelOpen(true);
                            }}
                            className={`text-xs px-1.5 py-1 rounded border truncate font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                              isMeeting ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                              isSiteVisit ? 'bg-orange-50 border-orange-200 text-orange-700' : 
                              'bg-purple-50 border-purple-200 text-purple-700'
                            }`}
                          >
                            {time} - {ev.title}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Side Panel for Event Details */}
      {isSidePanelOpen && selectedEvent && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[9998]" onClick={() => setIsSidePanelOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white shadow-2xl z-[9999] border-l border-slate-200 flex flex-col transform transition-transform duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-slate-900">Event Details</h3>
              <button onClick={() => setIsSidePanelOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-light">&times;</button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full mb-3 ${selectedEvent.type === 'Meeting' ? 'bg-blue-100 text-blue-700' : selectedEvent.type === 'Site Visit' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                  {selectedEvent.type}
                </span>
                <h4 className="text-2xl font-bold text-slate-900">{selectedEvent.title}</h4>
              </div>

              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Date & Time</p>
                    <p className="text-sm text-slate-600">{new Date(selectedEvent.startTime).toLocaleDateString()} • {new Date(selectedEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedEvent.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Location</p>
                      <p className="text-sm text-slate-600">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Attendees</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedEvent.attendees.map((email, i) => (
                          <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">{email}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={openEditModal} className="flex-1 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Edit Event
              </button>
              <button onClick={handleDeleteEvent} className="flex-1 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">{selectedEvent ? 'Edit Event' : 'Schedule Event'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Discuss Q3 targets" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                    <option value="Task">Task</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Site Visit">Site Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
                  <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
                  <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location (Optional)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Office, Zoom link, Address..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Attendees (Emails, comma separated)</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="text" value={formData.attendees} onChange={e => setFormData({...formData, attendees: e.target.value})} className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="john@example.com, sarah@..." />
                </div>
                {systemUsers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {systemUsers.map((u, i) => (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => {
                          const current = formData.attendees.split(',').map(a=>a.trim()).filter(Boolean);
                          if (!current.includes(u.email)) {
                            setFormData({...formData, attendees: [...current, u.email].join(', ')});
                          }
                        }}
                        className="text-xs px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-full text-purple-700 font-medium transition-colors"
                      >
                        + {u.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded-lg text-slate-700 font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">{selectedEvent ? 'Save Changes' : 'Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
