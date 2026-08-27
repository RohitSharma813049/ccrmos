import { IUser } from "@/modules/users/schemas/User";

/**
 * Builds a scoped MongoDB query based on the user's hierarchy level.
 * 
 * Hierarchy Levels:
 * 1: Platform Owner (Sees everything)
 * 2: Founder / Company Admin (Sees all records in their company)
 * 3, 4: Director / Manager (Sees all records in their assigned department)
 * 5, 6: Team Leader / Member (Sees all records in their assigned process/division)
 * 
 * @param user The session user object containing hierarchy context
 * @param baseQuery Optional initial query to merge with (e.g. { moduleId: "..." })
 * @returns A MongoDB query object with proper scope enforcement
 */
export function getScopedQuery(user: any, baseQuery: any = {}): any {
  if (!user) throw new Error("User context is missing for scoping");

  const query = { ...baseQuery };
  const level = user.hierarchyLevel || 6; // Default to lowest level if undefined
  const companyId = user.companyId || user.impersonatedFounderId;

  // Level 1: Platform Owner (Super Admin) - Can see across companies if needed, but normally restricted to company in CRM contexts
  if (level === 1) {
    // If they are impersonating a company, scope to it. Otherwise, return all.
    if (companyId) {
      query.companyId = companyId;
    }
    return query;
  }

  // Ensure all other levels are restricted to their company at minimum
  if (!companyId) throw new Error("Company ID is required for scoping");
  query.companyId = companyId;

  // Level 2: Founder (Full Company Access)
  if (level === 2) {
    return query;
  }

  // Level 3 & 4: Director / Manager (Department Access)
  if (level === 3 || level === 4) {
    if (!user.departmentId) throw new Error("Department ID is required for Director/Manager scoping");
    query.departmentId = user.departmentId;
    return query;
  }

  // Level 5 & 6: Team Leader / Member (Process / Division Access)
  if (level === 5 || level === 6) {
    if (!user.departmentId) throw new Error("Department ID is required for Team Member scoping");
    if (!user.processId) throw new Error("Process ID is required for Team Member scoping");
    query.departmentId = user.departmentId;
    query.processId = user.processId;
    return query;
  }

  return query;
}
