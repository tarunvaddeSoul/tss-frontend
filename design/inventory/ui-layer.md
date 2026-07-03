# UI Layer Inventory (components/ui/, lib/, hooks/)

Scope: all 56 files in `/components/ui/`, 3 files in `/lib/`, 6 files in `/hooks/`.
Purpose: contract for the redesign. Every primitive, its customizations vs shadcn stock, hardcoded colors, importers, and unused components. Import counts are file-level (number of distinct files importing the module), split into EXT (app/, components/ non-ui, hooks/, lib/) and INT (other files inside components/ui/).

---

## 1. Import-frequency ranking (EXT importers)

| Rank | Component | EXT | INT | Status |
|---|---|---|---|---|
| 1 | button | 53 | 9 | customized |
| 2 | card | 52 | 0 | lightly customized |
| 3 | input | 33 | 1 | stock |
| 4 | form | 28 | 0 | stock |
| 5 | select | 25 | 1 | stock |
| 6 | alert | 23 | 1 | stock |
| 6 | badge | 23 | 0 | stock |
| 6 | dialog | 23 | 1 | stock |
| 9 | use-toast | 22 | 2 | customized (TOAST_LIMIT=3) |
| 10 | table | 16 | 0 | customized (scrollbar-sleek) |
| 11 | skeleton | 15 | 1 | stock |
| 12 | tabs | 13 | 0 | stock |
| 13 | date-picker | 10 | 0 | fully custom |
| 13 | scroll-area | 10 | 0 | stock |
| 15 | label | 9 | 1 | stock |
| 16 | alert-dialog | 8 | 0 | stock |
| 16 | loader | 8 | 0 | fully custom |
| 16 | pagination | 8 | 0 | heavily customized |
| 19 | checkbox | 6 | 0 | stock |
| 19 | switch | 6 | 0 | stock |
| 21 | avatar | 5 | 0 | stock |
| 21 | month-picker | 5 | 0 | fully custom |
| 21 | separator | 5 | 1 | stock |
| 24 | tooltip | 4 | 1 | stock |
| 25 | chart | 3 | 0 | heavily customized |
| 25 | dropdown-menu | 3 | 1 | stock |
| 25 | progress | 3 | 0 | stock |
| 25 | theme-toggle | 3 | 0 | fully custom |
| 29 | accordion | 2 | 0 | stock |
| 29 | api-error-alert | 2 | 0 | fully custom |
| 29 | collapsible | 2 | 0 | stock |
| 29 | popover | 2 | 2 | stock |
| 29 | sheet | 2 | 1 | stock |
| 29 | textarea | 2 | 0 | stock |
| 35 | calendar | 1 | 1 | stock |
| 35 | command | 1 | 0 | stock |
| 35 | slider | 1 | 0 | stock (multi-thumb tweak) |
| 35 | sonner | 1 | 0 | stock |
| 35 | toaster | 1 | 0 | stock |
| 40 | toast | 0 | 2 | stock-ish (live via toaster/use-toast) |
| 40 | toggle | 0 | 1 | stock (only used by unused toggle-group) |
| — | all others | 0 | 0 | UNUSED (see section 4) |

---

## 2. Per-component inventory

### 2.1 accordion.tsx — stock shadcn
- Radix Accordion. Interactive: AccordionTrigger (click to expand/collapse, ChevronDown rotates on open).
- Icons: `ChevronDown`. Theme tokens only.
- EXT importers (2): `components/clients/salary-template-config-form.tsx`, `components/clients/salary-template-form.tsx`.

### 2.2 alert-dialog.tsx — stock shadcn
- Radix AlertDialog. Interactive: AlertDialogTrigger, AlertDialogAction (buttonVariants default), AlertDialogCancel (buttonVariants outline).
- Overlay: hardcoded `bg-black/80`.
- EXT importers (8): clients/page, settings/designation/page, settings/salary-rate-schedule/page, terminate-client-dialog, employment-history-form, terminate-employee-dialog, terminate-employment-dialog, calculate-payroll.

