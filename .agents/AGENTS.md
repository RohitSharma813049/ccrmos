# UI/UX & Frontend Guidelines

For every screen, form, table, modal, drawer, wizard, or workflow, validate the following before generating code:

## 1. FORM VALIDATION
- Show a red (*) only for mandatory fields.
- Never show (*) for optional fields.
- Clearly indicate optional fields if required by the design.
- Required validation should happen on submit and inline.
- Show meaningful validation messages.
- Disable Submit until all required fields are valid (unless business rules require otherwise).

## 2. FIELD VISIBILITY
Automatically determine Visible, Hidden, Disabled, Read Only, and Editable based on:
- User Role
- Permissions
- Workflow Status
- Parent Selection
- Previous Step
- Business Rules
- Feature Flags

## 3. CONDITIONAL FIELDS
When one field changes, automatically determine whether to Show, Hide, Enable, Disable, Make Required, Make Optional, or Reset dependent fields.

## 4. BUTTON STATES
Every button should define: Visible, Hidden, Enabled, Disabled, Loading, Permission controlled.

## 5. WORKFLOW STATES
Design for all workflow states (Draft, Pending Approval, Approved, Rejected, Cancelled, Closed, Archived). For each state define: Visible Actions, Disabled Actions, Editable Fields, Read Only Fields, Hidden Fields.

## 6. TABLE UX
Support: Search, Sort, Filter, Pagination, Column Resize, Column Hide, Sticky Header, Row Selection, Bulk Actions, Empty State, Loading Skeleton, No Data State.

## 7. RESPONSIVE DESIGN
Validate for: 320px, 375px, 768px, 1024px, 1280px, 1440px, 1920px. Ensure no overflow, no broken layout, proper spacing, touch friendly controls, responsive tables/cards, and responsive dialogs.

## 8. ACCESSIBILITY
Ensure Keyboard navigation, Tab order, Focus states, ARIA labels, Proper labels, Screen reader support, High color contrast, Minimum 44x44 touch targets.

## 9. CONSISTENT DESIGN SYSTEM
- Use 8px spacing system
- Consistent: Typography, Button heights, Input heights, Border radius, Colors, Icons, Margins, Padding, Grid alignment, Card spacing.
- Follow modern SaaS design similar to Linear, Notion, Vercel, Stripe and GitHub.
- Use Tailwind CSS best practices.

## 10. USER FRIENDLY UX
Always include: Confirmation dialogs, Delete confirmation, Unsaved changes warning, Helpful empty states, Loading indicators, Success/Error messages, Tooltips, Helper text, Character counters, Inline validation.

## 11. BUSINESS RULE REVIEW
Before generating code, explicitly identify:
- Which fields are required/hidden/disabled/editable?
- Which buttons should appear?
- Which workflow state is active?
- Which user role is using the screen?
- Which validations are required?
If any business rule is unclear, explicitly identify the assumption instead of guessing.

## 12. OUTPUT EXPECTATION
When building new screens, output a checklist or matrix covering UI Layout, Field Visibility, Validation Rules, Permissions, Responsive Behavior, Accessibility, UX Improvements before generating code.
