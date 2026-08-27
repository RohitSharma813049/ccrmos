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

  const session = await getSession();
  const user = session?.user as any;
  const userCompanyId = user?.companyId || user?.impersonatedFounderId;

  // Pass the module schema to the client component so it knows what columns to render
  // Filter out fields that are disabled by the current company
  let processedFields = [...moduleDoc.fields]
    .filter(f => !f.disabledBy || !f.disabledBy.map(id => id.toString()).includes(userCompanyId?.toString()))
    .map(f => f) as any[];

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
