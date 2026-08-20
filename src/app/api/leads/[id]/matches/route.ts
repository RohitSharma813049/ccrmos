import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import Property from '@/modules/properties/schemas/Property';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const lead = await Lead.findOne({ _id: params.id, companyId: user.companyId });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Fetch available properties for the company
    const properties = await Property.find({ 
      companyId: user.companyId,
      status: "Available"
    }).lean();

    const matches = properties.map(property => {
      let score = 0;
      const details: string[] = [];

      // 1. Budget Matching (40%)
      if (lead.budget && property.price) {
        // Remove currency symbols and commas, parse to number
        const propPrice = parseFloat(property.price.replace(/[^0-9.]/g, ''));
        if (!isNaN(propPrice) && propPrice > 0) {
          const diff = Math.abs(lead.budget - propPrice);
          const percentDiff = diff / lead.budget;
          
          if (percentDiff <= 0.05) {
             score += 40;
             details.push("Perfect budget match");
          } else if (percentDiff <= 0.15) {
             score += 30;
             details.push("Good budget match");
          } else if (percentDiff <= 0.25) {
             score += 15;
             details.push("Acceptable budget match");
          } else {
             details.push("Out of budget");
          }
        }
      }

      // 2. Location Matching (40%)
      if (lead.preferredLocation && property.location) {
        const leadLoc = lead.preferredLocation.toLowerCase();
        const propLoc = property.location.toLowerCase();
        
        if (propLoc.includes(leadLoc) || leadLoc.includes(propLoc)) {
          score += 40;
          details.push("Location matched");
        }
      }

      // 3. Size / Bedrooms Matching (20%)
      if (lead.bhkOrPlotSize) {
        const leadReq = lead.bhkOrPlotSize.toLowerCase();
        
        // Check if looking for BHK and property has bedrooms
        if (leadReq.includes('bhk') && property.bedrooms) {
          const requiredBhk = parseInt(leadReq.replace(/[^0-9]/g, ''));
          if (!isNaN(requiredBhk)) {
            if (property.bedrooms === requiredBhk) {
              score += 20;
              details.push("Exact bedroom match");
            } else if (Math.abs(property.bedrooms - requiredBhk) === 1) {
              score += 10;
              details.push("Similar bedroom count");
            }
          }
        } else if (property.area || property.squareFeet) {
           // Basic substring match for plot sizes like "1000 sqft"
           const propArea = (property.area || '') + ' ' + (property.squareFeet || '');
           if (propArea.toLowerCase().includes(leadReq.replace(/[^0-9]/g, ''))) {
             score += 20;
             details.push("Area match");
           }
        }
      }

      return {
        property,
        matchScore: score,
        matchDetails: details
      };
    });

    // Filter out scores less than 30% and sort descending
    const topMatches = matches
      .filter(m => m.matchScore >= 30)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return NextResponse.json({ matches: topMatches });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
