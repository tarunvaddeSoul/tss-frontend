# Employees Module Inventory

Contract for the UI redesign. Every item listed here must survive the redesign.
Scope: `app/(dashboard)/employees/**` and `components/employees/**` (including `forms/`), plus the shared `PdfPreviewDialog` these screens delegate to.

Service layer referenced throughout: `services/employeeService.ts`, `services/designationService.ts`, `services/departmentService.ts`, `services/clientService.ts`, `services/salaryRateScheduleService.ts`.

---

## 1. /employees (index redirect)

- **Route:** `/employees`
- **File:** `app/(dashboard)/employees/page.tsx` (client component)
- **Behavior:** `useEffect` redirects to `/employees/list` via `router.push`.
- **UI while redirecting:** centered text "Redirecting to employee list..." in `text-muted-foreground`, container `flex items-center justify-center h-[50vh]`.
- **Loading file:** `app/(dashboard)/employees/loading.tsx` renders a full skeleton page: header skeletons (h-8 w-48, h-4 w-64, h-10 w-32 button), a search Card skeleton, and a list Card with 8 row skeletons (avatar circle h-10 w-10, two text lines, two pill skeletons, two icon-button skeletons).
- **Navigation:** always to `/employees/list`.

---

## 2. /employees/list (Employee List)

- **Route:** `/employees/list`
- **File:** `app/(dashboard)/employees/list/page.tsx` (client). `loading.tsx` returns `null`.

### Interactive inventory

1. **Button "Add Employee"** (primary, `Plus` icon) wrapped in `Link href="/employees/add"`.
2. **Search text input** placeholder "Search employees". Debounced 350ms into `searchParams.searchText` (resets page to 1). Also submitted by the form.
3. **Select: Designation filter.** Placeholder "Select designation". Options: "All Designations" + list from `designationService.getDesignations()`. "all" clears the filter.
4. **Select: Department filter.** Placeholder "Select department". Options: "All Departments" + `departmentService.getEmployeeDepartments()`.
5. **Select: Client filter.** Placeholder "Select client". Options: "All Clients" + `clientService.getClients()` (`response.data.clients`).
6. **Select: Status filter.** Placeholder "Select status". Options: All Statuses / Active (`ACTIVE`) / Inactive (`INACTIVE`). Changing resets page to 1.
7. **Button "Search"** (submit, `Search` icon, full-width in its grid cell). Applies `searchInput` immediately and resets to page 1.
8. **Select: Items per page.** Label text "Items per page:". Options 10 / 25 / 50 / 100, width `w-[80px]`. Resets page to 1.
9. **Table (Employee List)** wrapped in `ScrollArea` > Card; horizontal scroll container `overflow-x-auto scrollbar-sleek` with inner `min-w-[900px]`. Columns, in order:
   1. **Employee**: Avatar (`AvatarImage src=employee.avatar || "/placeholder.svg"`, fallback initials), full name (`firstName lastName`), and a **clickable ID button** "ID: {id}" (`text-xs text-primary hover:underline`) that navigates to `/employees/view/{id}`.
   2. **Designation**: `Badge variant="outline" className="bg-primary/10"` with active employment history `designationName` or "N/A".
   3. **Department**: same badge style, `departmentName` or "N/A".
   4. **Client**: same badge style, `clientName` or "N/A".
   5. **Salary**: computed display, priority order: activeHistory PER_DAY -> `₹{salaryPerDay}/day`; activeHistory PER_MONTH -> `₹{salary}/month`; employee SPECIALIZED + monthlySalary -> `₹{monthlySalary}/month`; employee.salaryPerDay -> `₹{salaryPerDay}/day`; else "Not configured" (muted). Second line: `label.salaryCategory` + `label.salarySubCategory` joined by " · " or "-". Uses `toLocaleString("en-IN")`.
   6. **Status**: `Badge` variant `default` when ACTIVE else `secondary`, text via `label.status`.
   7. **Actions** (centered, ghost icon buttons):
      - **View** (`Eye` icon, title "View"): opens Employee Details dialog (see item 12).
      - **Edit** (`Edit` icon, title "Edit"): `router.push(/employees/edit/{id})`.
      - **View & Download PDF** (`Download` icon, spinner `Loader2` while loading, title "View & Download PDF"): fetches `employeeService.getEmployeeById(id)` then opens PdfPreviewDialog with `EmployeeViewPDF`. On fetch error: toast.error "Failed to load employee details for PDF".
      - **Terminate from TSS** (`XCircle` icon, title "Terminate from TSS", classes `text-destructive hover:text-destructive hover:bg-destructive/10`): only rendered when `status !== "INACTIVE"`. Opens TerminateEmployeeDialog. If somehow called on INACTIVE: toast.error "Employee is already terminated from TSS".
   - Sorting: none on this table. Pagination: server-side via `searchParams.page`.
10. **Pagination** component (shared `ui/pagination`) shown only when `totalPages > 1`, centered under the table. Guard against NaN/0 page values.
11. **Header caption**: CardDescription "Showing {employees.length} of {totalCount} employees" (only when totalCount > 0).
12. **Dialog: "Employee Details"** (`max-w-4xl`), triggered by the View action. Contents:
    - **Tabs** (2, grid cols 2): "Details" and "PDF Preview" (PDF tab disabled until a PDF exists or is loading).
    - Details tab: Avatar h-16 w-16 with initials fallback, name (text-xl font-bold), "ID: {id}", and a 2-column grid: Designation, Department, Client (all from active employment history, fallback "N/A"), Mobile (only if `contactDetails.mobileNumber` exists).
    - **Button "Generate PDF"** (disabled while generating, label switches to "Generating PDF..."). Dynamically imports `@react-pdf/renderer` + `EmployeeViewPDF`, creates blob URL, switches to PDF tab.
    - PDF tab states: generating (Skeleton h-[400px] + "Generating PDF..."), ready (iframe in `h-[500px]` bordered box + **Button "Download PDF"** with `Download` icon, downloads as `employee_{id}.pdf`), empty ("No PDF generated yet. Go to Details tab and click Generate PDF.").
    - **DialogFooter Button "Close"** (outline).
    - Blob URL revoked on unmount/regeneration.
13. **TerminateEmployeeDialog** (see component section 8). On success, the list refetches.
14. **PdfPreviewDialog** (dynamic import, ssr false; see section 12) titled "Employee Profile - {first} {last}", description "Employee ID: {id}", fileName `employee-{first}-{last}.pdf`.

### Toasts

- Error fetching employees: "Could not load employees. Please try again."
- Already-terminated guard: "Employee is already terminated from TSS".
- PDF detail fetch failure: "Failed to load employee details for PDF".
- (From TerminateEmployeeDialog: success/error toasts, see section 8.)

