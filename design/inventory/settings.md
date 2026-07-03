# Settings Section Inventory

Scope: `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/settings/` (layout, index, department, designation, profile, salary-rate-schedule, security, loading).

All settings pages render inside the shared settings layout (sidebar + content). Toasts on department/designation/salary-rate-schedule pages use `sonner` (`toast` from "sonner"); profile/security pages get toasts indirectly from `use-auth` which uses the legacy `use-toast` (`@/components/ui/use-toast`) system. Both toast systems are live in this section.

---

## 0. Settings Layout (shared shell)

- Route: wraps all `/settings/*` routes
- File: `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/settings/layout.tsx`

### Interactive inventory

1. Sidebar nav link "My Profile" -> `/settings/profile` (icon: `User`)
2. Sidebar nav link "Password" -> `/settings/security` (icon: `Shield`)
3. Sidebar nav link "Departments" -> `/settings/department` (icon: `Building2`)
4. Sidebar nav link "Designations" -> `/settings/designation` (icon: `Briefcase`)
5. Sidebar nav link "Salary Rate Schedule" -> `/settings/salary-rate-schedule` (icon: `DollarSign`)
6. Active-route indicator: active link gets `bg-primary/20 text-primary` plus a trailing `ChevronRight` icon (exact `pathname ===` match only).

Nav is grouped with uppercase group labels: "My Account" (Profile, Password) and "Company Setup" (Departments, Designations, Salary Rate Schedule). Sidebar heading text: "Settings".

### Data displayed
- Static nav config only (`settingsGroups` array in the file). No service calls.

### States
- None (static). No loading/empty/error.

### Current styling
- Layout: `container py-8`, `flex flex-col md:flex-row gap-8`; sidebar `w-full md:w-64 shrink-0`, content `flex-1`.
- Glassmorphism card on sidebar: `backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl rounded-2xl overflow-hidden`.
- Hardcoded colors bypassing tokens: `bg-white/5`, `border-white/10`, `text-gray-900 dark:text-white`, `hover:text-gray-700 dark:hover:text-gray-300`, `hover:bg-white/5`, `text-[11px]` group labels with `text-muted-foreground/70`.
- Icons: `User`, `Shield`, `ChevronRight`, `Building2`, `Briefcase`, `DollarSign` (lucide).

### Navigation
- To all five settings subpages. Content area renders the child route.

---

## 0b. Settings Loading (route-level)

- File: `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/settings/loading.tsx`
- Renders `<Loader text="Loading settings..." size="lg" fullPage />` from `/Users/tarunvadde/Development/tss-frontend/components/ui/loader.tsx` (spinning `Loader2` icon, `text-primary`, centered at `height: calc(100vh-200px)`).

---

## 1. Settings Overview (index)

- Route: `/settings`
- File: `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/settings/page.tsx`
- Server component (no "use client").

### Interactive inventory

1. Card link "My Profile" ("Name, email, mobile and department") -> `/settings/profile` (icon: `User`)
2. Card link "Password" ("Change your login password") -> `/settings/security` (icon: `Shield`)
3. Card link "Departments" ("Manage employee and user departments") -> `/settings/department` (icon: `Building2`)
4. Card link "Designations" ("Manage job designations") -> `/settings/designation` (icon: `Briefcase`)
5. Card link "Salary Rate Schedule" ("Per-day rates for Central and State categories") -> `/settings/salary-rate-schedule` (icon: `DollarSign`)
6. Hover affordances: card `hover:border-primary/50 hover:bg-muted/40`; trailing `ChevronRight` translates right on group hover (`group-hover:translate-x-0.5`).

Page copy: h1 "Settings", subtitle "Manage your account and the company configuration." Group headings "My Account" ("Your personal login and profile.") and "Company Setup" ("Shared configuration for the whole company.").

### Data displayed
- Static link config only. No service calls.

### States
- None. Static page.

