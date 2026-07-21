import dbConnect from "@/lib/db";
import CustomModule from "@/modules/settings/schemas/CustomModule";
import CustomModuleClient from "@/modules/dynamic/components/CustomModuleClient";
import { notFound } from "next/navigation";

export default async function DynamicModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  await dbConnect();
  const { moduleId } = await params;
  
  const moduleDoc = await CustomModule.findById(moduleId).lean();
  if (!moduleDoc || !moduleDoc.active) {
    notFound();
  }

  // Pass the module schema to the client component so it knows what columns to render
  const serializedModule = JSON.parse(JSON.stringify(moduleDoc));

  return <CustomModuleClient moduleSchema={serializedModule} />;
}