### Data displayed

- Employee list: `employeeService.getEmployees(searchParams)` -> `response.data` (Employee[]), `response.meta.total`.
- Per employee: firstName, lastName, id, avatar, employmentHistories (active entry: designationName, departmentName, clientName, salaryType, salaryPerDay, salary), salaryCategory, salarySubCategory, monthlySalary, salaryPerDay, status, contactDetails.mobileNumber.
- Filters: `designationService.getDesignations()`, `departmentService.getEmployeeDepartments()`, `clientService.getClients()`.
- Full record for PDF: `employeeService.getEmployeeById(id)`.

### States

- **Loading:** 5 skeleton rows x 7 skeleton cells inside the table.
- **Error:** in-table row with `AlertCircle` (h-8 w-8 `text-destructive`), message "Could not load employees. Check your connection and try again.", and **Retry** outline button that refetches. Plus toast.
- **Empty:** row "No employees found" (colSpan 7, centered, py-10).

### Current styling

- Layout: `space-y-6`; header flex row (title h1 `text-3xl font-bold tracking-tight`, subtitle) + Add button; Search Card with `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4`; list Card `CardContent p-0`.
- Hardcoded/off-token: `text-gray-500` subtitle ("View and manage all employees"); `bg-primary/10` on the three info badges; `/placeholder.svg` avatar fallback src.
- Custom classes: `scrollbar-sleek` on the table scroll container.
- Icons (lucide): Plus, Search, XCircle, Loader2, Download, Edit, Eye, AlertCircle.

### Navigation

- To `/employees/add` (Add button), `/employees/edit/{id}` (Edit), `/employees/view/{id}` (ID link). Dialogs stay in place.

---

## 3. /employees/add (Add New Employee)

- **Route:** `/employees/add`
- **File:** `app/(dashboard)/employees/add/page.tsx` (client). `loading.tsx` returns `null`.
- Renders `EmployeeForm` (section 7) inside a `ScrollArea` with `enableDrafts` and `draftStorageKey = EMPLOYEE_FORM_DRAFT_STORAGE_KEY` ("employee-form-draft").

### Page-level behavior

1. On mount fetches designations, departments, clients (mapped to `{value,label}` option arrays) via `designationService.getDesignations()`, `departmentService.getEmployeeDepartments()`, `clientService.getClients()`.
2. **Loading state:** Card with centered "Loading form data..." (h-[200px]).
3. **Fetch error:** toast.error(getErrorMessage(error) || "Failed to load form data. Please try again.").
4. **Submit:** `employeeService.createEmployee(values)`. On success: `clearEmployeeFormDraft()`, toast.success "Employee created successfully. Redirecting to employee list...", then `router.push("/employees/list")` after 1500ms. On failure: toast.error(getErrorMessage(error) || "Failed to create employee. Please try again.") and re-enables the form.
5. Header: h1 "Add New Employee" (`text-3xl font-bold tracking-tight`), subtitle "Create a new employee record" (`text-muted-foreground`).

### Navigation

- To `/employees/list` after successful create. No explicit cancel/back button on this page (browser/sidebar only).

---

## 4. /employees/edit/[id] (Edit Employee)

- **Route:** `/employees/edit/{id}`
- **Files:** `app/(dashboard)/employees/edit/[id]/page.tsx` (server wrapper, `container mx-auto py-6 space-y-6`, `Suspense` fallback skeleton with `bg-gray-200 rounded animate-pulse` blocks) delegating to `components/employees/edit-employee-content.tsx`.

### Data loading (EditEmployeeContent)

Parallel on mount: `employeeService.getEmployeeById(id)`, `clientService.getClients({page:1,limit:100})`, `designationService.getDesignations()`, `departmentService.getEmployeeDepartments()`, `employeeService.getEmployeeEmploymentHistory(id)`.

### Interactive inventory

1. **Button "Back to Employees"** (ghost, `ArrowLeft` icon; mobile label "Back") -> `router.push("/employees")`.
2. **Header:** `User` icon + "Edit: {firstName} {lastName}" (text-xl/2xl bold, truncate), **status Badge** (default when ACTIVE else secondary, raw `employee.status` text), subtitle "Update employee information and employment details".
3. **Button "View Employee"** (outline, `Eye` icon; mobile label "View") -> opens `EmployeeViewDialog` (section 10).
4. **ApiErrorAlert** shown when a non-fatal error exists, title "Update Error", dismissible (`onDismiss` clears the error).
5. **Tabs (8)** in a horizontally scrollable `TabsList` (`scrollbar-sleek`, each trigger `min-w-[120px..140px]` with icon + label):
   - **Basic** (`User`) -> BasicInfoForm
   - **Contact** (`Contact`) -> ContactInfoForm
   - **Employment** (`Briefcase`) -> EmploymentHistoryForm
   - **Salary** (`DollarSign`) -> SalaryInfoForm
   - **Bank** (`CreditCard`) -> BankInfoForm
   - **Additional** (`Briefcase`) -> AdditionalDetailsForm
   - **Reference** (`Contact`) -> ReferenceDetailsForm
   - **Documents** (`FileText`) -> EmployeeDocumentManager (refetches employee via `getEmployeeById` on document updates)
   (Each tab form is inventoried in sections 7.x below.)
6. **Sidebar Card "Employee Summary":** circular `bg-primary/10` avatar with `User` icon; name; active designation ("No designation" fallback); rows Employee ID, Client ("Not assigned"), Department ("Not assigned"), Joining Date ("Not specified"), Salary (computed: activeHistory PER_DAY `₹x/day`, PER_MONTH `₹x/month`, else SPECIALIZED monthly, else CENTRAL/STATE per-day, else "Not specified").
7. **Sidebar Card "Quick Actions":**
   - **Button "View Employee Details"** (outline, `Eye`) -> EmployeeViewDialog.
   - **Button "View & Download PDF"** (outline, `Download`) -> PdfPreviewDialog with EmployeeViewPDF; toast.error "Employee data not loaded" guard.
8. **Sidebar Card "Recent Changes":** static green dot (`w-2 h-2 bg-green-500 rounded-full`) + "All sections saved" + helper text "Changes are automatically saved when you update each section."
9. **EmployeeViewDialog** and **PdfPreviewDialog** (dynamic import) mounted conditionally.

### States

- **Loading:** inline pulse skeleton (same layout as page-level Suspense skeleton, `bg-gray-200` blocks inside `bg-white rounded-lg border`).
- **Error (fatal, no employee):** Back button + Card with `AlertCircle` "Failed to Load Employee", explanation copy, **"Try Again"** button (`window.location.reload()`), **"Back to Employees"** outline button.
- **Error (non-fatal):** ApiErrorAlert banner. Also toast.error "Failed to load employee data" on load failure.
- Returns `null` if not loading and no employee.

