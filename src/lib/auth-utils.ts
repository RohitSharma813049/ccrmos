import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  const session = await getServerSession(authOptions);
  if (session?.user && (session.user as any).hierarchyLevel === 1) {
    const impersonatedFounderId = (await cookies()).get("impersonatedFounderId")?.value;
    if (impersonatedFounderId) {
      (session.user as any).impersonatedFounderId = impersonatedFounderId;
    }
  }
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Ensures a user is authenticated, returning the user object or throwing an error.
 * Prevents repeating the manual session check and 401 handling across routes.
 */
export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }
  return user as any;
}

import { PLATFORM_OWNER_PERMISSIONS, FOUNDER_PERMISSIONS } from "@/config/permissions";

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

  const hierarchyLevel = (session.user as any).hierarchyLevel;
  if (hierarchyLevel === 1) {
    return session.user; // Platform Owners have global access
  }

  // Explicit bypass for Founders accessing Audit Logs so they don't need to re-login to refresh tokens
  if (hierarchyLevel === 2 && permissionOrModule === "AUDIT_MANAGEMENT") {
    return session.user;
  }

  if (PLATFORM_OWNER_PERMISSIONS.includes(permissionOrModule) && hierarchyLevel !== 1) {
    throw new Error(`Forbidden: You lack the required permission (${permissionOrModule}).`);
  }

  let userPermissions = (session.user as any).permissions || {};
  
  // Ensure Founders always get their default permissions if the DB is missing them
  if (hierarchyLevel === 2 && (!userPermissions || (Array.isArray(userPermissions) ? userPermissions.length === 0 : Object.keys(userPermissions).length === 0))) {
    userPermissions = { all: true };
  } else if (hierarchyLevel === 2) {
    // If they have array permissions, let's just forcefully give them "all" or let's say a Founder has access to all things in their company anyway.
    userPermissions = { ...userPermissions, all: true };
  }

  let hasAccess = false;

    const hasAll = userPermissions["all"] === true || Object.values(userPermissions).includes("all");
    
  if (Array.isArray(userPermissions)) {
    // Legacy support
    hasAccess = userPermissions.includes("all") || userPermissions.includes(permissionOrModule);
  } else if (action) {
    // New Matrix Support: e.g. requirePermission('Leads', 'view')
    hasAccess = hasAll || !!userPermissions[permissionOrModule]?.[action];
  } else {
    // Check if they have ANY permission in a module, or fallback
    hasAccess = hasAll || !!userPermissions[permissionOrModule];
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
  
  const hierarchyLevel = (session.user as any).hierarchyLevel;
  if (hierarchyLevel === 1) {
    return true; // Platform Owners have global access
  }

  if (PLATFORM_OWNER_PERMISSIONS.includes(permissionOrModule) && hierarchyLevel !== 1) {
    return false;
  }

  let userPermissions = (session.user as any).permissions || {};
  
  if (hierarchyLevel === 2 && (!userPermissions || (Array.isArray(userPermissions) ? userPermissions.length === 0 : Object.keys(userPermissions).length === 0))) {
    userPermissions = { all: true };
  } else if (hierarchyLevel === 2) {
    userPermissions = { ...userPermissions, all: true };
  }
  
  const hasAll = userPermissions["all"] === true || Object.values(userPermissions).includes("all");
  
  if (Array.isArray(userPermissions)) {
    if (userPermissions.includes("all")) return true;
    return userPermissions.includes(permissionOrModule);
  } else if (action) {
    if (hasAll) return true;
    return !!userPermissions[permissionOrModule]?.[action];
  } else {
    if (hasAll) return true;
    return !!userPermissions[permissionOrModule];
  }
}
