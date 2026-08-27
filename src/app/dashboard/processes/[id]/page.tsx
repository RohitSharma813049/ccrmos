import ProcessBuilderClient from "@/modules/companies/components/ProcessBuilderClient";
import dbConnect from "@/lib/db";
import Process from "@/modules/companies/schemas/Process";
import { notFound } from "next/navigation";

export default async function ProcessBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  
  const processDoc = await Process.findById(id).lean();
  if (!processDoc) return notFound();

  return <ProcessBuilderClient processId={id} processName={processDoc.name as string} />;
}