### Current styling

- Layout: `grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6` (form 3 cols + sidebar), responsive labels hidden/shown at `sm:`.
- Hardcoded: `bg-gray-200` skeletons, `bg-white rounded-lg border` skeleton containers, `bg-green-500` status dot, `bg-primary/10` avatar circle.
- Custom classes: `scrollbar-sleek` on tab strip.
- Icons: ArrowLeft, Eye, Download, User, AlertCircle, Briefcase, Contact, CreditCard, FileText, DollarSign.

### Navigation

- Back to `/employees` (redirects to list). Dialogs in place.

---

## 5. /employees/view/[id] (Employee Profile View)

- **Route:** `/employees/view/{id}`
- **Files:** `app/(dashboard)/employees/view/[id]/page.tsx` (Suspense wrapper `container mx-auto py-6` + skeleton) delegating to `components/employees/employee-view-page.tsx`.

### Interactive inventory

1. **Header Card:** Avatar h-16/20 with initials fallback (`bg-primary/10 text-primary`), name = `label.title(title) + firstName + lastName`, **status Badge** (default when ACTIVE else `destructive`, `label.status`), "Employee ID: {id}", and current-employment chips (`Briefcase` + designationName, `Building` + clientName).
2. **Button "Edit"** (outline, `Edit` icon; icon-only on mobile) -> `/employees/edit/{id}`.
3. **Button "View & Download PDF"** (primary, `Download`; mobile label "PDF") -> PdfPreviewDialog, fileName `Employee-{id}-{first}-{last}.pdf`.
4. **Tabs (6)**, horizontally scrollable strip (`scrollbar-sleek`), icon + label triggers:
   - **Personal** (`User`), **Contact** (`Phone`), **Employment** (`Briefcase`), **Salary** (`DollarSign`), **Financial** (`CreditCard`), **Documents** (`FileText`).
5. **Personal tab:** two Cards.
   - "Basic Information" (`User` title icon): InfoItems (icon + label + value, "N/A" fallback): Gender (`label.gender`), Date of Birth (`formatDate`), Age, Blood Group (`Heart` icon), Category (`label.category`, `Users` icon).
   - "Reference Details" (`Users` title icon): Reference Name, Reference Address (`MapPin`), Reference Number (`Phone`) from `referenceDetails`.
6. **Contact tab:** Card "Contact Information": Mobile Number, Present Address, City, State, Pincode from `contactDetails`. (An Email InfoItem exists but is commented out.)
7. **Employment tab:**
   - Card "Current Employment" (only when an ACTIVE history exists): Client (`Building`), Designation (`Briefcase`), Department (`Users`), Joining Date (`Calendar`, `formatDate`).
   - Card "Employment History": **table** (`min-w-[1000px]`, horizontal scroll `scrollbar-sleek`) columns: Client, Designation, Department, Joining Date, Leaving Date (else "Present"), Salary Type (outline Badge via `label.salaryType` or "N/A"), Salary Category (employee-level, outline Badge or "N/A"), Salary Sub Category (employee-level, outline Badge or "N/A"), Salary (PER_DAY `₹x/day`, PER_MONTH `₹x/month`, bare salary `₹x`, else "Not specified"). Empty state: "No employment history available". No sorting/pagination.
8. **Salary tab:** Card "Salary Information": Salary Category, Salary Sub-Category (conditional), Monthly Salary (SPECIALIZED) or Rate Per Day; PF Enabled and ESIC Enabled indicators (`CheckCircle2 text-green-600` vs `XCircle text-gray-400`). Not-configured state: Alert "Salary information not configured".
9. **Financial tab:** three Cards.
   - "Banking Information" (`CreditCard`): Bank Name, Account Number, IFSC Code from `bankDetails`.
   - "Government Details" (`Shield`): PF UAN Number, ESIC Number, Police Verification (number), Police Verification Date, from `additionalDetails`.
   - "Training & Medical" (`GraduationCap`): Training Certificate, Training Date, Medical Certificate, Medical Date.
10. **Documents tab:** Card "Document Uploads": grid of bordered tiles for keys photo, aadhaar, panCard, bankPassbook, markSheet, otherDocument, otherDocumentRemarks (key humanized via regex). Per tile with a value:
    - **Button "View Document"** (outline, `Eye`): fetches file, detects PDF by Content-Type, opens Document Preview dialog (iframe for PDF, `img` for images).
    - **Download button** (outline, `Download` icon only): fetches blob, infers extension from Content-Type (pdf/jpg/png/gif/webp) or URL, downloads as `{employeeId}_{key}{ext}`, toast.success "Document downloaded successfully!".
    - `otherDocumentRemarks` renders as plain text (`text-gray-700`). Missing value: "Not uploaded". No documents at all: "No documents uploaded".
11. **Dialog: Document Preview** (`max-w-4xl max-h-[90vh]`): title = document name, description "Document preview for {id}", header **Download** button (re-detects type then downloads), body iframe (`min-h-[60vh]`) or image (`max-h-[70vh] object-contain`) on `bg-muted` panel, footer **Close** button. Blob URLs revoked on close/unmount.
12. **PdfPreviewDialog** (dynamic) with EmployeeViewPDF.

### Toasts

- Fetch employee failure: error message toast.
- Document preview: "Document not available", "Failed to load document", "Failed to load document preview".
- Document download: "Document not available", "Failed to download document", success "Document downloaded successfully!".

### Data displayed

- `employeeService.getEmployeeById(id)` -> full Employee: title, firstName, lastName, status, id, gender, dateOfBirth, age, bloodGroup, category, referenceDetails.*, contactDetails.* (mobileNumber, presentAddress, city, state, pincode), employmentHistories[] (clientName, designationName, departmentName, joiningDate, leavingDate, salaryType, salaryPerDay, salary, status), salaryCategory, salarySubCategory, monthlySalary, salaryPerDay, pfEnabled, esicEnabled, bankDetails.* (bankName, bankAccountNumber, ifscCode), additionalDetails.* (pfUanNumber, esicNumber, policeVerificationNumber/Date, trainingCertificateNumber/Date, medicalCertificateNumber/Date), documentUploads.*.

### States

- **Loading:** skeleton (header card with pulsing avatar/lines + content card of paired lines; uses `bg-muted animate-pulse`). Route-level Suspense skeleton uses `bg-white rounded-lg border`.
- **Error / not found:** destructive Alert with `AlertCircle` and message ("Employee not found" fallback).

### Current styling

- Hardcoded: `text-green-600` / `text-gray-400` PF-ESIC icons, `text-gray-700` remark text, `bg-white` in route skeleton.
- Custom classes: `scrollbar-sleek`.
- Icons: User, Phone, MapPin, Calendar, CreditCard, FileText, Download, Edit, Building, Users, Briefcase, Heart, Shield, GraduationCap, AlertCircle, DollarSign, CheckCircle2, XCircle, Eye.

