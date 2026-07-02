# Brand Assets, Company Facts, and Domain Vocabulary Inventory

Scope audited: `COMPANY_INFO.md`, `company-profile.json`, `docs/`, `enums/`, `types/`, `public/`.
No `README.md` exists at the project root. `docs/` exists but is EMPTY (zero files).
This is not a page inventory; it is the brand/content/domain contract the redesign must honor.

---

## 1. Company Facts (source: /Users/tarunvadde/Development/tss-frontend/company-profile.json)

This JSON is the canonical structured company profile consumed as reference content for the landing page.

- **Company name**: Tulsyan Security Services Pvt. Ltd. (TSSPL)
- **Former name**: Tulsyan Outsourcing Pvt. Ltd.
- **Founded**: 2013
- **Head office**: Indore, Madhya Pradesh, India
- **Employees**: 2000+
- **Industry**: Manpower and Outsourcing Services
- **Leadership**: Kshitiz Tulsyan (Director), Anubhav Tulsyan (Director)
- **Core values** (5): Integrity, Reliability, Professionalism, Responsiveness, Customer First
- **Mission statement** (5 bullets): high-quality affordable outsourcing; long-term client relationships; respond immediately to changing needs; complete customer satisfaction; continuously improve service standards
- **Competitive advantages** (5): zero machine investment; security + facility management under one roof; reduced admin burden; hygienic environments; no downtime stress for breakdowns/consumables
- **Areas of specialization** (7): Security Services; Meter Reading and Bill Distribution; Solid Waste Management; Housekeeping; E&M / O&M Management; Payroll Management and Consultancy; Facility Management
- **Security services detail**: overview (ex-Army supervision), 8-item management scope (risk assessment, policy/governance, incident mgmt, access control, monitoring/surveillance, asset protection, legal compliance, training/awareness), 7-step deployment process (recruitment, medical/background checks, police verification, grooming, firefighting training, monthly client review meetings, record maintenance)
- **Recruitment policy**: objective + 5 steps (background/policy verification, 5-year service history, grooming/hygiene, integrity assessment, education validation)
- **Service divisions** (4 with sub-bullets): electricity_meter_reading_and_billing (5), solid_waste_management (5), housekeeping (6), payroll_management_and_consultancy (5)
- **Case study**: BPCL COCO Petrol Pump Management, Madhya Pradesh; 3-year tenure; 11,000 KL annual sales; 45 employees
- **Financials**: consistent YoY revenue growth FY 2019-20 to FY 2023-24, figures in crores (INR)
- **Awards** (4): Security Leadership Award; Best Security Agency Award (Madhya Pradesh); Young Entrepreneur Award; Special recognition for Sanitation Training Workshop
- **CSR initiatives** (3): Traffic Management (reduced congestion); Waste Management (dump site to selfie point); Social Awareness Film "Warning Call" (deforestation/pollution from funeral practices)
- **Contact**: 24 A, Chandra Nagar, MR 9 Road, Indore, Madhya Pradesh - 452010, India; phones 0731-4098357, 9993997072; email info@tulsyans.com; website www.tulsyans.com
- **Branch offices** (7): Bhopal, Jodhpur, Ahmedabad, Dewas, Dhar, Pithampur, Kota
- **Tone guideline (design-relevant)**: "Professional, trustworthy, and corporate. Emphasizing reliability, scale, and long-term client relationships."

## 2. Additional Facts Only in COMPANY_INFO.md (source: /Users/tarunvadde/Development/tss-frontend/COMPANY_INFO.md)

COMPANY_INFO.md is a prompt-style brief for building the landing page (references `app/page.tsx` and `company-profile.json`). Facts not in the JSON:

