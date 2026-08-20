import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import SiteVisit from '@/modules/bookings/schemas/SiteVisit';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const { leadId } = await req.json();

    const lead = await Lead.findOne({ _id: leadId, companyId: user.companyId }).lean();
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Fetch associated site visits
    const siteVisits = await SiteVisit.find({ leadId: lead._id })
      .populate('propertyId', 'title')
      .sort({ dateTime: -1 })
      .limit(3)
      .lean();

    // 1. Construct the Context payload
    const context = {
      name: `${lead.firstName} ${lead.lastName}`,
      status: lead.status,
      budget: lead.budget,
      locationPreference: lead.preferredLocation,
      requirements: lead.bhkOrPlotSize,
      leadScore: lead.leadScore,
      notes: lead.notes || "None",
      recentActivities: lead.activities?.slice(-5).map((a: any) => `${a.type}: ${a.description}`) || [],
      siteVisits: siteVisits.map((v: any) => `Visited ${v.propertyId?.title || 'Unknown Property'} on ${new Date(v.dateTime).toLocaleDateString()} - Status: ${v.status}`)
    };

    // 2. Construct the Prompt
    const prompt = `
      You are an expert real estate sales assistant. Analyze the following CRM data for a lead and provide a highly concise, 2-sentence executive summary and pitch strategy for the sales agent's next call.
      
      Lead Context:
      ${JSON.stringify(context, null, 2)}
      
      Output exactly 2 sentences. No fluff.
    `;

    // 3. Call LLM (Mocked for now)
    // In production:
    // const response = await fetch('https://api.openai.com/v1/chat/completions', { ... });
    // const aiText = response.data.choices[0].message.content;
    
    const isMock = true; // Set to false when providing actual API Keys in .env

    let summaryText = "";
    if (isMock) {
      await new Promise(r => setTimeout(r, 1500)); // Simulate network latency
      const budgetStr = context.budget ? `a budget around ${context.budget}` : 'an unknown budget';
      summaryText = `This lead is highly qualified with a score of ${context.leadScore}/10, actively looking in ${context.locationPreference || 'their preferred area'} with ${budgetStr}. Recommend focusing the call on scheduling a follow-up site visit based on their recent activity logs.`;
    } else {
      // TODO: Implement real LLM fetch here
      summaryText = "LLM response would go here.";
    }

    return NextResponse.json({ summary: summaryText, promptUsed: prompt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