### 2.3 alert.tsx — stock shadcn
- Variants: `default` (bg-background), `destructive` (border-destructive/50 text-destructive). Non-interactive.
- EXT importers (23): login page, clients/edit/[id], dashboard/page, settings/profile, settings/salary-rate-schedule, settings/security, users/reset-password, attendance-reports, mark-attendance-by-site, upload-attendance, terminate-client-dialog, assign-employment-dialog, employee-document-manager, employee-form, employee-view-dialog, employee-view-page, salary-info-form, terminate-employee-dialog, terminate-employment-dialog, calculate-payroll, client-reports, employee-reports, payroll-reports. INT: api-error-alert.

### 2.4 api-error-alert.tsx — FULLY CUSTOM (not shadcn)
- `ApiErrorAlert({ error, title="Error", onDismiss })`. Renders destructive Alert with AlertTriangle icon, error.message in `whitespace-pre-wrap`, and (if onDismiss) an absolute-positioned ghost icon Button with X to dismiss. Returns null when error is null.
- Interactive: 1 dismiss button.
- Icons: `AlertTriangle`, `X`. Theme tokens only.
- EXT importers (2): `components/clients/salary-template-config-form.tsx`, `components/employees/edit-employee-content.tsx`.

### 2.5 aspect-ratio.tsx — stock shadcn. UNUSED.

### 2.6 avatar.tsx — stock shadcn
- Avatar (h-10 w-10 rounded-full), AvatarImage, AvatarFallback (bg-muted).
- EXT importers (5): employees/list page, dashboard/special-dates, employee-view-page, layout/mobile-nav, layout/sidebar.

### 2.7 badge.tsx — stock shadcn
- Variants: default (bg-primary), secondary, destructive, outline. Rounded-full pill.
- Note: pages also use custom CSS pill classes from globals.css (`badge-success`, `badge-warning`, `badge-info`, `badge-danger`) on top of this component.
- EXT importers (23): attendance/records, clients/page, employees/list, settings/salary-rate-schedule, app/page (landing), attendance-reports, mark-attendance-by-site, upload-attendance, client-view-dialog, salary-template-config-form, salary-template-form, client-tenure, special-dates, stat-cards, edit-employee-content, employee-document-manager, employee-form, employee-view-dialog, employee-view-page, employment-history-form, layout/sidebar, calculate-payroll, payroll-reports.

### 2.8 breadcrumb.tsx — stock shadcn. UNUSED. (Icons: ChevronRight, MoreHorizontal.)

### 2.9 button.tsx — CUSTOMIZED shadcn
Deviations from stock:
- `default`: `hover:bg-primary-dark active:bg-primary-dark shadow-sm hover:shadow-md transition-all` (stock is `hover:bg-primary/90`, no shadows). `primary-dark` is a custom Tailwind token -> `hsl(var(--primary-dark))`; tailwind.config.js also carries a literal `"primary-dark": "#8C1A1D"` in the sidebar color block.
- `destructive`: adds `active:bg-destructive/80 shadow-sm hover:shadow-md transition-all`.
- `outline`: `hover:bg-primary hover:text-primary-foreground hover:border-primary` (stock hovers to accent, this fills solid primary — high-contrast hover on every outline button app-wide).
- `secondary`: adds active state + shadows.
- `ghost`: `hover:bg-primary/10 hover:text-primary active:bg-primary/20` (stock hovers accent).
- `link`: adds `hover:text-primary-dark`.
- Sizes stock: default h-10, sm h-9, lg h-11, icon h-10 w-10. `asChild` supported.
- EXT importers: 53 files (essentially every page and feature component). INT: alert-dialog, api-error-alert, calendar, carousel, date-picker, month-picker, pagination, sidebar, theme-toggle.

### 2.10 calendar.tsx — stock shadcn (react-day-picker v8 API)
- DayPicker with buttonVariants for nav/day cells. Interactive: prev-month button, next-month button, day cells.
- Icons: `ChevronLeft`, `ChevronRight`. Theme tokens only.
- EXT importer (1): clients/edit/[id]. INT: date-picker.

### 2.11 card.tsx — LIGHTLY CUSTOMIZED shadcn
- `CardTitle`: `text-2xl font-semibold leading-tight tracking-tight` (stock uses leading-none) and is a div.
- `CardDescription`: `text-base text-muted-foreground` (stock is `text-sm`) — descriptions render one size larger than stock everywhere.
- EXT importers: 52 files (every page/feature area incl. all loading.tsx skeleton pages).

