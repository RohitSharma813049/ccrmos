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
  let processedFields = [...moduleDoc.fields] as any[];
  for (const field of processedFields) {
    if (field.type === 'relation' && field.relationTarget === 'Project') {
      const { default: Project } = await import('@/modules/projects/schemas/Project');
      const projects = await Project.find({ companyId: moduleDoc.companyId }).select('_id name displayId').lean();
      field.relationOptions = projects.map((p: any) => ({
        label: `${p.displayId ? p.displayId + ' - ' : ''}${p.name}`,
        value: p._id.toString()
      }));
    }
  }
  moduleDoc.fields = processedFields;

  const serializedModule = JSON.parse(JSON.stringify(moduleDoc));

  return <CustomModuleClient moduleSchema={serializedModule} />;
}
