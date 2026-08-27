import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';
import Lead from '@/modules/leads/schemas/Lead';
import Invoice from '@/modules/invoices/schemas/Invoice';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const url = new URL(req.url);
    const startDateStr = url.searchParams.get('startDate');
    const endDateStr = url.searchParams.get('endDate');

    const matchQuery: any = buildTenantQuery(user);
    
    if (startDateStr && endDateStr) {
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
      matchQuery.createdAt = {
        $gte: new Date(startDateStr),
        $lte: end
      };
    }

    // 1. Leads Analytics
    const leads = await Lead.find(matchQuery).lean();
    
    const activeLeadsCount = leads.filter((l: any) => l.status !== 'Converted' && l.status !== 'Lost').length;
    const totalLeadsCount = leads.length;
    const convertedLeadsCount = leads.filter((l: any) => l.status === 'Converted').length;
    
    const conversionRate = totalLeadsCount > 0 ? (convertedLeadsCount / totalLeadsCount) * 100 : 0;

    const leadStatusDistribution = leads.reduce((acc: any, lead: any) => {
      const status = lead.status || 'New';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusChartData = Object.keys(leadStatusDistribution).map(status => ({
      name: status,
      value: leadStatusDistribution[status]
    }));

    // 2. Invoices Analytics
    const invoices = await Invoice.find(matchQuery).lean();
    
    const totalRevenue = invoices
      .filter((i: any) => i.status === 'Paid')
      .reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);

    const openInvoicesAmount = invoices
      .filter((i: any) => i.status === 'Draft' || i.status === 'Sent')
      .reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);
      
    // Group Revenue by Month/Day depending on range
    // For simplicity, let's group by YYYY-MM-DD
    const revenueOverTimeObj = invoices
      .filter((i: any) => i.status === 'Paid')
      .reduce((acc: any, inv: any) => {
        const date = new Date(inv.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (inv.total_amount || 0);
        return acc;
      }, {});

    const revenueOverTime = Object.keys(revenueOverTimeObj)
      .sort()
      .map(date => ({
        date,
        revenue: revenueOverTimeObj[date]
      }));

    // Generate Sales Funnel (Simplified based on Stage or Status)
    const funnelData = [
      { name: 'Total Leads', value: totalLeadsCount },
      { name: 'Active Leads', value: activeLeadsCount },
      { name: 'Converted Leads', value: convertedLeadsCount },
    ];

    return NextResponse.json({
      metrics: {
        totalRevenue,
        activeLeadsCount,
        conversionRate,
        openInvoicesAmount
      },
      charts: {
        statusChartData,
        revenueOverTime,
        funnelData
      }
    });

  } catch (error: any) {
    console.error('Failed to get dashboard analytics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