### 2.12 carousel.tsx — stock shadcn (embla). UNUSED.
- Would provide keyboard shortcuts ArrowLeft/ArrowRight and prev/next buttons. Icons: ArrowLeft, ArrowRight.

### 2.13 chart.tsx — HEAVILY CUSTOMIZED shadcn
- Recharts is dynamically imported inside `ChartContainer` via `import("recharts")` (bundle optimization). Until loaded, renders fallback text "Loading chart..." (`text-muted-foreground`) — this is a loading state the redesign must keep.
- `ChartTooltip` and `ChartLegend` are pass-through stubs `({children}) => children` (NOT re-exports of Recharts primitives as in stock). Consumers must import Recharts Tooltip/Legend themselves and use `ChartTooltipContent` / `ChartLegendContent` as content renderers.
- `ChartStyle` injects per-chart CSS vars (`--color-<key>`) for light/dark themes via dangerouslySetInnerHTML.
- Hardcoded: attribute selectors targeting recharts defaults `stroke='#ccc'` / `stroke='#fff'`; legend swatch uses inline `style={{ backgroundColor: item.color }}`; tooltip indicator uses inline `--color-bg`/`--color-border` CSS vars.
- EXT importers (3): dashboard/client-tenure, dashboard/employee-distribution, dashboard/growth-charts.

### 2.14 checkbox.tsx — stock shadcn
- Icons: `Check`. EXT importers (6): employees/advanced-search, mark-attendance-by-site, employee-form, contact-info-form, employment-history-form, payroll-reports.

### 2.15 collapsible.tsx — stock shadcn (bare Radix re-export)
- EXT importers (2): mark-attendance-by-site, client-salary-setup.

### 2.16 command.tsx — stock shadcn (cmdk)
- Command palette/combobox primitives: CommandInput (Search icon), CommandList, CommandEmpty ("py-6 text-center"), CommandGroup, CommandItem, CommandShortcut, CommandDialog (Dialog wrapper).
- EXT importer (1): `components/payroll/payroll-reports.tsx` (searchable combobox).

### 2.17 context-menu.tsx — stock shadcn. UNUSED. (Icons: Check, ChevronRight, Circle.)

### 2.18 date-picker.tsx — FULLY CUSTOM
- `DatePicker({ date, onSelect, className, yearRange={from:1900,to:2100} })`.
- Interactive inventory:
  1. Trigger: outline Button, full-width, CalendarIcon + formatted date (`format(date,"PPP")`) or placeholder "Pick a date" in muted text.
  2. Clear: X icon inside trigger (visible only when date set); stopPropagation, calls `onSelect(null)`, closes popover; hover turns `text-destructive`.
  3. Month Select (w-32, options January..December).
  4. Year Select (w-20, options from yearRange).
  5. Calendar single-select; picking a day calls onSelect and closes.
- Popover header separated by `border-b border-border`. Selecting via header selects month/year of the visible calendar page only.
- Icons: `CalendarIcon`, `ChevronLeft`, `ChevronRight` (imported; chevrons unused here), `X`. Theme tokens only.
- EXT importers (10): clients/add, employees/advanced-search, settings/salary-rate-schedule, assign-employment-dialog, employee-form, basic-info-form, employment-history-form, salary-info-form, terminate-employee-dialog, terminate-employment-dialog.

### 2.19 dialog.tsx — stock shadcn
- Overlay hardcoded `bg-black/80`. Content max-w-lg centered; built-in top-right X close button with sr-only "Close".
- EXT importers (23): attendance/records, employees/list, settings/department, settings/designation, settings/salary-rate-schedule, attendance-reports, mark-attendance-by-site, upload-attendance, client-view-dialog, salary-template-config-form, terminate-client-dialog, assign-employment-dialog, employee-document-manager, employee-view-dialog, employee-view-page, employment-history-form, terminate-employee-dialog, terminate-employment-dialog, layout/mobile-nav, layout/sidebar, calculate-payroll, payroll-reports, pdf-preview-dialog. INT: command.

### 2.20 drawer.tsx — stock shadcn (vaul). UNUSED. Overlay `bg-black/80`.

### 2.21 dropdown-menu.tsx — stock shadcn
- Full set incl. checkbox/radio items, sub-menus, shortcut span. Icons: Check, ChevronRight, Circle.
- EXT importers (3): salary-template-config-form, layout/sidebar, mode-toggle. INT: theme-toggle.

