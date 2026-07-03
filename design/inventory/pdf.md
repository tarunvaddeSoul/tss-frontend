# PDF Inventory — components/pdf/ + components/payroll/pdf/ + invocation sites

Scope: all 5 files in `/components/pdf/`, all 4 files in `/components/payroll/pdf/`, the related `/components/employees/employee-view-pdf.tsx` (consumes the brand kit), every import/trigger site, and font registration.

All PDFs are rendered client-side with `@react-pdf/renderer`. There are NO app routes for PDFs; every PDF is generated on demand from a dialog or button inside a dashboard page.

---

## 0. Shared foundation

### 0.1 Font registration
- File: `/Users/tarunvadde/Development/tss-frontend/components/pdf/brand.tsx` (lines 5-15)
- `Font.register` (wrapped in try/catch, silent fallback on failure):
  - family `"Roboto"`
  - `/fonts/Roboto-Regular.ttf` (fontWeight normal)
  - `/fonts/Roboto-Bold.ttf` (fontWeight bold)
- Font files on disk: `/Users/tarunvadde/Development/tss-frontend/public/fonts/Roboto-Regular.ttf`, `/Users/tarunvadde/Development/tss-frontend/public/fonts/Roboto-Bold.ttf`
- This is the ONLY `Font.register` call in the codebase. Every PDF page inherits `fontFamily: "Roboto"` via `brandStyles.page`.
- Logo asset: `/Users/tarunvadde/Development/tss-frontend/public/tss-logo.png` (referenced as `/tss-logo.png`).

### 0.2 Brand kit — `/components/pdf/brand.tsx`
Exports used by every PDF:
- `BRAND` constant:
  - name: `"Tulsyan Security Services Pvt. Ltd."`
  - tagline: `"Professional Security Services"`
  - colors (all hardcoded hex): primary `#D12702`, text `#1f2937`, muted `#6b7280`, border `#e5e7eb`, softBg `#fafafa`, tableHeaderBg `#f9fafb`
- `brandStyles` (StyleSheet): page (padding 30, paddingBottom 52, bg `#ffffff`, fontFamily Roboto), header (2pt bottom border in primary red, brand row + title + subtitle left, tag right), logo 28x28, brandName 18pt bold primary, headerTitle 16pt bold, headerSubtitle 10pt muted, tag (white text 9pt on primary bg, radius 3), section (softBg card, 1pt border, radius 4), sectionTitle (12pt bold primary with bottom border), row/label/value (label 55% width 10pt bold `#4b5563`, value 45% 10pt right-aligned), table/tableRow/tableHeader/tableHeaderCell (10pt bold)/tableCell (9pt muted), footer (absolute bottom 26, centered 9pt muted, 1pt top border)
- `PdfHeader({ title, subtitle, tag, logoSrc = "/tss-logo.png" })`: logo image + brand name (red) on top row, document title below, subtitle (defaults to tagline), optional right-aligned red tag pill.
- `PdfFooter({ rightNote })`: fixed footer on every page: `Generated on <locale date> | <rightNote or BRAND.name> • Page N of M` (uses react-pdf `render` with pageNumber/totalPages, `fixed`).
- `BrandPage({ size = "A4", orientation = "portrait" })`: Page wrapper with brandStyles.page.
- `Section({ title })`: gray card section with red title.
- `Row({ label, value })`: label/value row.
- Helpers: `formatCurrencyINR(amount, withSymbol)` (`₹` + en-IN, 2 decimals), `formatDate(date)` (en-IN locale). Note: `formatCurrencyINR` is exported but not consumed by any current PDF (they inline their own ₹ formatting).

