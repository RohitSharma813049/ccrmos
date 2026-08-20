'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'meeting' | 'tour' | 'call' | 'open_house';
  time: string;
  location?: string;
}

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'Client Meeting - Sarah Jenkins', date: new Date(), type: 'meeting', time: '10:00 AM' },
  { id: '2', title: 'Property Tour - Ocean Dr', date: new Date(), type: 'tour', time: '2:30 PM', location: '123 Ocean Dr' },
  { id: '3', title: 'Call with Acme Corp', date: new Date(new Date().setDate(new Date().getDate() + 1)), type: 'call', time: '11:00 AM' },
  { id: '4', title: 'Open House', date: new Date(new Date().setDate(new Date().getDate() + 2)), type: 'open_house', time: '1:00 PM', location: '456 City Center' },
  { id: '5', title: 'Contract Signing', date: new Date(new Date().setDate(new Date().getDate() - 2)), type: 'meeting', time: '4:00 PM' },
];

const eventStyles = {
  meeting: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
  tour: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
  call: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
  open_house: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
};

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (day: number) => {
    return mockEvents.filter(event => {
      return event.date.getDate() === day &&
             event.date.getMonth() === currentDate.getMonth() &&
             event.date.getFullYear() === currentDate.getFullYear();
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-2xl border border-zinc-800/60 overflow-hidden shadow-xl animate-in fade-in duration-500">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-zinc-100 min-w-[200px]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-1">
            <button 
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white rounded-xl shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Event</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-zinc-800/60 bg-zinc-900/20">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-auto">
          {/* Empty cells for start of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="border-b border-r border-zinc-800/40 bg-zinc-900/10 min-h-[100px]" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);
            const today = isToday(day);

            return (
              <div 
                key={day} 
                className={`border-b border-r border-zinc-800/40 p-1 sm:p-2 min-h-[100px] hover:bg-zinc-900/30 transition-colors group relative ${today ? 'bg-indigo-500/5 hover:bg-indigo-500/10' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full ${
                    today 
                      ? 'bg-indigo-500 text-white' 
                      : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}>
                    {day}
                  </span>
                </div>
                
                <div className="mt-1 flex flex-col gap-1 overflow-y-auto max-h-[80px] sm:max-h-[120px] scrollbar-none">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`px-2 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${eventStyles[event.type]}`}
                    >
                      <div className="font-semibold truncate">{event.title}</div>
                      <div className="flex items-center gap-2 mt-1 opacity-80 text-[10px] sm:text-xs">
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty cells for end of month */}
          {Array.from({ length: (42 - (firstDayOfMonth + daysInMonth)) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="border-b border-r border-zinc-800/40 bg-zinc-900/10 min-h-[100px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
