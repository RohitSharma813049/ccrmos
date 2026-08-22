import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import WorkflowBuilderClient from "@/modules/automation/components/WorkflowBuilderClient";
import dbConnect from "@/lib/db";
import Workflow from "@/modules/automation/schemas/Workflow";
import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function WorkflowBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.CONFIGURE_WORKFLOW_ENGINE);
  
  const { id } = await params;
  
  await dbConnect();
  const session = await getSession();
  const user = session?.user as any;
  if (!user) return redirect("/login");

  let workflow = await Workflow.findOne({ _id: id, companyId: user.companyId }).lean();
  
  // If not found, and user is platform owner, check if it's a global workflow
  if (!workflow && user.hierarchyLevel === 1) {
    workflow = await Workflow.findOne({ _id: id, companyId: null }).lean();
  }

  if (!workflow) {
    return redirect("/owner/workflow");
  }

  // Convert MongoDB ObjectId to string for client component serialization
  const serializedWorkflow = JSON.parse(JSON.stringify(workflow));

  return <WorkflowBuilderClient workflow={serializedWorkflow} />;
}
