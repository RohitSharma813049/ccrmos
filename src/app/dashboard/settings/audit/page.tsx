import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import AuditClient from "@/modules/audit/components/AuditClient";

export default async function TenantAuditPage() {
  await requirePermission(PERMISSIONS.AUDIT_MANAGEMENT);
  return (
    <AuditClient 
      title="Company Audit Logs" 
      description="Immutable record of all critical actions performed by users in your company." 
    />
  );
}