### 2.22 form.tsx — stock shadcn (react-hook-form bridge)
- Form/FormField/FormItem/FormLabel (turns `text-destructive` on error)/FormControl (aria wiring)/FormDescription/FormMessage (`text-sm font-medium text-destructive`).
- All app form validation UX flows through FormMessage. EXT importers (28) — every RHF form in the app (login, forgot-password, reset-password, clients add/edit, settings x5, attendance x3, all 7 employee sub-forms, employee-form, assign/terminate dialogs, salary-template forms x3).

### 2.23 hover-card.tsx — stock shadcn. UNUSED.

### 2.24 input-otp.tsx — stock shadcn. UNUSED. (Icon: Dot; caret-blink animation.)

### 2.25 input.tsx — stock shadcn
- h-10, text-base -> md:text-sm, file: styles for file inputs. EXT importers (33, all forms + table search boxes). INT: sidebar (SidebarInput).

### 2.26 label.tsx — stock shadcn. EXT importers (9). INT: form.

### 2.27 loader.tsx — FULLY CUSTOM (three loaders)
1. `Loader({ text?, size sm|default|lg, fullPage?, height="calc(100vh-200px)", className })` — Loader2 spinner `text-primary animate-spin` + optional text below; fullPage wraps in flex-centered div with inline `style={{ height }}` (inline style, and note the default string `calc(100vh-200px)` is missing spaces so it is an invalid CSS calc — fullPage default height silently collapses).
2. `InlineLoader({ text?, size })` — centered spinner + text with py-8.
3. `ButtonLoader({ className })` — h-4 w-4 spinner for inside buttons.
- Icon: `Loader2`. EXT importers (8): app/loading, (auth)/loading, attendance/loading, settings/loading, settings/salary-rate-schedule, mark-attendance-by-site, employee-form, salary-info-form.

### 2.28 menubar.tsx — stock shadcn. UNUSED. (Icons: Check, ChevronRight, Circle.)

### 2.29 month-picker.tsx — FULLY CUSTOM
- `MonthPicker({ value, onChange, disabled, placeholder="Select month", yearRange={from:2020,to:2030} })`.
- Interactive inventory:
  1. Trigger: outline Button full-width, Calendar icon + "July 2026"-style label or placeholder.
  2. Prev-year button (outline sm, ChevronLeft, disabled at yearRange.from).
  3. Next-year button (outline sm, ChevronRight, disabled at yearRange.to).
  4. 3x4 month grid: 12 Buttons (Jan..Dec, 3-letter labels). Selected month = default variant `bg-primary text-primary-foreground`; current month (unselected) highlighted `bg-accent`. Click selects month (day 1) and closes.
- Icons: `ChevronLeft`, `ChevronRight`, `Calendar`. Theme tokens only.
- EXT importers (5): attendance/records, upload-attendance, calculate-payroll, employee-reports, payroll-reports.

### 2.30 navigation-menu.tsx — stock shadcn. UNUSED. (Icon: ChevronDown.)

### 2.31 network-status.tsx — FULLY CUSTOM. UNUSED (never rendered anywhere).
- Listens to window online/offline. Fires toasts: "Connection Restored" / "You're back online." (default) and "Connection Lost" / "You're currently offline. Some features may be unavailable." (destructive). When offline renders fixed bottom-right pill: WifiOff icon + "Offline".
- HARDCODED COLORS: `bg-red-500/20 text-red-500 border-red-500/20`.
- Icon: `WifiOff`. Not imported by any file — dead unless the redesign intentionally mounts it.

### 2.32 pagination.tsx — HEAVILY CUSTOMIZED
- Primary export `Pagination({ currentPage, totalPages, onPageChange })` is a stateless controlled component (NOT stock shadcn link-based pagination):
  1. Prev button (ChevronLeft icon button, disabled on page 1, sr-only "Previous Page").
  2. Windowed page-number buttons: always page 1, current±1, last page; gaps rendered as disabled ellipsis items (MoreHorizontal, sr-only "More pages").
  3. Next button (ChevronRight, disabled on last page).
  4. Active page = default (filled) variant; others outline; all icon-size buttons. Returns null when totalPages <= 1.