- **Group firms** (6): Tulsyan Associates, Tulsyan Enterprises, Tulsyan Fashion House, Tulsyan Foundation, Mana Enterprises, Dream Big Outsourcing Pvt. Ltd.
- **Group sectors** (6): Wealth Management, Housekeeping Material Supply, Garment, Social Service, Graphic Designing, Recruitment Consultancy
- **Tagline copy**: "We provide Complete Solutions ...!!! Manpower, Machines, Material, Methods" (the 4 Ms)
- **Certification table** (S.No / CERTIFICATION / SCOPE, as written including original typos):
  | S.No. | Certification | Scope |
  |---|---|---|
  | 1 | ISO 18788 : 2015 | Private Security Operations |
  | 2 | ISO 14001 : 2015 | Environmental Mgt Sys |
  | 4 | ISO 45001 : 2018 | Occupational Health & Safety Sys |
  | 5 | ISO/IEC : 27001 : 2022 | Information Security Mgt Sys |
  | 6 | ISO 30409 : 2026 | Human Resource Mgt |
  (No row 3 in source; numbering gap is in the original.)
- **Movie**: "Warning Call", based on the practice of using trees as fuel for funerals causing deforestation, carbon emission, air pollution. Images at `public/movie-on-social-issues/`.
- Asset pointers: certifications at `public/certifications/`, directors at `public/directors/`, clients (no-bg PNGs) at `public/clients/`, awards 4-image collage (no bg) at `public/awards/`, media coverage at `public/media-coverage/`.

## 3. Logo (viewed: /Users/tarunvadde/Development/tss-frontend/public/tss-logo.png)

