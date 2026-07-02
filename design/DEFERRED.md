# Deferred (requires backend or behavioral change - out of scope for ui-v2)

## Dashboard-Home
- Add explicit empty states to growth and distribution charts (currently render empty axes); skipped because the inventory notes it as existing behavior and adding conditionals changes render logic.
- Render unused data (recentActivity, summary.inactiveClients) somewhere on the page; skipped, would add features.
- Partial or optimistic refresh instead of full-page skeleton on daysAhead change; skipped, changes refetch behavior.
- Convert the 'All Clients by Tenure' list into a register-style bordered table with mono numeric columns; skipped to keep the non-clickable hover rows and layout semantics exactly as inventoried.

## Attendance
- Replace native confirm() deletes on /attendance/records (sheets and Excel tabs) with a styled AlertDialog: behavior change, left as native confirm.
- Consolidate the 4x duplicated document preview dialog (HEAD sniffing, pdf/image mutual fallback, cache-buster, blob download) into one shared component: touches shared behavior, skipped.
- Move the View Records button into the PageHeader actions slot: its visibility is conditional on client+month selection inside the attachment card, so moving it would change when it renders; left in place.
- Align the Excel tab's first-click sort direction (asc) with the sheets tab (desc): inventoried as intentional current behavior, left inconsistent.
- Remove emoji-marked console.log/console.error debug statements in wizard and records preview handlers: code behavior, not presentation; untouched.
- Render a true day-by-day muster grid for the month in step 3 (the UI only captures a present-days count per employee, so a per-day grid would require new data and behavior).

## Payroll
- Delete the orphaned components/payroll/client-reports.tsx and components/payroll/employee-reports.tsx (and their now-unreachable exports in utils/file-export.ts). Deletion is a codebase change beyond presentation-only scope; inventory flags them as port-or-delete.
- Guide's empty-state pattern calls for a primary action button; adding one to the reports empty state would duplicate the Generate Report control and add a new interactive element, so it was skipped.
- Making 'Generate Report' the brand moment on the reports screen was considered and skipped: scope reserves variant brand for Calculate Payroll / Finalize only.
- Replacing native title-attribute tooltips on PF/ESIC info icons with the Tooltip component would change hover behavior; kept native titles.
- Step-2 'Continue to Admin Input' / 'Calculate Payroll' dual-label button kept ink even when it reads Calculate Payroll, to avoid a conditional brand variant on a button whose label is state-dependent.

## Employees
- Advanced search still has no user-visible error state or toast on fetch failure (known gap in inventory; adding one is a behavior change).
- AdditionalDetailsForm still uses free-text DD-MM-YYYY inputs for its three dates while the add form uses DatePickers; unifying would change behavior.
- TerminateEmploymentDialog still collects a termination reason it never sends to the backend.
- The list page's inline Employee Details dialog duplicates a subset of EmployeeViewDialog; consolidating them would change behavior.
- Mixed toast systems remain (sonner in most files, legacy useToast in EmploymentHistoryForm, AssignEmploymentDialog, TerminateEmploymentDialog); standardizing would alter toast presentation and timing.
- EmploymentHistoryForm's onUpdate prop is still never invoked (pre-existing dead wiring, left as is).

