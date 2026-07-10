import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import WorkflowClient from "@/modules/automation/components/WorkflowClient";

export default async function WorkflowPage() {
  await requirePermission(PERMISSIONS.CONFIGURE_WORKFLOW_ENGINE);
  return <WorkflowClient />;
}
