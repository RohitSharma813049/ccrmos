import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import WorkflowBuilderClient from "@/modules/automation/components/WorkflowBuilderClient";
import dbConnect from "@/lib/db";
import Workflow from "@/modules/automation/schemas/Workflow";
import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function CompanyWorkflowBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const user = session?.user as any;
  if (!user) return redirect("/login");

  const hierarchyLevel = user.hierarchyLevel;
  const isGlobal = hierarchyLevel === 1;

  if (!isGlobal) {
    await requirePermission(PERMISSIONS.CONFIGURE_COMPANY_AUTOMATIONS);
  }
  
  const { id } = await params;
  
  await dbConnect();

  const companyIdQuery = isGlobal ? null : user.companyId;
  const workflow = await Workflow.findOne({ _id: id, companyId: companyIdQuery }).lean();
  
  if (!workflow) {
    return redirect("/dashboard/automations");
  }

  // Convert MongoDB ObjectId to string for client component serialization
  const serializedWorkflow = JSON.parse(JSON.stringify(workflow));

  return <WorkflowBuilderClient workflow={serializedWorkflow} isGlobal={isGlobal} />;
}
