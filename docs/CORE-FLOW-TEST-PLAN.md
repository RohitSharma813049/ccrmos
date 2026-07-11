# Core CRM Flow Test Plan

## Purpose

Use this checklist before each release to verify hierarchy, forms, search,
duplicate protection, data synchronization, status transitions, error handling,
and tenant isolation. Run in a non-production environment with a fresh database.

## Test accounts and data

Create these accounts and retain their IDs:

| Account | Hierarchy | Tenant |
| --- | --- | --- |
| `owner@crmos.com` | Platform Owner (1) | none |
| `founder-a@test.com` | Founder (2) | Company A |
| `member-a@test.com` | Team Member (6) | Company A |
| `founder-b@test.com` | Founder (2) | Company B |

Use a unique run token such as `QA-20260711-001` in every test record's email,
name, and notes. This makes search, cleanup, and duplicate checks reliable.

## 1. Platform Owner -> Founder setup

1. Sign in as `owner@crmos.com`.
2. Confirm the dashboard has **Go to Control Center** and does not expose tenant
   modules such as Lead Management.
3. Open **Control Center -> Manage Companies**.
4. Create Company A with `founder-a@test.com`; create Company B with
   `founder-b@test.com`.
5. Refresh the company list. Confirm both companies appear once, have **Active**
   status, and show the expected user quota.
6. Repeat the create request with the same company name and admin email.
   Expected: a clear validation error; no second company or founder is created.
