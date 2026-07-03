# Payroll Section Inventory

Scope: `app/(dashboard)/payroll/` (index, calculate, reports, loading) and `components/payroll/` excluding `pdf/`.
PDF document internals are out of scope, but the buttons/dialogs that trigger them from these pages are inventoried (their triggers live on in-scope pages).

Supporting files read and covered here because the pages delegate to them:
- `hooks/use-payroll.ts` (usePayroll, usePayrollAdminInputs)
- `hooks/use-client.ts` (useClient)
- `services/payrollService.ts`
- `utils/payroll-export.ts`, `utils/file-export.ts` (Excel exports)
- `components/ui/month-picker.tsx`, `components/ui/pagination.tsx` (custom, not shadcn defaults)
- `components/pdf/pdf-preview-dialog.tsx` (shared PDF preview modal)

---

## 1. Payroll Landing (Hub)

- Route: `/payroll`
- File: `app/(dashboard)/payroll/page.tsx` (server component)
- Route loading state: `app/(dashboard)/payroll/loading.tsx`

### Interactive inventory
1. Card-link "Calculate Payroll" (entire Card is wrapped in `<Link href="/payroll/calculate">`). Card contains: `Calculator` icon (h-5 w-5), title "Calculate Payroll", description "Run monthly payroll for a client, review the figures, and finalize.", body text "Select a client and month to begin.". Hover: `hover:bg-muted/50`.
2. Card-link "Payroll Reports" (`<Link href="/payroll/reports">`). `FileText` icon, title "Payroll Reports", description "View and export finalized payroll by client or employee.", body text "Download reports as Excel or PDF.". Same hover treatment.

### Data displayed
None (static hub page, no service calls).

### States
- Loading: `loading.tsx` renders Skeletons: h-9 w-48 title, h-5 w-80 subtitle, two h-40 card skeletons in the same 2-col grid.
- Empty/error: n/a.

### Current styling
- `space-y-6` page wrapper; `h1.text-3xl.font-bold.tracking-tight` "Payroll"; muted subtitle "Calculate monthly salaries and view past payroll reports".
- Grid `grid-cols-1 md:grid-cols-2 gap-4`.
- Icons: `Calculator`, `FileText` (lucide).
- No hardcoded colors; all theme tokens.

### Navigation
- To `/payroll/calculate`, `/payroll/reports`.

---

## 2. Calculate Payroll (5-step wizard)

- Route: `/payroll/calculate`
- Files: `app/(dashboard)/payroll/calculate/page.tsx` (thin wrapper) -> `components/payroll/calculate-payroll.tsx` (client component, default export `CalculatePayroll`)

### Wizard steps (PAYROLL_STEPS constant)
1. "Select Client & Month" / "Choose client and payroll period"
2. "Review Data" / "Verify employee and attendance data"
3. "Admin Input" / "Fill required custom fields"
4. "Calculate" / "Calculate payroll amounts"
5. "Finalize" / "Review and finalize payroll"

Step indicator card: horizontal row of 5 circles (h-8 w-8 rounded-full). Completed = green circle with `CheckCircle` icon (`bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300`); current = blue (`bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300`); pending = gray (`bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400`), number shown otherwise. Current step title text is `text-blue-700 dark:text-blue-300`. Connector: `h-px w-16 bg-gray-200 dark:bg-gray-700` between steps. Note: step 4 "Calculate" is auto-completed programmatically (UI jumps 3 -> 5); there is no visible step-4 screen.

### Interactive inventory
1. Button "Start Over" (variant outline, header right). Only rendered when `currentStep > 1`. Calls `handleReset`: resets all state (step 1, steps array, clientId, month=now, errors, finalized flag, existing payroll, both dialogs, `resetCalculation()`, `resetInputs()`).
2. **Step 1** Select "Client" (Label "Client", shadcn Select, placeholder "Select a client"). Options: `clients` from `useClient()` (clientService.getClients, limit 1000), item text = `client.name`, value = `client.id`.
3. **Step 1** MonthPicker "Payroll Month" (Label "Payroll Month", default = current month). Custom popover picker: outline button with `Calendar` icon showing "July 2026"-style text; popover has year nav buttons (`ChevronLeft`/`ChevronRight`, bounds 2020-2030 default), 3x4 month grid buttons (3-letter labels); selected month = `bg-primary text-primary-foreground`, current month highlighted `bg-accent`.
4. **Step 1** Inline status indicators next to "Payroll Month" label:
   - `Loader2` spinner (animate-spin) while `checkingPayroll` (getPayrollByMonth in-flight; fires on every client/month change).
   - Badge "Finalized" (variant default + hardcoded `bg-green-600 hover:bg-green-700`, with `CheckCircle` h-3 w-3) when finalized payroll exists.
   - Badge "Not Finalized" (variant outline, `text-muted-foreground`) when client selected and no finalized payroll.
