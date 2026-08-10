import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/modules/companies/schemas/Company";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Unauthorized. Platform Owner only." }, { status: 401 });
    }

    await dbConnect();
    // Fetch all companies and populate their allowedAIProviders to see what they have access to
    const companies = await Company.find({}, "name plan allowedAIProviders")
      .populate("allowedAIProviders", "name isActive")
      .sort({ createdAt: -1 });

    return NextResponse.json({ companies });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