7. Run the founder sync once, then run it again.
   Expected: each company has exactly one founder; the second run is idempotent
   (it does not create duplicates or change a founder's tenant).
8. In the database/API response, verify each synced founder has all of:
   `companyId`, `role=founder`, `hierarchyLevel=2`, and a usable founder identity
   for tenant-scoped records. Record these values in the test evidence.
9. From the Owner company details, impersonate Company A. Confirm the banner is
   visible and only Company A records appear. Exit impersonation and confirm the
   Owner view is restored.

## 2. Founder permissions and user hierarchy

1. Sign in as Founder A.
2. Confirm company modules and company-admin settings are visible: Leads,
   Customers, Projects, Orders, Invoices, Tasks, Form Builder, Roles, Users,
   Directors, Automations, and Integrations.
3. Confirm Owner-only pages and APIs are denied/hidden: `/owner`, company-wide
   platform controls, audit control center, and founder sync.
4. Create Member A under Company A. Confirm their `companyId` and `founderId`
   match Founder A.
5. Attempt to create a user at founder level or higher, edit Founder A as Member
   A, and delete Founder A as Member A.
   Expected: each request returns 403 with a useful message and makes no change.
6. Sign in as Founder B and confirm they cannot list, search, open by ID, edit,
   or delete Company A users or records. Repeat via direct API URL, not only UI.

## 3. Forms and validation

Run these steps for Leads first, then repeat the same pattern for Customers,
Projects, Orders, Invoices, and Tasks.

1. As Founder A, open the module and choose **Add**.
2. Submit the empty form. Expected: every required field is identified, focus
   moves to the first invalid field, and no record is saved.
3. Test invalid email, invalid phone (if supplied), maximum-length text, special
   characters, and a valid record. Expected: invalid values are rejected with
   field-level messages; the valid record saves once.
4. Create a custom required field in Form Builder. Verify it appears in the new
   record form, blocks an empty submission, saves its value, and displays after
   refresh and in edit mode.
5. Edit the record, save, reload the page, and open it in a second session.
   Expected: exactly the saved values appear in both sessions; no old values
   reappear and no duplicate record is created.
6. Disable or remove the custom field. Expected: it no longer appears for new
   records, and existing data is handled according to the agreed retention rule.

## 4. Search, filters, pagination, and reset

1. Create three Company A records using the run token: one New, one Contacted,
   and one Qualified. Create a similarly named Company B record.
2. Search each supported field individually (name, email, and company where
   applicable), using upper case, lower case, partial text, and special characters.
   Expected: results are case-insensitive where specified, correctly scoped to
   Company A, and do not throw an error on special characters.
3. Search for the Company B token as Founder A and Member A.
   Expected: zero results in both UI and API.
4. Apply every status, assignee, date, and module-specific filter. Confirm the
   count, table rows, and pagination all use the same filtered data.
5. Combine search plus at least two filters; change pages; refresh; then clear
   all filters. Expected: no stale filters or records remain, and reset restores
   the complete Company A set.
6. Test no-results, loading, server-error, and retry states. Expected: clear
   messages, no empty broken table, and no data duplication after retry.

## 5. Duplicate prevention and concurrent saves

1. Create a Lead with `qa-...@example.test` and a phone number.
2. Submit the same form again, then submit it from a second browser session at
   the same time.
   Expected: one record only; the other request receives 409 Conflict (or the
   agreed duplicate message) identifying the matching field.
3. Repeat with the same email but different case, and with the same phone in
   alternate formatting. Expected: both are detected as duplicates.
4. Create the same email/phone in Company B. Expected: allowed if duplicate rules
   are tenant-scoped; it must never appear in Company A.
5. Repeat the checks for Customer email, Company name, and any GST/PAN fields
   once those fields are supported.
6. Double-click Save and simulate a slow network/retry. Expected: the Save button
   is disabled while pending or an idempotency key ensures one record only.

## 6. Status workflow

1. Create a new Lead. Confirm its initial status is the pipeline's first stage.
2. Move it forward through every configured stage. After each move, refresh and
   confirm the new status appears in the list, detail, API response, and activity
   history/workflow result.
3. Attempt to move it backward. Expected: 400 with `Status can only move forward
   in the pipeline`; the original status remains unchanged after refresh.
4. Attempt an unknown status and a status from another module. Expected: rejected
   with 400; no data changes.
5. Repeat for Customers and Projects. Also verify terminal statuses (Converted,
   Churned, Completed) cannot be incorrectly reopened unless a configured rule
   explicitly permits it.
6. Archive a record, refresh/search it, and call its direct GET endpoint.
   Expected: it disappears from normal lists and search; restore/permanent delete
   behavior follows the product rule.

## 7. Synchronization and data consistency

1. Create a Company A record as Founder A and assign it to Member A.
2. In separate sessions for Founder A and Member A, verify the record appears
   with the same ID, values, owner, and status according to each user's scope.
3. Edit it as Founder A; refresh Member A's page. Expected: the update appears
   after the normal refresh/polling interval and no duplicate is added.
4. Change status as Member A (when permitted); refresh Founder A's page and
   verify the same status and one audit/workflow event only.
5. Force one failed save (offline/network 500), reconnect, then retry once.
   Expected: a visible error, no partial record, and exactly one record after
   successful retry.
6. Run founder sync twice and verify it does not overwrite valid existing founder
   hierarchy data, reassign users, or generate duplicate founders.

## 8. Error, authorization, and API checks

1. Call every protected endpoint without a session. Expected: 401 Unauthorized,
   not 500 and not a database connection error.
2. Call each endpoint as a logged-in user lacking the relevant permission.
   Expected: 403 Forbidden, no state change, and a safe message.
3. Send invalid IDs, missing required JSON fields, malformed JSON, negative
   pagination values, huge limits, and invalid status values.
   Expected: 400/404 as appropriate; no stack trace, no 500 for client input.
4. Simulate database unavailability. Expected: 503 or a controlled 500 response
   with a retryable UI message; no misleading success toast.
5. Confirm errors are logged without passwords, OTPs, tokens, or personal data.

## Release gate

Release only when all steps pass, there are no cross-tenant records, duplicate
submissions create one record at most, status cannot move backward, and failed
requests leave the database unchanged. Attach screenshots/API responses and the
run token to the QA report.

## Current code findings to resolve before sign-off

1. `GET /api/leads` opens the database connection before authentication, so the
   unauthenticated API test currently returns 500 when MongoDB is unavailable
   instead of 401.
2. Tenant registration and `/api/sync-founders` set a role and company but do not
   explicitly set the founder hierarchy/tenant-scoping fields. This can make new
   founders unable to see their own tenant data.
3. The Lead schema requires email but does not enforce a tenant-scoped unique
   email/phone constraint, so the duplicate tests above are expected to fail
   until duplicate rules and a database index are implemented.
4. `npm test` could not complete in this environment: Chromium launch is blocked
   with `spawn EPERM`, and the configured MongoDB Atlas cluster is unreachable.
   The API test confirmed the resulting unauthorized-request 500 behavior.
