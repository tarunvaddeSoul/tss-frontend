# Inventory: Dashboard Home

## Route: `/dashboard`

- **Page file:** `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/dashboard/page.tsx` (client component)
- **Delegated components:**
  - `/Users/tarunvadde/Development/tss-frontend/components/dashboard/stat-cards.tsx`
  - `/Users/tarunvadde/Development/tss-frontend/components/dashboard/growth-charts.tsx`
  - `/Users/tarunvadde/Development/tss-frontend/components/dashboard/employee-distribution.tsx`
  - `/Users/tarunvadde/Development/tss-frontend/components/dashboard/client-tenure.tsx`
  - `/Users/tarunvadde/Development/tss-frontend/components/dashboard/special-dates.tsx`
- **Hook:** `/Users/tarunvadde/Development/tss-frontend/hooks/use-dashboard.ts` (`useDashboard(daysAhead)`)
- **Services:**
  - `dashboardService.getDashboardReport(daysAhead = 30)` in `/Users/tarunvadde/Development/tss-frontend/services/dashboardService.ts`: `GET /dashboard/report?daysAhead=N`, returns `DashboardReportData` (unwraps `response.data.data`).
  - `clientService.getClientEmployeeCounts()` in `/Users/tarunvadde/Development/tss-frontend/services/clientService.ts`: `GET` client employee-count endpoint, returns `ClientEmployeeCount[]` (`{ name, employeeCount }`), fetched in parallel with the report.
- **Types:** `/Users/tarunvadde/Development/tss-frontend/types/dashboard.ts` (`DashboardReportData`, `ClientEmployeeCount`, etc.)
- **Local state:** `daysAhead: number` (default 30). Changing it re-runs `useDashboard`'s effect (refetch). `handleDaysChange(value: string)` parses select value to int.

---

## 1. INTERACTIVE INVENTORY (exhaustive)

### Page header (page.tsx)
1. **Button "Refresh"** — `variant="outline" size="sm"`, icon `RefreshCw` (mr-2 h-4 w-4). `onClick={() => refetch(daysAhead)}`; re-fetches report + client counts, shows full-page skeleton while loading.

### Error state (page.tsx)
2. **Button "Try Again"** — `variant="outline" size="sm"`, icon `RefreshCw`. `onClick={() => refetch()}` (refetches with current `daysAhead` default). Rendered inside destructive Alert.

### GrowthCharts (growth-charts.tsx)
3. **Tab "Monthly"** (Employee Growth card) — default selected. Shows AreaChart of monthly employee data.
4. **Tab "Yearly"** (Employee Growth card) — shows LineChart of yearly employee data.
5. **Tab "Monthly"** (Client Growth card) — default selected. Shows AreaChart of monthly client data.
6. **Tab "Yearly"** (Client Growth card) — shows LineChart of yearly client data.
7. **Chart hover tooltips** — all 4 charts have recharts `Tooltip` (styled card background, 8px radius) and `Legend`.

### EmployeeDistribution (employee-distribution.tsx)
8. **Tab "Bar Chart"** (By Department card) — default. Vertical BarChart, top 10 departments by count, X labels rotated -45deg.
9. **Tab "Pie Chart"** (By Department card) — PieChart with ALL departments (not just top 10), slice label `"{name}: {percent}%"`, cycling 6-color palette.
10. **Tab "Bar Chart"** (By Designation card) — default. Top 10 designations.
11. **Tab "Pie Chart"** (By Designation card) — all designations, same label/palette pattern.
12. **Chart hover tooltips** — all 4 charts have styled recharts `Tooltip`; pie charts also have `Legend`.

### ClientTenure (client-tenure.tsx)
13. **Tenure Distribution pie hover** — custom tooltip component (`CustomTooltip`): shows tenure-group name (uppercase, 0.70rem) + "`{value}` clients" in a bordered card.
14. **Top Clients by Tenure bar hover** — recharts Tooltip with formatter `"{value.toFixed(1)} months" / "Tenure"`.
15. **Client list rows** — hover style only (`hover:bg-muted/50`), NOT clickable, no navigation.

### SpecialDates (special-dates.tsx)
16. **Select "Upcoming:"** — labelled `Label htmlFor="days-select"` ("Upcoming:"), `SelectTrigger id="days-select"` width `w-[160px]`, value = `daysAhead.toString()`, `onValueChange={onDaysChange}`. Hardcoded options:
    - `7` → "Next 7 days"
    - `15` → "Next 15 days"
    - `30` → "Next 30 days" (default)
    - `60` → "Next 60 days"
    - `90` → "Next 90 days"
    - `180` → "Next 180 days"
    - `365` → "Next year"
    Changing it refetches the whole dashboard (full-page skeleton reappears).
