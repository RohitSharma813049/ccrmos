# Enterprise Dynamic Multi-Industry CRM - Product Requirement Document

## Overall Assessment
This scope is appropriate for a modular, multi-tenant CRM platform designed to serve industries such as real estate, IT services, digital marketing, education, healthcare, recruitment, manufacturing, and e-commerce while remaining extensible for future modules like HRMS, payroll, inventory, and AI-powered automation.

---

## 1. Organization Structure
Large companies often have multiple branches.
Example:
- Company
  - Delhi Branch
    - Sales, HR, Support
  - Mumbai Branch
    - Sales, Marketing, HR
  - Bangalore Branch

Every record should contain:
- `company_id`
- `branch_id`
- `department_id`
- `team_id`

## 2. Custom Roles
Instead of fixed roles, allow Founder to create custom roles (e.g., Sales Executive, Admission Counselor, HR Recruiter, Finance Manager, Accountant). Each role inherits permissions.

## 3. Permission Groups
Allow Permission Groups (e.g., Sales Manager Permissions, Marketing Permissions) to make management easier.

## 4. Data Sharing Rules
Need Record Sharing to allow specific records to be shared without exposing everything.
Table: `shared_records` (record_id, module, shared_to, shared_by, permission).

## 5. User Groups
Groups for Sales Team, Inside Sales, Admission Team, Marketing Team, etc. Permissions can be assigned to groups.

## 6. Dynamic Forms
Platform Owner creates Field Types.
Founder creates Forms, Sections, Tabs, Layouts, Validation, Conditional Fields.
The frontend reads the configuration and renders the correct fields automatically.
Records should store dynamic values in a separate table (e.g., `lead_field_values`) or a JSONB column to avoid altering the database schema per company.

## 7. Workflow Builder
A complete automation engine (Trigger -> Conditions -> Actions).
Like Salesforce Flow.

## 8. Approval Engine
Allow approval for Lead Transfer, Discount, Quotation, Leave, Expense, Refund, Purchase, Project, Task Completion, etc., with multiple Approval Levels.

## 9. Notification Engine
Channels: Email, WhatsApp, SMS, Push Notification, In App, Slack, Teams.
User preferences for receiving notifications.

## 10. Search Engine
Global Search across Lead, Customer, Project, Invoice, Task, Document, Quotation.

## 11. Saved Filters
Saved forever per user (e.g., Today's Follow Ups, Hot Leads).

## 12. Tags System
Every module should support Tags (Hot, VIP, Renewal, etc.).

## 13. Timeline System
Activity Timeline for Call, Email, Meeting, WhatsApp, Task, Status Change, Notes.

## 14. Universal Comments
Comment, Mention User, Attach Files, Reply, Emoji, Pin Comment.

## 15. Soft Delete
Recycle Bin, 30 Days, Restore, Permanent Delete.

## 16. Version History
Rollback available for every record.

## 17. Public API
API Keys, OAuth, Scopes, Rate Limits, Logs, Webhooks.

## 18. Import Mapping
CSV import with saved column mapping to CRM fields.

## 19. Duplicate Detection
Rules based on Phone, Email, GST, PAN, Company Name.

## 20. Merge Records
Keep Timeline, Keep Notes, Keep Tasks when merging.

## 21. Scheduler
Recurring Jobs (Daily, Weekly, Monthly, Yearly).

## 22. File Storage
AWS, Cloudflare R2, Azure Blob, Google Cloud Storage, Local Storage. Selectable.

## 23. Audit Dashboard
Most Active Users, Inactive Users, Deleted Records, Exports, Failed Login, Permission Changes.

## 24. Feature Flags
Platform Owner can enable/disable modules per company.

## 25. Subscription Plans
Free, Starter, Professional, Enterprise. Each plan controls Modules, Storage, Users, Automation, API, AI Credits.

## 26. Billing
Invoices, Renewal, Coupons, GST, Payment Gateway, Usage Billing.

## 27. Multi-language & 28. Timezone
Per company customization.

## 29. Theme
Dark, Light, Custom Branding.

## 30. Mobile Permissions
Separate permissions for Web, Mobile, Tablet.

---

## Recommended Backend Architecture
- **Frontend**: Next.js, React.js, Tailwind CSS, ShadCN UI, Redux Toolkit, React Query
- **Backend**: Express.js / Node.js (or Next.js API Routes unified)
- **Database**: PostgreSQL (Prisma/TypeORM/Mongoose for MongoDB if adapting)
- **Storage**: Cloudflare R2 / AWS S3
- **Authentication**: JWT, Refresh Tokens
- **Cache & Queue**: Redis, BullMQ

---

## User Hierarchy & Permission Architecture

### Level 1: Platform Owner (Super Admin)
Manage all companies, Create dynamic fields, Create industry templates, Configure global automations.

### Level 2: Founder
Manage complete company operations, View all company data, Assign permissions, Configure company dashboards. Cannot modify platform structure or access other companies.

### Level 3: Director
Can access own business unit data. Director A cannot view Director B's data unless explicitly granted.

### Level 4: Manager
Can access own records and reporting team records.

### Level 5: Team Leader
Can access own records and assigned team members' records.

### Level 6: Team Member
Can access only assigned leads, customers, tasks, and projects.

### Permission Management System
- **Module Permissions**: View, Create, Edit, Delete, Assign, Approve, Import, Export, Download.
- **Record-Level Permissions**: Own Records, Team Records, Department Records, Director Records, Company Records.
- **Field-Level Permissions**: Show/Hide specific fields based on role.
- **Action Permissions**: Transfer Lead, Approve Invoice, Export Data, etc.

## Final Goal
Build a scalable SaaS CRM capable of serving thousands of companies and users with:
✓ Multi-Tenant Architecture
✓ Strict Permission Management
✓ Hierarchy-Based Access
✓ Multi-Industry Support
✓ White Label Capability
✓ Automation Engine
✓ AI Ready Architecture
✓ Enterprise Security
✓ High Scalability
✓ Fully Modular Design
