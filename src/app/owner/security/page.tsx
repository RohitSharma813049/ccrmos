import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import SecurityClient from "@/modules/settings/components/SecurityClient";

export default async function SecurityPage() {
  await requirePermission(PERMISSIONS.SECURITY_MANAGEMENT);
  return <SecurityClient />;
}