5. **Step 1** Amber alert banner "Payroll already finalized for this month" (shown when `existingPayroll && !checkingPayroll`). Classes: `border-amber-200 bg-amber-50 dark:bg-amber-950`, `AlertCircle` icon `text-amber-600`, text `text-amber-800 dark:text-amber-300`. Sub-line: "Finalized on {MMM dd, yyyy} • {n} employees • Net Salary: ₹{totalNetSalary en-IN}". Contains two small outline buttons (both `border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-500 hover:text-amber-900`):
   - "View" (`Eye` icon): navigates to `/payroll/reports?clientId=...&startMonth=yyyy-MM&endMonth=yyyy-MM`.
   - "Recalculate" (`Calculator` icon): opens Recalculate confirmation AlertDialog.
6. **Step 1** Primary full-width submit button, 3 label states:
   - checking: `Loader2` spinner + "Checking..." (disabled)
   - existing payroll: `FileText` + "View Existing Payroll" (opens Existing Payroll dialog)
   - normal: `Calendar` + "Continue to Data Review" (fetches client details via `fetchClientDetails` + `clientService.getClientEmployees`, advances to step 2)
   - Disabled when no client selected, clients loading, or checking. Validation: "Please select a client" pushed to error alert when clicked with no client (guarded by disabled anyway).
7. **Step 2** Button "Back" (outline): returns to step 1.
8. **Step 2** Button "Continue to Admin Input" (when adminInputFields exist) OR "Calculate Payroll" (when none; triggers calculation directly).
9. **Step 3** Per-employee, per-field number Input for admin inputs. One bordered box (`border rounded-lg p-4`) per ACTIVE employee showing "{firstName} {lastName}" (font-semibold) + employeeId (muted). Inside: grid md 2-col of fields; each field:
   - Label: `field.label` + Badge with `field.purpose` text; badge variant: ALLOWANCE/allowance = default, DEDUCTION/deduction = destructive, else secondary.
   - Input `type=number`, `min=0`, id `{employeeId}-{field.key}`, placeholder = `field.defaultValue || "0"`, value from `adminInputs[employeeId][field.key]`, onChange parses float (falls back 0) via `updateAdminInput`.
   - Optional helper text `field.description` (text-xs muted).
   - Fields sourced from client salaryTemplates (mandatoryFields/optionalFields/customFields where `requiresAdminInput`) via `usePayroll.fetchClientDetails`.
   - Validation (`validateAdminInputs`): value < 0 produces error "Employee {id}: {label} cannot be negative". Empty values default to 0 (info alert says fields may be left empty).