### Navigation

- To `/employees/edit/{id}`. Dialogs in place.

---

## 6. /employees/advanced-search (Advanced Employee Search)

- **Route:** `/employees/advanced-search`
- **File:** `app/(dashboard)/employees/advanced-search/page.tsx` (client, react-hook-form). `loading.tsx` returns `null`.

### Interactive inventory (Search Filters card)

1. **Input "Search"** (id `searchText`), placeholder "Search by name or ID".
2. **Select "Designation"**: All + `designationService.getDesignations()`.
3. **Select "Department"**: All + `departmentService.getEmployeeDepartments()`.
4. **Select "Client"**: All + `clientService.getClients()`.
5. **Select "Sort By"**: First Name / Last Name / Age (default `lastName`).
6. **Select "Sort Order"**: Ascending / Descending (default asc).
7. **DatePicker "Start Date"** and 8. **DatePicker "End Date"** (formatted `yyyy-MM-dd` for the API).
9. **Slider "Age Range: {min} - {max}"**: min 15, max 75, step 1, default [15, 65]; both bounds sent as minAge/maxAge.
10. **Select "Gender"**: All / Male (MALE) / Female (FEMALE).
11. **Select "Category"**: All / SC / ST / OBC / GENERAL.
12. **Select "Status"**: All / Active / Inactive.
13. **Select "Highest Education Qualification"**: All / Under 8th (UNDER_8) / 8th (EIGHT) / 10th (TEN) / 12th (TWELVE) / Graduate / Post Graduate.
14. **Section "Salary Filters"** (border-t, h3):
    - **Select "Salary Category"**: All / Central / State / Specialized.
    - **Select "Salary Sub-Category"**: All / Skilled / Unskilled / High Skilled (HIGHSKILLED) / Semi Skilled (SEMISKILLED).
    - **Input "Minimum Salary"** (number) and **Input "Maximum Salary"** (number).
    - **Checkbox "PF Enabled"** and **Checkbox "ESIC Enabled"** (checked -> true, unchecked -> undefined, i.e. not filtered).
15. **Section "Personal Information Filters"**: **Select "Title"** (All / Mr. (MR) / Ms. (MS)); **Input "Blood Group"** placeholder "e.g., A+, B-, O+".
16. **Section "Location Filters"**: **Input "City"**, **Input "State"**, **Input "District"**.
17. **Button "Clear Filters"** (outline) -> `reset()` form and page=1 (does not auto refetch).
18. **Button "Search"** (submit, `Search` icon) -> page=1 + `fetchEmployees()`.

### Results card

19. **Select "Items per page"**: 10/25/50/100 (w-[80px]); resets page and refetches.
20. **CardDescription** "Showing {n} results".
21. **Results table** (`min-w-[800px]`, `overflow-x-auto scrollbar-sleek`). Columns: **ID** (link-style `Button variant="link"` -> `/employees/view/{id}`), **Name**, **Designation**, **Department**, **Client** (from ACTIVE history or first history, "N/A" fallback), **Gender** (`label.gender`), **Age**. Sorting is server-side via Sort By/Sort Order controls; no column-header sorting.
22. **Pagination** (centered) via `handlePageChange`.

### Data displayed

- `employeeService.getEmployees(params)` with all filter params (searchText, designationId, employeeDepartmentId, clientId, gender, category, highestEducationQualification, minAge, maxAge, sortBy, sortOrder, startDate, endDate, status, salaryCategory, salarySubCategory, pfEnabled, esicEnabled, minSalary, maxSalary, title, bloodGroup, city, state, district, page, limit). Fetches once on mount with defaults.

### States

- **Loading:** 5 Skeletons h-12 in results card.
- **Empty:** "No results found" (centered, muted).
- **Error:** console.error only; NO user-visible error state or toast (gap to note in redesign).

### Current styling

- Header h1 "Advanced Employee Search" + subtitle "Search for employees using multiple criteria". Filter grids at md:2 / md:3 columns; sections separated with `pt-4 border-t` and `text-lg font-semibold` h3s.
- Custom classes: `scrollbar-sleek`.
- Icons: Search only.

### Navigation

- To `/employees/view/{id}` from ID link.

---

## 7. EmployeeForm (multi-step add/edit form)

- **File:** `components/employees/employee-form.tsx`
- Exports: `EmployeeForm`, `EMPLOYEE_FORM_DRAFT_STORAGE_KEY = "employee-form-draft"`, `clearEmployeeFormDraft(storageKey?)`.
- Props: `initialValues`, `onSubmit`, `designations`, `employeeDepartments`, `clients` (option arrays), `isLoading`, `onChange`, `enableDrafts`, `draftStorageKey`.
- Validation: zod schema (`employeeFormSchema`), `mode: "onChange"`.

### Steps (7, in order, defined in `steps` array)

| # | id | Title | Icon | Optional |
|---|----|-------|------|----------|
| 1 | basic | Basic Information | User | no |
| 2 | salary | Salary | DollarSign | no |
| 3 | employment | Employment | Briefcase | YES |
| 4 | bank | Bank Details | CreditCard | no |
| 5 | additional | Additional Details | FileText | no |
| 6 | reference | Reference | Building2 | no |
| 7 | documents | Documents | FileText | YES |

### Chrome around the steps

1. **Draft restore banner** (Alert `border-primary/40`, `Info` icon, title "Unsaved draft found") shown when a localStorage draft exists on mount: "A saved draft from {relative time} is available. Restore it or start a new employee." Buttons: **"Restore draft"** (outline, `RotateCcw`, merges all section drafts into the form) and **"Discard"** (ghost, `Trash2`, clears localStorage).
2. **Validation error Alert** (destructive, `AlertCircle`, title "Validation Errors"): "Please fix {n} error(s) in the form before submitting. Check step(s): {titles}".
3. **Progress Card** (`border-primary/20`): "Form Completion" label + percent + `Progress` bar (h-2). Percent = completed count of 21 tracked required checks (title, firstName, lastName, dateOfBirth, gender, fatherName, motherName, bloodGroup, employeeOnboardingDate, status, recruitedBy, highestEducationQualification, category, mobileNumber(10), aadhaarNumber(12), permanentAddress, presentAddress, city, district, state, pincode(6 digits)).
4. **Step indicator line:** current step icon + "Step {n} of 7: {title}" + "Optional" outline Badge when applicable.
5. **Visual stepper:** 7 clickable circular nodes (w-10 h-10 rounded-full border-2) joined by connector lines. State styling: active = `border-primary bg-primary text-primary-foreground`; completed = `border-green-500 bg-green-500 text-white` (connector `bg-green-500`); error = `border-destructive bg-destructive/10 text-destructive` with `AlertCircle` icon replacing the step icon, a small `bg-destructive` dot overlay top-right, destructive "Errors" badge under the title, and title text `text-destructive font-semibold`; default = `border-muted bg-background text-muted-foreground`. Optional steps get an "Opt" mini-badge overlay (`bg-background/95 backdrop-blur-sm border-primary/30`). All steps are freely clickable (`handleStepClick`); clicking scrolls to top.
6. **Per-section header actions** (`renderSectionHeaderActions`): draft status text ("Draft saving disabled" / "Saving draft..." / "Draft save failed" / "Saved {relative time}" / "Not saved yet"), documents section adds hint "File uploads must be reattached after saving", and a **"Save Section"** button (outline, `Save` icon, disabled while saving).
7. **Navigation Card** (bottom, `border-primary/20`): **"Previous"** button (outline, `ChevronLeft`, disabled on step 1 or while loading), center status ("Step {n} of 7" or, at 100% on last step, green `CheckCircle2` + "Ready to submit!"), **"Next"** button (`ChevronRight`) or on step 7 **"Submit"** (size lg, min-w-[120px], label "Submitting..." while `isLoading`).

