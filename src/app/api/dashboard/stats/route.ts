import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import User from '@/modules/users/schemas/User';
import Booking from '@/modules/bookings/schemas/Booking';
import Property from '@/modules/properties/schemas/Property';
import Task from '@/modules/tasks/schemas/Task';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    const tenantQuery = buildTenantQuery(user);

    const [
      totalOpenLeads,
      totalClosedLeads,
      activeUsers,
      totalProperties,
      totalBookings,
      pendingBookings
    ] = await Promise.all([
      Lead.countDocuments({ ...tenantQuery, status: { $ne: 'Closed' } }),
      Lead.countDocuments({ ...tenantQuery, status: 'Closed' }),
      User.countDocuments({ ...tenantQuery }),
      Property.countDocuments({ ...tenantQuery }),
      Booking ? Booking.countDocuments({ ...tenantQuery, status: 'confirmed' }) : 0,
      Booking ? Booking.countDocuments({ ...tenantQuery, status: { $ne: 'confirmed' } }) : 0
    ]);

    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    const tasks = await Task.find(tenantQuery).lean();

    let doneMeetings = 0;
    let pendingMeetings = 0;
    let doneFollowUps = 0;
    let pendingFollowUps = 0;
    let doneSiteVisits = 0;
    let pendingSiteVisits = 0;

    const rawCompletedMeetingsList: any[] = [];
    const rawNext7DaysMeetingsList: any[] = [];
    const rawPendingFollowUpsList: any[] = [];
    const rawNext7DaysFollowUpsList: any[] = [];
    const rawCompletedSiteVisitsList: any[] = [];

    const formatActivity = (act: any, status: string) => {
      const actDate = act.startTime ? new Date(act.startTime) : new Date(act.createdAt);
      return {
        id: act._id?.toString() || Math.random().toString(),
        name: act.title,
        comment: act.description || '',
        date: actDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        time: actDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status,
        timestamp: act.startTime || act.createdAt,
        imagesCount: 0,
        images: [],
        location: act.location
      };
    };

    for (const task of tasks) {
      const t = task.startTime ? new Date(task.startTime) : new Date(task.createdAt);
      const isPast = t < now;
      const isNext7Days = t >= now && t <= next7Days;
      const isDone = task.status === 'Completed';

      if (task.type === 'Meeting') {
        if (isDone) {
          doneMeetings++;
          rawCompletedMeetingsList.push(task);
        } else {
          pendingMeetings++;
          if (isNext7Days) rawNext7DaysMeetingsList.push(task);
        }
      } else if (task.type === 'Task') { // Follow-up
        if (isDone) {
          doneFollowUps++;
        } else {
          pendingFollowUps++;
          if (isPast) rawPendingFollowUpsList.push(task);
          else if (isNext7Days) rawNext7DaysFollowUpsList.push(task);
        }
      } else if (task.type === 'Site Visit') {
        if (isDone) {
          doneSiteVisits++;
          rawCompletedSiteVisitsList.push(task);
        } else {
          pendingSiteVisits++;
        }
      }
    }

    const sortByTimeDesc = (a: any, b: any) => (new Date(b.startTime || b.createdAt).getTime()) - (new Date(a.startTime || a.createdAt).getTime());
    const sortByTimeAsc = (a: any, b: any) => (new Date(a.startTime || a.createdAt).getTime()) - (new Date(b.startTime || b.createdAt).getTime());

    rawCompletedMeetingsList.sort(sortByTimeDesc).splice(5);
    rawNext7DaysMeetingsList.sort(sortByTimeAsc).splice(5);
    rawPendingFollowUpsList.sort(sortByTimeDesc).splice(5);
    rawNext7DaysFollowUpsList.sort(sortByTimeAsc).splice(5);
    rawCompletedSiteVisitsList.sort(sortByTimeDesc).splice(5);

    const completedMeetingsList = rawCompletedMeetingsList.map((a: any) => formatActivity(a, 'done'));
    const next7DaysMeetingsList = rawNext7DaysMeetingsList.map((a: any) => formatActivity(a, 'pending'));
    const pendingFollowUpsList = rawPendingFollowUpsList.map((a: any) => formatActivity(a, 'overdue'));
    const next7DaysFollowUpsList = rawNext7DaysFollowUpsList.map((a: any) => formatActivity(a, 'pending'));
    const completedSiteVisitsList = rawCompletedSiteVisitsList.map((a: any) => formatActivity(a, 'done'));

    const summaryData = [
      {
        title: 'Open Leads',
        value: totalOpenLeads.toString(),
        iconName: 'Users',
        iconBgColor: 'bg-blue-600',
        href: '/dashboard/leads',
        badges: [
          { label: 'Open', value: totalOpenLeads.toString(), color: 'blue' },
          { label: 'Closed', value: totalClosedLeads.toString(), color: 'green' },
        ]
      },
      {
        title: 'Active Users',
        value: activeUsers.toString(),
        iconName: 'Users',
        iconBgColor: 'bg-green-500',
        subtitle: 'Team members',
        href: '/settings/roles'
      },
      {
        title: 'Total Properties',
        value: totalProperties.toString(),
        iconName: 'Building',
        iconBgColor: 'bg-purple-500',
        subtitle: 'Listed properties',
        href: '/dashboard/properties'
      },
      {
        title: 'Meetings',
        value: (pendingMeetings + doneMeetings).toString(),
        iconName: 'Calendar',
        iconBgColor: 'bg-teal-500',
        href: '/dashboard/calendar',
        badges: [
          { label: 'Pending', value: pendingMeetings.toString(), color: 'yellow' },
          { label: 'Done', value: doneMeetings.toString(), color: 'green' },
        ]
      },
      {
        title: 'Follow-ups',
        value: (pendingFollowUps + doneFollowUps).toString(),
        iconName: 'Phone',
        iconBgColor: 'bg-amber-500',
        href: '/dashboard/tasks',
        badges: [
          { label: 'Pending', value: pendingFollowUps.toString(), color: 'yellow' },
          { label: 'Done', value: doneFollowUps.toString(), color: 'green' },
        ]
      },
      {
        title: 'Site Visits',
        value: (pendingSiteVisits + doneSiteVisits).toString(),
        iconName: 'MapPin',
        iconBgColor: 'bg-cyan-500',
        href: '/dashboard/tasks',
        badges: [
          { label: 'Pending', value: pendingSiteVisits.toString(), color: 'yellow' },
          { label: 'Done', value: doneSiteVisits.toString(), color: 'green' },
        ]
      },
      {
        title: 'Bookings',
        value: (totalBookings + pendingBookings).toString(),
        iconName: 'CheckCircle',
        iconBgColor: 'bg-pink-500',
        href: '/dashboard/bookings',
        badges: [
          { label: 'Confirmed', value: totalBookings.toString(), color: 'green' },
          { label: 'Pending', value: pendingBookings.toString(), color: 'yellow' },
        ]
      }
    ];

    return NextResponse.json({
      summaryData,
      completedMeetingsList,
      completedSiteVisitsList,
      pendingFollowUpsList,
      next7DaysMeetingsList,
      next7DaysFollowUpsList,
      pendingFollowUpsTotal: pendingFollowUpsList.length
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
