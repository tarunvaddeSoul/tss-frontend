# Attendance Section Inventory

Contract for the UI redesign. Every interactive element, data field, state, and style listed here must survive the redesign.

Scope:
- `/attendance` -> `app/(dashboard)/attendance/page.tsx` (renders `MarkAttendanceBySite`)
- `/attendance/mark-by-site` -> `app/(dashboard)/attendance/mark-by-site/page.tsx` (renders the SAME `MarkAttendanceBySite` component; two routes, one screen)
- `/attendance/records` -> `app/(dashboard)/attendance/records/page.tsx` (self-contained page)
- `/attendance/reports` -> `app/(dashboard)/attendance/reports/page.tsx` (renders `AttendanceReportsComponent`)
- `/attendance/upload` -> `app/(dashboard)/attendance/upload/page.tsx` (renders `UploadAttendanceComponent`)
- Route-level loading: `app/(dashboard)/attendance/loading.tsx` -> `<Loader text="Loading attendance..." size="lg" fullPage />`

Components inventoried:
- `components/attendance/mark-attendance-by-site.tsx`
- `components/attendance/attendance-reports.tsx`
- `components/attendance/upload-attendance.tsx`
- Shared: `components/pdf/pdf-preview-dialog.tsx` (used by reports), `components/ui/month-picker`, `hooks/use-client.ts`

---

## 1. Mark Attendance by Site (`/attendance` AND `/attendance/mark-by-site`)

File: `components/attendance/mark-attendance-by-site.tsx` (2799 lines). A 7-step wizard (steps 0-6) with sticky bottom navigation.

Steps: 0 Select Client, 1 Select Month, 2 Upload Excel File, 3 Mark Attendance, 4 Upload File (Optional), 5 Review & Submit, 6 Success.

### Interactive inventory

Header / status area (always visible):
1. Submission status Alert (shown after submit): green alert "Attendance Successfully Submitted" with created count, optional "Attendance file uploaded successfully" line, and "Submitted at: {formatDate(timestamp)}".
2. Attachment status card (shown once client + month chosen): text "Checking attachment..." while loading; if sheet exists: "Sheet attached for **{client}**, {Month yyyy}" + inline **View** link-button (variant link, `text-blue-600`) that opens the Document Preview Dialog (does HEAD fetch to detect pdf/image); if none: "No sheet attached for this month." + anchor link **"Upload now"** (href `/attendance/upload`, `text-blue-600`).
3. Button **"View Records"** (outline) -> `router.push("/attendance/records")`.
4. Progress Tracker card: `Progress` bar (h-2) + Badge (outline) "{n}% Complete".
5. Desktop stepper (lg+): 7 circular step indicators (icon or Check when completed, primary/completed/pending colorway) joined by connector lines, plus a 7-column grid of step title + description labels.
6. Mobile stepper (<lg): 7 numbered circles + current step title/description centered below.
7. Validation errors Alert (destructive) listing `errors[]` as bullets.

Step 0 - Select Client:
8. Select field `clientId` (label "Client", placeholder "Select a client", FormDescription "Select the client where employees work"). Options: all clients from `clientService.getClients()`, each rendered with Building2 icon + name. Disabled while loading or after submission. Zod: `min(1, "Please select a client")`. Changing it clears employees/selection.
9. Inline loading row: Loader2 spinner + "Loading clients...".
10. Confirmation Alert when client picked: "Client Selected" / "**{name}** has been selected for attendance marking."

Step 1 - Select Month:
11. `MonthPicker` field `month` (label "Attendance Month", yearRange 1900..currentYear, disabled after submit). Zod: required date ("Please select a month"). Selecting client+month triggers `fetchActiveEmployees` via a form.watch subscription.
12. "Selection Summary" info Alert showing Client and Month once both chosen.