- Stock shadcn anchor-based parts are ALSO exported (PaginationContent, PaginationLink, PaginationPrevious "Previous", PaginationNext "Next", PaginationEllipsis) — currently unused by pages.
- EXT importers (8): attendance/records, clients/page, employees/advanced-search, employees/list, settings/salary-rate-schedule, client-view-dialog, client-reports, payroll-reports.

### 2.33 popover.tsx — stock shadcn. EXT (2): clients/edit/[id], payroll-reports. INT: date-picker, month-picker.

### 2.34 progress.tsx — stock shadcn (bg-secondary track, bg-primary indicator, translateX inline style). EXT (3): mark-attendance-by-site, upload-attendance, employee-form.

### 2.35 radio-group.tsx — stock shadcn. UNUSED. (Icon: Circle.)

### 2.36 resizable.tsx — stock shadcn. UNUSED. (Icon: GripVertical.)

### 2.37 scroll-area.tsx — stock shadcn. EXT importers (10): employees/add, employees/list, settings/department, settings/designation, settings/salary-rate-schedule, employee-view-dialog, employment-history-form, mobile-nav, layout/sidebar, payroll-reports.

### 2.38 select.tsx — stock shadcn
- SelectTrigger h-10 w-full with ChevronDown; scroll up/down buttons; item check indicator. Icons: Check, ChevronDown, ChevronUp.
- EXT importers (25): all filter dropdowns and form selects. INT: date-picker.

### 2.39 separator.tsx — stock shadcn. EXT (5). INT: sidebar.

### 2.40 sheet.tsx — stock shadcn
- Sides top/bottom/left/right (left/right w-3/4 sm:max-w-sm). Overlay `bg-black/80`. Built-in X close.
- EXT (2): layout/mobile-nav, layout/sidebar. INT: sidebar (ui).

### 2.41 sidebar.tsx (ui) — stock shadcn sidebar kit. UNUSED EXTERNALLY.
- The app's real sidebar is the custom `components/layout/sidebar.tsx`; this 23KB shadcn kit (SidebarProvider/Sidebar/SidebarTrigger/SidebarRail/SidebarInset/SidebarMenu*/useSidebar, cookie persistence `sidebar:state`, KEYBOARD SHORTCUT Cmd/Ctrl+B, mobile Sheet at 18rem, icon-collapse 3rem) is imported by no one. It is the only consumer of `hooks/use-mobile`. Icon: PanelLeft. Uses `bg-sidebar`/sidebar-* tokens.

### 2.42 skeleton.tsx — stock shadcn (`animate-pulse rounded-md bg-muted`). EXT importers (15): all loading.tsx files and per-page loading states. INT: sidebar.

### 2.43 slider.tsx — stock shadcn, minor tweak: renders one Thumb per entry in `props.value` (multi-thumb/range support). EXT (1): employees/advanced-search (salary range filter).

### 2.44 sonner.tsx — stock shadcn wrapper for Sonner, theme-synced via next-themes. Mounted in `app/layout.tsx` as `<SonnerToaster position="top-right" richColors closeButton />`.

### 2.45 switch.tsx — stock shadcn. EXT (6): client-salary-setup, salary-template-config-form, salary-template-field, salary-template-form, employee-form, salary-info-form.

### 2.46 table.tsx — CUSTOMIZED shadcn
- Wrapper div is `relative w-full overflow-auto scrollbar-sleek` — custom scrollbar class from globals.css (thin 6px thumb, muted-foreground/20). Everything else stock (TableHead h-12 text-muted-foreground, TableRow hover:bg-muted/50, TableFooter bg-muted/50, TableCaption).
- EXT importers (16): attendance/records, clients/loading, clients/page, employees/advanced-search, employees/list, settings/salary-rate-schedule, attendance-reports, mark-attendance-by-site, client-view-dialog, employee-view-dialog, employee-view-page, employment-history-form, calculate-payroll, client-reports, employee-reports, payroll-reports.

### 2.47 tabs.tsx — stock shadcn (bg-muted list, active bg-background shadow-sm). EXT importers (13): attendance/records, clients/add, clients/edit/[id], employees/list, settings/department, client-view-dialog, salary-template-config-form, employee-distribution, growth-charts, edit-employee-content, employee-view-dialog, employee-view-page, payroll-reports.

