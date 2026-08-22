import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import ModuleBuilderClient from "@/modules/settings/components/ModuleBuilderClient";
import dbConnect from "@/lib/db";
import CustomModule from "@/modules/settings/schemas/CustomModule";
import { notFound } from "next/navigation";

export default async function ModuleBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.CREATE_DYNAMIC_MODULES);
  
  const { id } = await params;
  await dbConnect();

  const moduleDoc = await CustomModule.findById(id).lean();
  
  if (!moduleDoc) {
    notFound();
  }

  // Convert ObjectIds to strings so they can be passed to client component
  const safeModule = {
    ...moduleDoc,
    _id: moduleDoc._id.toString(),
    industryId: moduleDoc.industryId?.toString() || null,
    companyId: moduleDoc.companyId?.toString() || null,
    enabledBy: (moduleDoc.enabledBy || []).map((id: any) => id.toString()),
    // Convert any nested ObjectId string properties in fields just in case
    fields: (moduleDoc.fields || []).map((field: any) => ({
      ...field,
      _id: field._id ? field._id.toString() : undefined
    }))
  };

  return <ModuleBuilderClient moduleData={safeModule as any} />;
}