### 0.3 Shared preview dialog — `/components/pdf/pdf-preview-dialog.tsx` (`PdfPreviewDialog`)
Client component wrapping every "preview and download" flow (except the single `PDFDownloadLink` button in client-payroll, see 6; the employee-payroll button in 7 uses this dialog).
- Props: `open`, `onOpenChange`, `title`, `description?`, `fileName`, `renderDocument` (sync or async, returns react-pdf `<Document/>`), `autoGenerate` (default true).
- INTERACTIVE INVENTORY:
  1. Dialog (shadcn `Dialog`), `max-w-5xl w-[90vw] max-h-[85vh] p-0`; header shows `title` + optional `description`.
  2. Button "Regenerate" (variant outline, `FileText` icon) — regenerates blob via dynamic `import("@react-pdf/renderer")` then `pdf(doc).toBlob()`; label becomes "Generating..." while busy; disabled while generating.
  3. `<iframe>` PDF preview (blob object URL) inside `border rounded-md bg-white`, minHeight 500px inline style.
  4. Button "Print" (variant outline, `Printer` icon) — `window.open(pdfUrl, "_blank")`; disabled until a PDF exists.
  5. Button "Download PDF" (default variant, `Download` icon) — creates `<a download>` with `fileName` (appends `.pdf` if missing); disabled while generating.
- STATES: auto-generates on open; empty state text "Click Regenerate to create a preview"; loading state "Generating preview..."; error only `console.error` (no user-facing error UI — missing). Object URL revoked on unmount.
- STYLING: shadcn Dialog/Button; hardcoded `bg-white` on preview frame and `style={{ minHeight: "500px" }}` inline. Icons: `Download`, `FileText`, `Printer` (lucide).
- NAVIGATION: none (modal only; Print opens blob in new tab).

---

## 1. Salary Slip PDF — `/components/pdf/salary-slip-pdf.tsx`

- Document type: single-employee monthly salary slip. Exports `SalarySlipPDFPage` (page only, embedded by 4 other documents) and default `SalarySlipPDF` (Document wrapper). Also exports `SalarySlipData` interface (client, month, pay_period, employee {name, employee_id, category, department, location, working_days, account_no, esic_no, uan_no}, earnings {basic, allowance, other_allowance, other, gross_earning}, deductions {epf_contribution_12_percent, esic_0_75_percent, advance, gross_deduction}, net_pay).
- Page size: A4 portrait (BrandPage default).
- Document metadata (standalone): title `Salary Slip - <name> - <month>`, author BRAND.name, subject "Salary Slip", keywords "Tulsyan Security Services, Salary, Payslip".
- Header: `PdfHeader` title "Salary Slip", subtitle `<month> | Pay Period: <pay_period>`, logo `/tss-logo.png`.
- Sections rendered in order:
  1. Employee Details card (softBg, label 40% 9pt bold muted / value 60% 9pt): Employee Name, Employee ID, Category, Working Days always; Account No, ESIC No, UAN No only when non-empty. (NOTE: `department` and `location` exist in SalarySlipData but are NOT rendered on the slip.)
  2. Salary table: two columns, header row "EARNINGS" | "DEDUCTIONS" (11pt bold centered, tableHeaderBg). Earnings line items: Basic, Allowance always; Other Allowance and Other only when > 0. Deduction line items: EPF Contribution (12%), ESIC (0.75%) always; Advance only when > 0. Each line: label left 9pt muted, `₹` en-IN value right 10pt.
  3. Totals row (tableHeaderBg): Gross Earning (bold) | Gross Deduction (bold).
  4. Net Pay section (softBg card, space-between): label "Net Pay (Take Home)" 10pt bold, value 13pt bold in primary red `₹<en-IN, 2dp>`.
- Footer: `PdfFooter rightNote="This is a computer-generated salary slip"`.
- Fonts/colors: Roboto; all colors from BRAND constants (hex).
- STATES: all values null-guarded with `|| 0` / "N/A"; no explicit empty state.
- Trigger locations (standalone `SalarySlipPDF`):
  - `/components/clients/salary-slip-preview.tsx` (see section 9).
  - Embedded `SalarySlipPDFPage` used by: client-view-pdf (sample page), client-payroll-pdf, employee-payroll-pdf, payroll-report-pdf (single-record mode), single-payslip-pdf.

## 2. Attendance Report PDF — `/components/pdf/attendance-report-pdf.tsx`