Step 2 - Upload Excel File (optional step):
13. Button **"Download Template"** (outline, Download icon) -> `generateExcelTemplate()`: builds an XLSX client-side via the `xlsx` package with headers `Employee ID | Employee Name | Present Days Count` (one row per active employee, count 0), column widths 15/30/18, sheet name "Attendance", filename `Attendance_Template_{clientName}_{yyyy-MM}.xlsx`. Disabled unless client + month + employees loaded. Will fetch employees first if list is empty.
14. Existing-file check Alert: spinner "Checking for existing Excel file..." while checking; if a file exists: blue Alert "Excel File Already Uploaded" (uploading a new file replaces it) containing button **"View/Download Excel"** (outline, sm) -> opens Excel File Preview Dialog.
15. File input `attendanceFile` (label "Excel File (XLSX/XLS)", `accept=".xlsx,.xls"`, description "Only XLSX and XLS files are allowed. Maximum file size: 10MB"). On change runs `handleExcelFileChange`: client-side validation (extension .xlsx/.xls, size <= 10MB, first sheet, required case-insensitive headers "employee id"/"employee name"/"present days count", integer present-days in 0..daysInMonth, at least one row matching an active employee), fetches existing attendance (`attendanceService.getAttendanceByClientAndMonth`), merges Excel values into the form (Excel value wins, falls back to existing count when Excel is 0), selects those employees, then AUTO-UPLOADS via `attendanceService.uploadAttendanceExcel`.
16. Validation state Alerts: "Validating Excel file..." (spinner); destructive "Validation Errors" (bulleted, invalid rows capped at 10 + "and N more row(s)"); amber "Some rows were skipped" warnings (skipped non-active employees, active employees missing from sheet, each list capped at 5 names + "and N more"); green "Excel File Processed Successfully" (message varies by uploading/uploaded state).
17. Instructions Alert: 5-step ordered list + note "This step is optional...".

Step 3 - Mark Attendance:
18. Collapsible **"Previously Marked Attendance ({N} employee(s))"** (outline button trigger, History icon, ChevronDown; defaultOpen) -> blue-tinted card "Attendance Already Marked" containing a Table (min-w-[500px], `scrollbar-sleek` wrapper) with columns: **Employee** (name + id subtext), **Department**, **Designation**, **Present Days** (center, blue outline Badge "{n} day(s)"). Data from `attendanceService.getAttendanceByClientAndMonth`.
19. Button **"Select All"** / **"Deselect All"** (outline sm, UserCheck icon; label toggles when all selected). Toasts "All employees deselected" / "All {n} employee(s) selected"; destructive toast "Select Month First" if month missing.
20. Badge (secondary) "{selected} of {total} selected".
21. Caption "Max {maxDays} days for {Month yyyy}".
22. Mobile layout (<md): stacked cards per employee, each with: Checkbox (select), name, employee id, "{designation} · {department}", optional blue **"Marked"** badge (CheckCircle2 icon), and a number Input "Present days" (min 0, max daysInMonth, w-24, clamped on change/blur; editing auto-selects the employee). Card gets `bg-muted/50` when selected and `bg-blue-50/50 border-l-2 border-l-blue-500` when it has existing attendance.
23. Desktop layout (md+): Table with columns: **Select** (Checkbox, w-12), **Employee** (name + id, min-w-[200px]; blue "Marked" badge wrapped in Tooltip "Attendance already marked for this employee"), **Department** (min-w-[120px]), **Designation** (min-w-[120px]), **Present Days** (number Input w-20, same clamping). Same row highlighting as mobile.
24. Destructive Alert "No employees selected" when selection empty (message varies: no month / no employees / none selected).
25. Info Alert "Select Month to Load Employees" (when client set but month missing) and Info Alert "No employees found" (empty employee list).
26. Loading state: `InlineLoader text="Loading employees..."`.

Step 4 - Upload File (Optional):
27. File input `attendanceFile` (label "Attendance File", `accept=".pdf,.jpg,.jpeg,.png"`). Rejects other types with destructive toast "Unsupported File Type" and clears the input. Description: "Upload attendance proof as a PDF or image (PDF, JPG, JPEG, PNG)."
28. Info Alert "Optional Step" (can skip; attendance already marked in previous step).

Step 5 - Review & Submit:
29. Summary grid: Client, Month, Selected Employees ("{n} employees"), Attendance File (filename or "No file uploaded").
30. "Selected Employees Summary" Table: columns **Employee**, **Present Days** (only selected rows).
31. Alert "Ready to Submit" (cannot modify after submission).

Sticky bottom navigation (steps 0-5, sticky bottom bar with backdrop blur):
32. Button **"Previous"** (outline, ArrowLeft) - disabled on step 0, while submitting, or after submit; toast "Cannot Go Back" if already submitted.
33. Button **"Next"** (ArrowRight; Loader2 while loading) on steps 0-3 - runs per-step validation, toast "Progress / Step {x} of {y}"; moving off step 2 stores Excel data for merge and fetches employees if needed.
34. Step 4 only: TWO buttons - **"Skip & Review"** (outline) and **"Next: Review"** (primary), both advance to step 5.
35. Step 5 only: Button **"Submit Attendance"** (type submit, CheckCircle2; label becomes "Already Submitted"; disabled when submitting, nothing selected, or already submitted). Submit calls `attendanceService.bulkMarkAttendance` (atomic; on error stays on review with destructive toast, duration 8000) then optionally `attendanceService.uploadAttendanceSheet`; success toasts "Success" + optional "File Upload Success", advances to step 6. Submitting the form on any other step just redirects to step 5 with toast "Please Review".