### Draft-save behavior (enableDrafts)

- Autosaves per section to localStorage under the storage key, structure `{ [sectionId]: { values, updatedAt } }`. Debounce 1200ms after any field change in that section (field -> section via `FIELD_TO_SECTION_MAP`). Manual "Save Section" saves immediately.
- Dates encoded as ISO strings; decoded back to Date for fields in `DATE_FIELDS` (dateOfBirth, employeeOnboardingDate, policeVerificationDate, trainingCertificateDate, medicalCertificateDate, currentClientJoiningDate).
- Restore merges every section's saved values into the form and marks those sections "saved" with their timestamps; skipAutosave flag prevents re-save loops. Discard removes the whole key. Successful create clears the draft (`clearEmployeeFormDraft` called by the Add page).
- File inputs are NOT persisted in drafts (hence the reattach hint).

### Submit guarding

- Form submit only fires on the last step and only from an explicit Submit click (tracked via `isExplicitSubmit` + submitter check). Enter key is suppressed in regular inputs (allowed in textareas/submit button).
- On invalid submit: per-step error flags computed (optional steps skipped), toast.error "Please fill in all required fields. Check the highlighted steps for errors.", auto-jump to the step containing the first error, scroll + focus that field.
- On valid submit: dates formatted DD-MM-YYYY; `salaryPerDay` is stripped (backend derives it from the rate schedule); `monthlySalary` included only when category is SPECIALIZED. Generic submit failure toast if `onSubmit` throws.

### Step 1: Basic Information (merged personal + contact)

Section heading "Personal Details" (grid md:3 cols):
1. **Title*** select (Mr./Ms. via `label.title`) using **ClearableSelect** (when a value is set, dropdown shows a "Clear selection" item with `X` icon + separator).
2. **First Name*** input (required).
3. **Last Name*** input (required).
4. **Date of Birth*** ClearableDatePicker (required; max = today, "Date of birth cannot be in the future").
5. **Gender*** select (Male/Female) with inline clear item; selecting FEMALE reveals **Husband's Name** optional input.
6. **Father's Name*** input.
7. **Mother's Name*** input.
8. **Blood Group*** ClearableSelect (A+, A-, B+, B-, AB+, AB-, O+, O-).
9. **Employee Onboarding Date*** ClearableDatePicker (required).
10. **Status*** ClearableSelect (Active/Inactive; default ACTIVE).
11. **Recruited By*** input.
12. **Highest Education Qualification*** ClearableSelect (UNDER_8/EIGHT/TEN/TWELVE/GRADUATE/POST_GRADUATE via `label.education`).
13. **Category*** ClearableSelect (SC/ST/OBC/GENERAL).

Section heading "Contact Details" (`pt-6 border-t`):
14. **Mobile Number*** input (regex `^\d{10}$`, "Invalid mobile number").
15. **Aadhaar Number*** input (regex `^\d{12}$`, "Invalid Aadhaar number").
16. **Permanent Address*** input.
17. **Checkbox "Present address same as permanent address"**: copies permanent -> present and disables the Present Address input.
18. **Present Address*** input (disabled when checkbox on).
19. **City***, 20. **District***, 21. **State*** inputs (grid md:4).
22. **Pincode*** input (inputMode numeric, maxLength 6, regex `^\d{6}$`, "Enter a valid 6 digit pincode").

### Step 2: Salary Configuration

1. **Salary Category*** select: Central/State/Specialized (`label.salaryCategory`). Changing to SPECIALIZED clears subcategory + salaryPerDay; otherwise clears monthlySalary.
2. When CENTRAL or STATE:
   - **Subcategory*** select: Skilled/Unskilled/High Skilled/Semi Skilled (required by refine). Changing clears salaryPerDay to trigger rate refetch.
   - **Active rate fetch:** `salaryRateScheduleService.getActiveRate({category, subCategory, date: onboardingDate as yyyy-MM-dd})`. Loading row: `InlineLoader` + "Fetching active rate...". Success: info Alert (hardcoded `bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800`, `Info` icon `text-blue-600`) "Active rate for {cat}, {sub}: ₹{rate}/day" plus "(You can override this value manually)" when overridden; auto-populates salaryPerDay when empty. Error: destructive Alert with message ("No active rate schedule found for this category and date" or API error).
   - **Rate Per Day (₹)*** number input (step 0.01, min 0.01; required by refine) with helper "Leave empty to use active rate: ₹{rate}/day".
3. When SPECIALIZED: **Monthly Salary (₹)*** number input (required by refine).
4. **Switch "PF Enabled"** ("Enable Provident Fund deduction") and **Switch "ESIC Enabled"** ("Enable ESIC deduction"), each in a bordered row (`rounded-lg border p-4`).

### Step 3: Employment Details (Optional, `Card className="border-dashed"` with "Optional" badge)

1. **Client Date of Joining** ClearableDatePicker (optional).
2. **Designation** ClearableSelect from `designations` prop.
3. **Employee Department** ClearableSelect from `employeeDepartments` prop.
4. **Client** ClearableSelect from `clients` prop.

### Step 4: Bank Details

Fields (grid md:2), all schema-optional but rendered with red asterisks: **Bank Account Number**, **IFSC Code**, **Bank Name**, **Bank City** (text inputs).

### Step 5: Additional Details

Grid md:2, schema-optional but starred labels: **PF UAN Number** input, **ESIC Number** input, **Police Verification Number** input, **Police Verification Date** ClearableDatePicker, **Training Certificate Number** input, **Training Certificate Date** ClearableDatePicker, **Medical Certificate Number** input, **Medical Certificate Date** ClearableDatePicker.

