import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import SecurityClient from "@/modules/settings/components/SecurityClient";
import TwoFactorClient from "@/app/dashboard/settings/security/TwoFactorClient";

export default async function SecurityPage() {
  await requirePermission(PERMISSIONS.SECURITY_MANAGEMENT);
  return (
    <div className="space-y-8">
      <SecurityClient />
      <div className="border-t border-border my-8"></div>
      <TwoFactorClient />
    </div>
  );
}