Step 6 - Success:
36. Success panel: CheckCircle2 in a circular primary/10 badge, heading "Attendance Marked Successfully!", summary sentence, "Submission Details" box (created count, optional file-uploaded line, "Completed at: {formatDate}").
37. Button **"Start New Attendance Session"** (lg, RotateCcw) -> `resetForm()` (resets all state, toast "New Session Started").

Excel File Preview Dialog (trigger: item 14):
38. Dialog "Excel File Preview" (max-w-2xl): description "Attendance Excel file for {client} - {Month yyyy}", info panel (blue FileText tile, "Pre-finalized Attendance Excel File"), Alert "Note" (Excel cannot be previewed in browser); footer buttons **"Close"** and **"Download Excel File"** (Download icon; blob download, filename `Attendance_{client}_{yyyy-MM}.xlsx|.xls` by content type; toasts "Download Started" / "Download Failed"; disabled if no file).

Document Preview Dialog (trigger: item 2 "View" link):
39. Dialog (max-w-5xl, max-h-[90vh], p-0): title "Attendance Sheet - {client} - {Month yyyy}", header **"Download"** button (blob download with content-type/extension sniffing, filename `attendance-sheet-{client}-{yyyy-MM}{ext}`; toasts "Download Started"/"Download Failed"); body 70vh preview with 4 states: loading (spinner "Loading preview..."), pdf (`<iframe>`; onError falls back to image), image (`<img crossOrigin="anonymous">` on `bg-gray-50`; onError falls back to pdf), unsupported (fallback iframe, inline style `minHeight: 500px`); footer **"Close"** button.

Toasts (triggers -> messages): loaded clients ("Success / Loaded {n} clients"), no clients ("Error / No clients found. Please add clients first."), fetch errors (getErrorMessage), no active employees warning, loaded employees ("Loaded {n} active employee(s) ({m} with existing attendance) for {Month}"), select-month-first, select all / deselect all, per-step validation errors, step progress, already-submitted guards ("Already Submitted", "Cannot Go Back", "Already Processing", "Please Review"), submit success + file upload success, bulk-mark failure (8s), upload error, reset ("New Session Started"), template downloaded / template errors, Excel validation failed, "Excel File Processed & Uploaded", "Excel Processed but Upload Failed", "Excel File Uploaded", "Upload Failed", download started/failed (both dialogs), "Unsupported File Type".

Keyboard shortcuts: none.

### Data displayed
- Clients: `clientService.getClients()` (id, name).
- Active employees: `attendanceService.getActiveEmployeesForMonth(clientId, "yyyy-MM")` - id, firstName, lastName, employmentHistories (designation.name, department.name, joiningDate; component tolerates string/alt shapes via `getEmployeeDisplayInfo`, falls back to "N/A").
- Existing attendance: `attendanceService.getAttendanceByClientAndMonth({clientId, month})` - employeeID (note uppercase D)/employeeId, employeeName, presentCount, designationName, departmentName. Pre-fills and auto-selects rows.
- Existing sheet: `attendanceSheetService.get(clientId, month)` -> attendanceSheetUrl.
- Existing Excel: `attendanceService.getAttendanceExcelFiles({clientId, month})` -> attendanceExcelUrl.
- Writes: `attendanceService.bulkMarkAttendance`, `attendanceService.uploadAttendanceSheet`, `attendanceService.uploadAttendanceExcel`.

### States
- Loading: clients spinner row, `InlineLoader` for employees, Loader2 in buttons, "Checking attachment...", "Checking for existing Excel file...", "Validating Excel file...", preview "loading" state, `loadingExistingAttendance` flag (fetched silently).
- Empty: no clients (error toast + errors alert), no active employees (info alert + warning toast), no selection (destructive alert).
- Error: `errors[]` alert, Excel validation errors alert, per-step validation toasts, atomic submit failure keeps user on review step.
- Submitted lock: all inputs/nav disabled once `isSubmitted`.

