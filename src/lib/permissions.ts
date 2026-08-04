import { Types } from "mongoose";

export type ActionType = "view" | "create" | "edit" | "delete" | "assign" | "export" | "import" | "approve";
export type RecordScope = "Own" | "Team" | "Department" | "Director" | "Company" | "Platform";

export interface SessionUser {
  id: string;
  email: string;
  role?: string;
  permissions?: Record<string, any>;
  companyId?: string;
  founderId?: string;
  hierarchyLevel?: number;
  departmentId?: string;
  teamId?: string;
  directorId?: string;
  managerId?: string;
  teamLeaderId?: string;
}

/**
 * Check if the user has permission to perform an action on a module.
 */
export function hasModulePermission(user: SessionUser, module: string, action: ActionType): boolean {
  if (user.hierarchyLevel === 1 || user.hierarchyLevel === 2) {
    return true; // Platform Owner and Founder have full access to modules
  }
  
  if (!user.permissions || !user.permissions[module]) {
    return false;
  }
  
  return !!user.permissions[module][action];
}

/**
 * Returns a MongoDB query filter object to ensure the user only retrieves records within their scope.
 */
export function getRecordScopeFilter(user: SessionUser, module: string): Record<string, any> {
  // Platform Owner (1) can see everything, Founder (2) can see everything in their company
  if (user.hierarchyLevel === 1) {
    return {};
  }
  if (user.hierarchyLevel === 2) {
    return { companyId: user.companyId }; // Or founderId depending on how data is segregated
  }

  const modulePerms = user.permissions?.[module];
  const scope: RecordScope = modulePerms?.recordScope || "Own";

  // Base company filter to ensure cross-tenant isolation is maintained
  const baseFilter: Record<string, any> = { companyId: user.companyId };

  switch (scope) {
    case "Platform":
      return {}; // Danger! Should only be for Platform Owners
    case "Company":
      return baseFilter;
    case "Director":
      if (user.hierarchyLevel === 3) return { ...baseFilter, directorId: user.id };
      break;
    case "Department":
      if (user.departmentId) return { ...baseFilter, departmentId: user.departmentId };
      break;
    case "Team":
      // Allow user to see records if they are part of a team (via teamId),
      // OR they are specifically the manager/team leader of the record.
      const teamQueries = [];
      if (user.teamId) teamQueries.push({ teamId: user.teamId });
      if (user.hierarchyLevel === 4) teamQueries.push({ managerId: user.id });
      if (user.hierarchyLevel === 5) teamQueries.push({ teamLeaderId: user.id });
      
      if (teamQueries.length > 0) {
        return { ...baseFilter, $or: teamQueries };
      }
      return { ...baseFilter, assignedUserId: user.id }; // Fallback to Own
    case "Own":
    default:
      return { ...baseFilter, assignedUserId: user.id };
  }

  // Fallback to most restrictive (Own) if level doesn't match perfectly
  return { ...baseFilter, assignedUserId: user.id };
}

/**
 * Strips hidden fields from a record based on field-level permissions.
 */
export function filterFields<T extends Record<string, any>>(record: T, user: SessionUser, module: string): Partial<T> {
  if (user.hierarchyLevel === 1 || user.hierarchyLevel === 2) {
    return record; // Platform Owner and Founder see all fields
  }

  const hiddenFields: string[] = user.permissions?.[module]?.fieldPermissions?.hiddenFields || [];
  
  if (hiddenFields.length === 0) {
    return record;
  }

  const filtered = { ...record };
  for (const field of hiddenFields) {
    delete (filtered as any)[field];
  }
  
  return filtered;
}