### Step 6: Reference Details

Grid md:3, starred but optional: **Reference Name**, **Reference Address**, **Reference Number** (text inputs).

### Step 7: Document Uploads (Optional badge)

File inputs (each `accept="application/pdf,image/*"`, `Upload` icon beside): **Photo Upload**, **Aadhaar Upload**, **PAN Card Upload**, **Bank Passbook**, **Mark Sheet**, **Other Document**. When Other Document has a file, an **"Other Document Remarks"** text input appears.

### Styling notes for EmployeeForm

- Hardcoded colors: `text-red-500` asterisks throughout, green stepper (`border-green-500 bg-green-500 text-white`, `text-green-600`), blue rate Alert (`bg-blue-50` etc.), `bg-background/95 backdrop-blur-sm` badge overlay.
- Icons: Upload, User, Briefcase, CreditCard, FileText, Building2, CheckCircle2, ChevronLeft, ChevronRight, X, AlertCircle, DollarSign, Info, Save, RotateCcw, Trash2.

---

## 7.x Edit-tab section forms (components/employees/forms/)

Common pattern for BasicInfo / ContactInfo / BankInfo / AdditionalDetails / ReferenceDetails / SalaryInfo: Card with title; a **"Save Changes"** button (with `Save` icon, "Saving..." + `Loader2` spinner while submitting) appears in the header ONLY after a change (`hasChanges` via form `onChange`); optimistic `onUpdate` to parent; sonner toasts on success/failure; `form.reset()` reverts on error.

### BasicInfoForm (`basic-info-form.tsx`)

- Service: `employeeService.updateEmployee(id, data)` (dates formatted DD-MM-YYYY).
- Fields (grid md:3): Title select (MR/MS), First Name* input, Last Name* input, Date of Birth DatePicker, Gender* select (MALE/FEMALE), Father's Name* input, Mother's Name* input, Husband's Name input (only when gender FEMALE), Blood Group* select (8 groups), Status* select (ACTIVE/INACTIVE), Category* select (SC/ST/OBC/GENERAL), Recruited By* input, Employee Onboarding Date DatePicker.
- Toasts: "Basic information updated successfully!" / "Failed to update basic information".

### ContactInfoForm (`contact-info-form.tsx`)

- Service: `employeeService.updateEmployeeContactDetails(id, data)`.
- Fields: Mobile Number* (10-digit regex), Aadhaar Number* (12-digit regex), Permanent Address*, **Checkbox "Present address same as permanent address"** (copies + disables present), Present Address*, City*, District*, State*, Pincode* (type number, coerced to int, min 1).
- Toasts: "Contact information updated successfully!" / "Failed to update contact information".

### BankInfoForm (`bank-info-form.tsx`)

- Service: `employeeService.updateEmployeeBankingInformation(id, data)`.
- Fields (all required): Bank Account Number, IFSC Code, Bank Name, Bank City.
- Toasts: "Bank information updated successfully!" / "Failed to update bank information".

### AdditionalDetailsForm (`additional-details-form.tsx`)

- Service: `employeeService.updateEmployeeAdditionalDetails(id, data)`.
- Fields: PF UAN Number*, ESIC Number*, Police Verification Number*, Police Verification Date (plain text input, placeholder "DD-MM-YYYY"), Training Certificate Number*, Training Certificate Date (text "DD-MM-YYYY"), Medical Certificate Number*, Medical Certificate Date (text "DD-MM-YYYY"). NOTE: the three dates are free-text here, unlike the DatePickers used in the add form.
- Toasts: "Additional details updated successfully!" / "Failed to update additional details".

### ReferenceDetailsForm (`reference-details-form.tsx`)

- Service: `employeeService.updateEmployeeReferenceDetails(id, data)`.
- Fields (all required): Reference Name, Reference Address, Reference Number.
- Toasts: "Reference details updated successfully!" / "Failed to update reference details".

### SalaryInfoForm (`salary-info-form.tsx`)

- Service: `employeeService.updateEmployee(id, salaryData)`; rate lookup `salaryRateScheduleService.getActiveRate` keyed on category + subcategory + employee onboarding date (memoized, prev-value ref to avoid loops).
- Fields: Salary Category select (includes explicit **"None"** option `__none__` -> null, plus Central/State/Specialized; clearing rules same as add form), Subcategory* select (CENTRAL/STATE only), active-rate loading row / blue info Alert / destructive error Alert (same as add form), Rate Per Day (₹)* number input with "Leave empty to use active rate" hint, Monthly Salary (₹)* number input (SPECIALIZED only), PF Enabled Switch, ESIC Enabled Switch (bordered rows).
- Header includes `DollarSign` icon next to the title.
- Toasts: "Salary information updated successfully!" / API-derived error message.

### EmploymentHistoryForm (`employment-history-form.tsx`)

- Data: `employeeService.getEmployeeEmploymentHistory(id)`, `clientService.getClients({page:1,limit:100})`, `designationService.getDesignations()`, `departmentService.getEmployeeDepartments()`. Uses legacy `useToast` (shadcn toast, not sonner).
- **Header:** `Briefcase` icon + "Employment History"; **Button "Assign New Employment"** (`Plus`) -> AssignEmploymentDialog.
- **Loading:** centered `Loader2` spinner in card.
- **Empty:** big `Briefcase` (h-12 w-12 muted), "No Employment History", copy, **"Assign First Employment"** button.
- **Table** (min-w-[800px], vertical scroll max-h-[500px], sticky header `bg-background z-20`; header cells have icons): columns **Client** (Building), **Job Role** (Briefcase), **Department** (Users), **Start Date** (Calendar, raw string), **Salary Type** (DollarSign; outline badge "Per Day"/"Per Month" or "N/A"), **Salary Category** (employee-level raw enum badge or "N/A"), **Salary Sub Category** (employee-level raw enum badge or "N/A"), **Salary** (₹ formatted with /day or /month suffix, else "-"), **Status** (Badge default/secondary with CheckCircle/XCircle icon, text "Current"/"Previous"), **Actions**:
  - **Edit** ghost icon button (`Edit`, title "Edit employment details") -> Edit Employment History dialog.
  - **Terminate** ghost icon button (`XCircle`, destructive, title "Terminate employment"), only on ACTIVE rows -> TerminateEmploymentDialog. Guard toast "Only active employment can be terminated." for non-active.