### Current styling
- Layout: `container mx-auto px-4 py-6 max-w-7xl space-y-6`; card-per-step; sticky bottom nav (`sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4`) plus `h-20` bottom spacer.
- Hardcoded colors bypassing tokens: green success set (`border-green-200 bg-green-50`, `text-green-600/700/800`); blue info set (`border-blue-200 bg-blue-50`, `text-blue-600/700/800/900`, `bg-blue-50/30`, `bg-blue-50/50`, `bg-blue-100`, `border-blue-300`, `border-l-blue-500`); amber warning set (`border-amber-200 bg-amber-50`, `text-amber-600/700/800`); `text-blue-600` view/upload links; preview surfaces `bg-white`, `bg-gray-50`; inline style `{ minHeight: "500px" }` on fallback iframes.
- Custom classes: `scrollbar-sleek` (existing-attendance table wrapper), `cn()` conditional row highlights, `line-clamp-2` on step descriptions.
- Icons (lucide): CheckCircle2, Upload, Users, Calendar, Building2, FileText, AlertTriangle, Loader2, ArrowRight, ArrowLeft, Check, Info, UserCheck, Clock, RotateCcw, Download, ChevronDown, ChevronUp (imported), History.

### Navigation
- Anchor to `/attendance/upload` ("Upload now"), button to `/attendance/records` ("View Records"). Otherwise stays in wizard. Both `/attendance` and `/attendance/mark-by-site` land here.

---

## 2. Attendance Records (`/attendance/records`)

File: `app/(dashboard)/attendance/records/page.tsx` (self-contained, 1074 lines).

### Interactive inventory

Header: h1 "Attendance Records" + subtitle "View and manage all uploaded attendance sheets".

Search & Filters card (Filter icon title, description "Filter attendance sheets by client and month"):
1. Select `clientId` (label "Client" with Building2 icon; value "all" = All Clients; options: "All Clients" + clients from `useClient().fetchClients`; disabled while clients load).
2. MonthPicker `month` (label "Month (Single)", CalendarIcon; placeholder "Select month"; picking it clears startMonth/endMonth).
3. MonthPicker `startMonth` (label "Start Month", placeholder "From month"; picking clears single month).
4. MonthPicker `endMonth` (label "End Month", placeholder "To month"; picking clears single month).
   - Zod refine: cannot combine single month with a range; start must be <= end ("Either select a single month OR a date range, and start month must be before end month").
   - Filters ALSO auto-apply via useEffect on any watched form value change.
5. Button **"Search"** (submit; Search icon, Loader2 while loading) - resets both tabs to page 1 and refetches.
6. Button **"Clear Filters"** (outline, X icon; only rendered when any filter active) - resets form + pages and refetches.

Results card with Tabs (`activeTab`: "sheets" | "excel"):
7. Tab **"Attendance Sheets"** (FileText icon).
8. Tab **"Excel Files"** (FileSpreadsheet icon).

Sheets tab:
9. Result count CardDescription: "Loading records..." / "Showing {x} of {y} record(s)" / "No records found".
10. Select "Items per page" (w-[80px]; options 10 / 20 / 50 / 100; default 20; change resets to page 1).
11. Table (min-w-[1000px], `rounded-md border overflow-x-auto scrollbar-sleek`) columns:
    - **Client** - sortable (ghost button + ArrowUpDown; sortBy "clientId").
    - **Month** - sortable (sortBy "month"; default sort month desc); cell renders outline Badge "MMM yyyy".
    - **File Type** - Badge: destructive "PDF" or secondary "Image" (detected from URL).
    - **Upload Date** - sortable (sortBy "createdAt"); cell `formatDate(createdAt)`.
    - **Actions** (right-aligned): **View** (ghost sm, Eye) -> preview dialog with HEAD-request type detection + cache-buster `_t={Date.now()}`; **Download** (ghost sm, Download) -> blob download, extension from content type, filename `attendance-sheet-{clientName}-{month}{ext}`, toasts "Download Started"/"Download Failed"; **Delete** (ghost sm, Trash2, `text-destructive hover:text-destructive`) -> native `confirm("Are you sure you want to delete the attendance sheet for {client} - {Month yyyy}?")` then `attendanceSheetService.delete(id)`, toast "Deleted"/"Delete failed", refetch.
    - Sort behavior: clicking same column toggles asc/desc; new column sets desc and resets to page 1.
12. Pagination component (centered; only when totalPages > 1) - `currentPage`, `totalPages`, `onPageChange`.
13. Empty state: FileText icon (h-12 w-12, muted, opacity-50), "No Attendance Sheets Found", context-aware hint (adjust filters vs upload), plus **"Clear Filters"** outline button when filters active.
14. Loading state: 5 Skeleton rows (h-16).