### Current styling
- Layout: `space-y-8`; each group `space-y-3` with a `grid gap-3 sm:grid-cols-2` of link cards.
- Uses shadcn `Card`/`CardContent`; icon chip `h-10 w-10 rounded-lg bg-primary/10 text-primary`.
- Token-friendly (uses `text-muted-foreground`, `bg-primary/10`); no gray-scale hardcodes here. This is the one settings page that mostly respects theme tokens.
- Icons: `User`, `Shield`, `Building2`, `Briefcase`, `DollarSign`, `ChevronRight` (lucide).

### Navigation
- To all five settings subpages.

---

## 2. Department Management

- Route: `/settings/department`
- File: `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/settings/department/page.tsx`
- Client component. h1: "Department Management".

### Interactive inventory

1. Tab "User Departments" (value `users`, default active; icon `Users`) — switches the card to the user-department list; add/delete actions target user departments.
2. Tab "Employee Departments" (value `employees`; icon `UserPlus`) — switches to the employee-department list; add/delete target employee departments.
3. Button "Add Department" (`Plus` icon, `bg-primary hover:bg-primary/90`) — opens the Add dialog. Which entity gets created depends on the active tab.
4. Dialog "Add New Department" (controlled by `isAddingDepartment`):
   - Form field `name`: text Input, label "Department Name", placeholder "Enter department name". Zod validation: `min(2)` message "Department name must be at least 2 characters".
   - Submit button "Add Department" (full width); while submitting shows `Loader2` spinner + "Adding...", disabled.
   - On success: calls `departmentService.addUserDepartment(name)` or `addEmployeeDepartment(name)` per active tab, resets form, closes dialog, refetches both lists.
