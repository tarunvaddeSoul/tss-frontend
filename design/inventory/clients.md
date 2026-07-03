# Inventory: Clients Section

Scope: `/app/(dashboard)/clients/**` and `/components/clients/**`
All paths relative to repo root `/Users/tarunvadde/Development/tss-frontend`.

Routes found:
- `/clients` -> `app/(dashboard)/clients/page.tsx` (+ `loading.tsx`)
- `/clients/add` -> `app/(dashboard)/clients/add/page.tsx`
- `/clients/edit/[id]` -> `app/(dashboard)/clients/edit/[id]/page.tsx`
- `/clients/templates` -> **NO page.tsx exists.** Only `app/(dashboard)/clients/templates/loading.tsx` (returns `null`). The route 404s today. Do not invent a page for it; either keep as-is or delete the orphan loading file (decision for redesigner/owner).

Dead code in scope (never imported anywhere):
- `components/clients/client-view-pdf.tsx` (superseded by `components/pdf/client-view-pdf.tsx`, which is what `client-view-dialog.tsx` actually imports)
- `components/clients/salary-template-field.tsx`
- `components/clients/salary-template-form.tsx`
These are inventoried at the end for completeness but carry no live features.

---

## 1. Clients List — `/clients`

File: `app/(dashboard)/clients/page.tsx`
Route loading skeleton: `app/(dashboard)/clients/loading.tsx`

### Interactive inventory

