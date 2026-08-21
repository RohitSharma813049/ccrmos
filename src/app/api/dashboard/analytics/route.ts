import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import Booking from '@/modules/bookings/schemas/Booking';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    const query = userCompanyId ? { companyId: userCompanyId } : {};

    // 1. Lead Status Data
    const leads = await Lead.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Map blank or undefined statuses to 'New'
    const leadStatusData = leads.map(l => ({
      name: l._id ? (l._id.charAt(0).toUpperCase() + l._id.slice(1)) : 'New',
      value: l.count
    }));

    // 2. Booking Revenue Data (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const bookingMatch = { ...query, createdAt: { $gte: sixMonthsAgo } };
    
    const bookings = await Booking.aggregate([
      { $match: bookingMatch },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalValue" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Ensure 6 months are filled even if zero
    const bookingRevenueData = [];
    let current = new Date(sixMonthsAgo);
    const now = new Date();
    
    while (current <= now) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      
      const found = bookings.find(b => b._id.year === year && b._id.month === month);
      bookingRevenueData.push({
        name: `${monthNames[month - 1]} ${year.toString().slice(2)}`,
        revenue: found ? found.revenue : 0,
        count: found ? found.count : 0
      });
      
      current.setMonth(current.getMonth() + 1);
    }

    return NextResponse.json({
      leadStatusData,
      bookingRevenueData
    });

  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
