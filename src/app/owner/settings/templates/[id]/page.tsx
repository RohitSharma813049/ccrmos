import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import IndustryTemplate from "@/modules/settings/schemas/IndustryTemplate";
import TemplateBuilderClient from "@/modules/settings/components/TemplateBuilderClient";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";

export default async function TemplateBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.GLOBAL_SETTINGS);
  await dbConnect();
  
  const { id } = await params;
  
  const template = await IndustryTemplate.findById(id).lean();
  
  if (!template) {
    return redirect("/owner/settings");
  }
  
  const serializedTemplate = JSON.parse(JSON.stringify(template));
  
  return <TemplateBuilderClient template={serializedTemplate} />;
}