- **Dialog "Edit Employment History"** (max-w-2xl): description varies by row status ("...Making this inactive will end the current employment." vs "Update previous employment details."). Fields: Client select (uuid validated), Designation select, Department select, Start Date* DatePicker, End Date DatePicker (required when not active; hidden with note "Not applicable for current employment" when active; must be after start date), **Checkbox "Current Employment"** (disabled when another employment is already active, with explanatory helper text; unchecking auto-sets leaving date to today). Footer: **Cancel** (outline) and **"Update Employment"** (spinner "Updating..." while submitting). Service: `employeeService.updateEmploymentHistory(historyId, data)` (dates DD-MM-YYYY, status ACTIVE/INACTIVE). Toasts: success "Employment history updated successfully!", errors mapped ("There is already an active employment...", "Employment record not found...", generic).

---

## 8. TerminateEmployeeDialog (`terminate-employee-dialog.tsx`)

Two-stage destructive flow (used from the list page):

1. **Dialog "Terminate Employee from TSS"** (max-w-2xl, destructive title with `UserX` icon). Description: marks employee INACTIVE in the system.
2. Destructive Alert (`AlertTriangle`) "Critical: Terminating Employee from TSS" with bullet list (mark INACTIVE not deleted, remove from active payroll, keep history, prevent new assignments); extra inline warning box (`bg-destructive/10 border-destructive/20`) when the employee still has ACTIVE employment(s); "This is a permanent action..." line.
3. Summary panel (`bg-muted p-4 rounded-lg`): Employee Name, Employee ID, Current Status, Current Client (if present).
4. **DatePicker "Termination Date"*** (default today, `Calendar` label icon, FormDescription "Select the last working day with Tulsyan Security Services.").
5. Footer: **Cancel** (outline), **"Continue to Confirm"** (destructive, `UserX` icon, spinner "Processing...").
6. **AlertDialog "Confirm Employee Termination from TSS"** (`AlertTriangle`): recap of name, termination date (`toLocaleDateString`), nested destructive Alert about INACTIVE + "All historical data will be preserved." Buttons: **Cancel** and **"Confirm Termination from TSS"** (destructive styling `bg-destructive text-destructive-foreground hover:bg-destructive/90`, spinner "Terminating...").
- Service: `employeeService.updateEmployee(id, { status: INACTIVE, employeeRelievingDate })` (date via `convertToCustomDateFormat`).
- Toasts (sonner): success "{name} has been terminated from TSS successfully.", error with API message fallback "Failed to terminate employee. Please try again.".

## 9. TerminateEmploymentDialog (`terminate-employment-dialog.tsx`)

Two-stage flow (used from EmploymentHistoryForm):

1. **Dialog "Terminate Employment"** (destructive title, `XCircle`). Destructive Alert "Important: This is a Termination Action" with bullets (mark employment INACTIVE, set termination date, block payroll for the client, allow new assignment after).
2. Summary panel (`bg-muted`): Employee, Client, Designation, Department, Joining Date.
3. **DatePicker "Termination Date"*** (default today; validated not before joining date, guard toast "Termination date cannot be before the joining date.").
4. **Textarea "Termination Reason (Optional)"** (3 rows, helper "Optional: Record the reason for termination for internal documentation."). Note: the reason is not sent to the backend.
5. Footer: **Cancel**, **"Continue to Confirm"** (destructive, `XCircle`, "Processing..." spinner).
6. **AlertDialog "Confirm Employment Termination"**: recap (name, client, formatted date "dd MMM yyyy", reason if entered), nested destructive Alert. Buttons **Cancel** / **"Confirm Termination"** ("Terminating..." spinner).
- Service: `employeeService.closeEmployment(employeeId, { leavingDate: "dd-MM-yyyy" })`.
- Toasts (useToast): success "Employment at {client} has been terminated successfully.", error with API message fallback.

## 10. EmployeeViewDialog (`employee-view-dialog.tsx`)

Read-only quick view used by the Edit page (max-w-4xl, max-h-[90vh], scrollable body `scrollbar-sleek`).

1. Header: `bg-primary/10` circle with `User` icon, name, `employee.designationName` subtitle; **Button "View & Download PDF"** (outline, `Download`) -> PdfPreviewDialog (fileName `Employee-{id}-{first}-{last}.pdf`).
2. **Tabs (3):** "Employee Details" / "Employment History" / "Documents".
3. Details tab cards (grid md:2):
   - **Basic Information:** Full Name (title+first+last), Status Badge, Date of Birth, Gender, Blood Group, Category, Father's Name, Mother's Name, Husband's Name (FEMALE only). "Not specified" fallbacks.
   - **Contact Information:** Mobile Number (`Phone` icon), Aadhaar Number, Permanent Address and Present Address (`MapPin` icon, composed with city/state/pincode suffixes).
   - **Current Employment:** Client, Department, Designation, Date of Joining (`Calendar`), Recruited By.
   - **Salary Information:** Salary Category (+ sub-category suffix, `DollarSign`), Monthly Salary or Rate Per Day, PF / ESIC indicators (`CheckCircle2 text-green-600` / `XCircle text-gray-400`); unconfigured -> Alert "Salary information not configured".
   - **Bank Information:** Bank Name, Account Number (`CreditCard`), IFSC Code, Bank City, PF UAN Number, ESIC Number.
4. Employment History tab: **table** (min-w-[1000px]) columns Client, Designation, Department, Joining Date, End Date ("-" fallback), Salary Type (badge), Salary Category (badge), Salary Sub Category (badge), Salary (₹/day, ₹/month, bare, "-"), Status (Badge "Current"/"Previous"). Empty row: "No employment history found." (colSpan 10).
5. Documents tab: embeds **EmployeeDocumentManager** (full upload/preview/download capability inside the dialog).
- Icons: X, Download, User, Phone, MapPin, Calendar, CreditCard, DollarSign, CheckCircle2, XCircle, AlertCircle.

## 11. EmployeeDocumentManager (`employee-document-manager.tsx`)

Used in the Edit page Documents tab and inside EmployeeViewDialog.

