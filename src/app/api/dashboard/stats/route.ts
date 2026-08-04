import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import User from '@/modules/users/schemas/User';
import Booking from '@/modules/bookings/schemas/Booking';
import Property from '@/modules/properties/schemas/Property';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

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
      pendingBookings,
      leads
    ] = await Promise.all([
      Lead.countDocuments({ ...tenantQuery, status: { $ne: 'Closed' } }),
      Lead.countDocuments({ ...tenantQuery, status: 'Closed' }),
      User.countDocuments({ ...tenantQuery }),
      Property.countDocuments({ ...tenantQuery }),
      Booking ? Booking.countDocuments({ ...tenantQuery, status: 'confirmed' }) : 0,
      Booking ? Booking.countDocuments({ ...tenantQuery, status: { $ne: 'confirmed' } }) : 0,
      Lead.find({ ...tenantQuery }).select('activities firstName lastName')
    ]);

    let pendingMeetings = 0;
    let doneMeetings = 0;
    let pendingFollowUps = 0;
    let doneFollowUps = 0;
    let pendingSiteVisits = 0;
    let doneSiteVisits = 0;

    const completedMeetingsList: any[] = [];
    const completedSiteVisitsList: any[] = [];
    const pendingFollowUpsList: any[] = [];
    const next7DaysMeetingsList: any[] = [];
    const next7DaysFollowUpsList: any[] = [];

    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    leads.forEach((lead) => {
      if (!lead.activities || lead.activities.length === 0) return;

      lead.activities.forEach((act: any) => {
        const actDate = new Date(act.timestamp);
        const isPast = actDate < now;
        const isNext7Days = actDate >= now && actDate <= next7Days;

        const typeLower = act.type?.toLowerCase() || '';

        const itemProps = {
          id: act._id?.toString() || Math.random().toString(),
          name: `${lead.firstName} ${lead.lastName}`,
          comment: act.description || '',
          date: actDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          time: actDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: isPast ? 'done' : 'overdue'
        };

        if (typeLower.includes('meeting')) {
          if (isPast) {
            doneMeetings++;
            completedMeetingsList.push({ ...itemProps, status: 'done' });
          } else {
            pendingMeetings++;
            if (isNext7Days) next7DaysMeetingsList.push({ ...itemProps, status: 'pending' });
          }
        } else if (typeLower.includes('follow-up') || typeLower.includes('followup')) {
          if (isPast) {
            doneFollowUps++;
            pendingFollowUpsList.push({ ...itemProps, status: 'overdue' });
          } else {
            pendingFollowUps++;
            if (isNext7Days) next7DaysFollowUpsList.push({ ...itemProps, status: 'pending' });
          }
        } else if (typeLower.includes('site visit') || typeLower.includes('visit')) {
          if (isPast) {
            doneSiteVisits++;
            completedSiteVisitsList.push({ ...itemProps, status: 'done', imagesCount: act.attachmentUrl ? 1 : 0, images: act.attachmentUrl ? [act.attachmentUrl] : [] });
          } else {
            pendingSiteVisits++;
          }
        }
      });
    });

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
      completedMeetingsList: completedMeetingsList.slice(0, 5),
      completedSiteVisitsList: completedSiteVisitsList.slice(0, 5),
      pendingFollowUpsList: pendingFollowUpsList.slice(0, 5),
      next7DaysMeetingsList: next7DaysMeetingsList.slice(0, 5),
      next7DaysFollowUpsList: next7DaysFollowUpsList.slice(0, 5),
      pendingFollowUpsTotal: pendingFollowUpsList.length
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