17. **Special-date list rows** — hover style only (`hover:bg-muted`), NOT clickable.

**No** tables with sortable columns, no dialogs/modals/drawers, no toasts, no file uploads, no downloads/exports, no keyboard shortcuts, no pagination on this page. Interactive element count: 2 buttons + 8 tab triggers + 1 select = **11** discrete controls (plus non-clickable hover tooltips/rows).

### Badges / status pills (all display-only)
- **StatCards trend badge:** `Badge variant="secondary"` with classes `bg-success/10 text-success border-success/20`, icon `TrendingUp`, text `+{change}`. Rendered only when `change > 0`.
- **ClientTenure list, status badge:** `Badge variant={status === "ACTIVE" ? "default" : "secondary"}`, text via `label.status(client.status)` (STATUS lookup map in `/Users/tarunvadde/Development/tss-frontend/lib/labels.ts`, falls back to titleCase). States: default (ACTIVE) / secondary (anything else).
- **ClientTenure list, tenure-group badge:** `Badge variant="outline"`, text = one of `0-6 months | 6-12 months | 1-2 years | 2-5 years | 5+ years`.
- **SpecialDates date badges:** `Badge variant="outline" className="text-xs"` on every birthday / employee-anniversary / client-anniversary row, showing `formatDate(...)` (en-IN "DD Mon YYYY").

---

## 2. DATA DISPLAYED

All from `dashboardService.getDashboardReport(daysAhead)` unless noted.

### StatCards (4 cards)
| Card | Value | Sub-metric (change + label) |
|---|---|---|
| Total Employees | `summary.totalEmployees` (en-IN locale formatted) | `summary.newEmployeesThisMonth` "new this month" |
| Active Employees | `summary.activeEmployees` | `summary.inactiveEmployees` "inactive" |
| Total Clients | `summary.totalClients` | `summary.newClientsThisMonth` "new this month" |
| Active Clients | `summary.activeClients` | `clientsWithEmployees` "with employees" — computed client-side from `clientService.getClientEmployeeCounts()` (`employeeCount > 0` filter) |

Note: `clientsWithoutEmployees` is computed in stat-cards.tsx but never rendered. Each card also shows a trend row: `TrendingUp`/`TrendingDown` icon + "{change} {changeLabel}".

### GrowthCharts
- Employee monthly: `growthMetrics.employees.monthly[]` → month formatted `"MMM YYYY"` (en-IN), series "Total Employees" (`count`) and "New Employees" (`newEmployees`).
- Employee yearly: `growthMetrics.employees.yearly[]` → `year`, same two series.
- Client monthly: `growthMetrics.clients.monthly[]` → series "Total Clients" (`count`), "New Clients" (`newClients`).
- Client yearly: `growthMetrics.clients.yearly[]`.

### EmployeeDistribution
- `data.employeeStats.byDepartment[]`: `departmentName` (underscores → spaces) + `_count.departmentName`. Bar = top 10 desc; pie = all.
- `data.employeeStats.byDesignation[]`: `designationName` + `_count.designationName`. Same top-10/all split.

### ClientTenure
- Summary cards: `averageTenureYears` (toFixed(1)) + `averageTenureMonths` (toFixed(1)); `clients.length` ("Total Clients ... with tenure data"); max `yearsWithUs` (toFixed(1), "0" when empty) as "Longest Tenure".
- Pie: `tenureDistribution` object entries (5 fixed buckets).
- Bar: top 10 clients by `monthsWithUs` desc; names truncated at 15 chars + "..."; bar value = months, right-positioned value labels.
- Client list ("All Clients by Tenure"): every client sorted by `monthsWithUs` desc — name, `formatDate(onboardingDate)`, status badge, `yearsWithUs.toFixed(1)` + "years", `monthsWithUs` + "months", tenureGroup badge.

### SpecialDates
- `specialDates.birthdays[]` (first 10 shown): avatar initials (first+last initial), full name, employee `id`, `formatDate(dateOfBirth)` badge; overflow line "+N more birthdays".
- `specialDates.employeeAnniversaries[]` (first 10): initials avatar, name, `id`, `formatDate(employeeOnboardingDate)` badge; "+N more anniversaries".
- `specialDates.clientAnniversaries[]` (first 10): Building2 icon chip, client `name`, `label.status(status)`, `formatDate(clientOnboardingDate)` badge; "+N more anniversaries".
- Section header: "Upcoming Dates" + "Birthdays and anniversaries in the next {daysAhead} days" (daysAhead also interpolated into all 3 card descriptions).

### Unused data
`data.recentActivity` (recentJoinees, recentPayrolls) is in the API type but NOT rendered anywhere on this page. `summary.inactiveClients` also unrendered.

---

## 3. STATES