### 2.48 textarea.tsx — stock shadcn (min-h-[80px]). EXT (2): salary-template-config-form, terminate-employment-dialog.

### 2.49 theme-toggle.tsx — FULLY CUSTOM
- Outline icon Button trigger with layered animated icons: Sun (light), Moon (dark), Stars (system) — opacity/rotate/scale transitions; `border-primary/20` on trigger; sr-only "Toggle theme". Mounted-guard against hydration mismatch.
- DropdownMenu with 3 items: Light (Sun), Dark (Moon), System (Stars) -> setTheme.
- EXT importers (3): (auth)/layout, users/layout, layout/header. NOTE: `components/mode-toggle.tsx` is a near-duplicate component (separate file, imported nowhere; dead), so two theme toggler files exist but only this one is live.

### 2.50 toast.tsx — stock shadcn (Radix toast primitives)
- Variants default/destructive. ToastViewport fixed bottom-right (md:max-w-[420px]). ToastClose has HARDCODED reds for destructive: `text-red-300 hover:text-red-50 focus:ring-red-400 focus:ring-offset-red-600`. ToastAction outlined button.
- No direct EXT importers; live via toaster.tsx + use-toast.ts.

### 2.51 toaster.tsx — stock shadcn. Mounted in `app/layout.tsx`. Renders use-toast queue (title, description, action, close X).

### 2.52 toggle.tsx — stock shadcn. Only imported by toggle-group (itself unused) => effectively UNUSED.

### 2.53 toggle-group.tsx — stock shadcn. UNUSED.

### 2.54 tooltip.tsx — stock shadcn. EXT (4): salary-template-config-form, salary-template-field, salary-template-form, layout/sidebar. INT: sidebar (ui).

### 2.55 use-mobile.tsx (ui copy) — duplicate of hooks/use-mobile. UNUSED (nothing imports `components/ui/use-mobile`).

### 2.56 use-toast.ts — customized shadcn hook
- `TOAST_LIMIT = 3` (stock is 1) — up to 3 stacked toasts. `TOAST_REMOVE_DELAY = 1000000` (toasts effectively persist until dismissed). Exports `toast()` and `useToast()`.
- EXT importers (22): attendance/records, clients/add, clients/edit/[id], clients/page, users/reset-password, attendance-reports, mark-attendance-by-site, upload-attendance, client-view-dialog, salary-slip-preview, salary-template-config-form, salary-template-form, terminate-client-dialog, assign-employment-dialog, employment-history-form, terminate-employment-dialog, client-reports, employee-reports, payroll-reports, hooks/use-auth, hooks/use-employee, hooks/use-payroll. INT: network-status, toaster.

---

## 3. DUAL TOAST SYSTEMS (feature to preserve, decision needed)

`app/layout.tsx` mounts BOTH:
- Radix `<Toaster />` (bottom-right, custom use-toast queue, limit 3) — used by 22 files via `@/components/ui/use-toast`.
- Sonner `<SonnerToaster position="top-right" richColors closeButton />` — used by 10+ files importing `toast` directly `from "sonner"` (settings/designation, settings/department, settings/salary-rate-schedule, employees/add, employees/list, employee-view-page, employee-document-manager, employee-form, employee-view-dialog, ...).
Users currently see toasts in two different corners with two different styles. Redesign must not drop either pipeline (or must consciously unify them and migrate all call sites).

---

## 4. UNUSED components (imported nowhere externally)

Safe-to-ignore for redesign effort (but do not silently delete without a call):
`aspect-ratio`, `breadcrumb`, `carousel`, `context-menu`, `drawer`, `hover-card`, `input-otp`, `menubar`, `navigation-menu`, `radio-group`, `resizable`, `sidebar` (shadcn kit incl. its Cmd/Ctrl+B shortcut), `toggle`, `toggle-group`, `use-mobile.tsx` (ui copy), `network-status` (defined but never mounted).

Root-level `components/` files outside `ui/` and the feature dirs:
- `components/error-boundary.tsx` — UNUSED (imported nowhere). Window-level boundary: listens for `error` + `unhandledrejection` events, then renders the same "Something went wrong" card pattern as the route error boundaries with a "Reload Page" button (`window.location.reload()`). Dead code; do not confuse with `app/error.tsx` / `app/(dashboard)/error.tsx`, which are the live boundaries.
- `components/mode-toggle.tsx` — UNUSED (imported nowhere). Near-duplicate of `ui/theme-toggle.tsx` (see 2.49).
- `components/theme-provider.tsx` — LIVE (mounted in `app/layout.tsx`); covered in shell.md and landing.md.

