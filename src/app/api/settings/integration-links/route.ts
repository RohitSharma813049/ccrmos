import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import IntegrationLink from "@/modules/settings/schemas/IntegrationLink";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;

    const links = await IntegrationLink.find({ companyId })
      .populate("projectId", "name")
      .populate("formId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ links });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: "Only admins can configure integrations" }, { status: 403 });
    }

    const { integrationId, integrationName, projectId, formId, url } = await req.json();

    if (!integrationId || !integrationName || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if exactly this configuration already exists to prevent duplicates
    const existing = await IntegrationLink.findOne({
      companyId,
      integrationId,
      projectId: projectId || null,
      formId: formId || null,
      url,
    });

    if (existing) {
      return NextResponse.json({ link: existing, isNew: false });
    }

    const newLink = await IntegrationLink.create({
      companyId,
      integrationId,
      integrationName,
      projectId: projectId || null,
      formId: formId || null,
      url,
    });

    const populatedLink = await IntegrationLink.findById(newLink._id)
      .populate("projectId", "name")
      .populate("formId", "name");

    return NextResponse.json({ link: populatedLink, isNew: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: "Only admins can configure integrations" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await IntegrationLink.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