- Data: `employeeService.getEmployeeDocumentUploads(employeeId)`; save via `employeeService.updateEmployeeDocumentUploads(employeeId, dto)`; download via `employeeService.downloadEmployeeDocument(url, filename)`.
- Validation constants: max 5MB; allowed types JPEG/JPG/PNG/GIF + PDF. Invalid file -> toast.error ("File size exceeds 5MB limit" / "Invalid file type. Only images and PDF files are allowed").
- **Info Alert "File Requirements":** "Maximum file size: 5MB. Allowed formats: PDF, JPEG, PNG, GIF".
- Document rows (6): Photo (accept image/*), Aadhaar Card, PAN Card, Bank Passbook, Mark Sheet, Other Document (accept application/pdf,image/*). Each row:
  1. Label + **"Uploaded" Badge** (secondary) when a file exists on the server.
  2. **File input** (styled `file:` pseudo classes with `file:bg-primary file:text-primary-foreground`).
  3. When stored file exists: **Preview** button (outline, `Eye`) and **Download** button (outline, `Download`, filename `{employeeId}_{key}.pdf`).
  4. When a new file is selected: filename + size (KB) + file-type icon (`ImageIcon`/`FileText`) + **X clear** ghost button.
- **Input "Other Document Remarks"** (text).
- **"Save Changes"** header button (appears only when `hasChanges`; `Upload` icon; custom spinner `animate-spin rounded-full h-4 w-4 border-b-2 border-white` while "Uploading...").
- **Current Documents summary** grid: each doc name colored `text-green-600` when uploaded (else muted) + outline "✓" badge.
- **Preview Dialog** (max-w-4xl): title = doc label with header **Download** button, description "Document preview for {employeeId}", body iframe (PDF, h-[60vh]) or img on `bg-muted` panel, footer **Close**. Blob URLs cleaned up.
- States: loading = custom spinner (`animate-spin rounded-full h-8 w-8 border-b-2 border-primary`); load error toast "Failed to load documents"; save toasts "Documents updated successfully!" / "Failed to update documents"; download toasts success/failure; preview toasts as in section 5.
- Icons: Eye, Download, Upload, X, FileText, ImageIcon, AlertCircle.

## 12. PdfPreviewDialog (`components/pdf/pdf-preview-dialog.tsx`, shared)

- Dialog max-w-5xl w-[90vw] max-h-[85vh]. Auto-generates the PDF on open (`autoGenerate` default true) by dynamic-importing `@react-pdf/renderer` and calling the provided `renderDocument`.
- Buttons: **"Regenerate"** (outline, `FileText`, "Generating..." while busy), **"Print"** (outline, `Printer`, opens blob URL in a new tab, disabled without a PDF), **"Download PDF"** (primary, `Download`, downloads as `{fileName}.pdf`).
- Body: iframe preview in bordered `bg-white` panel (inline style minHeight 500px); placeholder text "Generating preview..." / "Click Regenerate to create a preview".
- Object URLs revoked on close/unmount.

## 13. EmployeeViewPDF (`employee-view-pdf.tsx`, react-pdf document)

Branded via `components/pdf/brand` (BRAND, BrandPage, PdfHeader, PdfFooter, Section, brandStyles). Document metadata: title "Employee Profile - {name}", author BRAND.name, subject "Employee Profile".

Sections (conditionally rendered when data exists):
1. **PdfHeader** title "Employee Profile", subtitle name.
2. **Header block:** name (with title label), "Employee ID: {id}", generation date (en-IN long format), 80x80 photo (from `documentUploads.photo` or `employee.photo`) or initials placeholder.
3. **Personal Information:** DOB, Age, Gender, Blood Group, Father's/Mother's/Husband's Name, Category.
4. **Contact Details:** Mobile, Aadhaar, Permanent Address, Present Address, City, District, State, Pincode (each with contactDetails-vs-flat fallbacks).
5. **Current Employment Information:** Client Name, Designation, Department, Joining Date, Status (green `#10b981` badge when ACTIVE, red `#ef4444` when not), Recruited By.
6. **Salary Information:** Salary Category, Sub-Category, Monthly Salary or Per Day Rate, PF Enabled Yes/No, ESIC Enabled Yes/No.
7. **Bank Details:** Bank Name, Account Number, IFSC Code, Bank City, PF UAN Number, ESIC Number.
8. **Educational Qualifications:** highest qualification via `label.education`.
9. **Employment History table:** columns Client / Designation / Department / Joining Date / Leaving Date ("Present" fallback) / Salary (right-aligned; /day, /month, bare, "N/A"), fixed header row, rows `wrap={false}`.
10. **Reference Details:** Reference Name, Address, Contact Number.
11. **Documents & Certificates:** Police Verification Number/Date, Training Certificate Number/Date, Medical Certificate Number/Date, Document Status ("Available"/"Not Available" based on any upload).
12. **Additional Information:** Employee Onboarding Date, Employee Relieving Date (first history with a leavingDate), Status badge.
13. **PdfFooter** rightNote "Confidential - System Generated Document".

Hardcoded hex values (PDF only): `#4b5563`, `#111827`, `#ffffff`, `#10b981`, `#ef4444`, plus BRAND token colors.

---

## Cross-cutting notes for the redesign

- **Toast systems are mixed:** sonner (`toast` from "sonner") in most places, legacy shadcn `useToast` in EmploymentHistoryForm / AssignEmploymentDialog / TerminateEmploymentDialog. Preserve every message.
- **Repeated hardcoded style hotspots:** `text-red-500` required asterisks (add form + dialogs), `text-green-600`/`text-gray-400` PF-ESIC indicators, green stepper colors (`bg-green-500`, `border-green-500`, `text-green-600`), blue active-rate Alert (`bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800`, `text-blue-600/800 dark:text-blue-200/400`), gray skeletons (`bg-gray-200`, `bg-white`), `text-gray-500` list subtitle, `text-gray-700` remarks, `bg-primary/10` badges and avatar circles, custom border-spinner divs in EmployeeDocumentManager, PDF hex values.
- **Custom CSS class used everywhere:** `scrollbar-sleek` on horizontal/vertical scroll containers. No spotlight-card/glass/craze-border-* classes in this module.
- **Known gaps (do not silently "fix" without flagging):** advanced-search has no error state; AdditionalDetailsForm uses free-text dates while the add form uses DatePickers; TerminateEmploymentDialog collects a reason it never sends; EmploymentHistoryForm's `onUpdate` prop is never invoked; `employee.avatar` is referenced only on the list page; the list page's inline "Employee Details" dialog duplicates a subset of EmployeeViewDialog.
- **AssignEmploymentDialog** (`assign-employment-dialog.tsx`, used from EmploymentHistoryForm): title "Assign New Employment" (`Briefcase`), description "Employee can only work in one client at a time."; loads `getActiveEmployment` (404 tolerated), clients (ACTIVE only, "Only active clients are shown" hint), designations, departments; destructive Alert "Active Employment Detected" naming the current client and disabling all fields + submit when active employment exists; info Alert "Important: Employee must not have any active employment..."; fields Client* / Job Role* / Department* selects (uuid-validated) + Joining Date* DatePicker (default today, md:col-span-2); footer **Cancel** + **"Assign Employment"** ("Assigning..." spinner); service `employeeService.createEmploymentHistory(employeeId, {clientId, departmentId, designationId, joiningDate dd-MM-yyyy, status: ACTIVE})`; toasts: success "Employee has been successfully assigned to the new client.", duplicate-active error "This employee already has an active employment. Please terminate it first.", generic error fallback.
- **Keyboard behavior:** EmployeeForm intercepts Enter in inputs (prevents accidental submit); no other custom shortcuts in this module.