Excel tab (parallel, independent pagination/sort state):
15. Same result-count description and "Items per page" Select (10/20/50/100).
16. Table (min-w-[1000px]) columns: **Client** (sortable; note: first click sets asc, unlike sheets tab), **Month** (sortable; outline Badge "MMM yyyy"), **File Type** (secondary Badge with FileSpreadsheet icon, always "Excel"), **Upload Date** (sortable; formatDate), **Actions**: **Download** (blob download `attendance-excel-{clientName}-{month}.xlsx`; toasts) and **Delete** (native `confirm(...Excel file...)` then `attendanceService.deleteAttendanceExcel(id)`; toasts; refetch). No View action on Excel rows.
17. Pagination (when excelTotalPages > 1).
18. Empty state: FileSpreadsheet icon, "No Excel Files Found", hint, optional "Clear Filters" button.
19. Loading state: 5 Skeletons.

Document Preview Dialog:
20. Dialog (max-w-5xl max-h-[90vh] p-0): title "Attendance Sheet - {clientName} - {Month yyyy}" + header **"Download"** button; description "Attendance sheet document preview"; body states: loading spinner, pdf iframe (h-[70vh], keyed on URL), image (`bg-gray-50` wrapper, crossOrigin anonymous, onError fallback logic pdf/unsupported, console logs with emoji markers), unsupported ("File Preview Not Available" + FileText h-16 + **"Download File"** button); footer **"Close"** (outline).

Toasts: fetch errors ("Error" + getErrorMessage, both tabs), "Deleted"/"Delete failed" (both tabs), "Download Started"/"Download Failed" (both types).

Keyboard shortcuts: none. Native `confirm()` used for both deletes (a feature to preserve or replace with a proper dialog).

### Data displayed
- Sheets: `attendanceSheetService.list(params)` with `{page, limit, sortBy, sortOrder, clientId?, month?, startMonth?, endMonth?}`; handles list response (`meta.total`) AND single-record fallback. Fields: id, clientName, month (yyyy-MM), attendanceSheetUrl, createdAt.
- Excel files: `attendanceService.getAttendanceExcelFiles(params)` (same param shape); fields: id, clientName, month, attendanceExcelUrl, createdAt.
- Clients for filter: `useClient()` -> `clientService.getClients({limit: 1000})`.

### States
- Loading: skeleton rows per tab, Loader2 in Search button.
- Empty: dedicated empty states per tab with contextual hint + clear-filters shortcut.
- Error: destructive toast, table cleared (records=[], count 0).

### Current styling
- Layout: `container mx-auto px-4 py-6 max-w-7xl space-y-6`; filter card + tabbed results card.
- Hardcoded/bypass: preview `bg-white` / `bg-gray-50`; destructive PDF badge; console.log/error with emoji ("❌", "✅"). Everything else uses theme tokens.
- Custom classes: `scrollbar-sleek` on both table wrappers; `min-w-[1000px]` tables.
- Icons: Building2, Calendar (as CalendarIcon), Eye, Loader2, Trash2, Download, FileText, FileSpreadsheet, Search, ArrowUpDown, X, Filter.

### Navigation
- No outbound links; deletes/downloads/preview only. Reached from mark-by-site "View Records".

---

## 3. Attendance Reports (`/attendance/reports`)

File: `components/attendance/attendance-reports.tsx`.

### Interactive inventory

Header: h1 "Attendance Reports" + subtitle "Generate and download comprehensive attendance reports".

Generate Report card (BarChart3 icon):
1. Select `clientId` (label "Client *", h-12 trigger, placeholder "Select a client"; options from `useClient` clients, each with Building2 icon `text-gray-500`; disabled while loading; Zod min(1)). On change: resets month + report, then loads available months via `attendanceService.getAttendanceByClientId(clientId)` (unique months, sorted newest first).
2. Inline "Loading clients..." spinner row under the field.
3. Select `month` (label "Month *", h-12; placeholder varies: "Select client first" / "Loading months..." / "Select month"; options = available months rendered as "MMMM yyyy" with Calendar icon; disabled until client chosen or while loading; Zod min(1)).
4. Inline "Loading available months..." spinner; hint "No attendance data found for this client" when list empty.
5. Button **"Generate Report"** (submit, lg, min-w-48, BarChart3; "Generating..." + Loader2 while loading; disabled without client+month). Calls `attendanceService.getAttendanceReport(clientId, month)`, then fetches Excel attachment via `attendanceService.getAttendanceExcelFiles({clientId, month})`. Toast "Report Generated / Found {n} attendance records for {client} - {Month yyyy}."

