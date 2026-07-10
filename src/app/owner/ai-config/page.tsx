import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import AIConfigClient from "@/modules/ai/components/AIConfigClient";

export default async function AIConfigPage() {
  await requirePermission(PERMISSIONS.CONFIGURE_AI_MODULES);
  return <AIConfigClient />;
}