10. **Step 3** Info Alert: `AlertCircle` + "The following fields require admin input. You can leave fields empty if not applicable for specific employees."
11. **Step 3** Button "Back" (outline): to step 2.
12. **Step 3** Button "Calculate Payroll" / "Calculating..." (disabled while `isCalculating`). Calls `payrollService.calculatePayroll` (POST /payroll/calculate-payroll, 120s timeout) with clientId, payrollMonth (yyyy-MM), and adminInputs (all ACTIVE employees x all fields, missing values filled with 0). On success jumps to step 5.
13. **Step 5** Results table (see Data below).
14. **Step 5, pre-finalize** Button "Back to Edit" (outline): to step 3.
15. **Step 5, pre-finalize** Button "Finalize Payroll" (shows `Loader2` + "Finalizing..." while `isFinalizing`). Calls `payrollService.finalizePayroll` (POST /payroll/finalize, 120s timeout) with clientId, payrollMonth, adminInputs (if any), `force: true` when an existing payroll was being replaced.
16. **Step 5, post-finalize** Button "Calculate New Payroll" (outline): full reset (`handleReset`).
17. **Step 5, post-finalize** Button "View Payroll Reports": `router.push("/payroll/reports")`.
18. **Dialog: "Existing Payroll Found"** (shadcn Dialog, max-w-2xl). Trigger: clicking step-1 submit when finalized payroll exists. Header: `FileText` icon + title; description "A payroll has already been finalized for {client name} - {MMMM yyyy}". Body stat tiles:
    - "Total Employees" (`bg-blue-50 dark:bg-blue-950`, number `text-blue-700 dark:text-blue-300`)
    - "Net Salary" ₹ en-IN (`bg-green-50 dark:bg-green-950`, `text-green-700 dark:text-green-300`)
    - "Gross Salary" ₹ en-IN (`bg-purple-50 dark:bg-purple-950`, `text-purple-700 dark:text-purple-300`)
    - "Finalized On" full date `EEEE, MMMM dd, yyyy 'at' hh:mm a` (`bg-muted`)
    Footer buttons: "Cancel" (outline, closes), "View in Reports" (outline, `Eye` icon, same reports navigation as #5), "Recalculate Anyway" (primary, `Calculator` icon, opens confirm AlertDialog).
19. **AlertDialog: "Confirm Recalculation"** (`AlertCircle` amber icon in title). Body: "You are about to recalculate payroll for **{client}** - **{month yyyy}**." / "This will create a new payroll record. The existing finalized payroll will be replaced by the new one." / "Are you sure you want to proceed?". Buttons: "Cancel" (AlertDialogCancel), "Yes, Recalculate" (AlertDialogAction, hardcoded `bg-amber-600 hover:bg-amber-700`) -> clears existingPayroll, fetches client details + employees, advances to step 2.
20. Error Alert (variant destructive, `AlertCircle`): renders `errors[]` as a `list-disc` list. Sources: no client selected, fetch client details failure ("Failed to fetch client details. Please try again."), admin input validation errors.

### Toasts (via use-toast, fired from `hooks/use-payroll.ts`)
1. "Error" / error.message or "Failed to fetch client details" (destructive) on fetchClientDetails failure.
2. "Payroll Calculated" / "Successfully calculated payroll for {n} employees." on calculate success.
3. "Calculation Failed" / error.message or "Failed to calculate payroll. Please try again." (destructive).
4. "Payroll Finalized" / "Successfully finalized payroll for {n} employees." on finalize success.
5. "Finalization Failed" / error.message or "Failed to finalize payroll. Please try again." (destructive).

### Data displayed
- Clients list: `clientService.getClients({limit:1000})` via `useClient()`.
- Finalized-payroll check: `payrollService.getPayrollByMonth(clientId, "yyyy-MM")` (GET /payroll/by-month/:clientId/:month; 404 -> null). Uses `records`, `summary.totalEmployees/totalNetSalary/totalGrossSalary`, `updatedAt || createdAt`.
- Step 2 client review: `clientService.getClientById` via `usePayroll.fetchClientDetails`. Shows Client Name, Contact Person (`contactPersonName`), Contact Number (`contactPersonNumber`), Status badge (default when ACTIVE else secondary, text via `label.status`). Plus "Admin Input Required Fields" outline badges listing each admin field label.
- Step 2/3 employees: `clientService.getClientEmployees(clientId)`; only `status === "ACTIVE"` employees are used for admin input and calculation payloads.
- Step 5 summary tiles: `calculationResult.data.totalEmployees` (blue tile), `.clientName` (green tile), `.payrollMonth` (purple tile).
- Step 5 results table from `calculationResult.data.payrollResults` (CalculatePayrollResponse). Columns (11, header order):
  1. Employee (employeeName bold + employeeId muted)
  2. Category (Badge outline with `label.salaryCategory`; sub-line `label.salarySubCategory` if present; else "N/A")
  3. Present Days (`record.presentDays`)
  4. Rate (`IndianRupee` icon + value; sub-label "/month" when SalaryCategory.SPECIALIZED else "/day"; "N/A" fallback)
  5. Basic Pay (₹ icon + `calculations.basicPay` fallback `salary.basicPay`, else "N/A")
  6. Gross Salary (same pattern, `grossSalary`)
  7. PF (₹ amount if > 0; else "-" + `Info` icon with native `title` tooltip: "PF not enabled" or "PF enabled but amount is 0 (Gross salary may exceed threshold)")
  8. ESIC (same pattern with ESIC wording)
  9. Total Deductions (₹, `deductions.totalDeductions` fallback)
  10. Net Salary (₹, font-semibold)
  11. Status (Badge: destructive "Error" if `record.error`; green "Finalized" with CheckCircle after finalize (`bg-green-600 hover:bg-green-700`); else default "Pending")
  Table has no sorting/pagination; wrapper `rounded-md border overflow-x-auto scrollbar-sleek`, `min-w-[1200px]`. salaryData read from grouped structure (`calculations`/`deductions`/`allowances`/`information`) with legacy flat fallbacks.
- Step 5 success alert (post-finalize): green Alert `border-green-200 bg-green-50 dark:bg-green-950`, CheckCircle `text-green-600`, text `text-green-800 dark:text-green-300`: "**Payroll Finalized!** The payroll records have been successfully saved. You can view them in the Payroll Reports section."

### States
- Loading: `checkingPayroll` spinner; button label swaps ("Checking...", "Calculating...", "Finalizing..." with Loader2). Route-level `loading.tsx` covers /payroll only, calculate has no dedicated route skeleton.
- Empty: no explicit empty state for zero employees/zero clients (Select simply empty).
- Error: error Alert list + destructive toasts (above). Calculation/finalize errors are swallowed in component (handled in hook toasts).

### Current styling
- Card-based layout, `space-y-6`. Header `text-3xl font-bold tracking-tight`.
- Hardcoded palette classes bypassing tokens: step circles (green/blue/gray-100/700/900 series), connector `bg-gray-200 dark:bg-gray-700`, badge `bg-green-600 hover:bg-green-700` (x2), amber banner set (`border-amber-200 bg-amber-50 dark:bg-amber-950`, `text-amber-600/700/800/900`, `border-amber-300`, `hover:bg-amber-100`, `hover:border-amber-500`), AlertDialog action `bg-amber-600 hover:bg-amber-700`, stat tiles `bg-blue-50/green-50/purple-50 dark:bg-*-950` with `text-*-700 dark:text-*-300`, success alert greens.
- Custom class: `scrollbar-sleek` (globals.css).
- Icons (lucide): Calendar, Users, Calculator, CheckCircle, AlertCircle, Building2, IndianRupee, Loader2, Info, Eye, FileText.
- Native `title` attribute tooltips on PF/ESIC info icons (not a Tooltip component).

### Navigation
- To `/payroll/reports` (plain and with `?clientId&startMonth&endMonth` query), back through wizard steps, self-reset.

---

## 3. Payroll Reports

- Route: `/payroll/reports` (reads query params `clientId`, `startMonth`, `endMonth`)
- Files: `app/(dashboard)/payroll/reports/page.tsx` (Suspense wrapper + `PayrollReportsSkeleton`: h-10 w-64 + h-96 w-full skeletons) -> `components/payroll/payroll-reports.tsx` (`PayrollReports`, client)

### Interactive inventory
1. Tabs "Report Type" (shadcn Tabs, value `client | employee`, full-width 2-col TabsList):
   - Tab "Client Reports" (`Building2` icon)
   - Tab "Employee Reports" (`User` icon)
   - Switching resets filters to `{page:1, limit:20}`, clears data, error, employee search/selection.
2. **Client tab** Select "Client *" (id `client-select`, h-12, placeholder "Select a client", disabled while clients load). Options from `useClient()` clients; each item shows `Building2` icon (hardcoded `text-gray-500`) + name.
3. **Client tab** MonthPicker "Start Month (Optional)" (placeholder "Select start month"; sets filter `startMonth` yyyy-MM).
4. **Client tab** MonthPicker "End Month (Optional)".
5. **Client tab** Button "Generate Report" (`RefreshCw` icon; loading state `Loader2` + "Loading..."; mobile short labels "Generate"/"Loading"; full-width h-12; disabled when no clientId or loading). Calls `fetchReportData`.
6. **Employee tab** Employee combobox (Popover + Command). Trigger: outline button role=combobox h-12 showing selected "{first} {last} ({employeeId})" or typed text or "Search employee...", `Search` icon right. Popover content `w-[90vw] sm:w-[400px]`: CommandInput placeholder "Search employee by ID or name..." (300ms debounce, min 2 chars, calls `employeeService.getEmployees({searchText})`); list states: centered `Loader2` while searching; CommandEmpty "No employees found." (>=2 chars, no results); CommandEmpty "Type at least 2 characters to search..." otherwise; CommandGroup of CommandItems (User icon, bold name, employeeId sub-line) selecting sets `employeeId` filter.
7. **Employee tab** Button "Clear" (ghost, xs, `X` icon; visible only when an employee is selected): clears selection and employeeId filter.
8. **Employee tab** Select "Client (Optional)" (id `employee-client`, options "All clients" + client list; "all" maps to undefined filter).
9. **Employee tab** MonthPicker "Start Month (Optional)".
10. **Employee tab** MonthPicker "End Month (Optional)".
11. **Employee tab** Button "Generate Report" (same states as #5; disabled when no employeeId or loading).
    Note: data also auto-fetches via useEffect whenever filters change (once required clientId/employeeId present), and initializes from URL query params on first load (sets client tab + clientId/startMonth/endMonth).
12. Button "Export Excel" (outline, lg, `FileSpreadsheet` icon; mobile label "Excel"). Card "Export Report" is only rendered when records exist. Calls `exportPayrollToExcel(allRecords || page records, filename)` where filename = `Client_Payroll_Report_{clientName}` or `Employee_{employeeId}_Payroll_Report`; saved as `{filename}_{timestamp}.xlsx` (SheetJS + file-saver, sheet "Payroll Report"). Excel columns (21): Employee ID, Client, Month, Salary Category, Salary Sub-Category, Rate (Per Day/Month), Basic Duty, Duty Done, Basic Pay, Monthly Pay, Gross Salary, Net Salary, PF, ESIC, LWF, Advance Taken, Bonus, Total Deductions, Designation, Employee Name, Created At.
13. Button "View & Download PDF" (outline, lg, `FileText` icon; mobile "PDF"). Opens PDF Preview Dialog (#20).
14. Button "Customize Columns" (outline, sm, `Settings` icon; header of Report Data card). Opens Customize Columns dialog (#21).
15. Report Data table. Columns driven by `COLUMN_FIELDS` (17 configurable) + fixed trailing "Payslip" column. Field list (key / label / category / default visible):
    - employeeId / Employee ID / essential / true (rendered as outline Badge)
    - client / Client / essential / true
    - month / Month / essential / true (outline Badge)
    - category / Category / essential / true (Badge `label.salaryCategory` + muted `label.salarySubCategory` sub-line, "N/A" fallback)
    - rate / Rate / essential / true (monthlySalary "/month" for SPECIALIZED, salaryPerDay or wagesPerDay/rate "/day", "N/A" fallback)
    - basicPay / Basic Pay / essential / true
    - grossSalary / Gross Salary / essential / true
    - netSalary / Net Salary / essential / true (font-medium)
    - pf / PF / deductions / true (amount, or "-" + `Info` icon with title "PF disabled: Gross salary > ₹15,000" when 0 and gross > 15000, else plain "-")
    - esic / ESIC / deductions / true (same, threshold ₹21,000)
    - totalDeductions / Total Deductions / deductions / true
    - bonus / Bonus / allowances / false (auto-shows if any record has value)
    - advanceTaken / Advance Taken / deductions / false (auto-show)
    - lwf / LWF / deductions / false (auto-show)
    - designation / Designation / information / false
    - department / Department / information / false
    - createdAt / Created / information / true (formatDate en-IN)
    Column visibility logic: user preference OR (essential and not explicitly hidden) OR (bonus/lwf/advanceTaken with data) OR (non-essential with data and preference). Money columns right-aligned; per-column min-width classes (min-w-[90px] to min-w-[120px]); table `min-w-[1200px]` inside `rounded-md border overflow-x-auto scrollbar-sleek -mx-4 sm:mx-0 px-4 sm:px-0`. No column sorting in UI (service supports sortBy/sortOrder but unused).
16. Per-row Button "Payslip" (ghost sm, `FileText` icon, label hidden on mobile; dynamic import of `SingleEmployeePayslipButton` with identical disabled-button loading fallback). Opens PdfPreviewDialog titled "Payslip - {employeeName}", description "{clientName} ({month})", file `Payslip_{employeeId}_{month}_{timestamp}.pdf`.
17. Pagination (custom component; shown when `total > limit`, i.e. > 20). Prev/next icon buttons (ChevronLeft/ChevronRight, sr-only labels "Previous Page"/"Next Page"), numbered buttons with first/last always shown and `MoreHorizontal` ellipsis; active page = default variant; server-side paging via `updateFilter("page", n)`.
18. Summary statistics cards (5, shown when data exists): Total Records (`reportData.total`), Total Gross Salary, Total Net Salary, Total Deductions (all `formatCurrency` INR, computed over allRecords), and 5th card "Unique Employees" (client tab) or "Unique Clients" (employee tab).
19. Error Alert (destructive): title "Error" + message from fetch failure.
20. **Dialog: PDF Preview** (`components/pdf/pdf-preview-dialog.tsx`, dynamically imported, max-w-5xl w-[90vw] max-h-[85vh]). Title "{report title} - Payroll Report"; description = period text ("MMM yyyy - MMM yyyy" / "MMMM yyyy" / "All Periods"); auto-generates on open. Contents: Button "Regenerate"/"Generating..." (outline, `FileText`), iframe preview (bordered, `bg-white`, inline style minHeight 500px) with placeholder text "Generating preview..." / "Click Regenerate to create a preview", footer Button "Print" (outline, `Printer`, opens blob URL in new tab, disabled until generated) and Button "Download PDF" (`Download` icon, downloads `payroll-report-{title}-{timestamp}.pdf`). Document = `components/payroll/pdf/payroll-report-pdf.tsx` (out of scope).
21. **Dialog: "Customize Columns"** (sm:max-w-[600px], max-h-[85vh], scrollable body). Description: "Select which columns to display in the payroll report table. Your preferences will be saved." Four checkbox groups: "Essential Fields", "Deductions", "Allowances", "Information". Each row: Checkbox (id = field key) + Label; non-essential fields with no data in current result set are disabled and get "(No data)" suffix + muted cursor-not-allowed label. Footer: "Reset to Defaults" (outline), "Cancel" (outline), "Save Preferences" (primary). Preferences persist to localStorage key `payroll-reports-column-preferences`.

### Toasts
1. "Error" / fetch error message (destructive) on report fetch failure.
2. "No Data" / "No data available to export" (destructive) when exporting with no records.
3. "Export Successful" / "Report exported as {fileName}".
4. "Export Failed" / error or "Failed to export report" (destructive).
5. "Preferences Saved" / "Column preferences have been saved and will be remembered." on saving column customization.

### Data displayed
- `payrollService.getPayrollReport({clientId, employeeId, startMonth, endMonth, page, limit})` (GET /payroll/report, 120s timeout). Records: PayrollReportRecord {id, employeeId, clientId, clientName, month, salaryData, createdAt, updatedAt}. Second full fetch (limit = total) grabs `allRecords` for export/PDF/summary when total > page size.
- `employeeService.getEmployees({searchText})` for the combobox suggestions.
- `useClient()` -> `clientService.getClients` for client selects.
- salaryData is read through grouped structure (calculations/deductions/allowances/information) with flat legacy fallbacks everywhere.

### States
- Loading: 5 x h-12 Skeleton rows in table area; button spinners; combobox spinner; route Suspense skeleton.
- Empty: centered block with `TrendingUp` icon (h-12 w-12, opacity-50), heading varies: "Select a client to generate reports" / "Select an employee to generate reports" / "No payroll data found"; helper sentence per tab ("Choose a client and click 'Generate Report'..." / "Search for an employee and click 'Generate Report'...").
- Error: destructive Alert + toast.

### Current styling
- Page container `container mx-auto px-4 py-6 max-w-7xl space-y-6`; responsive labels via `hidden sm:inline` / `sm:hidden` pairs.
- Hardcoded/bypass: `text-gray-500` on select icons; PF/ESIC threshold tooltips via native `title`; inline style `style={{ maxHeight: 'calc(85vh - 180px)' }}` in customize dialog and `style={{ minHeight: "500px" }}` + `bg-white` in PDF preview.
- Custom class: `scrollbar-sleek`.
- Icons (lucide, imported): AlertCircle, FileSpreadsheet, Search, Building2, User, TrendingUp, RefreshCw, FileText, Download, Eye, Loader2, X, DollarSign, Info, Settings, Check (Download/Eye/DollarSign/Check imported but unused in this file); MonthPicker adds Calendar/ChevronLeft/ChevronRight; Pagination adds ChevronLeft/ChevronRight/MoreHorizontal; PdfPreviewDialog adds Printer.
- Keyboard: Command palette in combobox provides arrow/enter navigation (cmdk built-in). No other shortcuts.

### Navigation
- Deep-linkable via query params `clientId`, `startMonth`, `endMonth` (used by calculate page's "View" actions). No outbound links.

---

## 4. ORPHANED: ClientReports component

- File: `components/payroll/client-reports.tsx` (`ClientReports`)
- **Not imported anywhere** (grep across app/ and components/ finds no usage). Superseded by `payroll-reports.tsx`. Redesign decision needed: port or delete. Inventoried for completeness.

### Interactive inventory
1. Select "Select Client" (native label, id `client-select`, h-12; options = clients from `useClient()`; resets page to 1).
2. Button "Export Excel" (outline lg, `FileDown` icon, mobile "Excel"; disabled while loading/empty). Calls `exportClientPayrollToExcel(payrollData, clientName)` -> `{ClientName}_Payroll_{timestamp}.xlsx`, sheet "Client Payroll", 21 columns: Month, Employee ID, Employee Name, Client, Salary Category, Salary Sub-Category, Rate (Per Day/Month), Basic Duty, Duty Done, Basic Pay, Monthly Pay, Gross Salary, Net Salary, PF, ESIC, LWF, Advance Taken, Bonus, Total Deductions, Designation, Created At.
3. `ClientPayrollPDFDownloadButton` (from excluded pdf/ dir; renders outline lg button, `FileText` icon, "View & Download PDF" via react-pdf PDFDownloadLink).
4. Expandable month rows: clicking a TableRow toggles `expandedMonth`; row also holds a ghost sm button with `ChevronUp`/`ChevronDown` (16px).
5. Outer table columns: Month, Employee Count, Total Net Salary (₹ toLocaleString), Actions (right-aligned chevron). `min-w-[600px]`, `overflow-x-auto scrollbar-sleek`, row `hover:bg-muted/50 cursor-pointer`.
6. Nested "Employee Details" table (inside expanded row, `bg-muted/30 p-4`): Employee (full name or employeeId), Basic Pay, Gross Salary, Net Salary, Deductions (all ₹, grouped-with-fallback reads).
7. Pagination (page size 10, shown when totalPages > 1).

### Toasts
"Error"/"Failed to fetch payroll data" (destructive); "No data to export"/"Please select a client with payroll data first" (destructive); "Export successful"/"Payroll data has been exported to Excel"; "Export failed"/"Failed to export payroll data to Excel" (destructive).

### Data / states
- `payrollService.getPastPayrolls(clientId, page, 10)` (GET /payroll/past) + `clientService.getClientById` (address, contactPersonName, contactPersonNumber, clientOnboardingDate for the PDF).
- Loading: 3 h-10 skeleton rows. Empty: centered "No payroll data found for this client" / "Select a client to view payroll data" (also mirrored in CardDescription). Error: destructive Alert titled "Error".
- Icons: AlertCircle, ChevronDown, ChevronUp, FileDown, FileText. No hardcoded colors.

---

## 5. ORPHANED: EmployeeReports component

- File: `components/payroll/employee-reports.tsx` (`EmployeeReports`)
- **Not imported anywhere.** Superseded by `payroll-reports.tsx`. Inventoried for completeness.

### Interactive inventory
1. Select "Client (Optional)" (id `employee-client`; options "All Clients" + clients; changing it fetches that client's employees via `employeeService.getEmployees({clientId})`).
2. Employee picker, mode-dependent:
   - Client chosen: Select "Employee" (id `employee-select`, options "{first} {last} ({id})").
   - "All Clients": Input `employee-search` placeholder "Search by ID or name" + Enter key handler + secondary icon Button (`Search` icon) calling `handleSearch` (`employeeService.getEmployees({searchText})`, auto-selects first match; destructive toast "No employees found" otherwise).
3. MonthPicker "Start Month (Optional)".
4. MonthPicker "End Month (Optional)".
5. Button "Export Excel" (outline lg, `FileDown`, mobile "Excel") -> `exportEmployeePayrollToExcel(data, employeeId)` -> `Employee_{id}_Payroll_{timestamp}.xlsx`, sheet "Employee Payroll", 18 columns (Month, Salary Category, Salary Sub-Category, Rate (Per Day/Month), Basic Duty, Duty Done, Basic Pay, Monthly Pay, Gross Salary, Net Salary, PF, ESIC, LWF, Advance Taken, Bonus, Total Deductions, Designation, Created At).
6. `EmployeePayrollPDFDownloadButton` (excluded pdf/ dir; outline lg button, `FileText`, "View & Download PDF").
7. Summary cards (3): Total Gross Salary, Total Deductions, Total Net Salary (₹ toLocaleString).
8. Payroll table (min-w-[800px], `scrollbar-sleek`), 10 columns: Month, Basic Pay, Gross Salary, Net Salary, PF, ESIC, LWF, Bonus, Advance, Total Deductions. Zero PF/ESIC/LWF/Bonus/Advance render "-". No pagination.
9. Data auto-fetches on employee/client/month change: `payrollService.getEmployeePayrollReport(employeeId, clientId?, startMonth?, endMonth?)` (GET /payroll/employee-report/:employeeId).

### Toasts
"Error"/"Failed to fetch employees"; "No employees found"/"No employees match your search criteria"; "Error"/"Failed to search employees"; "Error"/"Failed to fetch employee payroll data"; "No data to export"/"Please select an employee with payroll data first"; "Export successful"/"Employee payroll data has been exported to Excel"; "Export failed"/"Failed to export payroll data to Excel" (destructive variants on all errors).

### States
- Loading: 3 h-10 skeletons; selects disabled while loading. Empty: "No payroll data found for this employee" / "Select an employee to view payroll data". Error: destructive Alert "Error".
- Icons: AlertCircle, FileDown, Search (+ FileText via PDF button). Keyboard: Enter submits employee search. No hardcoded colors.

---

## Cross-cutting notes for the redesigner

1. **Service calls used by this section** (`services/payrollService.ts`): `calculatePayroll`, `finalizePayroll`, `getPastPayrolls`, `getPayrollByMonth`, `getPayrollStats` (defined, unused in UI), `getEmployeePayrollReport`, `getPayrollReport`. Plus `clientService.getClients/getClientById/getClientEmployees`, `employeeService.getEmployees`.
2. **Hardcoded-color hotspots to migrate to tokens**: calculate-payroll.tsx step indicator (green/blue/gray-*), amber existing-payroll banner + amber dialog action, green "Finalized" badges (`bg-green-600 hover:bg-green-700`), blue/green/purple stat tiles (x2 locations: step 5 summary and existing-payroll dialog), green success alert, `text-gray-500` icons in payroll-reports selects, `bg-white` + inline minHeight in pdf-preview-dialog, inline maxHeight in customize dialog.
3. **Persistence**: localStorage `payroll-reports-column-preferences` drives report table columns; must survive redesign.
4. **URL contract**: `/payroll/reports?clientId&startMonth&endMonth` is deep-linked from calculate flow (two entry points) and must keep working.
5. **Auto-show column rules** (bonus/lwf/advanceTaken appear automatically when data exists) and PF/ESIC threshold tooltips (₹15,000 / ₹21,000) are business logic embedded in the table; do not lose.
6. **Orphans**: `client-reports.tsx` and `employee-reports.tsx` are dead code (no imports). Decide port-or-delete; their Excel exports (file-export.ts) and PDF buttons are only reachable through them.
7. **Wizard quirk**: step 4 "Calculate" has no screen; UI jumps 3 -> 5, marking 4 complete programmatically.
8. All money formatting: `formatCurrency` (Intl en-IN INR, 0 decimals) in payroll-reports, raw `₹{n.toLocaleString()}`/`toLocaleString("en-IN")` elsewhere; `IndianRupee` lucide icon used as currency glyph in calculate table.
