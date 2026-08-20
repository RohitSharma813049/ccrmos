import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    // 1. Pipeline Velocity & Win Rate
    // Average time (days) from createdAt to expectedClosingDate (or now) for "Won" deals
    const velocityAndWinRate = await Lead.aggregate([
      { $match: { companyId: user.companyId, status: { $ne: 'Archived' } } },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          wonLeads: { $sum: { $cond: [{ $eq: ["$status", "Won"] }, 1, 0] } },
          lostLeads: { $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] } },
          totalVelocityDays: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Won"] },
                { $divide: [{ $subtract: [{ $ifNull: ["$expectedClosingDate", "$updatedAt"] }, "$createdAt"] }, 1000 * 60 * 60 * 24] },
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          totalLeads: 1,
          wonLeads: 1,
          lostLeads: 1,
          winRate: {
            $cond: [
              { $gt: [{ $add: ["$wonLeads", "$lostLeads"] }, 0] },
              { $multiply: [{ $divide: ["$wonLeads", { $add: ["$wonLeads", "$lostLeads"] }] }, 100] },
              0
            ]
          },
          avgPipelineVelocityDays: {
            $cond: [
              { $gt: ["$wonLeads", 0] },
              { $divide: ["$totalVelocityDays", "$wonLeads"] },
              0
            ]
          }
        }
      }
    ]);

    // 2. Sales Forecasting (Probability-adjusted Pipeline Revenue)
    // Dynamically assign weights based on LeadStatus or fallback to LeadScore
    const forecasting = await Lead.aggregate([
      { $match: { companyId: user.companyId, status: { $nin: ['Won', 'Lost', 'Archived'] }, dealValue: { $gt: 0 } } },
      {
        $addFields: {
          probability: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "Negotiation"] }, then: 0.8 },
                { case: { $eq: ["$status", "Proposal"] }, then: 0.5 },
                { case: { $eq: ["$status", "Qualified"] }, then: 0.3 },
                { case: { $eq: ["$status", "New"] }, then: 0.1 }
              ],
              default: { $divide: [{ $ifNull: ["$leadScore", 5] }, 10] } // Fallback to LeadScore (1-10) converted to 10-100%
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRawPipeline: { $sum: "$dealValue" },
          weightedForecast: { $sum: { $multiply: ["$dealValue", "$probability"] } }
        }
      }
    ]);

    // 3. Revenue by Month (Trailing 6 Months) for Won Deals
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueTrend = await Lead.aggregate([
      { 
        $match: { 
          companyId: user.companyId, 
          status: 'Won', 
          updatedAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
          revenue: { $sum: "$dealValue" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      velocityAndWinRate: velocityAndWinRate[0] || { winRate: 0, avgPipelineVelocityDays: 0 },
      forecasting: forecasting[0] || { totalRawPipeline: 0, weightedForecast: 0 },
      revenueTrend
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
