# Workflow Module Fix Plan

## The Broken Points

After analyzing the `Workflow` (Automations) module, I've identified the following issues that cause friction and potential bugs:

1. **Duplicate and Redundant API Routes**
   - **Issue:** The codebase currently has two separate API folders for workflows: `/api/workflows` and `/api/automation/workflows`.
   - **Result:** The frontend (`AutomationsClient.tsx`) exclusively uses `/api/automation/workflows`. The duplicate `/api/workflows` is dead code that creates confusion, technical debt, and potential routing conflicts.

2. **TypeScript Typing Defect in Schema**
   - **Issue:** The `WorkflowBuilderClient.tsx` saves the visual node graph to the database by wrapping it in an action with the type `"Canvas"`. However, the `IWorkflowAction` interface in `src/modules/automation/schemas/Workflow.ts` restricts the `type` to `"Create Task" | "Send Email" | "Assign User"`.
   - **Result:** This TypeScript mismatch means `"Canvas"` is technically an invalid type according to the interface, forcing developers to use `any` casting in the frontend to bypass TypeScript errors and creating a weak contract.

## Full Flow & Implementation Plan

To fully repair the Workflow module, we need to apply the following fixes:

### 1. Remove Dead Code
- **[DELETE]** `src/app/api/workflows/route.ts` and `src/app/api/workflows/[id]/route.ts`. 
- We will consolidate all workflow API logic strictly within the `src/app/api/automation/workflows` directory.

### 2. Fix the Schema (`src/modules/automation/schemas/Workflow.ts`)
- **[MODIFY]** Update the `IWorkflowAction` interface to include `"Canvas"` as a valid type, matching what the frontend actually sends.
  ```typescript
  export interface IWorkflowAction {
    type: "Create Task" | "Send Email" | "Assign User" | "Canvas";
    payload: any;
  }
  ```

## User Review Required

Does this plan accurately cover the issues you've experienced with the workflow automations module? If you approve, I will go ahead and implement these fixes immediately and place this document in the `docs` folder.