- **Shape**: a stylized human eye. Two sweeping crescent brushstrokes form the upper and lower eyelids; the iris is a solid red ellipse (slightly tilted) containing a white negative-space lowercase "t" shaped like an upward-pointing arrow / flag (the "t" doubles as an up-arrow, suggesting growth).
- **Color**: single brand red, a deep crimson (approx. #B01E24 / #AD1F23 range; between Tailwind red-700 and red-800). White/transparent background, square canvas (1024x1024), soft anti-aliased edges.
- **Design-system implication**: brand red is the anchor color. The current dashboard/PDF code keys off this logo (`components/pdf/brand.tsx` header uses `/tss-logo.png`; sidebar renders it at 32x32; `app/layout.tsx` uses it as favicon `icon: "/tss-logo.png"`).
- **Usage found in code**: `app/layout.tsx` (favicon), `app/page.tsx` (nav 387, mobile nav 429, footer 887), `components/layout/sidebar.tsx` (274, 283, 537), `components/pdf/brand.tsx` (PdfHeader default logoSrc), `components/pdf/client-view-pdf.tsx`, `components/pdf/salary-slip-pdf.tsx`.

## 4. Complete public/ Asset Listing (ls -R)

- `public/tss-logo.png` (259 KB, 1024x1024, red eye logo)
- `public/awards/`: `image.png` (4-image award collage, no bg)
- `public/certifications/`: `certified-by-governments.png`, `other-certifications.png`
- `public/clients/` (13 no-bg client logos): `aditya-birla.png`, `ashoka-hotel.png`, `brilliant-convention-centre.png`, `electricity-department.png`, `epfo.png`, `franklin.png`, `hotwax-systems.png`, `iit-jodhpur.png`, `municipal_corp.png`, `nvda.png`, `parishad-mhow.png`, `prestige.png`, `vistara.png`
- `public/directors/`: `anubhav-old.png`, `anubhav.jpg`, `kshitiz.jpg` (anubhav-old.png is unreferenced in code)
- `public/fonts/`: `Roboto-Bold.ttf`, `Roboto-Regular.ttf` (registered in `components/pdf/brand.tsx` for @react-pdf/renderer; PDFs depend on these exact paths)
- `public/media-coverage/`: `image.png`, `image 1.png`, `image 2.png`, `image 3.png`, `image 4.png` (5 newspaper clippings; note filenames contain spaces)
- `public/movie-on-social-issues/`: `on-news.png`, `warning-call.png`
- `public/petrol-pump/`: `petrol-pump.png`
- `public/security-guards/`: `security-guards.png`, `security-guards-1.png`
- `public/slideshow/`: `before-and-after.png`, `image 1.png`, `security-guards-1.png`, `security-guards.png`, `traffic-management.png`, `waste-management-news.png`, `waste-management.png` (7 files; `waste-management-news.png` and slideshow copies of `security-guards-1.png` appear unreferenced)
- `public/training/`: `training.png`, `training-1.png`

### Landing page asset bindings (app/page.tsx, must survive redesign)
- Hero background: `/slideshow/security-guards.png` (rendered at opacity-30, dark:opacity-20)
- Services/slideshow rotation (6): security-guards, petrol-pump, waste-management, before-and-after, security-guards-1, traffic-management
- Directors: `/directors/kshitiz.jpg`, `/directors/anubhav.jpg` with bios ("Leading the strategic expansion into diverse sectors." / "Driving operational excellence and innovation.")
- Client logo wall: all 13 client PNGs with display names (Aditya Birla Group, Ashoka Hotel, Brilliant Convention Centre, Electricity Department, EPFO, Franklin, HotWax Systems, IIT Jodhpur, Municipal Corporation, NVDA, Nagar Parishad Mhow, Prestige, Vistara)
- Media coverage: all 5 media-coverage images
- Gallery (6 with categories): Security, Services, Security, Training, Services, Operations
- Training section image: `/training/training-1.png`
- Movie section: `/movie-on-social-issues/warning-call.png` (click opens image lightbox)
- Awards section: `/awards/image.png` (click opens image lightbox)

## 5. Representative Images Viewed

- **aditya-birla.png**: Aditya Birla Group / UltraTech logo. Red-and-ochre sunburst square, "ADITYA BIRLA" in red serif caps, yellow "UltraTech" bar. Colorful, opaque block, not truly background-free.
- **iit-jodhpur.png**: screenshot-style banner on light blue background with IIT Jodhpur circular seal and text "IIT Jodhpur (Rajasthan)"; includes a watermark ("aglaem") in the corner. Low quality; NOT a clean transparent logo. Logo wall design must tolerate mixed-quality, mixed-aspect images (cards/containers, not raw transparent marks).
- **vistara.png**: navy-blue decorative script "vistara" with red/blue dotted spiral sun motif, subtitle "Metropolitan Lifestyle" (a realty brand, not the airline). Light background.
- **certified-by-governments.png**: dark collage titled "WE ARE CERTIFIED BY THESE GOVERNMENTS" with an ISO 9001 gold badge ("ISO 9001:2008 certify company"), CRISIL Research logo, MP Police crest, and Bureau of Civil Aviation Security emblem. Transparent/black background; sized for dark backdrops. Note the certification claims differ from the ISO table in COMPANY_INFO.md (9001:2008 here vs 18788/14001/45001/27001/30409 there); redesign should keep both sources visible or reconcile with owner.

## 6. Domain Vocabulary (enums/ and types/) — the language the UI must speak

### enums/employee.enum.ts
- `Category`: SC, ST, OBC, GENERAL
- `EducationQualification`: UNDER_8, EIGHT, TEN, TWELVE, GRADUATE, POST_GRADUATE
- `Gender`: MALE, FEMALE
- `EmployeeTitle`: MR, MS
- `Status` (employee): ACTIVE, INACTIVE

### types/auth.ts
- Entities: `User` (id, name, email, mobileNumber, role, avatar, departmentId, createdAt)
- `Role`: HR, OPERATIONS, ACCOUNTS, FIELD, ADMIN, USER
- Flows implied: login, signup, change password, forgot password, reset password (resetToken), update user; tokens accessToken/refreshToken

### types/client.ts
- `ClientStatus`: ACTIVE, INACTIVE
- Client entity: name, address, contactPersonName, contactPersonNumber, status, clientOnboardingDate, salaryTemplates
- `PresentDaysCount`: D26..D31 (basic duty options 26-31 days, helper `getBasicDutyOptions()`)
- Statutory option enums (used as select options in salary setup): `PFOptions` (12% | NO), `ESICOptions` (0.75% | NO), `BONUSOptions` (8.33% | NO), `LWFOptions` (10 RUPEES | NO)
- Salary template model: `SalaryFieldCategory` (MANDATORY_NO_RULES, MANDATORY_WITH_RULES, OPTIONAL_NO_RULES, OPTIONAL_WITH_RULES, CUSTOM), `SalaryFieldType` (TEXT, NUMBER, DATE, BOOLEAN, SELECT), `SalaryFieldPurpose` (ALLOWANCE, DEDUCTION, INFORMATION, CALCULATION), `SalaryPaidStatus` (PAID, PENDING, HOLD)
- Default salary template fields (labels are UI copy):
  - Mandatory: S.No, Client Name, Employee Name, Designation, Monthly Pay, Basic Duty (SELECT, default 30), Gross Salary, Total Deduction, Net Salary
  - Optional: PF (12%), ESIC (0.75%), Father Name, UAN No., Wages Per Day, LWF (default 10)
  - Custom (requiresAdminInput): Bonus (ALLOWANCE), Advance Taken (DEDUCTION)
- `ClientEmployee` row fields: employeeId, title, status, firstName, lastName, designation, department, salary, joiningDate, leavingDate, salaryPerDay, salaryType (PER_DAY | PER_MONTH), salaryCategory, salarySubCategory, monthlySalary

### types/salary.ts
- `SalaryCategory`: CENTRAL, STATE, SPECIALIZED
- `SalarySubCategory`: SKILLED, UNSKILLED, HIGHSKILLED, SEMISKILLED
- `SalaryType`: PER_DAY, PER_MONTH
- `SalaryRateSchedule` entity: category, subCategory, ratePerDay, effectiveFrom, effectiveTo (null = ongoing), isActive; CRUD DTOs; category/subCategory immutable on update; rate schedules apply to CENTRAL/STATE only (SPECIALIZED uses monthlySalary)

### types/employee.ts
- Employee entity spans grouped sub-records the UI presents as sections: core profile (title, names, DOB, gender, fatherName, motherName, husbandName, bloodGroup, category, education, onboarding/relieving dates, status, recruitedBy, age), `contactDetails` (mobile, aadhaarNumber, permanent/present address, city, district, state, pincode), `bankDetails` (account, IFSC, bankName, bankCity), `additionalDetails` (pfUanNumber, esicNumber, police verification no/date, training certificate no/date, medical certificate no/date), `referenceDetails` (name, address, number), `documentUploads` (photo, aadhaar, panCard, bankPassbook, markSheet, otherDocument + otherDocumentRemarks; File uploads), `employmentHistories` (client, designation, department, salary snapshot, salaryPerDay, salaryType, joiningDate, leavingDate, status, isActive, reason)
- Salary fields on employee: salaryCategory, salarySubCategory, salaryPerDay (CENTRAL/STATE), monthlySalary (SPECIALIZED), pfEnabled, esicEnabled
- `EmployeeSearchParams` (the filter vocabulary the employees list must expose): page, limit, searchText, designationId, employeeDepartmentId, clientId, gender, category, highestEducationQualification, minAge/maxAge, sortBy/sortOrder, startDate/endDate, status, salaryCategory, salarySubCategory, pfEnabled, esicEnabled, minSalary/maxSalary, title, bloodGroup, city, state, district
- Lookup entities: `Designation` (id, name), `EmployeeDepartments` (id, name), `Clients` (id, name, address)

### types/attendance.ts
- `Attendance` record: employeeId, clientId, month (YYYY-MM), presentCount, plus denormalized employeeID/employeeName/clientName/designationName/departmentName/attendanceSheetUrl
- Operations implied: mark single, bulk mark, upload attendance sheet (file per client+month), get by employee+month, get by client+month, delete (bulk ids)
- `AttendanceReportResponse`: client (id, name, address), month, totals (totalEmployees, totalPresent, averageAttendance, minPresent, maxPresent), per-employee records, optional attendanceSheet URL
- Excel flow: `AttendanceExcelRecord` (attendanceExcelUrl per client+month), upload response, `ImportAttendanceExcelResult` (totalRows, imported, skipped, errors[] with row/employeeId/reason), list params (sortBy: month | clientId | createdAt; limit max 100, default 20; sortOrder default desc)
- `ActiveEmployee` (per-month active list): id, names, status, mobile, employmentHistories with designation/department names

### types/payroll.ts
- Flow DTOs: `CalculatePayrollDto` (clientId, payrollMonth YYYY-MM, adminInputs map employeeId->field->number), `FinalizePayrollDto` (same + force flag)
- `PayrollSalaryData` grouped structure: metadata (salaryCategory, salarySubCategory, monthlySalary, salaryPerDay, pfEnabled, esicEnabled, serialNumber) + groups `information` (clientName, employeeName, designation, department, monthlyPay, fatherName, uanNumber), `calculations` (basicDuty, dutyDone, basicPay, grossSalary, netSalary, wagesPerDay, rate, totalDeduction), `allowances` (bonus), `deductions` (pf, esic, lwf, advanceTaken, totalDeductions)
- Reports: `ReportType` = "client" | "employee"; `ReportFilters` (clientId, employeeId, startMonth, endMonth, page, limit); `PastPayrollsResponse` grouped by month (employeeCount, totalNetSalary); `PayrollByMonthData` summary (totalEmployees, totalGrossSalary, totalDeductions, totalNetSalary); paginated `PayrollReportResponseData` (hasNextPage/hasPrevPage)
- `PayrollStep` (wizard: id, title, description, completed, current); `AdminInputField` (key, label, type, purpose, description, defaultValue, requiresAdminInput)

### types/dashboard.ts
- `DashboardReportData`: summary (totalEmployees, newEmployeesThisMonth, totalClients, newClientsThisMonth, active/inactive employees, active/inactive clients), employeeStats (byDepartment, byDesignation, activeInactive), clientStats (+ tenure: distribution buckets "0-6 months" / "6-12 months" / "1-2 years" / "2-5 years" / "5+ years", averageTenureMonths/Years, per-client tenure detail), growthMetrics (employee + client, monthly and yearly series with cumulative count and new-per-period), specialDates (birthdays, employeeAnniversaries, clientAnniversaries), recentActivity (recentJoinees, recentPayrolls)
- Legacy deprecated shapes retained for backward compatibility (`DashboardReport`, `DepartmentStat`, etc.)

## 7. Redesign Guardrails Derived From This Scope

1. Brand red from the eye logo (approx #B01E24) should become the primary token; current code hardcodes reds ad hoc.
2. PDF layer depends on `public/fonts/Roboto-*.ttf` and `/tss-logo.png` paths; do not move/rename these without updating `components/pdf/brand.tsx`.
3. Filenames with spaces (`image 1.png` etc. in media-coverage and slideshow) are referenced literally in `app/page.tsx`; renaming breaks the landing page.
4. Client logo wall must handle non-uniform, non-transparent, mixed-quality images (see iit-jodhpur.png).
5. Status pill vocabulary across the app: ACTIVE/INACTIVE (employee, client), PAID/PENDING/HOLD (salary), rate schedule isActive, tenure buckets.
6. Certification content exists in two conflicting sources (ISO table in COMPANY_INFO.md vs badges in certified-by-governments.png); landing redesign must not silently drop either.
7. `docs/` is empty and there is no README; COMPANY_INFO.md + company-profile.json are the only written brand sources.