- Document type: per-client monthly attendance report (default export `AttendanceReportPDF`; props `title`, `month?`, `records: AttendanceRecord[]`).
- Page size: A4 portrait.
- Document metadata: title `<title> - Attendance Report`, author BRAND.name, subject "Attendance Report", keywords "Tulsyan Security Services, Attendance, Report".
- Header: `PdfHeader` title = `<ClientName> Attendance`, subtitle `Attendance Report • <month>` (or just "Attendance Report" without month). No tag, no explicit logoSrc (default logo used).
- Sections:
  1. Summary: single row "Total Employees:" = records.length.
  2. Details table (header row `fixed`, repeats across pages; data rows `wrap={false}`). Columns with widths: Employee ID (12%), Employee Name (22%), Client (22%), Designation (16%), Department (16%), Present Days (12%, right-aligned). Missing values render "-".
  3. Empty state row: "No attendance records for this period." (full-width centered muted) when records empty.
- Footer: `PdfFooter rightNote="This is a computer-generated report"`.
- DATA: `AttendanceRecord` = {employeeID, employeeName, clientName, designationName, departmentName, presentCount, attendanceSheetUrl}. NOTE: `attendanceSheetUrl` is passed in by the caller but never rendered in the PDF.
- Trigger: `/components/attendance/attendance-reports.tsx` (page route `/attendance/reports` via `/app/(dashboard)/attendance/reports/page.tsx`):
  - Button "Preview & Download PDF" (outline, size lg, line ~668) calls `openPDFPreview()` → opens `DynamicPdfPreviewDialog` (dynamic ssr:false import of PdfPreviewDialog) with title `<client> - Attendance Report`, description = month display, fileName `attendance-report-<clientName>-<month>`; `renderDocument` dynamically imports the PDF component and maps `reportData.records`.
  - Sibling export in same card: "Download CSV" button (separate feature, not a PDF).
  - Data source: `attendanceService.getAttendanceReport(clientId, month)` (plus `attendanceService.getAttendanceByClientId`, `attendanceService.getAttendanceExcelFiles` for the surrounding screen) in `/services/attendanceService`.

## 3. Client View PDF — `/components/pdf/client-view-pdf.tsx`

- Document type: client profile + sample salary slip (default export `ClientViewPDF`; prop `client: Client`).
- Page size: A4 portrait, 1-2 pages.
- Document metadata: title `<client.name> - Client Profile`, subject "Client Profile", keywords "...Client, Profile".
- Page 1:
  - Header: `PdfHeader` title = client.name, subtitle "Client Profile", tag = `label.status(client.status)` (red pill), logoSrc `/tss-logo.png`.
  - Section "Basic Information": Client Name, Address (left-aligned value), Status, Onboarding Date (`formatDate` from `/lib/labels`), Client ID (left-aligned).
  - Section "Contact Information": Contact Person, Contact Number ("-" fallbacks).
  - Footer: "This is a computer-generated document".