## Clients
- app/(dashboard)/clients/templates/loading.tsx orphan (route 404s, file returns null) left untouched; deleting it is an owner decision per inventory.
- Dead components left untouched and unmigrated per surgical-change rule: components/clients/client-view-pdf.tsx, components/clients/salary-template-field.tsx, components/clients/salary-template-form.tsx (never imported; still contain old palette).
- Date widget inconsistency (Add uses DatePicker with yearRange, Edit uses Popover+Calendar with disabled-date logic) kept as-is; unifying would change widget behavior/constraints.
- Double-card nesting on the Preview tab (page Card wrapping SalarySlipPreview's own Card with duplicate titles) kept to avoid restructuring; flattening is a follow-up.
- Native browser confirm() for 'Disable All' mandatory fields kept (replacing with AlertDialog would be a behavior change).
- components/pdf/client-view-pdf.tsx hex re-branding belongs to Phase 4 (out of module scope).
- Trash2 and AlertDialog imports in app/(dashboard)/clients/page.tsx are pre-existing unused code; left in place per surgical-change rule.

## Settings
- Add a confirmation dialog to department delete (departments delete directly by name with no confirm, unlike designations and rate schedules): behavior change
- Render or remove the dead 'error' state on department and designation pages (set on add failure, never displayed): behavior/code change beyond presentation
- Unify the two live toast systems (sonner on department/designation/salary vs legacy use-toast via use-auth on profile/security): behavior change
- Convert salary-rate-schedule row cards to a register Table (Table components are imported but unused): would alter the responsive sm/lg grid collapse behavior, so kept the card-row layout with mono numerals instead
- Remove pre-existing unused imports on the salary page (Table*, Pagination, Skeleton, X): pre-existing dead code, left untouched per surgical-change rule

## Boundaries
- Dashboard layout's plain-text 'Loading...' auth-initializing state (app/(dashboard)/layout.tsx) could use the Loader component, but that file belongs to the shell module and is out of scope.
- Considered unifying the two error boundaries' description copy; kept the wording difference noted in the inventory to avoid any audit mismatch.

## Cross-cutting
- The login form's zod schema enforces password complexity (uppercase + lowercase + digit) at sign-in time, so valid backend credentials that predate the policy (e.g. the local demo login admin123) are rejected client-side before any API call. Login forms should only check non-empty; complexity belongs on set/reset flows. Behavior change, so deferred.
- Unify the dual toast systems (Radix use-toast bottom-right + Sonner top-right). Both pipelines are live with different corners and styles; consolidating means migrating 30+ call sites and changing user-visible toast placement.
- PdfPreviewDialog has no user-facing error state (errors go to console only). Adding one is a behavior addition.
- ClientReports and EmployeeReports components (payroll module) are dormant: no route imports them. They were restyled anyway; deciding their fate is a product call.
- Login button label stays 'Login' to match the 'Login successful' toast wired in hooks/use-auth; renaming the flow end-to-end touches the shared auth hook.
- Dead code flagged by inventory (components/error-boundary.tsx, components/mode-toggle.tsx, ui sidebar kit, lib/icons.ts, hooks/use-employee.ts, duplicate use-mobile, unused formatDate in lib/utils) left in place per surgical-change rule; a cleanup pass needs an explicit decision.

## E2E functional pass (2026-07-03): fixed vs deferred

### Fixed on this branch (frontend-only)
- Wizard steps no longer turn green when skipped; each step is validated on leave (employee add/edit).
- All forms carry `noValidate` so zod drives one consistent styled error message instead of native browser bubbles (previously a rate of ₹0 silently failed with no message).
- PDF preview dialog now has a visible error state with a Try again button.
- Advanced salary-template edits persist even if the client is saved without pressing the (now "Validate fields") button; quick toggles and the advanced panel stay in sync.
- Payroll: calculate button guarded against double-submit; admin-input value of 0 renders instead of blanking; invalid finalized date guarded; calculate/finalize failures show one toast instead of two.
- Advanced employee search: failures surface an inline error + toast + retry; changing page size no longer fetches with a stale limit.
- Auth: a missing refresh token no longer wedges every later request; a retried 401 now clears the session and redirects instead of failing silently.
- Attendance: CSV export escapes embedded quotes; invalid month strings no longer crash the records tables.
- Expected 404 on the "any payroll this month?" check no longer fires a spurious "Not Found" toast (new `skipErrorToast` request flag).

### Deferred, low severity (frontend, safe to batch later)
- Add in-flight/disabled guards to a few more buttons: advanced-search Search/Clear, rate-schedule Delete/Deactivate, client Save (rapid double-click), department/designation delete rows.
- Department/designation rows delete from an icon-only trash button with no confirm dialog and no aria-label; add a confirm + aria-label.
- salary-slip-preview deduction calc keys "advance" but the default template field key is "advanceTaken", so a sample advance is not reflected in the preview total (preview-only; real payroll uses the backend calc).
- employee-reports free-text search silently picks the first match when several employees match; show a chooser.
- attendanceService.checkAttendanceExists returns false on network error, hiding failures.

### Backend bugs found (out of scope, need ems-backend changes)
- Salary rate schedule update can never clear `effectiveTo`: the service does `effectiveTo = effectiveTo || undefined`, so passing null is dropped by Prisma. Frontend cannot reopen a closed rate via edit; only delete + recreate works.
- Login endpoint accepts a password the login FORM rejects: the form's zod schema enforces complexity (uppercase/lowercase/digit), so valid legacy credentials like the demo `admin123` fail client-side before any request. Sign-in should only check non-empty; complexity belongs on set/reset.
