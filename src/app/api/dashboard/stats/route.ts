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

    // Aggregation pipeline to gather all activities from leads
    // and correctly count and return the recent ones.
    const leadActivitiesAggregation = await Lead.aggregate([
      { $match: tenantQuery },
      { $unwind: "$activities" },
      { 
        $project: {
          _id: "$activities._id",
          leadId: "$_id",
          name: { $concat: ["$firstName", " ", "$lastName"] },
          type: { $toLower: "$activities.type" },
          timestamp: "$activities.timestamp",
          comment: "$activities.description",
          attachmentUrl: "$activities.attachmentUrl"
        } 
      },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                doneMeetings: { $sum: { $cond: [{ $and: [{ $regexMatch: { input: "$type", regex: "meeting" } }, { $lt: ["$timestamp", now] }] }, 1, 0] } },
                pendingMeetings: { $sum: { $cond: [{ $and: [{ $regexMatch: { input: "$type", regex: "meeting" } }, { $gte: ["$timestamp", now] }] }, 1, 0] } },
                doneFollowUps: { $sum: { $cond: [{ $and: [{ $regexMatch: { input: "$type", regex: "follow" } }, { $lt: ["$timestamp", now] }] }, 1, 0] } },
                pendingFollowUps: { $sum: { $cond: [{ $and: [{ $regexMatch: { input: "$type", regex: "follow" } }, { $gte: ["$timestamp", now] }] }, 1, 0] } },
                doneSiteVisits: { $sum: { $cond: [{ $and: [{ $regexMatch: { input: "$type", regex: "visit" } }, { $lt: ["$timestamp", now] }] }, 1, 0] } },
                pendingSiteVisits: { $sum: { $cond: [{ $and: [{ $regexMatch: { input: "$type", regex: "visit" } }, { $gte: ["$timestamp", now] }] }, 1, 0] } }
              }
            }
          ],
          completedMeetingsList: [
            { $match: { type: { $regex: "meeting" }, timestamp: { $lt: now } } },
            { $sort: { timestamp: -1 } },
            { $limit: 5 }
          ],
          next7DaysMeetingsList: [
            { $match: { type: { $regex: "meeting" }, timestamp: { $gte: now, $lte: next7Days } } },
            { $sort: { timestamp: 1 } },
            { $limit: 5 }
          ],
          pendingFollowUpsList: [
            { $match: { type: { $regex: "follow" }, timestamp: { $lt: now } } },
            { $sort: { timestamp: -1 } },
            { $limit: 5 }
          ],
          next7DaysFollowUpsList: [
            { $match: { type: { $regex: "follow" }, timestamp: { $gte: now, $lte: next7Days } } },
            { $sort: { timestamp: 1 } },
            { $limit: 5 }
          ],
          completedSiteVisitsList: [
            { $match: { type: { $regex: "visit" }, timestamp: { $lt: now } } },
            { $sort: { timestamp: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    const leadData = leadActivitiesAggregation[0] || { stats: [] };
    const leadStats = leadData.stats[0] || {
      doneMeetings: 0, pendingMeetings: 0, doneFollowUps: 0, pendingFollowUps: 0, doneSiteVisits: 0, pendingSiteVisits: 0
    };

    const formatActivity = (act: any, status: string) => {
      const actDate = new Date(act.timestamp);
      return {
        id: act._id?.toString() || Math.random().toString(),
        name: act.name,
        comment: act.comment || '',
        date: actDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        time: actDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status,
        timestamp: act.timestamp,
        imagesCount: act.attachmentUrl ? 1 : 0,
        images: act.attachmentUrl ? [act.attachmentUrl] : []
      };
    };

    let doneMeetings = leadStats.doneMeetings;
    let pendingMeetings = leadStats.pendingMeetings;
    let doneFollowUps = leadStats.doneFollowUps;
    let pendingFollowUps = leadStats.pendingFollowUps;
    let doneSiteVisits = leadStats.doneSiteVisits;
    let pendingSiteVisits = leadStats.pendingSiteVisits;

    const completedMeetingsList = (leadData.completedMeetingsList || []).map((a: any) => formatActivity(a, 'done'));
    const next7DaysMeetingsList = (leadData.next7DaysMeetingsList || []).map((a: any) => formatActivity(a, 'pending'));
    const pendingFollowUpsList = (leadData.pendingFollowUpsList || []).map((a: any) => formatActivity(a, 'overdue'));
    const next7DaysFollowUpsList = (leadData.next7DaysFollowUpsList || []).map((a: any) => formatActivity(a, 'pending'));
    const completedSiteVisitsList = (leadData.completedSiteVisitsList || []).map((a: any) => formatActivity(a, 'done'));

    const summaryData = [
      {
        title: 'Open Leads',
        value: totalOpenLeads.toString(),
        iconName: 'Users',
        iconBgColor: 'bg-blue-600',
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
        subtitle: 'Team members'
      },
      {
        title: 'Total Properties',
        value: totalProperties.toString(),
        iconName: 'Building',
        iconBgColor: 'bg-purple-500',
        subtitle: 'Listed properties'
      },
      {
        title: 'Meetings',
        value: (pendingMeetings + doneMeetings).toString(),
        iconName: 'Calendar',
        iconBgColor: 'bg-teal-500',
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