Report results (only when generated):
6. Green header card "Report Generated Successfully" with client name + month, optional client address line, CheckCircle2 (w-8 h-8 green).
7. Sheet row: if attached -> Badge (outline, `bg-white`) "Sheet attached" (FileText icon) + Button **"View Sheet"** (outline sm, Eye) + Button **"Download Sheet"** (outline sm, Download; blob download with cache-buster, filename `attendance-sheet-{client}-{MMMM-yyyy}{ext}`); else text "No attendance sheet attached for this month."
8. Excel row: "Checking for Excel file..." spinner while loading; if attached -> Badge "Excel attached" (FileSpreadsheet) + Button **"Download Excel"** (filename `attendance-excel-{client}-{MMMM-yyyy}.xlsx`); else "No Excel file attached for this month."
9. Statistics cards (3, centered, max-w-3xl): **Total Employees** (`text-blue-600` value, Users icon `text-blue-500`), **Minimum Present** (`text-orange-600`, Minus icon `text-orange-500`), **Maximum Present** (`text-indigo-600`, Maximize2 icon `text-indigo-500`). From `reportData.totals`.
10. Export Report card: Button **"Preview & Download PDF"** (outline lg, FileText) -> opens PdfPreviewDialog; Button **"Download CSV"** (outline lg, FileSpreadsheet) -> client-generated CSV with headers `Employee ID, Employee Name, Department, Designation, Present Days`, filename `attendance-report-{client}-{MMMM-yyyy}.csv`; toasts "CSV Downloaded" or "No Data".
11. Attendance Records table card (when records exist; min-w-[800px], `scrollbar-sleek`): columns **Employee ID** (outline Badge), **Employee Name** (font-medium), **Department**, **Designation**, **Present Days** (right-aligned secondary Badge, font-semibold). No sorting, no pagination.
12. Alert (AlertCircle) "No attendance records found for the selected client and month." when records array empty.

PDF Preview Dialog (`components/pdf/pdf-preview-dialog.tsx`, dynamically imported, ssr:false):
13. Dialog (max-w-5xl w-[90vw] max-h-[85vh]): title "{client} - Attendance Report", description "{Month yyyy}"; auto-generates PDF on open via `@react-pdf/renderer` rendering `components/pdf/attendance-report-pdf` (records mapped with employeeID, employeeName, clientName, designationName, departmentName, presentCount, attendanceSheetUrl). Buttons: **"Regenerate"** (outline, FileText; "Generating..." while busy), **"Print"** (outline, Printer; opens blob URL in new tab; disabled until generated), **"Download PDF"** (Download; filename `attendance-report-{client}-{yyyy-MM}.pdf`). Preview area: iframe of blob URL or placeholder text "Generating preview..." / "Click Regenerate to create a preview" (inline style `minHeight: "500px"`, `bg-white`).

Attendance Sheet Preview Dialog:
14. Same 4-state preview dialog pattern as records page (loading / pdf iframe / image with pdf fallback / fallback iframe), title "Attendance Sheet - {client} - {Month yyyy}", header **Download** button, footer **Close**.

Toasts: months fetch failure ("Failed to fetch available months for this client."), report generated, report error (getErrorMessage), CSV downloaded / No Data, sheet & Excel download started/failed.

Keyboard shortcuts: none.

### Data displayed
- Clients: `useClient()` -> `clientService.getClients({limit: 1000})`.
- Available months: `attendanceService.getAttendanceByClientId(clientId)` (record.month values).
- Report: `attendanceService.getAttendanceReport(clientId, month)` -> `data.client{name,address}`, `data.month`, `data.totals{totalEmployees,minPresent,maxPresent}`, `data.records[{employeeID,employeeName,departmentName,designationName,presentCount}]`, `data.attendanceSheet{attendanceSheetUrl}`.
- Excel attachment: `attendanceService.getAttendanceExcelFiles({clientId, month})` -> {id, attendanceExcelUrl}.

### States
- Loading: clients spinner, months spinner, Generate button spinner, Excel-check spinner, PDF "Generating...".
- Empty: "No attendance data found for this client" (months), no-records Alert, no sheet / no Excel text rows.
- Error: destructive toasts; report cleared on failure.

