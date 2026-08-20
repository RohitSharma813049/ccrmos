import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteVisit from '@/modules/bookings/schemas/SiteVisit';
import Lead from '@/modules/leads/schemas/Lead';
import Property from '@/modules/properties/schemas/Property';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    // Fetch all scheduled site visits for this company, populate lead and property details
    const visits = await SiteVisit.find({ companyId: user.companyId })
      .populate('leadId', 'firstName lastName phone email')
      .populate('propertyId', 'title location')
      .populate('agentId', 'name email')
      .sort({ dateTime: 1 })
      .lean();

    return NextResponse.json({ visits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const { leadId, propertyId, agentId, dateTime, durationMinutes = 60, notes } = await req.json();

    const visit = await SiteVisit.create({
      companyId: user.companyId,
      leadId,
      propertyId,
      agentId,
      dateTime,
      durationMinutes,
      notes,
      status: "Scheduled"
    });

    // Generate Google Calendar Link
    const lead = await Lead.findById(leadId).select('firstName lastName phone');
    const property = await Property.findById(propertyId).select('title location');
    
    if (lead && property) {
      const startDate = new Date(dateTime);
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
      
      // Format YYYYMMDDTHHmmssZ
      const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
      
      const text = encodeURIComponent(`Site Visit: ${property.title}`);
      const details = encodeURIComponent(`Meeting with Lead: ${lead.firstName} ${lead.lastName}\nPhone: ${lead.phone || 'N/A'}\n\nNotes: ${notes || 'None'}`);
      const location = encodeURIComponent(property.location || 'TBD');
      
      const gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${formatGCalDate(startDate)}/${formatGCalDate(endDate)}&details=${details}&location=${location}`;
      
      return NextResponse.json({ visit, googleCalendarLink: gcalLink });
    }

    return NextResponse.json({ visit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