Primitives that actually matter (restyle these first): button, card, input, form, select, alert, badge, dialog, table, tabs, skeleton, use-toast/toaster/toast, sonner, date-picker, month-picker, pagination, loader, scroll-area, label, alert-dialog, checkbox, switch, avatar, separator, tooltip, chart, dropdown-menu, progress, theme-toggle, accordion, api-error-alert, collapsible, popover, sheet, textarea, calendar, command, slider.

---

## 5. lib/

### 5.1 lib/utils.ts
- `cn()` — clsx + tailwind-merge; imported by virtually every component.
- `convertToCustomDateFormat(date)` -> "YYYY-MM-DD" (UTC ISO split). Used by `components/employees/terminate-employee-dialog.tsx` and `services/employeeService.ts`.
- `formatDate(dateString?)` -> "dd/mm/yyyy" en-IN, handles `dd-mm-yyyy` input, "N/A" fallback. UNUSED — all pages import `formatDate` from `lib/labels` instead (different output format: "02 Jul 2026"). Duplicate-name footgun.

### 5.2 lib/icons.ts — UNUSED
- Centralized lucide re-exports (LayoutDashboard, Users, Building2, ClipboardCheck, DollarSign, Settings, Shield, chevrons, LogOut, HelpCircle, Mail, Calendar, Search, Filter, Download, Upload, Edit, Trash2, Plus, X, Check, TrendingUp/Down, AlertCircle, CheckCircle, XCircle, Info, Eye, EyeOff, Lock, Unlock, RefreshCw, Loader2, Printer) + `Icon` type. No file imports from it; every component imports lucide-react directly.

### 5.3 lib/labels.ts — heavily used (24 importers incl. all PDFs)
- Enum -> human label maps: salaryCategory (CENTRAL/STATE/SPECIALIZED), salarySubCategory (SKILLED/UNSKILLED/HIGHSKILLED/SEMISKILLED), status (ACTIVE/INACTIVE), gender, title (MR/MS), category (SC/ST/OBC/GENERAL), education (UNDER_8..POST_GRADUATE), salaryType (PER_DAY/PER_MONTH). Unknown values fall back to titleCase; null -> "-".
- `formatDate()` -> "02 Jul 2026" (en-IN, day 2-digit / month short / year numeric), "-" fallback.
- Redesign contract: raw backend enums must never surface in UI; badge/pill states listed above are the display vocabulary.

---

## 6. hooks/

### 6.1 hooks/use-auth.tsx — AuthProvider + useAuth (10 importers: both layouts, login, forgot-password, reset-password, settings/profile, settings/security, users/layout, mobile-nav, layout/sidebar)
- State: user, isLoading, isInitializing, isAuthenticated.
- Actions + their toasts (all via ui/use-toast, i.e. bottom-right Radix):
  - `login` -> push `/dashboard`; success toast "Login successful"/"Welcome back!"; failure "Login failed"/<api message> destructive.
  - `logout` -> push `/login`; "Logged out"/"You have been logged out successfully."; on API failure still clears tokens, pushes /login, toast "Error"/"Failed to logout properly." destructive.
  - `changePassword` -> "Password changed" / failure "Change password failed" destructive.
  - `forgotPassword` -> "Reset email sent"/"Check your email for password reset instructions." / failure destructive.
  - `resetPassword` -> "Password reset"/"...Please login with your new password."; errors intentionally NOT toasted here (component handles display); no auto-redirect.
  - `updateUser` -> "Profile updated" / "Update profile failed" destructive.
- Token invalidation clears localStorage accessToken/refreshToken. Services: `services/auth` (login, logout, getCurrentUser, changePassword, forgotPassword, resetPassword, updateUser, isAuthenticated).

### 6.2 hooks/use-client.ts (7 importers: attendance/records, attendance-reports, upload-attendance, calculate-payroll, client-reports, employee-reports, payroll-reports)
- Auto-fetches single client (`clientService.getClientById`) when clientId given, else all clients (`clientService.getClients({limit:1000})`).
- Exposes: client, clients, data, isLoading, isSaving, error, fetchClient, fetchClients, saveSalaryTemplateConfig (updateClient with salaryTemplates), updateClient, refreshClient, clearError, getEnabledFieldsCount, isSalaryTemplateConfigured, deprecated `saveTemplates` alias. No toasts (errors surfaced via `error` state).