- **Loading:** full-page skeleton layout mirroring final structure — header (h-8 w-64 + h-4 w-96), 4× h-32 stat skeletons (1/2/4-col responsive grid), 2× h-80 (growth), 2× h-80 (distribution), 1× h-96 (tenure), 1× h-64 (special dates). Shown on initial load AND on every refetch/daysAhead change (no partial/optimistic refresh).
- **Error:** destructive `Alert` (max-w-2xl centered) with `AlertCircle` icon, title "Error Loading Dashboard", error message text, inline "Try Again" outline button. Error message from `getErrorMessage(err)` fallback "Failed to fetch dashboard data"; also `console.error`d.
- **Empty (no data):** non-destructive `Alert` with `AlertCircle`, title "No Data Available", body "Unable to load dashboard data. Please try refreshing the page." (no retry button here).
- **Per-section empty states:**
  - Top Clients by Tenure chart: centered "No client tenure data available" in h-[300px].
  - "All Clients by Tenure" card: hidden entirely when `clients.length === 0`.
  - Birthdays: centered `Cake` icon (h-12 w-12 opacity-50) + "No upcoming birthdays".
  - Employee anniversaries: `Award` icon + "No upcoming employee anniversaries".
  - Client anniversaries: `Building2` icon + "No upcoming client anniversaries".
  - Growth/distribution charts have NO explicit empty state (render empty axes if data is empty) — noted as missing.
  - Longest Tenure card guards `clients.length > 0` else shows "0".

## 4. CURRENT STYLING

- **Layout:** `container mx-auto py-6 space-y-8`; header flex-col→sm:flex-row justify-between; stats grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`; growth + distribution each `grid-cols-1 lg:grid-cols-2 gap-6`; tenure summary `md:grid-cols-3 gap-4`; special dates `lg:grid-cols-3 gap-6`.
- **Custom CSS class:** `security-card` on every Card in all 5 dashboard components — **NOT defined in `app/globals.css`** (dead/no-op class; globals.css only defines `spotlight-card`, `glass`, `glass-strong`, `craze-border-*`, none used here).
- **Hardcoded colors bypassing theme tokens:**
  - page.tsx h1: gradient text `bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent` (`purple-600` hardcoded).
  - special-dates.tsx: `text-pink-500` (Cake icon), `text-amber-500` (Award icon), avatar gradients `from-pink-500 to-rose-500` and `from-amber-500 to-orange-500` with `text-white`.
  - Recharts pie `fill="#8884d8"` (recharts default hex, overridden by Cells) in employee-distribution.tsx (x2) and client-tenure.tsx (x1).
  - Inline `contentStyle` objects on every recharts Tooltip (hsl(var(--card))/border/8px radius) — inline styles, though token-based.
  - Chart series colors are token-based `hsl(var(--primary|success|info|warning|destructive|secondary))`.
  - Semantic token classes used: `text-success`, `text-info`, `text-warning`, `bg-success/10`, `bg-info/10`, `bg-primary/10`, `border-success/20`.
- **Stat-card treatment:** per-card gradient overlay (`from-primary-light/20 to-primary/20`, `from-success/20 to-success/10`, `from-info/20 to-info/10`, `from-warning/20 to-warning/10`) revealed on group-hover; icon in rounded-xl gradient chip with shadow-lg; value uses foreground gradient clip text.
- **Charts:** recharts (AreaChart w/ linearGradient fills id=`colorTotal`/`colorNew`/`colorClientTotal`/`colorClientNew`, LineChart strokeWidth 2 dot r=4 activeDot r=6, BarChart radius `[8,8,0,0]` vertical / `[0,8,8,0]` horizontal, PieChart outerRadius 100) inside `ChartContainer` (h-[300px]) from `components/ui/chart`.
- **Icons (lucide):** AlertCircle, RefreshCw (page); Users, Building2, UserPlus, Building, TrendingUp, TrendingDown (stat-cards); TrendingUp, Users, Building2 (growth-charts; TrendingUp imported unused); Users, Briefcase (employee-distribution); Building2, Calendar, TrendingUp (client-tenure); Cake, Award, Building2 (special-dates).
- **shadcn/ui primitives used:** Card/CardHeader/CardTitle/CardDescription/CardContent, Badge, Button, Alert, Skeleton, Tabs/TabsList/TabsTrigger/TabsContent, Select (full set), Label, Avatar/AvatarFallback, ChartContainer.

## 5. NAVIGATION

- **None from page content.** No `<Link>`s, no `router.push`, no clickable rows. All navigation away from `/dashboard` comes from the surrounding dashboard shell/layout (outside this scope). The only in-page actions are refresh, tab switches, and the daysAhead select (all stay on `/dashboard`).
