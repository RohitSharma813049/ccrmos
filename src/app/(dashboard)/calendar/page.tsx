import React from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <div className="h-[calc(100vh-8rem)] min-h-[600px] flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Schedule</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your property tours, open houses, and client meetings.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <CalendarView />
      </div>
    </div>
  );
}
