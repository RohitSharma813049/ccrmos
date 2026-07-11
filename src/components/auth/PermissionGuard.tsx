"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { SessionUser, hasModulePermission, ActionType } from "@/lib/permissions";

interface PermissionGuardProps {
  module: string;
  action: ActionType;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function PermissionGuard({ module, action, children, fallback = null }: PermissionGuardProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return <>{fallback}</>;
  }

  const user = session.user as SessionUser;
  
  const hasAccess = hasModulePermission(user, module, action);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
