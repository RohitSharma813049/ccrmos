import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import AuditClient from "@/modules/audit/components/AuditClient";

export default async function AuditPage() {
  await requirePermission(PERMISSIONS.AUDIT_MANAGEMENT);
  return <AuditClient />;
}