### 6.3 hooks/use-dashboard.ts (1 importer: dashboard/page)
- Parallel fetch: `dashboardService.getDashboardReport(daysAhead=30)` + `clientService.getClientEmployeeCounts()`. Returns data, clientEmployeeCounts, loading, error (string), refetch(daysAhead?).

### 6.4 hooks/use-employee.ts — UNUSED (no importers)
- Full CRUD wrapper over employeeService (fetch/create/update/delete/deleteMultiple) with success/error toasts ("Employee created successfully", "Employees deleted successfully", etc.). Pages call employeeService directly instead. Dead code; its toast copy is NOT part of the live UI contract.

### 6.5 hooks/use-mobile.tsx (only importer: unused ui/sidebar) — `useIsMobile()`, breakpoint 768px. Effectively dead.

### 6.6 hooks/use-payroll.ts (1 importer: payroll/calculate-payroll)
- `usePayroll`: fetchClientDetails (extracts requiresAdminInput fields from client salary template mandatory/optional/custom fields into adminInputFields; error toast "Error"/"Failed to fetch client details"); calculatePayroll (`payrollService.calculatePayroll`; success toast "Payroll Calculated"/"Successfully calculated payroll for N employees."; failure "Calculation Failed" destructive); finalizePayroll (success "Payroll Finalized"/"Successfully finalized payroll for N employees."; failure "Finalization Failed" destructive); resetCalculation.
- `usePayrollAdminInputs`: per-employee per-field numeric input map, updateAdminInput, validateAdminInputs (negative-value check -> "Employee X: <label> cannot be negative"), resetInputs.

---

## 7. Hardcoded colors / theme-bypass hotspots in this layer

1. `components/ui/network-status.tsx` — `bg-red-500/20 text-red-500 border-red-500/20` (should be destructive tokens; component currently unmounted).
2. `components/ui/toast.tsx` (ToastClose, destructive) — `text-red-300`, `hover:text-red-50`, `focus:ring-red-400`, `focus:ring-offset-red-600`.
3. `components/ui/button.tsx` — `primary-dark` token; tailwind.config.js maps it to `hsl(var(--primary-dark))` in the main palette but also hardcodes `"primary-dark": "#8C1A1D"` in the sidebar color block.
4. Overlays: dialog, alert-dialog, sheet, drawer all use `bg-black/80` (stock shadcn, but not tokenized).
5. `components/ui/chart.tsx` — recharts attribute selectors on `#ccc`/`#fff`; inline `backgroundColor: item.color` legend swatches; inline CSS-var indicator colors.
6. `components/ui/loader.tsx` — inline `style={{ height }}` with broken default `"calc(100vh-200px)"` (missing spaces, invalid calc).
7. `components/ui/sidebar.tsx` — `shadow-[0_0_0_1px_hsl(var(--sidebar-border))]` arbitrary shadows (token-based but arbitrary values).
8. Related in globals.css (referenced by ui/table via `scrollbar-sleek`): custom utility classes `scrollbar-sleek`, `spotlight-card` (hardcoded `hsl(358 70% 42%)` spotlight), `glass`/`glass-strong`, `glow-btn`, `gradient-mesh`, `gradient-text`, `noise-overlay`, `fade-mask-x`, `badge-success/warning/info/danger`, legacy `.success/.warning/.info`, and legacy `craze-border-*` (fullscreen/teal/slate/rose/orange/indigo) with raw hex gradients (#8b5cf6, #0d9488, #475569, #e11d48, #ea580c, #4338ca, ...).

---

## 8. Keyboard shortcuts defined in this layer

- ui/sidebar.tsx: Cmd/Ctrl+B toggles sidebar — DEAD (component unused; the live layout sidebar is components/layout/sidebar.tsx).
- ui/carousel.tsx: ArrowLeft/ArrowRight — DEAD (unused).
- No live keyboard shortcuts are defined in components/ui/. (cmdk Command in payroll-reports gives standard listbox arrow-key navigation.)