### Current styling
- Layout: `container mx-auto px-4 py-6 max-w-7xl space-y-6`.
- Hardcoded/bypass: success card `border-green-200 bg-green-50`, `text-green-800/700/600`; stat values `text-blue-600`, `text-orange-600`, `text-indigo-600` with matching `-500` icons; `text-gray-500` / `text-gray-600` labels; badges `bg-white`; preview `bg-gray-50` / `bg-white`; inline `minHeight: 500px`.
- Custom classes: `scrollbar-sleek`, `min-w-[800px]`.
- Icons: Building2, Download, FileText, Users, Loader2, BarChart3, TrendingUp (imported, unused), Clock (imported, unused), CheckCircle2, AlertCircle, Calendar, Eye, Minus, Maximize2, FileSpreadsheet; dialog adds Printer.

### Navigation
- No route links; dialogs and downloads only.

---

## 4. Upload Attendance Files (`/attendance/upload`)

File: `components/attendance/upload-attendance.tsx`.

### Interactive inventory

Header: h1 "Upload Attendance Files" + subtitle "Upload attendance sheets (PDF/images) and Excel files (XLSX/XLS) for a client and month".

Select Client & Month card (Calendar icon):
1. Select `clientId` (label "Client *" with Building2 icon, h-11 trigger, placeholder "Select a client"; options with Users icon + name; Zod min(1)).
2. MonthPicker `month` (label "Month *" with Calendar icon, h-11, placeholder "Select month"; Zod required date). Changing either triggers `loadExistingSheet` + `loadExistingExcel`.

Attendance Sheet section (only when client + month selected; FileText title "Attendance Sheet (PDF/Images)"):
3. Badge (secondary) **"Sheet Available"** in header when a sheet exists.
4. Existing-sheet row (bg-muted/50): FileText icon (red-500 if PDF, blue-500 otherwise), "Attendance Sheet", "{client} • {Month yyyy}", with buttons **"View"** (outline sm, Eye) -> preview dialog (HEAD type detection, cache-buster) and **"Delete"** (outline sm, Trash2; Loader2 while busy) -> `attendanceSheetService.delete(id)`, toast "Deleted"/"Delete failed", reload.
5. Empty state: FileText h-12 opacity-50 + "No attendance sheet found for this month".
6. Sheet dropzone: dashed border box, drag states (`border-primary bg-primary/5 scale-[1.02]` on drag), invisible full-area file Input (`accept=".pdf,.jpg,.jpeg,.png"`); validation on pick: type in {pdf,jpg,jpeg,png} (toast "Invalid File Type"), size <= 10MB (toast "File Too Large"). Idle content: UploadCloud in muted circle, "Drag & drop your file" / "Drop your file here", "or click to browse", badges **PDF / JPG / PNG / Max 10MB**.
7. Selected-sheet panel: file icon by extension (`getFileIcon`: pdf -> FileText red-500, images -> ImageIcon blue-500, xlsx/xls -> FileSpreadsheet green-500, default muted), filename, Badge (secondary) formatted size (B/KB/MB), Badge (outline) MIME type; **X** clear button (ghost, resets input); Button **"Upload Sheet"** / **"Replace Sheet"** (Upload icon; "Uploading..." + Loader2) -> `attendanceSheetService.upload(clientId, yyyy-MM, file)`, clears input, reloads, toast "Upload Successful / Attendance sheet uploaded for {client} - {Month yyyy}." or "Upload Failed".
8. File Requirements Alert (AlertCircle): formats PDF/JPG/JPEG/PNG, max 10MB.

Attendance Excel section (only when client + month selected; FileSpreadsheet title "Attendance Excel File (XLSX/XLS)"):
9. Badge (secondary) **"Excel Available"** in header when Excel exists.
10. Existing-Excel row: FileSpreadsheet green-500 icon, "Attendance Excel File", "{client} • {Month yyyy}", buttons **"Download"** (blob download `attendance-excel-{client}-{yyyy-MM}.xlsx`; toasts) and **"Delete"** (`attendanceService.deleteAttendanceExcel(id)`; toasts; reload).
11. Empty state: "No Excel file found for this month".
12. Excel dropzone: same pattern, `accept=".xlsx,.xls"`, type check XLSX/XLS (toast "Invalid File Type"), 10MB limit; idle badges **XLSX / XLS / Max 10MB**.
13. Selected-Excel panel: icon/name/size/type badges, **X** clear, Button **"Upload Excel"** / **"Replace Excel"** -> TWO calls: `attendanceService.uploadAttendanceExcel` (stores file) then `attendanceService.importAttendanceExcel` (parses + saves present days, returns `ImportAttendanceExcelResult`); clears input, reloads; toast "Attendance saved" or "Attendance saved with some skipped rows / Saved {imported} of {totalRows} rows... {skipped} skipped, see details below." or "Upload Failed".
14. File Requirements Alert: XLSX/XLS, 10MB, "Needs an employee ID column and a present days column".
15. Import summary panel (after import): CheckCircle2 green-600 + "Import summary"; badges **"Total rows: {n}"** (secondary), **"Saved: {n}"** (`bg-green-600 hover:bg-green-600`), **"Skipped: {n}"** (destructive, only when > 0); "Skipped rows" scrollable list (max-h-48, divided rows): "Row {n}" (w-16), employeeId in mono (w-28) or "-", reason text.

