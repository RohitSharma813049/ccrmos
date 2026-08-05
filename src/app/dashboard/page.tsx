'use client';

import React, { useState, useEffect } from 'react';
import AnalyticsCharts from "@/components/ui/AnalyticsCharts";
import PageHeader from "@/components/ui/PageHeader";
import DashboardQuickActions from "@/components/ui/DashboardQuickActions";
import { SummaryCard } from '@/components/crm/summary-card'
import { ActivityList, ActivityItemProps } from '@/components/crm/activity-list'
import { Users, Building, Calendar, Phone, MapPin, CheckCircle } from 'lucide-react'

// Maps string iconNames from API back to Lucide components
const iconMap: Record<string, any> = {
  Users, Building, Calendar, Phone, MapPin, CheckCircle
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
        />
        <ActivityList 
          title="Follow - Ups (Next 7 Days)" 
          count={next7DaysFollowUpsList.length} 
          items={next7DaysFollowUpsList} 
          emptyMessage="No follow-ups today"
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
