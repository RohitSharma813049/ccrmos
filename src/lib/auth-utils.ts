import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Checks if the current authenticated user has the required permission.
 * Supports legacy array permissions and new matrix permissions.
 * Throws an error if not authorized. Useful for API Routes and Server Actions.
 */
export async function requirePermission(permissionOrModule: string, action?: string) {
  const session = await getSession();
  
  if (!session || !session.user) {
    throw new Error("Unauthorized: Please log in.");
  }

  const userPermissions = (session.user as any).permissions || {};
  let hasAccess = false;

  if (Array.isArray(userPermissions)) {
    // Legacy support
    hasAccess = userPermissions.includes("all") || userPermissions.includes(permissionOrModule);
  } else if (action) {
    // New Matrix Support: e.g. requirePermission('Leads', 'view')
    hasAccess = !!userPermissions["all"] || !!userPermissions[permissionOrModule]?.[action];
  } else {
    // Check if they have ANY permission in a module, or fallback
    hasAccess = !!userPermissions["all"] || !!userPermissions[permissionOrModule];
  }
  
  if (!hasAccess) {
    throw new Error(`Forbidden: You lack the required permission (${permissionOrModule}${action ? `:${action}` : ''}).`);
  }

  return session.user;
}

/**
 * Safely checks if the user has a permission, returning a boolean instead of throwing.
 */
export async function hasPermission(permissionOrModule: string, action?: string): Promise<boolean> {
  const session = await getSession();
  if (!session || !session.user) return false;
  
  const userPermissions = (session.user as any).permissions || {};
  
  if (Array.isArray(userPermissions)) {
    if (userPermissions.includes("all")) return true;
    return userPermissions.includes(permissionOrModule);
  } else if (action) {
    if (userPermissions["all"]) return true;
    return !!userPermissions[permissionOrModule]?.[action];
  } else {
    if (userPermissions["all"]) return true;
    return !!userPermissions[permissionOrModule];
  }
}
