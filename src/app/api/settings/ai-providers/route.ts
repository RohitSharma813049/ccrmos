import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/modules/companies/schemas/Company";
import AIProvider from "@/modules/settings/schemas/AIProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!companyId) return NextResponse.json({ providers: [] });

    await dbConnect();
    
    // We must register AIProvider model explicitly in case it hasn't been used yet
    require("@/modules/settings/schemas/AIProvider");

    const company = await Company.findById(companyId).populate("allowedAIProviders");
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Filter out inactive providers
    const activeProviders = (company.allowedAIProviders || []).filter((p: any) => p.isActive);

    // Strip sensitive global API keys before sending to the client,
    // unless it's the platform owner (but they have the owner dashboard anyway).
    // Actually, we should NEVER send the global API key to the client.
    const safeProviders = activeProviders.map((p: any) => ({
      _id: p._id,
      name: p.name,
      description: p.description,
      endpointUrl: p.endpointUrl,
      defaultModel: p.defaultModel,
      icon: p.icon,
      color: p.color,
      allowTenantOverride: p.allowTenantOverride
    }));

    return NextResponse.json({ providers: safeProviders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
