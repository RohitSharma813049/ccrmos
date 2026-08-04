import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import User from '@/modules/users/schemas/User';
import Project from '@/modules/projects/schemas/Project';
import Property from '@/modules/properties/schemas/Property';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    const queryScope = buildTenantQuery(user);

    // 1. Open Leads
    const openLeadsCount = await Lead.countDocuments({ ...queryScope, status: { $ne: 'Converted' }, stageId: { $ne: null } });
    const closedLeadsCount = await Lead.countDocuments({ ...queryScope, status: 'Converted' });

    // 2. Active Users
    const activeUsersCount = await User.countDocuments({ companyId: user.companyId, active: true });

    // 3. Properties (Or Projects if properties schema isn't populated)
    let propertiesCount = 0;
    try {
      propertiesCount = await Property.countDocuments(queryScope);
    } catch {
      propertiesCount = await Project.countDocuments(queryScope);
    }

    // Since Meetings, Follow-ups, Site visits, Bookings are part of Leads Activity or Tasks,
    // we'll fetch mock counts for now or real counts if they exist in a Task model.
    // For this demonstration, we'll return zeroes for those if not implemented.

    return NextResponse.json({
      openLeads: openLeadsCount,
      closedLeads: closedLeadsCount,
      activeUsers: activeUsersCount,
      totalProperties: propertiesCount,
      meetings: { pending: 0, done: 0 },
      followUps: { pending: 0, done: 0 },
      siteVisits: { pending: 0, done: 0 },
      bookings: { confirmed: 0, pending: 0 },
      completedMeetings: [],
      completedSiteVisits: [],
      pendingFollowUps: []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
