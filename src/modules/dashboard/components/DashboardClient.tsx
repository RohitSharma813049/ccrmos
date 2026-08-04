"use client";

import React, { useEffect, useState } from 'react'
import { SummaryCard } from '@/components/crm/summary-card'
import { ActivityList, ActivityItemProps } from '@/components/crm/activity-list'
import { Users, Building, Calendar, Phone, MapPin, CheckCircle } from 'lucide-react'

export default function DashboardClient() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;

  const summaryData = [
    {
      title: 'Open Leads',
      value: (stats.openLeads + stats.closedLeads).toString(),
      icon: Users,
      iconBgColor: 'bg-blue-600',
      badges: [
        { label: 'Open', value: stats.openLeads.toString(), color: 'blue' as const },
        { label: 'Closed', value: stats.closedLeads.toString(), color: 'green' as const },
      ]
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toString(),
      icon: Users,
      iconBgColor: 'bg-green-500',
      subtitle: 'Team members'
    },
    {
      title: 'Total Properties',
      value: stats.totalProperties.toString(),
      icon: Building,
      iconBgColor: 'bg-purple-500',
      subtitle: 'Listed properties'
    },
    {
      title: 'Meetings',
      value: (stats.meetings.pending + stats.meetings.done).toString(),
      icon: Calendar,
      iconBgColor: 'bg-teal-500',
      badges: [
        { label: 'Pending', value: stats.meetings.pending.toString(), color: 'yellow' as const },
        { label: 'Done', value: stats.meetings.done.toString(), color: 'green' as const },
      ]
    },
    {
      title: 'Follow-ups',
      value: (stats.followUps.pending + stats.followUps.done).toString(),
      icon: Phone,
      iconBgColor: 'bg-amber-500',
      badges: [
        { label: 'Pending', value: stats.followUps.pending.toString(), color: 'yellow' as const },
        { label: 'Done', value: stats.followUps.done.toString(), color: 'green' as const },
      ]
    },
    {
      title: 'Site Visits',
      value: (stats.siteVisits.pending + stats.siteVisits.done).toString(),
      icon: MapPin,
      iconBgColor: 'bg-cyan-500',
      badges: [
        { label: 'Pending', value: stats.siteVisits.pending.toString(), color: 'yellow' as const },
        { label: 'Done', value: stats.siteVisits.done.toString(), color: 'green' as const },
      ]
    },
    {
      title: 'Bookings',
      value: (stats.bookings.confirmed + stats.bookings.pending).toString(),
      icon: CheckCircle,
      iconBgColor: 'bg-pink-500',
      badges: [
        { label: 'Confirmed', value: stats.bookings.confirmed.toString(), color: 'green' as const },
        { label: 'Pending', value: stats.bookings.pending.toString(), color: 'yellow' as const },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">System overview & team activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item, index) => (
          <SummaryCard 
            key={index}
            {...item}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActivityList 
          title="Meetings (Next 7 Days)" 
          count={0} 
          items={[]} 
          emptyMessage="No meetings found"
        />
        <ActivityList 
          title="Follow - Ups (Next 7 Days)" 
          count={0} 
          items={[]} 
          emptyMessage="No follow-ups today"
        />
      </div>

      <div className="space-y-4">
        <ActivityList 
          title="Completed Meetings" 
          count={stats.completedMeetings.length} 
          items={stats.completedMeetings} 
        />
        <ActivityList 
          title="Completed Site Visits" 
          count={stats.completedSiteVisits.length} 
          items={stats.completedSiteVisits} 
        />
        <ActivityList 
          title="Pending Follow-ups (Overdue)" 
          count={stats.pendingFollowUps.length}
          items={stats.pendingFollowUps} 
        />
      </div>
    </div>
  )
}
