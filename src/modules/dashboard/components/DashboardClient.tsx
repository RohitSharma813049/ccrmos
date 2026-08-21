"use client";

import React, { useEffect, useState } from 'react'
import { SummaryCard } from '@/components/crm/summary-card'
import { ActivityList, ActivityItemProps } from '@/components/crm/activity-list'
import { Users, Building, Calendar, Phone, MapPin, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function DashboardClient() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);

        // Check for upcoming meetings (within 15 minutes)
        if (data.next7DaysMeetingsList && data.next7DaysMeetingsList.length > 0) {
          const now = new Date().getTime();
          data.next7DaysMeetingsList.forEach((meeting: any) => {
            if (meeting.timestamp) {
              const meetingTime = new Date(meeting.timestamp).getTime();
              const timeDiff = meetingTime - now;
              // If meeting is within the next 15 minutes (or currently happening up to 15 mins late)
              if (timeDiff <= 15 * 60 * 1000 && timeDiff >= -15 * 60 * 1000) {
                const isLate = timeDiff < 0;
                toast(
                  (t) => (
                    <div>
                      <div className="font-semibold text-zinc-100">{isLate ? 'Meeting in progress' : 'Upcoming Meeting'}</div>
                      <div className="text-sm text-zinc-400 mb-3">{meeting.name} is scheduled for {meeting.time}.</div>
                      <div className="flex gap-2">
                        <a 
                          href={meeting.location && meeting.location.includes('http') ? meeting.location : "https://meet.google.com/new"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => toast.dismiss(t.id)}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs font-semibold"
                        >
                          Join Now
                        </a>
                        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-slate-100 text-zinc-300 rounded-md text-xs font-semibold">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ),
                  { duration: 10000, icon: '📅' }
                );
              }
            }
          });
        }
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' })
      });
      if (res.ok) {
        toast.success("Marked as done!");
        fetchData();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Error updating status");
    }
  };

  const handleEdit = (id: string) => {
    toast("To edit, please navigate to the Tasks or Calendar page.", { icon: "ℹ️" });
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;

  const iconMap: Record<string, React.ElementType> = {
    Users, Building, Calendar, Phone, MapPin, CheckCircle
  };

  const summaryData = (stats.summaryData || []).map((item: any) => ({
    ...item,
    icon: iconMap[item.iconName] || Users
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">System overview & team activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item: any, index: number) => (
          <SummaryCard 
            key={index}
            {...item}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActivityList 
          title="Meetings (Next 7 Days)" 
          count={stats.next7DaysMeetingsList?.length || 0} 
          items={stats.next7DaysMeetingsList || []} 
          emptyMessage="No meetings found"
          showMeetButton={true}
          onComplete={handleComplete}
          onEdit={handleEdit}
        />
        <ActivityList 
          title="Follow - Ups (Next 7 Days)" 
          count={stats.next7DaysFollowUpsList?.length || 0} 
          items={stats.next7DaysFollowUpsList || []} 
          emptyMessage="No follow-ups today"
          onComplete={handleComplete}
          onEdit={handleEdit}
        />
      </div>

      <div className="space-y-4">
        <ActivityList 
          title="Completed Meetings" 
          count={stats.completedMeetingsList?.length || 0} 
          items={stats.completedMeetingsList || []} 
        />
        <ActivityList 
          title="Completed Site Visits" 
          count={stats.completedSiteVisitsList?.length || 0} 
          items={stats.completedSiteVisitsList || []} 
        />
        <ActivityList 
          title="Pending Follow-ups (Overdue)" 
          count={stats.pendingFollowUpsList?.length || 0}
          items={stats.pendingFollowUpsList || []} 
        />
      </div>
    </div>
  )
}