Document Preview Dialog:
16. Same 4-state preview dialog (loading / pdf iframe with image fallback / image with pdf fallback / fallback iframe, inline `minHeight: 500px`), title "Attendance Sheet - {client} - {Month yyyy}", header **Download** (content-type extension sniffing, filename `attendance-sheet-{client}-{yyyy-MM}{ext}`; toasts), footer **Close**.

Toasts: invalid file type (x2), file too large (x2), no file selected (x2), upload successful/failed (sheet), attendance saved / saved-with-skips / upload failed (Excel), deleted / delete failed (x2), download started/failed (Excel row + preview dialog).

Keyboard shortcuts: none. Note: file inputs are located via `document.querySelector('input[type="file"][accept=...]')` for resets - selector-coupled behavior to preserve.

### Data displayed
- Clients: `useClient()` -> `clientService.getClients({limit: 1000})`.
- Existing sheet: `attendanceSheetService.get(clientId, yyyy-MM)` -> {id, attendanceSheetUrl}.
- Existing Excel: `attendanceService.getAttendanceExcelFiles({clientId, month})` -> {id, attendanceExcelUrl}.
- Writes: `attendanceSheetService.upload`, `attendanceSheetService.delete`, `attendanceService.uploadAttendanceExcel`, `attendanceService.importAttendanceExcel`, `attendanceService.deleteAttendanceExcel`.

### States
- Loading: clients disabled select, centered Loader2 while checking sheet/Excel, button spinners while uploading/deleting.
- Empty: per-section "No ... found for this month" placeholders; sections hidden entirely until client + month chosen.
- Error: destructive toasts only (no inline error panels except import skipped-rows list).

### Current styling
- Layout: `container mx-auto px-4 py-6 max-w-6xl space-y-6` (note: max-w-6xl, narrower than sibling pages).
- Hardcoded/bypass: file-type icon colors `text-red-500`, `text-blue-500`, `text-green-500`; `text-green-600` summary icon; Saved badge `bg-green-600 hover:bg-green-600`; preview `bg-gray-50` / `bg-white`; inline `minHeight: 500px`; dropzone `scale-[1.02]` drag effect.
- Custom classes: dashed dropzones with `border-primary bg-primary/5`; `font-mono` employee ids in skipped rows.
- Icons: Upload, FileText, Building2, Calendar, CheckCircle2, AlertCircle, RotateCcw (imported, unused), Loader2, UploadCloud, Users, Eye, Trash2, Download, X, FileSpreadsheet, ImageIcon (Image as ImageIcon).

### Navigation
- No route links. Reached via mark-by-site "Upload now" anchor and the sidebar.

---

## Cross-cutting notes for the redesigner

1. `/attendance` and `/attendance/mark-by-site` must both keep rendering the wizard (duplicate routes).
2. The preview-dialog pattern (HEAD-request content-type sniffing, pdf<->image mutual fallback, cache-buster `_t=`, crossOrigin images, blob downloads with extension sniffing) is duplicated in 4 places; behavior must be preserved wherever it is consolidated.
3. Deletes on `/attendance/records` use native `confirm()`, not a styled dialog.
4. Excel template contract (exact headers "Employee ID", "Employee Name", "Present Days Count", case-insensitive on parse) is a hard business rule shared between mark-by-site step 2 and the upload page.
5. Filters on `/attendance/records` auto-apply on change AND via the Search button; both paths reset pagination.
6. Sheets-tab sort defaults desc on new column; Excel-tab sort defaults asc on new column (inconsistent but current behavior).
7. Toast copy is extensive and user-facing; treat messages above as the contract.
8. `formatDate` from `lib/labels` is used for all upload/submission timestamps.
