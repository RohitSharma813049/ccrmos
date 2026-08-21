'use client';

import React, { useState, useEffect } from 'react';
import AnalyticsCharts from "@/components/ui/AnalyticsCharts";
import PageHeader from "@/components/ui/PageHeader";
import DashboardQuickActions from "@/components/ui/DashboardQuickActions";
import { SummaryCard } from '@/components/crm/summary-card'
import { ActivityList, ActivityItemProps } from '@/components/crm/activity-list'
import { Users, Building, Calendar, Phone, MapPin, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Maps string iconNames from API back to Lucide components
const iconMap: Record<string, any> = {
  Users, Building, Calendar, Phone, MapPin, CheckCircle
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const json = await res.json();
      setData(json);

        // Check for upcoming meetings (within 15 minutes)
        if (json.next7DaysMeetingsList && json.next7DaysMeetingsList.length > 0) {
          const now = new Date().getTime();
          json.next7DaysMeetingsList.forEach((meeting: any) => {
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
                        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-zinc-800/50 text-zinc-300 rounded-md text-xs font-semibold">
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
      } catch (err) {
        console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
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
    // For now, redirect to calendar where they can edit events, or just show a message.
    toast("To edit, please navigate to the Tasks or Calendar page.", { icon: "ℹ️" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const {
    summaryData = [],
    completedMeetingsList = [],
    completedSiteVisitsList = [],
    pendingFollowUpsList = [],
    next7DaysMeetingsList = [],
    next7DaysFollowUpsList = [],
    pendingFollowUpsTotal = 0
  } = data || {};

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader 
        title="Admin Dashboard" 
        description="System overview & team activities." 
      />
      
      <DashboardQuickActions />
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item: any, index: number) => {
          const Icon = iconMap[item.iconName] || Users;
          return (
            <SummaryCard 
              key={index}
              title={item.title}
              value={item.value}
              icon={Icon}
              iconBgColor={item.iconBgColor}
              subtitle={item.subtitle}
              badges={item.badges}
            />
          );
        })}
      </div>

      <AnalyticsCharts />

      {/* Upcoming Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActivityList 
          title="Meetings (Next 7 Days)" 
          count={next7DaysMeetingsList.length} 
          items={next7DaysMeetingsList} 
          emptyMessage="No meetings found"
          showMeetButton={true}
          onComplete={handleComplete}
          onEdit={handleEdit}
        />
        <ActivityList 
          title="Follow - Ups (Next 7 Days)" 
          count={next7DaysFollowUpsList.length} 
          items={next7DaysFollowUpsList} 
          emptyMessage="No follow-ups today"
          onComplete={handleComplete}
          onEdit={handleEdit}
        />
      </div>

      {/* Completed Activities & Pending */}
      <div className="space-y-4">
        <ActivityList 
          title="Completed Meetings" 
          count={completedMeetingsList.length} 
          items={completedMeetingsList} 
        />
        <ActivityList 
          title="Completed Site Visits" 
          count={completedSiteVisitsList.length} 
          items={completedSiteVisitsList} 
        />
        <ActivityList 
          title="Pending Follow-ups (Overdue)" 
          count={pendingFollowUpsList.length}
          totalCount={pendingFollowUpsTotal}
          items={pendingFollowUpsList} 
        />
      </div>

    </div>
  );
}