- Page 2 (conditional — only when the client's first salary template has enabled fields): sample `SalarySlipPDFPage` built from template defaults:
  - basic from CALCULATION field keyed `basic`/`basicSalary`/`basicPay` (fallback 15000), allowance = sum of ALLOWANCE fields, EPF from `pf`/`epfContribution12Percent`, ESIC from `esic`/`esic075Percent`, Advance from `advance`; gross/net computed. Employee stub: name "SAMPLE (template preview only)", id "SAMPLE", category "Sample", working_days 27; month/pay period = current month.
- Unused local styles: `styles.badge` (green `#22c55e` white pill, width 60) and `styles.inactiveBadge` (`#6b7280`) are defined but not referenced — dead style code. Local `currentDate` also unused.
- Trigger: `/components/clients/client-view-dialog.tsx` (used on `/clients` page via `/app/(dashboard)/clients/page.tsx`):
  - Dialog footer button "View/Download PDF" (default variant, `FileText` icon) opens `PdfPreviewDialog` with title `<name> - Client Profile`, description "Client details and salary slip template preview", fileName `client_<name_lowercase_underscored>.pdf`; `renderDocument` dynamically imports ClientViewPDF.
  - Sibling in same dialog: "Close" button; also an "Export Excel" of active employees (xlsx, separate feature). Data: `clientService.getClientEmployees(clientId)`; the client object itself comes from the clients page list.

## 4. Employee View PDF — `/components/employees/employee-view-pdf.tsx`

(Lives outside `/components/pdf/` but is a full brand-kit PDF; four separate trigger sites.)
- Document type: full employee profile (default export `EmployeeViewPDF`; prop `employee: Employee`).
- Page size: A4 portrait, multi-page as needed.
- Metadata: title `Employee Profile - <first> <last>`, subject "Employee Profile".
- Header: `PdfHeader` title "Employee Profile", subtitle `<first> <last>`.
- Header card (softBg): full name with `label.title()` prefix, "Employee ID: <id>", generated date (en-IN long format); right side 80x80 photo (`documentUploads.photo` or `employee.photo` via `Image`) or initials fallback (24pt bold primary on softBg).
- Sections (each conditional on data presence via `hasValue`, values fall back "N/A" via `getValue`):
  1. "Personal Information": Date of Birth, Age, Gender (`label.gender`), Blood Group; conditional Father's Name, Mother's Name, Husband's Name, Category (`label.category`).
  2. "Contact Details" (renders only if any field present): Mobile Number, Aadhaar Number, Permanent Address, Present Address, City, District, State, Pincode (each checks `contactDetails.*` with flat-field fallback).
  3. "Current Employment Information" (only when an ACTIVE employmentHistory exists): Client Name, Designation, Department, Joining Date, Status (colored pill: ACTIVE = `#10b981` green bg white text, else `#ef4444` red), Recruited By (conditional).
  4. "Salary Information" (only when salaryCategory set): Salary Category (`label.salaryCategory`), Salary Sub-Category (conditional), Monthly Salary (SPECIALIZED) OR Per Day Rate, PF Enabled Yes/No, ESIC Enabled Yes/No.
  5. "Bank Details" (conditional): Bank Name, Account Number, IFSC Code, Bank City, PF UAN Number, ESIC Number.
  6. "Educational Qualifications" (conditional): Highest Education Qualification (`label.education`).
  7. "Employment History" (conditional): table with fixed header — columns Client (flex 2), Designation (1.6), Department (1.6), Joining Date (1.3), Leaving Date (1.3, "Present" if null), Salary (1.5, right; `₹X/day`, `₹X/month`, or plain by salaryType). Rows `wrap={false}`.
  8. "Reference Details" (conditional): Reference Name, Reference Address, Reference Contact Number.
  9. "Documents & Certificates" (conditional): Police Verification Number/Date, Training Certificate Number/Date, Medical Certificate Number/Date, plus "Document Status" = "Available"/"Not Available" (checks photo/aadhaar/panCard/bankPassbook/markSheet uploads).
  10. "Additional Information" (conditional): Employee Onboarding Date, Employee Relieving Date (first history with leavingDate), Status pill (same green/red).
- Footer: "Confidential - System Generated Document".
- Hardcoded colors beyond BRAND: `#4b5563`, `#111827`, `#10b981`, `#ef4444`, `#ffffff`.
- Trigger locations (all use `PdfPreviewDialog` via `dynamic(..., { ssr: false })`):
  1. `/app/(dashboard)/employees/list/page.tsx` (route `/employees/list`), two flows:
     a. Per-row ghost icon button (Download icon) → fetches `employeeService.getEmployeeById(employee.id)` then opens PdfPreviewDialog (title `Employee Profile - <name>`, fileName `employee-<first>-<last>.pdf`); toast error "Failed to load employee details for PDF" on failure.
     b. Inside the row View modal: Tabs "Details" / "PDF Preview" (PDF tab disabled until generated). Details tab has button "Generate PDF" (label "Generating PDF..." while busy) → builds blob inline (`pdf(<EmployeeViewPDF/>).toBlob()`), switches to PDF tab with 500px iframe + "Download PDF" button (`employee_<id>.pdf`); skeleton loading state; empty state "No PDF generated yet. Go to Details tab and click Generate PDF."
  2. `/components/employees/employee-view-dialog.tsx` (dialog header): button "View & Download PDF" (outline sm, Download icon) → PdfPreviewDialog, fileName `Employee-<id>-<first>-<last>.pdf`.
  3. `/components/employees/employee-view-page.tsx` (route `/employees/view/[id]`): header button "View & Download PDF" (default variant sm, Download icon, "PDF" label on mobile) → PdfPreviewDialog, fileName `Employee-<id>-<first>-<last>.pdf`. Data: `employeeService.getEmployeeById`.
  4. `/components/employees/edit-employee-content.tsx` (route `/employees/edit/[id]`, sidebar quick-actions card): button "View & Download PDF" (outline, full width, Download icon) → PdfPreviewDialog, fileName `employee-<first>-<last>.pdf`; toast error "Employee data not loaded" if employee missing.

## 5. Payroll Report PDF — `/components/payroll/pdf/payroll-report-pdf.tsx`

- Document type: dual-mode payroll report (default export `PayrollReportPDF`; props `data: PayrollReportRecord[]`, `title`, `totalRecords`, `startMonth?`, `endMonth?`, `employeeName?`).
- MODE A — exactly 1 record: renders a single `SalarySlipPDFPage` (A4 portrait) with Document title `Salary Slip - <name> - <month>`; record converted via local `convertToSalarySlipData` (grouped salaryData `calculations`/`deductions`/`allowances`/`information` with flat-field fallbacks; client fallback literal "TULSYAN SECURITY SERVICES PVT. LTD.").
- MODE B — multiple records: A4 LANDSCAPE page (`BrandPage orientation="landscape"`), Document title `<title> - Payroll Report`.
  - Header: `PdfHeader` title `<title> Payroll Report`, subtitle `Period: <start> to <end> | "All Periods" • Total Records: <totalRecords> • Showing: <data.length>`.
  - Section "Summary": Total Gross Salary, Total Net Salary, Total Deductions, Total Basic Pay, Total PF, Total ESIC, Total Bonus (only if > 0) — all `₹` en-IN.
  - Section "Report Data" table (header `fixed`, rows `wrap={false}`), 13 columns with widths: Employee ID 9%, Client 13%, Month 6% (formatted `Jul-25`), Category 8% (`label.salaryCategory` + optional second line `label.salarySubCategory`), Rate 7% right (`₹X /mo` for SPECIALIZED monthlySalary, else `₹X /day` from salaryPerDay or rate/wagesPerDay, else "N/A"), Basic Pay 8% right, Gross 8% right, PF 6% right ("-" when 0), ESIC 6% right ("-" when 0), LWF 5% right ("-" when 0), Bonus 6% right ("-" when 0), Net 8% right, Deductions 10% right.
- Footer: "This is a computer-generated report".
- Trigger: `/components/payroll/payroll-reports.tsx` (route `/payroll/reports` via `/app/(dashboard)/payroll/reports/page.tsx`):
  - "Export Report" card button "View & Download PDF" (outline lg, `FileText` icon; "PDF" on mobile) → `DynamicPdfPreviewDialog` (title `<reportTitle> - Payroll Report`, description period text or "All Periods", fileName `payroll-report-<title>-<timestamp>`). Uses `allRecords` (full fetch) when available, else current page records; passes `employeeName` when exactly 1 record and an employee is selected. Sibling button "Export Excel" (separate feature).
  - Data: `payrollService.getPayrollReport({...})` (paged + full fetch) and `employeeService.getEmployees` for the employee picker.

## 6. Client Payroll PDF — `/components/payroll/pdf/client-payroll-pdf.tsx`

- Document type: client payroll summary + one salary slip page per employee record (component `ClientPayrollPDF`; props `data: ClientPayrollMonth[]`, `clientName`, `clientDetails?`).
- Page size: A4 portrait, N+1 pages.
- Metadata: title `<clientName> - Payroll Report`, subject "Client Payroll Report".
- Page 1:
  - Header: `PdfHeader` title `<clientName> - Payroll Report`, subtitle "Client Payroll Summary".
  - Section "Client Information": Client Name always; Address, Contact Person, Contact Number, Onboarding Date (`formatDate`) each conditional.
  - Section "Payroll Summary": Total Months (data.length), Total Employees (sum of employeeCount), Total Net Salary (`₹` en-IN 2dp).
  - Footer: "This is a computer-generated report".
- Pages 2+: `SalarySlipPDFPage` per record across all months, via exported `clientRecordToSalarySlip(record, clientName, month)` (same grouped/flat fallback mapping; employee name from `title + firstName + lastName` when employee relation present, else `information.employeeName`, else employeeId). Also exports `PayslipSourceRecord` type (reused by single-payslip-pdf).
- Exported button `ClientPayrollPDFDownloadButton` — the only PDF in the app using `PDFDownloadLink` (renders document eagerly, no preview dialog):
  - Button (outline, lg, `FileText` icon): "View & Download PDF" / mobile "PDF"; loading render-prop state "Generating PDF..." / "Generating..."; disabled via prop or while loading. fileName `<ClientName_underscored>_Payroll_<ISO-timestamp>.pdf`.
- Dead local `styles` block (page/header/title/subtitle/metadata/monthSection/monthHeader/monthTitle/monthStats/col1-col5/footer with hardcoded `#666666`, `#888888`, `#fafafa`, `#e5e7eb`, `#6b7280`) is mostly unreferenced by current markup — legacy of an older table layout.
- Trigger: `/components/payroll/client-reports.tsx` → `ClientReports` component, "Export Actions" row next to "Export Excel". Data: `payrollService.getPastPayrolls(clientId, page, 10)` + `clientService.getClientById(clientId)`.
- WARNING: `ClientReports` is not imported by any route or component (grep finds no import sites) — this whole flow is currently unmounted/dormant code. Inventory it anyway; confirm intent before dropping in redesign.

## 7. Employee Payroll PDF — `/components/payroll/pdf/employee-payroll-pdf.tsx`

- Document type: one salary slip page per month for a single employee (component `EmployeePayrollPDF`; props `data: EmployeePayrollRecord[]`, `employeeId`). No cover page.
- Page size: A4 portrait, one page per record, sorted ascending by month.
- Metadata: title `Employee <id> - Payroll Report`, subject "Employee Payroll Report".
- Record conversion: local `convertToSalarySlipData` (same grouped/flat fallback pattern; client = `information.clientName` or "N/A").
- Exported button `EmployeePayrollPDFDownloadButton`:
  - Button (outline lg, `FileText` icon) "View & Download PDF" / "PDF" → opens `PdfPreviewDialog` (title `Employee <id> - Payroll Report`, description `Pay Period: <MMM yyyy - MMM yyyy>` computed from record months, fileName `Employee_<id>_Payroll_<timestamp>.pdf`).
- Trigger: `/components/payroll/employee-reports.tsx` → `EmployeeReports` component, "Export Actions" row next to "Export Excel". Data: `payrollService.getEmployeePayrollReport(...)` + `employeeService.getEmployees`.
- WARNING: `EmployeeReports` also has no import sites — dormant like ClientReports.

## 8. Single Payslip Button — `/components/payroll/pdf/single-payslip-pdf.tsx`

- Document type: one-page payslip for a single payroll row (component `SingleEmployeePayslipButton`; props `record: PayslipSourceRecord`, `clientName`, `month`).
- Page size: A4 portrait, single `SalarySlipPDFPage` wrapped in Document (title `Payslip <employeeId> <month>`, subject "Employee Payslip"). Data mapped via `clientRecordToSalarySlip` imported from client-payroll-pdf.
- INTERACTIVE:
  1. Button "Payslip" (ghost, sm, h-8, `FileText` icon; label hidden below `sm` breakpoint) → opens `PdfPreviewDialog` (title `Payslip - <employeeName>`, description `<clientName> (<month>)`, fileName `Payslip_<employeeId>_<month>_<timestamp>.pdf`).
- Trigger: `/components/payroll/payroll-reports.tsx` line ~1094 — rendered as `DynamicPayslipButton` (dynamic ssr:false with disabled-button loading fallback showing same icon/label) in the right-aligned last cell of EVERY row of the payroll report table on `/payroll/reports`.

## 9. Salary Slip Preview (template designer) — `/components/clients/salary-slip-preview.tsx`

Hosts the standalone `SalarySlipPDF` inside client add/edit flows (routes `/clients/add` and `/clients/edit/[id]`).
- Card "Salary Slip Preview" / description "See how the salary slip will look with your template configuration".
- INTERACTIVE INVENTORY:
  1. Input `employeeName` (label "Employee Name", text, default "John Doe", placeholder "Enter employee name").
  2. Select `month` (label "Month", 12 English month names, defaults to current month).
  3. Select `year` (label "Year", 5 options: currentYear-2 … currentYear+2).
  4. Button "Regenerate Preview" (outline, `FileText` icon; "Generating..." while busy).
  5. Inline `<iframe>` preview, 500px, bordered; empty state "Click Regenerate to create a preview" on `bg-muted`; loading "Generating preview...".
  6. Button "Print" (outline, `Printer` icon) — `window.open(pdfUrl)`.
  7. Button "Download PDF" (`Download` icon) — filename `salary_slip_<name>_<month>_<year>.pdf`.
- Behavior: auto-regenerates 300ms-debounced on any input/config change. Builds `SalarySlipData` from the template config (enabled mandatory/optional/custom fields grouped by purpose INFORMATION/CALCULATION/ALLOWANCE/DEDUCTION); sample working_days 27; client literal "TULSYAN SECURITY SERVICES PVT. LTD.".
- Toasts: success "PDF Generated / Your salary slip PDF has been generated successfully"; destructive "Error / Failed to generate PDF. Please try again.".
- Known workaround baked in: retries up to 3x on react-pdf `BindingError` "Config" errors with 200-300ms delays, suppressing toasts for those. Preserve or consciously remove during rebuild.
- Data: no service call; consumes `SalaryTemplateConfig` prop from the client form.

---

## Cross-cutting notes for the redesign

1. Composition graph: `brand.tsx` → everything; `SalarySlipPDFPage` is embedded by 5 documents (salary-slip standalone, client-view sample page, client-payroll pages 2+, employee-payroll all pages, payroll-report single mode, single-payslip). Changing the slip layout changes 6 user-facing outputs.
2. Rendering patterns: (a) `PdfPreviewDialog` + dynamic import + blob iframe (most flows), (b) `PDFDownloadLink` eager render (client-payroll only), (c) hand-rolled blob + tabs inside the employees list view modal. Three divergent UX patterns for the same job.
3. Page sizes: A4 portrait everywhere except payroll-report multi-record mode (A4 landscape). `BrandPage` supports A3/LETTER but nothing uses them.
4. All colors are hardcoded hex (no theme tokens reach PDFs): BRAND palette (#D12702 primary red, #1f2937, #6b7280, #e5e7eb, #fafafa, #f9fafb, #ffffff) plus stragglers: #22c55e + #6b7280 (dead badge styles, client-view-pdf), #10b981/#ef4444 status pills + #4b5563/#111827 text (employee-view-pdf), #666666/#888888/#fafafa/#e5e7eb/#6b7280 (dead legacy styles, client-payroll-pdf).
5. Fonts: single Roboto regular/bold registration in brand.tsx from `/public/fonts`; ₹ glyph rendering depends on Roboto, so any font swap must keep ₹ coverage.
6. Footer/header treatment is uniform: red-underlined brand header (logo 28x28 + company name + title + subtitle + optional red tag pill), fixed footer "Generated on <date> | <note> • Page N of M".
7. Dormant code: `ClientReports`/`EmployeeReports` (hosts of ClientPayrollPDFDownloadButton and EmployeePayrollPDFDownloadButton) have no import sites; `formatCurrencyINR` and `Row` in brand.tsx are unused; client-payroll-pdf and client-view-pdf carry dead StyleSheet blocks.
8. Data mapping duplication: `convertToSalarySlipData`/`clientRecordToSalarySlip` logic (grouped salaryData with flat fallbacks) is copy-pasted 3x (client-payroll, employee-payroll, payroll-report) — a rebuild must keep identical fallback chains or old payroll records will render zeros.
9. Missing states: PdfPreviewDialog has no user-visible error state (console only); AttendanceReportPDF is the only document with an in-PDF empty state.
