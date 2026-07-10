import mongoose from "mongoose";

/**
 * Builds a dynamic MongoDB query scope based on the user's hierarchy level and record scope permissions.
 * 
 * Hierarchy Levels:
 * 1: Platform Owner
 * 2: Founder
 * 3: Director
 * 4: Manager
 * 5: Team Leader
 * 6: Team Member
 * 
 * @param user The logged-in user object from session
 * @param recordScope "Own" | "Team" | "Department" | "Director" | "Company" | "Platform"
 */
export function buildQueryScope(user: any, recordScope: string = "Own") {
  // If the user has no companyId or role data, they can see nothing by default
  if (!user || !user.companyId) {
    return { _id: null }; // Invalid query returns nothing
  }

  // 1. Platform Owner (Level 1) can see EVERYTHING across all companies
  if (user.hierarchyLevel === 1) {
    return {};
  }

  // 2. Founder (Level 2) or "Company" scope can see everything IN THEIR COMPANY
  if (user.hierarchyLevel === 2 || recordScope === "Company") {
    return { companyId: user.companyId };
  }

  // From this point, all queries MUST be scoped to the company
  const baseQuery: any = { companyId: user.companyId };
  const userId = new mongoose.Types.ObjectId(user._id);

  switch (recordScope) {
    case "Director":
      // Can see records where directorId is theirs, or they are assigned
      baseQuery.$or = [
        { directorId: userId },
        { assignedUserId: userId },
        { createdBy: userId }
      ];
      break;

    case "Department":
      // Can see records in their department
      baseQuery.$or = [
        { departmentId: user.departmentId },
        { assignedUserId: userId },
        { createdBy: userId }
      ];
      break;

    case "Team":
      // Can see records for their team (Manager or Team Leader level)
      if (user.hierarchyLevel === 4) {
        baseQuery.$or = [
          { managerId: userId },
          { assignedUserId: userId },
          { createdBy: userId }
        ];
      } else if (user.hierarchyLevel === 5) {
        baseQuery.$or = [
          { teamLeaderId: userId },
          { assignedUserId: userId },
          { createdBy: userId }
        ];
      } else {
        baseQuery.$or = [
          { assignedUserId: userId },
          { createdBy: userId }
        ];
      }
      break;

    case "Own":
    default:
      // Can only see records explicitly assigned to them or created by them
      baseQuery.$or = [
        { assignedUserId: userId },
        { createdBy: userId }
      ];
      break;
  }

  return baseQuery;
}