5. Search input: placeholder "Search departments...", leading `Search` icon; client-side case-insensitive substring filter on department name (filters the active tab's list).
6. Per-row delete button: ghost icon button (`Trash2`, `text-red-400 hover:text-red-600 hover:bg-red-500/10`) — deletes by department NAME via `deleteUserDepartment(name)` / `deleteEmployeeDepartment(name)` depending on tab. NO confirmation dialog (unlike designations). Refetches after delete.
7. Toasts (sonner):
   - error "Failed to fetch departments" (fetch failure)
   - success "User department added successfully" / "Employee department added successfully"
   - error "Failed to add department"
   - success "User department deleted successfully" / "Employee department deleted successfully"
   - error "Failed to delete department"
8. Department list rows: each row shows a circular `Building2` icon chip and the department name. Rows live inside a `ScrollArea` fixed at `h-[400px]`.

Note: an `error` state string is set on add failure but never rendered in the UI (dead state; toast is the only surfaced feedback).

### Data displayed
- Entities: user departments and employee departments; field rendered: `name` (id used as key).
- Service calls (in `/Users/tarunvadde/Development/tss-frontend/services/departmentService.ts`): `departmentService.getUserDepartments()`, `getEmployeeDepartments()` (fetched in parallel on mount), `addUserDepartment(name)`, `addEmployeeDepartment(name)`, `deleteUserDepartment(name)`, `deleteEmployeeDepartment(name)`.

### States
- Loading: only in-dialog submit spinner ("Adding..."). NO list-level loading indicator during initial fetch.
- Empty: MISSING — an empty/filtered-out list renders a blank scroll area with no message.
- Error: fetch/add/delete errors surface via sonner toasts only; no inline error UI.

### Current styling
- Layout: `container py-8` (double-nested inside layout's own `container`), Tabs above a glass Card.
- Glass card: `backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl rounded-2xl overflow-hidden` with an absolute gradient overlay `bg-gradient-to-br from-primary/10 to-transparent ... opacity-50` and `relative z-10` content layers.
- Hardcoded colors: `text-gray-900 dark:text-white` (h1, titles, names), `text-gray-600 dark:text-gray-300` (descriptions), search input `bg-white/5 border-white/10 ... placeholder:text-gray-500 dark:placeholder:text-gray-400`, `text-gray-400` search icon, delete button `text-red-400 hover:text-red-600 hover:bg-red-500/10`, rows `bg-white/5 border-white/10 hover:bg-white/10`, icon chip `bg-primary/20`.
- Tab triggers use `data-[state=active]:bg-primary/20`.
- Icons: `Building2`, `Loader2`, `Users`, `UserPlus`, `Search`, `Plus`, `Trash2` (lucide).

### Navigation
- Stays on page; settings sidebar (layout) is the only way out.

---

## 3. Designation Management

- Route: `/settings/designation`
- File: `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/settings/designation/page.tsx`
- Client component. h1: "Designation Management". Card title "Designations", description "Manage job designations and titles".

### Interactive inventory

1. Button "Add Designation" (`Plus` icon, `bg-primary hover:bg-primary/90`) — opens Add dialog.
2. Dialog "Add New Designation":
   - Form field `name`: text Input, label "Designation Name", placeholder "Enter designation name". Zod: `min(2)` message "Designation name must be at least 2 characters".
   - Submit button "Add Designation" (full width); submitting state: `Loader2` spinner + "Adding...", disabled.
   - On success: `designationService.createDesignation(name)`, form reset, dialog closed, list refetched.
3. Search input: placeholder "Search designations...", leading `Search` icon; client-side case-insensitive filter on name.
4. Per-row delete button: ghost icon (`Trash2`, red classes as departments) — sets `designationToDelete`, opening the confirm dialog (does NOT delete directly).
5. AlertDialog delete confirmation:
   - Title "Are you sure?", description: `This will permanently delete the designation "{name}". This action cannot be undone.`
   - "Cancel" (AlertDialogCancel) — closes.
   - "Delete" action button (`bg-red-500 hover:bg-red-600`) — calls `designationService.deleteDesignationById(id)`, refetches.
6. Toasts (sonner):
   - error "Failed to fetch designations"
   - success "Designation added successfully"
   - error "Failed to add designation"
   - success "Designation deleted successfully"
   - error "Failed to delete designation"
7. Designation list rows: circular `Briefcase` icon chip + name, in `ScrollArea` `h-[400px]`.

Note: `error` state string set on add failure but never rendered (dead state, same as departments).

### Data displayed
- Entity: designation; field rendered: `name` (id used as key and for delete).
- Service calls (`/Users/tarunvadde/Development/tss-frontend/services/designationService.ts`): `designationService.getDesignations()` on mount, `createDesignation(name)`, `deleteDesignationById(id)`. (Service also exposes `getDesignationById`, `getDesignationByName`, `deleteDesignationByName` — unused by this page.)

### States
- Loading: submit spinner in dialog only; NO list-level loading state.
- Empty: MISSING — blank scroll area, no message.
- Error: toasts only; no inline error UI.

### Current styling
- Identical glass-card treatment to departments: `backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl rounded-2xl overflow-hidden` + absolute `bg-gradient-to-br from-primary/10 to-transparent` overlay.
- Hardcoded colors: same set as departments (`text-gray-900 dark:text-white`, `text-gray-600 dark:text-gray-300`, `bg-white/5`, `border-white/10`, `text-gray-400`, `placeholder:text-gray-500 dark:placeholder:text-gray-400`, `text-red-400 hover:text-red-600 hover:bg-red-500/10`, `hover:bg-white/10`); delete action `bg-red-500 hover:bg-red-600`.
- Icons: `Briefcase`, `Loader2`, `Search`, `Plus`, `Trash2` (lucide).

### Navigation
- Stays on page.

---

## 4. Profile Settings

- Route: `/settings/profile`
- File: `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/settings/profile/page.tsx`
- Client component. h1: "Profile Settings". Card title "Personal Information", description "Update your personal information and account settings".

### Interactive inventory

1. Form field `name`: text Input, label "Full Name", placeholder "John Doe", leading `User` icon inside input. Zod: `min(2)` "Name must be at least 2 characters".
2. Form field `email`: text Input, label "Email", placeholder "your.email@example.com", leading `Mail` icon. Zod: `.email()` "Please enter a valid email address".
3. Form field `mobileNumber`: text Input, label "Mobile Number", placeholder "9876543210", leading `Phone` icon. Zod: `.length(10)` "Mobile number must be 10 digits".
4. Read-only field "Role": disabled Input showing `user?.role || "-"` (`bg-muted`). Not part of the form submission.
5. Form field `departmentId`: Select, label "Department", placeholder "Select a department" ("Loading..." while departments fetch). Options: user departments from `departmentService.getUserDepartments()` (item label = department name, value = id). While loading, dropdown content shows a centered `Loader2` spinner. Zod: required "Please select a department".
6. Submit button "Save Changes" (`Save` icon, `w-full md:w-auto`); submitting state: `Loader2` spinner + "Saving...", disabled.
7. Inline destructive Alert: renders `error` message on failure (`bg-red-500/10 text-red-500 border-red-500/20`).
8. Inline success Alert: "Profile updated successfully!" (`bg-green-500/10 text-green-500 border-green-500/20`), auto-dismisses after 3 seconds via setTimeout.
9. Toasts (via `useAuth().updateUser`, legacy use-toast system): success "Profile updated" / "Your profile has been updated successfully."; destructive "Update profile failed" + error message.

Behavior notes: form defaults come from `useAuth().user` and re-`reset()` whenever `user` changes. On submit calls `updateUser(data)` (PATCH via `authService.updateUser(user.id, data)`, fields: name, email, mobileNumber, departmentId) then `refreshUser()` to re-fetch the current user.

### Data displayed
- Entity: current authenticated user — fields `name`, `email`, `mobileNumber`, `role` (read-only), `departmentId`.
- Entity: user departments (for the select) — `id`, `name`.
- Service calls: `departmentService.getUserDepartments()` directly; `authService.updateUser()` and `authService.getCurrentUser()` indirectly through `useAuth().updateUser` / `refreshUser` (`/Users/tarunvadde/Development/tss-frontend/services/auth.ts`, hook `/Users/tarunvadde/Development/tss-frontend/hooks/use-auth.tsx`).

### States
- Loading: `isLoadingDepartments` drives select placeholder + in-dropdown spinner; `isLoading` drives submit button spinner/disable.
- Empty: n/a (form). If departments fetch fails it only console.errors; select shows an empty dropdown (silent failure, no user-facing error).
- Error: inline destructive Alert + toast from hook. Success: inline green Alert (3s) + toast.

### Current styling
- Same glass card + gradient overlay as departments/designations.
- Layout: single column, with email/mobile and role/department in `grid grid-cols-1 md:grid-cols-2 gap-6`.
- Hardcoded colors: `text-gray-900 dark:text-white` labels, inputs `pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 ... placeholder:text-gray-500 dark:placeholder:text-gray-400`, `FormMessage className="text-red-400"`, alerts `bg-red-500/10 text-red-500 border-red-500/20` and `bg-green-500/10 text-green-500 border-green-500/20`, select content `bg-card border-white/10`, select items `hover:bg-white/5`, icons `text-foreground/40`.
- Icons: `User`, `Phone`, `Mail`, `Save`, `Loader2` (lucide).

### Navigation
- Stays on page.

---

## 5. Security Settings (Change Password)

- Route: `/settings/security`
- File: `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/settings/security/page.tsx`
- Client component. h1: "Security Settings". Card title "Change Password", description "Update your password to keep your account secure".

### Interactive inventory

1. Form field `oldPassword`: password Input, label "Current Password", placeholder "••••••••", leading `Lock` icon. Zod: `min(6)` "Password must be at least 6 characters".
2. Show/hide toggle for current password: bare `<button type="button">` with `Eye`/`EyeOff` icon, toggles input type text/password.
3. Form field `newPassword`: password Input, label "New Password", placeholder "••••••••", leading `Lock` icon. Zod: `min(6)`.
4. Show/hide toggle for new password (`Eye`/`EyeOff`).
5. Form field `confirmPassword`: password Input, label "Confirm New Password", placeholder "••••••••", leading `Lock` icon. Zod refine: must equal newPassword, message "Passwords don't match" (attached to confirmPassword).
6. Show/hide toggle for confirm password (`Eye`/`EyeOff`).
7. Static "Password requirements:" bullet list: at least 6 characters; include upper and lower case; include a number; include a special character. (Display-only; only the 6-char rule is actually validated.)
8. Submit button "Change Password" (`Save` icon, `w-full md:w-auto`); submitting: `Loader2` + "Changing Password...", disabled. On success: form reset.
9. Inline destructive Alert on error with branched messages: HTTP 400 -> "Current password is incorrect."; server-provided `response.data.message` if present; generic "An error occurred. Please try again."; no response -> "No response from server. Please check your internet connection."; else `err.message` fallback.
10. Inline success Alert: "Password changed successfully!" (green classes), auto-dismisses after 3 seconds.
11. Toasts (via `useAuth().changePassword`, legacy use-toast): success "Password changed" / "Your password has been changed successfully."; destructive "Change password failed" + message.

### Data displayed
- No entity data rendered; form-only. Calls `authService.changePassword({ oldPassword, newPassword })` through `useAuth().changePassword`.

### States
- Loading: submit button spinner/disabled.
- Empty: n/a.
- Error/success: inline Alerts (error persistent, success 3s) plus hook toasts.

### Current styling
- Same glass card + gradient overlay pattern.
- Hardcoded colors: labels `text-gray-900 dark:text-white`, inputs `pl-10 pr-10 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 ... placeholder:text-gray-500`, eye-toggle buttons `text-gray-400 hover:text-gray-600` (raw buttons, not shadcn Button), `FormMessage text-red-400`, alerts red/green as profile, requirements text `text-gray-600 dark:text-gray-300`, `Lock` icons `text-gray-400`.
- Icons: `Lock`, `Save`, `Loader2`, `Eye`, `EyeOff` (lucide).

### Navigation
- Stays on page.

---

## 6. Salary Rate Schedule Management

- Route: `/settings/salary-rate-schedule`
- File: `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/settings/salary-rate-schedule/page.tsx`
- Client component. h1: "Salary Rate Schedule Management". Card title "Rate Schedules", description "Manage per-day salary rates for CENTRAL and STATE categories".

### Interactive inventory

1. Button "Add Rate Schedule" (`Plus` icon, `bg-primary hover:bg-primary/90 w-full sm:w-auto`) — opens Add dialog. Closing the dialog clears the dialog error and resets the form.
2. Dialog "Add New Rate Schedule" (`max-w-2xl max-h-[90vh] overflow-y-auto`):
   - Inline destructive Alert inside the dialog showing `dialogError` (with `AlertTriangle` icon) on failed create.
   - Field `category`: Select, label "Category *". Options: Central (`CENTRAL`), State (`STATE`) — labels via `label.salaryCategory` from `/Users/tarunvadde/Development/tss-frontend/lib/labels.ts`. Zod: nativeEnum required + refine restricting to CENTRAL/STATE ("Rate schedules only apply to CENTRAL or STATE categories"). Default CENTRAL.
   - Field `subCategory`: Select, label "Subcategory *". Options: Skilled, Unskilled, Highly Skilled, Semi-Skilled (`SKILLED`/`UNSKILLED`/`HIGHSKILLED`/`SEMISKILLED` via `label.salarySubCategory`). Required. Default SKILLED.
   - Field `ratePerDay`: number Input, label "Rate Per Day (₹) *", `step 0.01`, `min 0.01`, placeholder "Enter rate per day", parses to float (empty -> 0). Zod: `min(0.01)` "Rate per day must be greater than 0".
   - Field `effectiveFrom`: custom `DatePicker` (popover with month select, year select 1900-2100, calendar, clear-X on trigger), label "Effective From *". Required date. Sent as `yyyy-MM-dd`.
   - Submit button "Add Rate Schedule" (full width); submitting: `ButtonLoader` + "Adding...". Calls `salaryRateScheduleService.create(payload)`; on success resets, closes, refetches.
3. Filter select "Category" (`filter-category`): options All categories / Central / State. Changing any filter resets page to 1 and refetches.
4. Filter select "Subcategory" (`filter-subcategory`): All subcategories / Skilled / Unskilled / Highly Skilled / Semi-Skilled.
5. Filter select "Status" (`filter-active`): All statuses / Active (`true`) / Inactive (`false`).
6. Button "Clear Filters" (outline, `Filter` icon; text collapses to "Clear" below `sm`) — resets all three filters to "all".
7. Inline destructive Alert (page-level, `AlertTriangle` icon) rendering fetch `error`.
8. Rate schedule list (card rows in a `ScrollArea` `h-[400px] sm:h-[500px]`; NOT a `<table>` although Table components are imported unused). Each row shows five labeled columns (grid `sm:grid-cols-2 lg:grid-cols-5`):
   1. "Category" — `label.salaryCategory(schedule.category)`
   2. "Subcategory" — `label.salarySubCategory(schedule.subCategory)`
   3. "Rate Per Day" — `₹{ratePerDay.toLocaleString()}`
   4. "Effective Period" — `MMM dd, yyyy` from effectiveFrom, then `- {effectiveTo}` or `- Ongoing`
   5. Status Badge: variant `default` "Active" / variant `secondary` "Inactive"
   plus a circular `DollarSign` icon chip.
9. Per-row Edit button: ghost icon (`Edit`, `text-blue-400 hover:text-blue-600 hover:bg-blue-500/10`) — opens Edit dialog prefilled.
10. Per-row Delete button: ghost icon (`Trash2`, red classes) — opens delete/deactivate confirm.
11. Edit dialog "Edit Rate Schedule" (`max-w-2xl max-h-[90vh] overflow-y-auto`):
    - Inline destructive Alert for `dialogError`.
    - "Category": disabled Input showing label, helper text "Category cannot be changed".
    - "Subcategory": disabled Input, helper "Subcategory cannot be changed".
    - Editable `ratePerDay` (same number input) and `effectiveFrom` (DatePicker).
    - Buttons: "Cancel" (outline, closes + resets) and "Update Rate Schedule" (submitting: `ButtonLoader` + "Updating..."). Calls `salaryRateScheduleService.update(id, { ratePerDay, effectiveFrom })`.
12. AlertDialog delete/deactivate confirmation (dual-mode by `isActive`):
    - Active record: description "This will deactivate the rate schedule for {Category}, {Subcategory} (₹{rate}/day). It stays on record for past payroll but stops applying to new payroll." plus a yellow warning box (`bg-yellow-500/10 border-yellow-500/20`, text `text-yellow-600 dark:text-yellow-400`): "This rate schedule is currently active. Deactivating it may affect employees using this rate." Action button label "Deactivate" -> `salaryRateScheduleService.update(id, { isActive: false })`.
    - Inactive record: description "This will permanently delete the rate schedule for {Category}, {Subcategory} (₹{rate}/day). This action cannot be undone." Action label "Delete" -> `salaryRateScheduleService.delete(id)`.
    - "Cancel" button; action button `bg-red-500 hover:bg-red-600` in both modes.
13. Pagination (custom, shown only when totalPages > 1): text "Showing {n} of {total} rate schedules"; "Previous" and "Next" outline buttons (disabled at bounds or while loading). Page size fixed at 10. (shadcn `Pagination` component imported but unused.)
14. Toasts (sonner):
    - error "Failed to fetch rate schedules"
    - success "Rate schedule added successfully"; error = server message or "Failed to add rate schedule" (5s duration)
    - success "Rate schedule updated successfully"; error = server message or "Failed to update rate schedule" (5s duration)
    - success "Rate schedule deactivated successfully" / "Rate schedule deleted successfully"; error "Failed to deactivate rate schedule" / "Failed to delete rate schedule"

### Data displayed
- Entity: `SalaryRateSchedule` (`/Users/tarunvadde/Development/tss-frontend/types/salary.ts`): `category`, `subCategory`, `ratePerDay`, `effectiveFrom`, `effectiveTo`, `isActive` (id as key; createdAt/updatedAt not shown).
- Service calls (`/Users/tarunvadde/Development/tss-frontend/services/salaryRateScheduleService.ts`): `salaryRateScheduleService.getAll({ page, limit: 10, category?, subCategory?, isActive? })` (paginated, `meta.total`/`meta.limit` drive page count), `create(dto)`, `update(id, dto)`, `delete(id)`. (Service also has `getById` and `getActiveRate` — unused here.)
- Enum-to-label mapping via `label.salaryCategory` / `label.salarySubCategory` (`/Users/tarunvadde/Development/tss-frontend/lib/labels.ts`).

### States
- Loading: `InlineLoader` (centered spinner) when loading with no rows; pagination buttons disabled while loading; dialog submit buttons show `ButtonLoader` + text.
- Empty: "No rate schedules found" centered message (`text-gray-500 dark:text-gray-400`).
- Error: page-level inline destructive Alert + toast; dialog-level inline Alert + toast for create/update.

### Current styling
- Same glass card + `bg-gradient-to-br from-primary/10 to-transparent` overlay; `container py-8` (double-nested container).
- Filters in `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`; filter triggers and Clear button hardcode `bg-white/5 border-white/10`.
- Hardcoded colors: row cards `bg-white/5 border-white/10 hover:bg-white/10`; column labels `text-gray-500 dark:text-gray-400`; values `text-gray-900 dark:text-white`; edit `text-blue-400 hover:text-blue-600 hover:bg-blue-500/10`; delete `text-red-400 hover:text-red-600 hover:bg-red-500/10`; alerts `bg-red-500/10 text-red-500 border-red-500/20`; warning box `bg-yellow-500/10 border-yellow-500/20` with `text-yellow-600 dark:text-yellow-400`; destructive actions `bg-red-500 hover:bg-red-600`; disabled inputs `bg-muted`; helper text `text-xs text-gray-500`.
- Icons: `DollarSign`, `Plus`, `Trash2`, `Edit`, `Filter`, `X` (imported; X used inside DatePicker), `AlertTriangle` (lucide); DatePicker adds `CalendarIcon`, `ChevronLeft`, `ChevronRight`.
- Unused imports worth knowing during redesign: `Table/TableBody/TableCell/TableHead/TableHeader/TableRow`, `Pagination`, `Skeleton`, `X`.

### Navigation
- Stays on page.

---

## Cross-cutting notes for the redesigner

1. Two toast systems: sonner (department, designation, salary-rate-schedule) vs legacy `use-toast` (profile/security via `use-auth`). Both must keep firing or be consciously unified.
2. Department delete has NO confirmation dialog; designation and rate-schedule deletes DO. Preserve or deliberately change, but note the asymmetry.
3. Department deletes are keyed by NAME (URL-encoded path param); designation deletes by ID.
4. Rate-schedule delete is dual-mode: active records are soft-deactivated (`update isActive:false`), inactive records are hard-deleted.
5. `container py-8` is applied both in the settings layout AND inside department/designation/profile/security/salary-rate-schedule pages (double container nesting). The index page does not repeat it.
6. Dead `error` state variables on department and designation pages (set but never rendered).
7. Rate-schedule category/subCategory are immutable after creation (edit dialog enforces this with disabled inputs); the Zod refine limits category to CENTRAL/STATE even though the enum also has SPECIALIZED.
8. The glass style (`backdrop-blur-sm bg-white/5 border-white/10` + primary gradient overlay) is the dominant hardcoded pattern in this section and appears on every page except the settings index.