1. Button "Add Client" (header, primary, `Plus` icon) -> `router.push("/clients/add")`.
2. Search form (submit via form `onSubmit`):
   - Input `name="searchText"`, placeholder "Search clients...", `Search` icon absolutely positioned inside (`pl-8`), no validation, defaultValue from current `searchParams.searchText`.
   - Select "Status" (width `w-[140px]`): options `all` ("All Status", default), `ACTIVE` ("Active"), `INACTIVE` ("Inactive"). Changing it applies immediately (sets `status`, resets `page: 1`); "all" maps to `undefined`.
   - Button "Search" (type submit) -> sets `searchText` from form data, resets page to 1.
   - Button "Clear" (variant outline, type button) -> clears `searchText` and `status` (note: does NOT reset page or re-fill the input's visible text; input keeps typed value since it is uncontrolled).
3. Select "Items per page" (in table card header, `w-[80px]`): options 10 / 25 / 50 / 100 -> sets `limit`, resets page to 1. Labeled by adjacent text "Items per page:".
4. Table (min-w-[800px], horizontal scroll container `overflow-x-auto scrollbar-sleek`, `rounded-md border`). Columns in order:
   1. "Client Name" — sortable: ghost Button with `ArrowUpDown` icon -> `handleSort("name")` toggles asc/desc. Cell shows client.name (font-medium) + sub-line "ID: {client.id}" in `text-xs text-muted-foreground`.
   2. "Contact Person" — not sortable. `client.contactPersonName`.
   3. "Phone" — not sortable. `client.contactPersonNumber`.
   4. "Status" — sortable via ghost Button + `ArrowUpDown` -> `handleSort("status")`. Badge: variant `default` when ACTIVE, `secondary` otherwise; text via `label.status()`.
   5. "Onboarding Date" — sortable via ghost Button + `ArrowUpDown` -> `handleSort("clientOnboardingDate")`. Rendered with `formatDate()`.
   6. "Actions" (right-aligned), per row:
      - Ghost icon Button `Eye`, title "View Details" -> opens ClientViewDialog for that client.
      - Ghost icon Button `Edit`, title "Edit Client" -> `router.push(/clients/edit/{id})`.
      - Ghost icon Button `XCircle`, title "Terminate from TSS", classes `text-destructive hover:text-destructive hover:bg-destructive/10` -> opens TerminateClientDialog. ONLY rendered when `client.status !== "INACTIVE"`.
   - Sorting: server-side (sortBy/sortOrder passed to API). Default sort `name asc`. Toggling same column flips order; new column starts `asc`.
5. Pagination (custom `components/ui/pagination.tsx`): rendered in CardFooter only when `totalPages > 1`. Prev/Next chevron buttons (`ChevronLeft`/`ChevronRight`, disabled at bounds), numbered page buttons with first/last always shown, `MoreHorizontal` ellipsis for gaps, active page highlighted (`isActive`). `onPageChange` -> sets `searchParams.page`.
6. Empty-state Button "Add Client" (`Plus` icon) -> `/clients/add`; only shown when list empty AND no `searchText`.
7. Dialogs mounted from this page: ClientViewDialog (see section 4), TerminateClientDialog (see section 5).
8. Toasts:
   - Fetch failure: destructive, "Error" / "Failed to fetch clients. Please try again."
   - Attempt to terminate an already-INACTIVE client: destructive, "Already Terminated" / "This client is already terminated from TSS." (guard in `handleTerminate`).

### Data displayed
- Entity: `Client` list from `clientService.getClients(searchParams)` (GET `/clients` with `page, limit, sortBy, sortOrder, searchText, status`). Response gives `data.clients` and `data.total`.
- Fields per row: name, id, contactPersonName, contactPersonNumber, status, clientOnboardingDate.
- Card description shows "Showing {clients.length} of {totalCount} clients" (or "Loading clients..." while loading).

### States
- Loading: 5 skeleton rows (6 Skeleton cells each, fixed widths e.g. `w-[200px]`); route-level `loading.tsx` renders full-page skeleton (header, search card, 6-column table with 5 skeleton rows, 3 action skeletons per row).
- Empty: colSpan=6 cell, centered: "No clients found" + contextual sub-text ("Try adjusting your search terms" when searching, else "Get started by adding your first client") + conditional Add Client button.
- Error: toast only; table stays with previous/empty data. No inline error UI.

### Current styling
- Layout: `space-y-6`; header flex row (h1 `text-3xl font-bold tracking-tight` + `text-muted-foreground` subtitle, button right); two stacked Cards (search, table). Table card content `p-0`.
- Custom class: `scrollbar-sleek` on the table scroll wrapper.
- Hardcoded/off-token: none notable on this page (uses theme tokens); destructive-tinted terminate button uses `text-destructive`/`bg-destructive/10` tokens.
- Icons: Plus, Search, Edit, Trash2 (imported, unused), Eye, ArrowUpDown, XCircle; pagination uses ChevronLeft, ChevronRight, MoreHorizontal.

### Navigation
- -> `/clients/add` (header button, empty-state button)
- -> `/clients/edit/[id]` (row edit)
- Opens ClientViewDialog and TerminateClientDialog in place.

---

## 2. Add Client — `/clients/add`

File: `app/(dashboard)/clients/add/page.tsx`

### Interactive inventory

1. Button "Back to Clients" (outline, `ArrowLeft` icon) -> `router.push("/clients")`.
2. Tabs (3, controlled state `activeTab`, TabsList `grid grid-cols-3`):
   - "Basic Information" (`basic`)
   - "Salary Slip" (`salary-templates`)
   - "Preview" (`preview`)
3. Basic Information tab — form `id="client-form"` (react-hook-form + zod `clientFormSchema`), grid `md:grid-cols-2`:
   1. Input `name` — label "Client Name", placeholder "Enter client name". Validation: min 2, "Client name must be at least 2 characters".
   2. Select `status` — label "Status": options ACTIVE / INACTIVE (labels via `label.status()`). Default ACTIVE. Validation: nativeEnum ClientStatus.
   3. Input `contactPersonName` — label "Contact Person Name", placeholder "Enter contact person name". Min 2 chars.
   4. Input `contactPersonNumber` — label "Contact Person Number", placeholder "Enter 10-digit phone number". Regex `^\d{10}$`, "Contact number must be 10 digits".
   5. DatePicker `clientOnboardingDate` — label "Onboarding Date", component `components/ui/date-picker` with `yearRange={from:1900, to:currentYear}`, FormDescription "The date when the client was onboarded". Required date. (NOTE: add page uses DatePicker component; edit page uses a Popover+Calendar. Inconsistent widgets for the same field.)
   6. Input `address` — label "Address", spans 2 cols (`md:col-span-2`), placeholder "Enter client address". Min 5 chars.
   - Footer buttons: "Cancel" (outline) -> `/clients`; "Next: Set Up Salary Slip" -> switches to salary-templates tab.
4. Salary Slip tab:
   - `<ClientSalarySetup config onChange>` (see section 6).
   - Button "Back to Basic Information" (outline) -> basic tab.
   - Button "Preview Salary Slip" (outline) -> preview tab.
   - Button "Save Client" (primary, `Save` icon, `type=submit form="client-form"`, disabled while `isLoading`, label becomes "Saving..."): triggers full form validation; if invalid, switches back to basic tab + destructive toast "Validation Error" / "Please fill in all required fields in the Basic Information tab."; if valid submits.
5. Preview tab (Card "Salary Slip Preview" / "Preview how the salary slip will look with your configuration"):
   - `<SalarySlipPreview config>` (see section 7).
   - Footer: "Back to Salary Templates" (outline) -> salary-templates tab; second "Save Client" button (same validate-then-submit behavior as above).
6. Submission: date formatted `dd-MM-yyyy`; payload `{...values, clientOnboardingDate, salaryTemplates: salaryTemplateConfig}` -> `clientService.createClient`. Success toast "Success" / "Client created successfully" then `router.push("/clients")`. Failure: destructive toast "Error" / "Failed to create client. Please try again."

### Data displayed
- No fetch on mount. Salary template config starts from `getDefaultSalaryTemplateConfig()` (see Appendix A for the full default field list — this IS the feature set of the salary slip setup).
- Service call: `clientService.createClient(clientData)` (POST `/clients`).

### States
- Loading: only submit-button disabled + "Saving..." text. No page skeleton (none needed, no fetch).
- Empty: n/a.
- Error: toast only; no inline error summary (unlike edit page).

### Current styling
- Layout: `space-y-6`; header row identical pattern to list page; Tabs full width; Cards per tab.
- No hardcoded colors on the page itself (children have them, see sections 6–8).
- Icons: Save, ArrowLeft.

### Navigation
- -> `/clients` (Back, Cancel, after successful save).
- Internal tab navigation basic <-> salary-templates <-> preview.

---

## 3. Edit Client — `/clients/edit/[id]`

File: `app/(dashboard)/clients/edit/[id]/page.tsx`

Same skeleton as Add with these differences — inventory of everything:

### Interactive inventory

1. Button "Back to Clients" (outline, `ArrowLeft`) -> `/clients`.
2. Validation Errors Alert (destructive `Alert`, `AlertTriangle` icon, title "Validation Errors"): shown when `validationErrors.length > 0` (server-side errors from update). Renders "Please fix the following issues:" + `list-disc` of messages. Cleared when salary config changes.
3. Tabs (3): "Basic Information", "Salary Slip", "Preview".
   - The "Salary Slip" TabsTrigger gets class `text-red-600` AND an inline `AlertTriangle` icon (`text-red-600`) when any validation error message contains `"salaryTemplateConfig"` (hardcoded red-600, bypasses tokens).
4. Basic Information form — identical 6 fields/validation to Add, EXCEPT:
   - `clientOnboardingDate` uses Popover + Button trigger (outline, `w-full pl-3 text-left font-normal`, shows `format(value, "PPP")` or "Pick a date", `CalendarIcon` right, `text-muted-foreground` when unset) + `Calendar` mode single; dates disabled when `> today` or `< 1900-01-01`; `initialFocus`.
   - Values prefilled via `form.reset()` from fetched client.
   - Footer: "Cancel" -> `/clients`; "Next: Set Up Salary Slip" -> salary tab.
5. Salary Slip tab:
   - `<ClientSalarySetup>` when `salaryTemplateConfig` loaded; otherwise inline fallback: heading "Loading Salary Slip..." + "Please wait while we load this client's salary slip setup."
   - Buttons: "Back to Basic Information" (outline), "Preview Salary Slip" (outline), "Update Client" (primary, `Save` icon, disabled while `isLoading`, label "Saving..." while saving; validate-then-submit with same invalid-toast/tab-switch behavior as Add).
6. Preview tab:
   - `<SalarySlipPreview>` when config exists, else centered text "No template configuration available for preview."
   - Footer: "Back to Salary Templates" (outline); "Update Client" (disabled when `isLoading || !salaryTemplateConfig`).
7. Submission: `clientService.updateClient(id, {...values, clientOnboardingDate: dd-MM-yyyy, salaryTemplates: salaryTemplateConfig ?? undefined})`. Success toast "Success" / "Client updated successfully" -> `/clients`. Failure path parses `error.response.data.error.details` via `getErrorMessage` (`services/api.ts`) into `validationErrors`; if any message contains "salaryTemplateConfig" -> destructive toast "Salary Template Validation Error" / "...check the details below." AND auto-switches to salary-templates tab; else generic destructive toast "Error" / errorMessage.

### Data displayed
- Fetch on mount: `clientService.getClientById(id)` (GET `/clients/{id}`). Fields used: name, address, contactPersonName, contactPersonNumber, status, clientOnboardingDate, salaryTemplates.
- `salaryTemplates` array converted with `convertSalaryTemplatesToConfig()` (types/client.ts); falls back to `getDefaultSalaryTemplateConfig()` when absent/empty.
- Save via `clientService.updateClient` (PUT `/clients/{id}`).

### States
- Data loading: Card skeleton (header 2 skeletons + 6 label/input skeleton pairs in 2-col grid). Tabs hidden until loaded.
- Fetch error: destructive toast "Error" / "Failed to load client data. Please try again." then redirect to `/clients`.
- Salary config not yet set: inline "Loading Salary Slip..." block (salary tab) / "No template configuration available for preview." (preview tab).
- Server validation errors: destructive Alert list + red tab highlight (described above).

### Current styling
- Hardcoded: `text-red-600` on tab trigger and its AlertTriangle (x2).
- Icons: CalendarIcon, Save, ArrowLeft, AlertTriangle.
- Layout mirrors Add page.

### Navigation
- -> `/clients` (Back, Cancel, save success, fetch failure redirect).
- Internal tab navigation; error auto-jump to salary tab.

---

## 4. Client View Dialog (from list page "Eye" action)

File: `components/clients/client-view-dialog.tsx`

Trigger: Eye button on a `/clients` row. Dialog `max-w-4xl max-h-[85vh]`.

### Interactive inventory

1. DialogHeader: title = client.name (`text-xl font-bold`), description "Client ID: {id}".
2. Tabs (2, grid-cols-2): "Client Details" (`details`, default) and "Employees ({activeCount})" (`employees`; count = ACTIVE employees only).
3. Details tab:
   - Card "Basic Information" (`Building` icon): labeled values Client Name, Address, Status (Badge default/secondary via `label.status`), Onboarding Date (`Calendar` icon + `formatDate`).
   - Card "Contact Information" (`User` icon): Contact Person (font-medium), Contact Number (`Phone` icon).
   - Card "Salary Template Configuration":
     - 4 stat tiles (`bg-muted rounded-md p-3 text-center`, `text-2xl font-bold` numbers): Total Fields, Calculation Fields, Allowance Fields, Deduction Fields (counts of enabled fields by purpose).
     - Separator.
     - Table of enabled fields, columns: "Field Name" (font-medium label), "Type" (outline Badge), "Purpose" (secondary Badge with HARDCODED colors: ALLOWANCE `bg-green-100 text-green-800`, DEDUCTION `bg-red-100 text-red-800`, CALCULATION `bg-blue-100 text-blue-800`), "Default Value" (`field.defaultValue || field.rules?.defaultValue || "Not specified"`). No sort/pagination.
     - Empty state: "No salary template configuration found or no fields are enabled."
     - Enabled fields computed from `client.salaryTemplates[0]` merging mandatory+optional+custom, filtered `enabled`.
4. Employees tab:
   - Button "Export to Excel" (outline, sm, `Download` icon; disabled when 0 active employees). Dynamically imports `xlsx`; exports ACTIVE employees with columns: Employee ID, Name (title+first+last), Designation, Department, Joining Date, Salary Type, Salary Category, Salary Sub Category, Salary (formatted). Filename `{client_name}_employees.xlsx` (spaces->underscores, lowercased); sheet name "{client.name} Employees". Success toast "Success" / "Active employee list exported to Excel"; failure destructive toast "Error" / "Failed to export to Excel. Please try again."
   - Employees table: RAW `<table>` markup (not the ui/table component), `min-w-[1200px]` inside `overflow-x-auto scrollbar-sleek` bordered wrapper. Columns (9): ID, Name (title firstName lastName, font-medium), Designation (or "N/A"), Department (or "N/A"), Joining Date (`formatDate`), Salary Type (outline Badge via `label.salaryType` or muted "N/A"), Salary Category (outline Badge via `label.salaryCategory` or "N/A"), Salary Sub Category (outline Badge via `label.salarySubCategory` or "N/A"), Salary (font-medium, via `formatSalary`).
   - `formatSalary` logic (must be preserved): PER_DAY+salaryPerDay -> `₹{n}/day`; PER_MONTH+salary -> `₹{n}/month`; fallback salaryCategory SPECIALIZED+monthlySalary -> `/month`; CENTRAL|STATE+salaryPerDay -> `/day`; final fallback salary with type suffix or bare; else "N/A".
   - Client-side pagination: 20 per page (`EMPLOYEES_PER_PAGE`), `Pagination` component + left label "{n} active employees"; only when >1 page. Page resets to 1 each time dialog opens.
   - Filtering: only `status === "ACTIVE"` employees are shown/exported (inactive are fetched but hidden).
5. DialogFooter:
   - Button "Close" (outline) -> onClose.
   - Button "View/Download PDF" (primary, `FileText` icon) -> opens nested `PdfPreviewDialog`.
6. Nested PdfPreviewDialog (`components/pdf/pdf-preview-dialog.tsx`), title "{client.name} - Client Profile", description "Client details and salary slip template preview", filename `client_{name}.pdf`; renders `components/pdf/client-view-pdf.tsx` (dynamic import). Its own controls: "Regenerate" (outline, FileText, "Generating..." while busy), iframe preview (min 500px, `bg-white` hardcoded), "Print" (outline, Printer, opens blob in new tab, disabled w/o pdf), "Download PDF" (primary, Download). Auto-generates on open.
7. Toast on employee fetch failure: destructive "Error" / "Failed to load employees. Please try again."

### Data displayed
- `client` object passed in from list; employees via `clientService.getClientEmployees(clientId)` (GET `/clients/{id}/employees`), fetched every time the dialog opens.
- Employee fields: employeeId, title, firstName, lastName, designation, department, joiningDate, status, salaryType, salaryCategory, salarySubCategory, salary, salaryPerDay, monthlySalary.

### States
- Employees loading: plain centered text "Loading employees...".
- Employees empty: `Users` icon (h-12 w-12, opacity-50) + "No active employees found" + "This client doesn't have any active employees at the moment."
- Errors: toasts only.

### Current styling / hotspots
- HARDCODED purpose badge palette: bg-green-100/text-green-800, bg-red-100/text-red-800, bg-blue-100/text-blue-800.
- Raw hand-rolled `<table>` with duplicated tailwind cell classes (`h-12 px-4 text-left align-middle font-medium text-muted-foreground`, `p-4 align-middle`).
- `scrollbar-sleek` custom class. `min-w-[1200px]`.
- Icons: FileText, Download, Users, Calendar, Phone, Building, User (+ Printer in nested pdf dialog).

---

## 5. Terminate Client Dialog (two-step)

File: `components/clients/terminate-client-dialog.tsx`

Trigger: XCircle row action on `/clients` (only for non-INACTIVE clients).

### Interactive inventory

1. Step 1 Dialog (`max-w-2xl`):
   - Title "Terminate Client from TSS" (destructive color, `XCircle` icon). Description: "Terminate this client from Tulsyan Security Services. This will mark the client as INACTIVE in the system."
   - Destructive Alert (`AlertTriangle`): "Critical: Terminating Client from TSS" + bullet list of 4 consequences (marks INACTIVE not deleted; prevents new employee assignments; keeps historical records; existing employee-client relationships remain) + conditional warning box (`bg-destructive/10 border-destructive/20`) "Warning: This client has {n} employee(s) assigned..." when count > 0 + "Please verify before confirming."
   - Client summary panel (`bg-muted p-4 rounded-lg`), label/value rows: Client Name, Client ID, Current Status (`label.status`), Contact Person (or "N/A"), Employees (with `Users` icon; "Loading..." while fetching, count or "N/A").
   - Footer: "Cancel" (outline) -> close; "Continue to Confirm" (destructive, `XCircle` icon, disabled while submitting) -> opens step 2.
2. Step 2 AlertDialog:
   - Title "Confirm Client Termination from TSS" (`AlertTriangle` destructive icon).
   - Body: "You are about to terminate **{name}** from Tulsyan Security Services." + muted panel with Client ID and, when employees > 0, destructive-colored "Active Employees: {n} (may need separate termination)" + nested destructive Alert restating INACTIVE consequence and "All historical data, payroll records, and employee relationships will be preserved."
   - "Cancel" (AlertDialogCancel, disabled while submitting).
   - "Confirm Termination from TSS" (AlertDialogAction, classes `bg-destructive text-destructive-foreground hover:bg-destructive/90`; while submitting shows `Loader2` spinner + "Terminating...").
3. Action: `clientService.updateClient(client.id, { status: INACTIVE })`. Success toast "Client Terminated" / "{name} has been terminated from TSS successfully."; calls `onSuccess` (list refetch) and closes both dialogs. Failure: destructive toast "Error" / `getErrorMessage(error)`.
4. On open, fetches employee count via `clientService.getClientEmployees(client.id)` (silently logs errors, no toast).

### States
- Employee count loading ("Loading..."), loaded (n), unknown ("N/A").
- Submitting: buttons disabled, spinner + "Terminating...".

### Styling
- Token-based destructive styling throughout; no raw hex. Icons: AlertTriangle, XCircle, Loader2 (animate-spin), Users.

---

## 6. Client Salary Setup (embedded in Add + Edit "Salary Slip" tab)

File: `components/clients/client-salary-setup.tsx`

### Interactive inventory

1. Card "Salary Slip" — description "A standard salary slip is ready for this client. Turn the common deductions and allowances on or off below. Most clients keep the defaults."
2. 5 quick-toggle rows (whole row is a `<label>`; `rounded-lg border p-4`, `hover:bg-muted/30`), each with title, description, and a `Switch` bound to the field's `enabled` flag across mandatory/optional/custom arrays:
   1. `pf` — "Provident Fund (PF)" / "Deduct 12% PF from eligible employees."
   2. `esic` — "ESIC" / "Deduct 0.75% ESIC for employees under the wage ceiling."
   3. `lwf` — "Labour Welfare Fund (LWF)" / "Deduct the periodic LWF contribution."
   4. `bonus` — "Bonus" / "Show a bonus line on the payslip. You enter the amount each month."
   5. `advanceTaken` — "Salary advance" / "Show an advance line so advances can be deducted when taken."
3. Collapsible "Advanced: customize salary slip fields" — dashed-border trigger button with `Settings2` icon, sub-text "Rename, add, or remove individual fields. Only needed for special cases.", `ChevronDown` rotates 180deg when open. Opening remounts the inner form (increments `advancedKey`) so it picks up current config.
4. Inside collapsible: `<SalaryTemplateConfigForm initialConfig={config} onSave={onChange}>` (section 8).

### Data / states
- Pure controlled component over `SalaryTemplateConfig`; no service calls. No loading/empty/error states of its own.

### Styling
- Tokens only. Icons: ChevronDown, Settings2.

---

## 7. Salary Slip Preview (embedded in Add + Edit "Preview" tab)

File: `components/clients/salary-slip-preview.tsx`

### Interactive inventory

1. Card "Salary Slip Preview" / "See how the salary slip will look with your template configuration". (Note: pages wrap this in their own Card titled "Salary Slip Preview" too — double-card nesting today.)
2. Sample-data inputs (grid md:grid-cols-3):
   - Input `employeeName`, label "Employee Name", default "John Doe".
   - Select `month`, label "Month": 12 full month names, defaults to current month.
   - Select `year`, label "Year": 5 options, currentYear-2 .. currentYear+2, defaults to current year.
3. Button "Regenerate Preview" (outline, `FileText` icon, "Generating..." while busy) -> `handleGeneratePDF`.
4. Auto-generation: debounced 300ms effect regenerates the PDF whenever employeeName/month/year/config change (and on mount). Includes a BindingError("Config") retry workaround for @react-pdf/renderer (retries up to 2 extra times; suppresses success toast + error toast for that error class).
5. PDF preview iframe (`h-[500px]`, bordered rounded) once generated.
6. Button "Print" (outline, `Printer` icon) -> `window.open(pdfUrl, "_blank")`.
7. Button "Download PDF" (primary, `Download` icon) -> anchor download named `salary_slip_{employee}_{month}_{year}.pdf`; generates first if no URL.
8. Toasts: success "PDF Generated" / "Your salary slip PDF has been generated successfully" (skipped after Config-error retry); destructive "Error" / "Failed to generate PDF. Please try again."

### Data displayed
- No service calls. Builds a sample `SalarySlipData` from the template config: hardcoded client name "TULSYAN SECURITY SERVICES PVT. LTD.", sample employee (id "E-XXX", working_days 27), month formatted "Jan-25" style, pay period "01-MM-YYYY to 31-MM-YYYY".
- Earnings: basic from a CALCULATION field keyed `basic|basicSalary|basicPay` (fallback 15000), allowance = sum of ALLOWANCE numeric defaults, gross computed. Deductions: EPF from keys `pf|epfContribution12Percent`, ESIC from `esic|esic075Percent`, advance from `advance`; gross deduction and net pay computed.
- Renders `components/pdf/salary-slip-pdf.tsx` via dynamic import of @react-pdf/renderer.

### States
- No pdf yet: bordered `bg-muted` 500px box, "Generating preview..." or "Click Regenerate to create a preview".
- isGenerating disables the regenerate button.

### Styling
- Tokens only in component; fallback constants (15000 basic) are logic not styling. Icons: Printer, Download, FileText.

---

## 8. Salary Template Config Form ("Advanced" editor)

File: `components/clients/salary-template-config-form.tsx` (1876 lines)

Embedded inside ClientSalarySetup's collapsible. Fully client-side; `onSave` bubbles the config up (persisted only when the client is saved).

### Interactive inventory

1. Card header: title "Salary Template Configuration" with `Info` icon Tooltip ("Configure which fields should appear in salary slips and their properties." / "Toggle fields on/off and set rules for enabled fields."); description "Customize which fields appear in employee salary slips for this client".
2. `ApiErrorAlert` (components/ui/api-error-alert) shown for `validationError`, title "Validation Error", dismissible.
3. Tabs (3) with live counts: "Mandatory Fields (enabled/total)", "Optional Fields (enabled/total)", "Custom Fields (enabled/total)".
4. Mandatory tab:
   - Inline error panel when mandatory fields disabled: HARDCODED `bg-red-50 border-red-200`, `AlertCircle` `text-red-400`, heading "Mandatory Fields Required" `text-red-800`, list `text-red-700`.
   - Heading "Mandatory Fields" + "These fields are required for salary calculations".
   - "Actions" DropdownMenu (outline button, `ChevronDown`): "Enable All" (`Check` icon), "Disable All" (`X` icon — guarded by NATIVE `confirm()` browser dialog: "Warning: Disabling mandatory fields will prevent you from saving the template. Are you sure?").
   - Fields grouped in an Accordion by purpose (INFORMATION / CALCULATION / ALLOWANCE / DEDUCTION), each AccordionTrigger shows purpose Badge (colored, see palette below) + "(enabled/total)" count.
   - Empty state: dashed border box, `AlertCircle`, "No Mandatory Fields" (or generic "No fields available in this category" inside grouping).
5. Optional tab: same layout; Actions dropdown Enable All / Disable All (no confirm). Empty state "No Optional Fields".
6. Custom tab:
   - Actions dropdown (only when custom fields exist): Enable All / Disable All.
   - Button "Add Custom Field" (primary, `Plus`) -> Add Custom Field dialog.
   - Empty state (no custom fields): HARDCODED gradient box `bg-gradient-to-br from-blue-50 to-indigo-50`, circle `bg-blue-100` with `Plus` `text-blue-600`, heading "Create Your Custom Fields" (`text-gray-900`), body text `text-gray-600`, 4 example rows with colored dots (`bg-green-400`, `bg-red-400`, `bg-blue-400`, `bg-purple-400`; labels Performance Bonus, Salary Advance, Overtime Pay, Travel Allowance), CTA Button "Add Your First Custom Field" (`bg-blue-600 hover:bg-blue-700`, size lg).
7. Per-field card (`renderFieldCard`, used in all three tabs):
   - Enable `Switch` + Label (mandatory fields get red asterisk `text-red-500`).
   - Disabled-mandatory warning treatment: card `border-red-200 bg-red-50`, label `text-red-700`, destructive Badge "Required".
   - Badges: purpose (palette: ALLOWANCE green-100/green-800, DEDUCTION red-100/red-800, CALCULATION blue-100/blue-800, INFORMATION gray-100/gray-800), type (TEXT purple-100/purple-800, NUMBER blue-100/blue-800, DATE orange-100/orange-800, BOOLEAN teal-100/teal-800, SELECT indigo-100/indigo-800), "Admin Input" (orange-100/orange-800) when `requiresAdminInput`.
   - Custom fields only: ghost icon Buttons Edit (`Edit`, title "Edit custom field") and Delete (`Trash2` `text-destructive`, title "Delete custom field"; deletion immediate, toast "Custom field deleted" / "The custom field has been removed from the template" — NO confirm).
   - Expand/collapse ghost icon Button: `Info` icon when collapsed / `X` when expanded, title Expand/Collapse.
   - Expanded content: Key, Category, Description; Rules section when `field.rules` or category includes WITH_RULES:
     - NUMBER fields: Input "Default Value" (type number) -> `rules.defaultValue`.
     - TEXT fields: Input "Default Value" -> `defaultValue`.
     - SELECT fields:
       - Special-case `basicDuty`: Select "Select Days" with options 26–31 days (`getBasicDutyOptions`), default "30", helper text "Select the number of days for basic duty calculation".
       - Other selects: options rendered as outline Badges; custom fields can remove an option (X button in badge) and add options (Input "Add new option" + "Add" button; Enter key also adds). Plus a "Default Value" Select over the options (hidden for basicDuty).
     - Switch "Require remarks" -> `rules.requireRemarks` (all field types).
8. Add Custom Field Dialog (`sm:max-w-[500px] max-h-[90vh]`, scrollable body):
   - Header: "Add Custom Field" / "Create a custom field for your salary template. This field will be available for all employees."
   - Section "Required Information" (destructive Badge "Required"):
     1. Input `key` — "Field Key *", placeholder "e.g. advanceTaken, overtimeHours"; zod: required, camelCase regex, alnum only; description "Must be camelCase...".
     2. Input `label` — "Display Label *", placeholder "e.g. Advance Taken, Overtime Hours"; required; description "How the field will appear on the salary slip".
     3. Select `type` — "Field Type *": Text / Number / Date / Boolean / Select.
     4. Select `purpose` — "Field Purpose *": Information / Allowance / Deduction / Calculation.
     5. Textarea `description` — "Description *", required; placeholder "Describe the purpose and usage of this field".
     6. Switch `requiresAdminInput` — "Requires Admin Input" ("If enabled, admin must fill this field for each employee every month during salary processing"), boxed row `bg-muted/50`.
   - Section "Optional Settings" (outline Badge "Optional"):
     7. When type=SELECT: options manager (badges with X remove, Input + "Add" button, Enter adds; duplicate guard -> destructive toast "Duplicate option" / "This option already exists").
     8. When type=TEXT: Input `defaultValue` "Default Value".
     9. When type=NUMBER: Input number `defaultValue` "Default Value".
     10. Switch `requireRemarks` — "Require Remarks" ("If enabled, users will need to provide remarks when using this field").
   - Footer: "Cancel" (outline) / "Add Field" (submit; disabled until form valid). On add: field appended (category CUSTOM, enabled true) + toast "Custom field added".
   - Error styling: invalid inputs get `border-destructive`.
9. Edit Custom Field Dialog: identical form, title "Edit Custom Field" / "Update the properties of your custom field.", footer "Cancel" / "Update Field" (disabled until valid). Matches field by original key; preserves enabled state; toast "Custom field updated".
10. Card footer:
    - Button "Reset to Default" (outline) -> replaces config with `getDefaultSalaryTemplateConfig()` + toast "Reset to Default" / "Salary template configuration has been reset to default values".
    - Button "Apply to preview" (primary, `Save` icon; "Applying..." when `isLoading` prop true): validates (a) config shape present, (b) ALL mandatory fields enabled (`validateMandatoryFields` -> inline red panel + error alert "Please enable all mandatory fields before saving"), (c) no stray metadata props id/clientId/createdAt/updatedAt on any field (`validateTemplateConfig`); on pass calls `onSave(config)` + toast "Applied" / "Salary template fields applied to the preview. Save the client to store them."

### Data / states
- Pure client-side editing of `SalaryTemplateConfig`; nothing fetched. `initialConfig` prop merged over defaults.
- Error states: ApiErrorAlert, mandatory-fields red panel, per-field red card treatment, per-input destructive borders.

### Styling hotspots (all bypass theme tokens)
- Purpose/type/admin badge palettes (green/red/blue/gray/purple/orange/teal/indigo 100/800 pairs).
- Mandatory error panel red-50/200/400/700/800; disabled-mandatory card red-50/200/700; asterisks `text-red-500`.
- Custom-fields empty state: gradient blue-50->indigo-50, blue-100 circle, blue-600 icon/CTA (`bg-blue-600 hover:bg-blue-700`), gray-900/gray-600/gray-500 text, green/red/blue/purple-400 dots.
- Native browser `confirm()` for Disable All mandatory (inconsistent with the app's AlertDialog pattern).
- Icons: Plus, Save, Trash2, Edit, Info, AlertCircle, X, Check, ChevronDown.

---

## 9. Client View PDF (live version used by dialog)

File: `components/pdf/client-view-pdf.tsx` (imported by client-view-dialog via dynamic import; the copy at `components/clients/client-view-pdf.tsx` is dead but nearly identical).

Content contract (A4 @react-pdf document):
- Header: client name (24pt bold #333333), subtitle "Client Profile" (#666666); right side status badge (green `#22c55e` for ACTIVE, gray `#6b7280` for inactive, white text) + "ID: {id}".
- Section "Basic Information": Client Name, Address, Status, Onboarding Date (label/value rows, labels #555555, section title on `#f9fafb`).
- Section "Contact Information": Contact Person, Contact Number.
- Section "Salary Template Configuration" (only when enabled fields exist): table with header row (Field Name 40%, Type 20%, Purpose 20%, Default Value 20%), borders #e0e0e0.
- Footer: "Generated on {date} | This is a computer-generated document, no signature is required." (#999999).
- All colors hardcoded hex (required by react-pdf, but must be re-branded in Phase 4): #ffffff, #e0e0e0, #333333, #666666, #f9fafb, #555555, #f0f0f0, #999999, #22c55e, #6b7280.

---

## 10. Dead components (inventory for completeness; no live routes use them)

### `components/clients/salary-template-form.tsx` (unused)
Older full-form template editor: accordion sections Mandatory/Optional/Custom with per-field cards (toggle Switch disabled for MANDATORY_WITH_RULES, Check/X status icons green-500/red-500, type/purpose badges, red "Required" badge), inline value editors (basicDuty 26-31 day Select, number/text Inputs writing `rules.defaultValue`), "Add Custom Field" button creating `custom_field_{timestamp}` placeholder fields, Trash2 remove (red-500/red-700), footer "Save Template Configuration" submit, toasts on save success/failure. Uses ScrollArea, Tooltip. Safe to drop in redesign after confirming no future import.

### `components/clients/salary-template-field.tsx` (unused)
Single field card: Switch toggle, required-tooltip (AlertCircle destructive), select/number/text input bound to a passed react-hook-form. Card enabled style `border-primary/20 bg-primary/5`.

### `components/clients/client-view-pdf.tsx` (unused duplicate)
Same layout as section 9 (identical styles/sections). The live import path is `@/components/pdf/client-view-pdf`.

---

## Appendix A — Default salary template config (types/client.ts `getDefaultSalaryTemplateConfig`)

This is the baseline every new client gets; the quick toggles and advanced editor operate on these keys. Losing any key breaks payroll field mapping.

Mandatory (all enabled, category MANDATORY_NO_RULES unless noted):
| key | label | type | purpose |
|---|---|---|---|
| serialNumber | S.No | NUMBER | INFORMATION |
| clientName | Client Name | TEXT | INFORMATION |
| employeeName | Employee Name | TEXT | INFORMATION |
| designation | Designation | TEXT | INFORMATION |
| monthlyPay | Monthly Pay | NUMBER | CALCULATION |
| basicDuty | Basic Duty | SELECT (MANDATORY_WITH_RULES, default "30", rules.defaultValue 30, options 26-31 days) | CALCULATION |
| grossSalary | Gross Salary | NUMBER | CALCULATION |
| totalDeduction | Total Deduction | NUMBER | CALCULATION |
| netSalary | Net Salary | NUMBER | CALCULATION |

Optional (all enabled):
| key | label | type | purpose |
|---|---|---|---|
| pf | PF (12%) | NUMBER | DEDUCTION |
| esic | ESIC (0.75%) | NUMBER | DEDUCTION |
| fatherName | Father Name | TEXT | INFORMATION |
| uanNumber | UAN No. | TEXT | INFORMATION |
| wagesPerDay | Wages Per Day | NUMBER | CALCULATION |
| lwf | LWF | NUMBER (OPTIONAL_WITH_RULES, rules.defaultValue 10) | DEDUCTION |

Custom (all enabled, requiresAdminInput true, defaultValue "0"):
| key | label | type | purpose |
|---|---|---|---|
| bonus | Bonus | NUMBER | ALLOWANCE |
| advanceTaken | Advance Taken | NUMBER | DEDUCTION |

## Appendix B — Service functions referenced (services/clientService.ts)
- `getClients(params)` — GET /clients (page, limit, sortBy, sortOrder, searchText, status) -> {clients, total}
- `getClientById(id)` — GET /clients/{id}
- `createClient(data)` — POST /clients (payload includes `salaryTemplates` = SalaryTemplateConfig)
- `updateClient(id, data)` — PUT /clients/{id} (also used for termination: `{status: "INACTIVE"}`)
- `getClientEmployees(clientId)` — GET /clients/{clientId}/employees
- Unused by these screens but in service: `deleteClient(id)`, `getClientEmployeeCounts()` (GET /clients/employee-count)

## Appendix C — Cross-cutting notes for the redesigner
- Sorting is server-side on the list page; employee pagination inside the view dialog is client-side (20/page). Both must survive.
- Date widget inconsistency: Add uses `DatePicker` (yearRange 1900-current), Edit uses Popover+Calendar (disabled outside 1900-01-01..today). Unify but keep both constraints.
- "Save Client"/"Update Client" buttons exist on BOTH the salary tab and the preview tab; both run form.trigger() -> jump back to basic tab with a destructive toast if invalid.
- The Advanced editor's "Apply to preview" does NOT persist; persistence happens only on client save. The toast copy explains this; keep that affordance.
- `Trash2` is imported but unused in `app/(dashboard)/clients/page.tsx` (leftover from a removed delete action; there is no client delete in the UI, only terminate).
- Terminate is a status flip (PUT status INACTIVE), not a delete; the two-step confirm and employee-count warning are deliberate safety UX.
