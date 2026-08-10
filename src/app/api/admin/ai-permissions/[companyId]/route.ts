import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/modules/companies/schemas/Company";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request, { params }: { params: Promise<{ companyId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Unauthorized. Platform Owner only." }, { status: 401 });
    }

    const { companyId } = await params;
    const body = await req.json(); // Expected: { providerId: string, action: "grant" | "revoke" }
    
    await dbConnect();
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (!company.allowedAIProviders) {
      company.allowedAIProviders = [];
    }

    if (body.action === "grant") {
      if (!company.allowedAIProviders.includes(body.providerId)) {
        company.allowedAIProviders.push(body.providerId);
      }
    } else if (body.action === "revoke") {
      company.allowedAIProviders = company.allowedAIProviders.filter(
        id => id.toString() !== body.providerId
      );
    }

    await company.save();
    return NextResponse.json({ success: true, allowedAIProviders: company.allowedAIProviders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
