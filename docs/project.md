# Projects Module Fix Plan

## The Broken Points

After analyzing the `Projects` module, I've identified several critical disconnects between the data layer, API, and UI that cause the feature to break:

1. **Schema Default Status Mismatch (The Ghost Project Bug)**
   - **Issue:** When a new project is created via the UI, the `ProjectSchema` sets the default status to `'Active'`. However, the Kanban board and default pipeline stages expect `"Planning"`, `"In Progress"`, `"Review"`, and `"Completed"`.
   - **Result:** Newly created projects receive the `'Active'` status and consequently do not appear in the Kanban board, making them seem like they disappeared.

2. **Table UI Fallback Bug**
   - **Issue:** In the table view (`ProjectsClient.tsx`), the dropdown to change a project's status only renders if custom `pipelineStages` are fetched from the database (`pipelineStages.length > 0`). 
   - **Result:** If a user hasn't explicitly configured a custom pipeline for projects, they are entirely blocked from changing project statuses via the table view. (The Kanban view correctly falls back to default stages, but the table does not).

3. **TypeScript Typing Defect**
   - **Issue:** In `Project.ts`, the `IProject` interface defines `name` and `status` as `any` instead of `string`.
   - **Result:** This creates a weak contract that circumvents TypeScript's type-safety, which can lead to runtime errors down the line.

## Full Flow & Implementation Plan

To fully repair the Projects module, we need to apply the following fixes:

### 1. Fix the Schema (`src/modules/projects/schemas/Project.ts`)
- **[MODIFY]** Change `name: any` and `status: any` to `string` in the `IProject` interface.
- **[MODIFY]** Change the default status from `'Active'` to `'Planning'` to align with the default Kanban/Pipeline stages.

### 2. Fix the Table UI Fallback (`src/modules/projects/components/ProjectsClient.tsx`)
- **[MODIFY]** Update the `kanbanCols` constant to act as the single source of truth for stages when custom stages are missing.
- **[MODIFY]** Update the columns definition so the Table view uses the default stages `["Planning", "In Progress", "Review", "Completed"]` if `pipelineStages.length === 0`, ensuring users can always change statuses from the table.

### 3. Ensure API Consistency (`src/app/api/projects/route.ts`)
- The API already implements a fallback pipeline correctly during the `PUT` request (`"Planning"`, `"In Progress"`, `"Review"`, `"Completed"`). We will ensure the UI exactly matches this fallback to maintain a cohesive flow.

## User Review Required

Does this plan accurately cover the issues you've experienced with the projects module? If you approve, I will go ahead and implement these fixes immediately.
