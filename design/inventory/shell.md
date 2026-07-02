# Shell Inventory: Dashboard Layout, Sidebar, Header, Mobile Nav, Theme, Network Status

Scope files:
- `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/layout.tsx`
- `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/error.tsx`
- `/Users/tarunvadde/Development/tss-frontend/components/layout/sidebar.tsx`
- `/Users/tarunvadde/Development/tss-frontend/components/layout/header.tsx`
- `/Users/tarunvadde/Development/tss-frontend/components/layout/mobile-nav.tsx`
- `/Users/tarunvadde/Development/tss-frontend/components/theme-provider.tsx`
- `/Users/tarunvadde/Development/tss-frontend/components/ui/theme-toggle.tsx`
- `/Users/tarunvadde/Development/tss-frontend/components/ui/network-status.tsx`
- Supporting (followed imports): `/Users/tarunvadde/Development/tss-frontend/hooks/use-auth.tsx`, `/Users/tarunvadde/Development/tss-frontend/services/auth.ts`, `/Users/tarunvadde/Development/tss-frontend/app/layout.tsx` (root providers)

---

## 1. Dashboard Shell

**Route:** wraps every route under `app/(dashboard)/` (i.e. `/dashboard`, `/attendance/*`, `/payroll/*`, `/employees/*`, `/clients/*`, `/settings/*`).
**File:** `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/layout.tsx`

### Behavior
1. Wraps children in `AuthProvider` (from `hooks/use-auth.tsx`).
2. Auth guard: if `!isInitializing && !user`, `router.push("/login")`. Renders `null` while unauthenticated.
3. Layout: `<div class="flex h-screen overflow-hidden" data-dashboard-layout>` containing `<Sidebar />` + right column (`flex flex-col flex-1 overflow-hidden min-w-0 min-h-0`) with `<Header />` and `<main class="flex-1 overflow-y-auto overflow-x-hidden p-6 min-h-0">`.

### States
- Loading (auth initializing): full-screen centered plain text `Loading...` (`flex items-center justify-center h-screen`). No spinner/skeleton.
- Unauthenticated: renders `null` while redirecting to `/login`.
- Error state: none (auth failure silently clears tokens in the hook).

### Notes for redesign
- `data-dashboard-layout` attribute must survive (may be targeted by CSS/tests).
- Main content padding is `p-6` globally; pages rely on it.

---

## 2. Sidebar (desktop + built-in mobile sheet)

**File:** `/Users/tarunvadde/Development/tss-frontend/components/layout/sidebar.tsx`
Rendered by the dashboard layout. Desktop `<aside>` is `hidden lg:flex` (visible >= lg only).

### Full nav tree (source of truth: exported `navSections` / `navItems`, also consumed by mobile-nav.tsx)

Section 1 (no header):
1. **Dashboard** -> `/dashboard` (icon `LayoutDashboard`), no sub-items.

Section 2, header **"Everyday Work"**:
2. **Attendance** -> `/attendance` (icon `ClipboardCheck`), expandable with sub-items:
   - Mark by Site -> `/attendance/mark-by-site`
   - Upload Attendance -> `/attendance/upload`
   - Records -> `/attendance/records`
   - Reports -> `/attendance/reports`
3. **Payroll** -> `/payroll` (icon `DollarSign`), expandable with sub-items:
   - Run Payroll -> `/payroll/calculate`
   - Reports -> `/payroll/reports`

Section 3, header **"Master Data"**:
4. **Employees** -> `/employees` (icon `Users`), expandable with sub-items:
   - All Employees -> `/employees`
   - Add Employee -> `/employees/add`
   - Search Employees -> `/employees/advanced-search`
5. **Clients** -> `/clients` (icon `Building2`), expandable with sub-items:
   - All Clients -> `/clients`
   - Add Client -> `/clients/add`

Important: on desktop, parent items WITH sub-items are `<button>`s that only expand/collapse the sub-list (they do NOT navigate to the parent href). Only items without sub-items (Dashboard) are direct links. Parent hrefs (`/attendance`, `/payroll`, `/employees`, `/clients`) are reachable only via sub-items or the flat mobile-nav list.

### Interactive inventory (desktop sidebar)
1. **Logo block** (expanded): `Image /tss-logo.png` 32x32 + bold text "Tulsyan". Not a link. Hover scales logo (`group-hover:scale-105`).
2. **Logo (collapsed)**: logo only, with tooltip (side right): "Tulsyan Security" / "Services Pvt. Ltd." (`cursor-pointer` but no click action).
3. **Collapse toggle button**: ghost icon button, `ChevronLeft` icon, absolutely positioned on the sidebar edge (`absolute -right-3 top-8`, round, `bg-card border-2 shadow-lg`, rotates 180deg when collapsed). aria-label "Expand sidebar"/"Collapse sidebar". Toggles collapsed state; width animates `w-[280px]` <-> `w-[70px]`; state persisted in `localStorage["sidebar-collapsed"]`.
4. **Section headers**: expanded = uppercase label (`text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60`); collapsed = replaced by a divider line (`border-t border-border/60`).
5. **Nav parent buttons (with sub-items)**: h-10 rows, icon size 20 + title + `ChevronDown` (rotates 180deg when expanded). Active-but-collapsed-submenu style `bg-primary/10 text-primary`; otherwise `text-muted-foreground hover:bg-muted hover:text-foreground`. When sidebar collapsed: tooltip with title on right, and active indicator bar (`absolute left-0 w-1 h-6 bg-primary rounded-r-full`).
6. **Nav links (no sub-items)**: same row style; active = `bg-primary text-primary-foreground`; collapsed active indicator bar `bg-primary-foreground`.
7. **Sub-item links**: indented (`ml-4 pl-4 border-l border-border/50`), h-9, bullet dot (`h-1.5 w-1.5 rounded-full`, active `bg-primary`, inactive `bg-muted-foreground/30`, hover `bg-primary/50`), active row `bg-primary/10 text-primary font-medium`. Sub-list animates in (`animate-in slide-in-from-top-2`). Expand state auto-initializes from current pathname.
8. **Quick Actions block** (expanded only, above footer): `Zap` icon + label "Quick Actions"; button **"Keyboard Shortcuts"** (`Keyboard` icon, ghost, h-8 text-xs) -> opens Keyboard Shortcuts dialog.
9. **Settings link**: ghost button -> `/settings` (`Settings` icon). Collapsed: icon-only with right tooltip "Settings".
10. **Help button**: ghost button (`HelpCircle` icon) -> opens Help & Support dialog. Collapsed: icon-only with right tooltip "Help".
11. **User account trigger** (expanded): row with Avatar (`user.avatar` image, fallback = first letter of name or "U"), name (truncate), email (truncate, muted), `ChevronsUpDown` icon. Collapsed: avatar-only round button. Opens account dropdown.
12. **Account dropdown menu** (side top, align start, w-56):
    - Label: user name + email (non-interactive).
    - **My Profile** -> `/settings/profile` (`User` icon).
    - **Password** -> `/settings/security` (`Shield` icon).
    - Separator.
    - **Log out** (`LogOut` icon, `text-destructive`) -> opens Logout confirmation dialog.

### Dialogs (rendered by Sidebar, shared by both desktop and its mobile sheet)
13. **Help & Support dialog** (`sm:max-w-md`): title "Help & Support", description "Need assistance with TSS? Contact our support team for help."; shows "Contact Email:" with `Mail` icon + `vaddeofficial@gmail.com` in a `bg-muted` box; full-width button **"Send Email"** (`Mail` icon) -> `window.location.href = "mailto:vaddeofficial@gmail.com?subject=TSS Support Request"`.
14. **Keyboard Shortcuts dialog** (`sm:max-w-md`): title "Keyboard Shortcuts" with `Keyboard` icon, description "Use these shortcuts to navigate faster". Two rows in `bg-muted/50` boxes with outline `Badge` keycaps (platform-aware Cmd vs Ctrl via `navigator.platform`):
    - "Toggle Sidebar" (`Command` icon): Cmd/Ctrl + B
    - "Show Shortcuts" (`Zap` icon): Cmd/Ctrl + Shift + K
15. **Logout confirmation dialog** (`sm:max-w-sm`): title "Log out?", description "You will need to sign in again to access the portal." Buttons: **Cancel** (outline) and **Log out** (destructive, `LogOut` icon) -> calls `logout()` from `useAuth`.

### Keyboard shortcuts (global window listeners)
- **Cmd/Ctrl + B**: toggle sidebar collapsed.
- **Cmd/Ctrl + Shift + K**: open Keyboard Shortcuts dialog.

### Sidebar's own mobile sheet (DEAD UI, currently unreachable)
`MobileSidebar` (Sheet, side left, `w-[280px] p-0`) is rendered but has **no SheetTrigger**; `mobileOpen` is never set to true from anywhere. The exported `MobileMenuToggle` component (Menu/X icons) is never imported by any other file and its state is local to itself anyway. Contents (would-be): logo + "Tulsyan" SheetTitle header; user card (avatar/name/email); flat `navItems` list with expandable sub-items (bullet `bg-current`); footer: Settings -> `/settings/profile` (note: differs from desktop which goes to `/settings`), Help (dialog), **Logout** (destructive, calls `logout()` DIRECTLY, no confirmation). The live mobile nav is `MobileNav` in the header (section 4). Redesign decision needed: keep one mobile nav; do not lose the Help entry point on mobile if the sidebar sheet is dropped (current live MobileNav has no Help item).

### Data displayed
- `user.name`, `user.email`, `user.avatar` from `useAuth()` -> `authService.getCurrentUser()` (`/Users/tarunvadde/Development/tss-frontend/services/auth.ts`). User type also has `id, mobileNumber, role (HR|OPERATIONS|ACCOUNTS|FIELD|ADMIN|USER), departmentId, createdAt` (not shown in shell).

### States
- No loading/empty/error states of its own (auth handled by layout). If `user` is null the account block simply doesn't render.

### Current styling
- Container: `bg-card text-card-foreground border-r`, `transition-all duration-300`, `h-screen`, widths hardcoded `w-[280px]` / `w-[70px]` (arbitrary values). Header row `h-16 px-4 border-b`.
- Theme tokens used throughout (`bg-primary`, `bg-muted`, `text-muted-foreground`, `border-border`, `text-destructive`). No hex colors, no inline styles.
- Arbitrary-value classes: `w-[280px]`, `w-[70px]`, `text-[11px]`, `-right-3`.
- Animations: tailwindcss-animate (`animate-in slide-in-from-top-2`), scale hovers (`hover:scale-110 active:scale-95`), rotate transforms on chevrons.
- Icons (lucide): LayoutDashboard, Users, Building2, ClipboardCheck, DollarSign, ChevronDown, ChevronsUpDown, LogOut, Settings, HelpCircle, Mail, Menu, X, ChevronLeft, Zap, Keyboard, Command, User, Shield. (`ChevronRight` imported but unused.)
- UI primitives: Button, ScrollArea, Avatar, Tooltip, Dialog, DropdownMenu, Badge, Sheet.
- Exports: `navSections`, `navItems`, `useSidebarContext` (SidebarContext provides `collapsed/setCollapsed/toggleCollapsed` to descendants; keep the export, pages/components may consume it).

### Navigation summary (from sidebar)
`/dashboard`, `/attendance/mark-by-site`, `/attendance/upload`, `/attendance/records`, `/attendance/reports`, `/payroll/calculate`, `/payroll/reports`, `/employees`, `/employees/add`, `/employees/advanced-search`, `/clients`, `/clients/add`, `/settings`, `/settings/profile`, `/settings/security`, `/login` (after logout), `mailto:vaddeofficial@gmail.com`.

---

## 3. Header

**File:** `/Users/tarunvadde/Development/tss-frontend/components/layout/header.tsx`

### Interactive inventory
1. **MobileNav hamburger** (mobile only, `lg:hidden`): see section 4.
2. Static text logo **"TSS"** next to hamburger (mobile only, `font-semibold text-lg`, not a link).
3. **ThemeToggle** (always, right-aligned): see section 5.

That is the entire header: no search, no notifications, no breadcrumbs, no page title, no user menu (user menu lives in the sidebar footer). Desktop left side is an empty spacer div.

### Breadcrumbs
**None anywhere in the shell or app pages.** `components/ui/breadcrumb.tsx` exists (shadcn primitive) but is not imported by any page. Not a lost feature if omitted; flag as intentionally absent.

### Styling
- `border-b bg-card shrink-0 z-40`, inner row `flex h-16 items-center px-4 justify-between`. All theme tokens.

### States
- None (purely presentational).

---

## 4. MobileNav (the live mobile navigation)

**File:** `/Users/tarunvadde/Development/tss-frontend/components/layout/mobile-nav.tsx`
Rendered inside Header; visible below `lg` only.

### Interactive inventory
1. **Trigger button**: ghost icon Button, `Menu` icon (h-5 w-5), aria-label "Open navigation menu", `lg:hidden`.
2. **Sheet** (side left, `w-72 p-0 flex flex-col`): header with SheetTitle **"Tulsyan Security"** in `text-primary`.
3. **Nav list** (ScrollArea, `navItems` imported from sidebar.tsx): for EVERY item a parent `Link` to its href (unlike desktop, parents WITH sub-items ARE links here, so `/attendance`, `/payroll`, `/employees`, `/clients` index pages are reachable). Active state (`pathname === href || startsWith(href + "/")`): `bg-primary text-primary-foreground`; inactive: `hover:bg-muted`. Each link closes the sheet on click.
4. **Sub-item links**: always visible (no expand/collapse), indented `ml-9`, active = `text-primary font-medium`, inactive = `text-muted-foreground hover:text-foreground`. Close sheet on click.
5. **Settings link**: footer, `Settings` icon -> `/settings`, closes sheet.
6. **User info row** (non-interactive): Avatar (fallback initial only; no AvatarImage here even if `user.avatar` exists), name + email truncated.
7. **Log out button**: `LogOut` icon, `text-destructive hover:bg-destructive/10` -> opens confirmation dialog.
8. **Logout confirmation dialog** (`sm:max-w-sm`): title "Log out?", description "You will need to sign in again to access the portal." Buttons: **Cancel** (outline), **Log out** (destructive, `LogOut` icon) -> closes both dialog and sheet, calls `logout()`.

Missing vs desktop sidebar: no Help entry, no My Profile / Password links, no keyboard-shortcuts access, no theme of its own (ThemeToggle is adjacent in header).

### Data displayed
- `user.name`, `user.email` via `useAuth()`.

### Styling
- All theme tokens; icons: Menu, LogOut, Settings. Primitives: Sheet, Dialog, Button, Avatar, ScrollArea.

---

## 5. ThemeToggle

**File:** `/Users/tarunvadde/Development/tss-frontend/components/ui/theme-toggle.tsx`
Used in: dashboard Header, `/Users/tarunvadde/Development/tss-frontend/app/(auth)/layout.tsx`, `/Users/tarunvadde/Development/tss-frontend/app/users/layout.tsx`.

### Interactive inventory
1. **Trigger**: outline icon Button, `border-primary/20 bg-background hover:bg-accent`, stacked animated icons (opacity/rotate/scale transitions, `h-[1.2rem] w-[1.2rem]` absolute): `Sun` (light), `Moon` (dark), `Stars` (system). sr-only label "Toggle theme". Icons render only after mount (hydration guard), so the button is briefly empty on first paint.
2. **Dropdown (align end)** with three items, each icon + label, `cursor-pointer`:
   - **Light** (`Sun`) -> `setTheme("light")`
   - **Dark** (`Moon`) -> `setTheme("dark")`
   - **System** (`Stars`) -> `setTheme("system")`

### Inconsistency to resolve in redesign
Root layout mounts ThemeProvider with `enableSystem={false}` and `defaultTheme="light"`, yet the toggle offers a "System" option. Preserve all three options or consciously reconcile.

---

## 6. ThemeProvider

**File:** `/Users/tarunvadde/Development/tss-frontend/components/theme-provider.tsx`
Mounted in root layout `/Users/tarunvadde/Development/tss-frontend/app/layout.tsx` with `attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange`.

### Behavior
1. Wraps `next-themes` ThemeProvider.
2. **Forces `light` theme when `pathname === "/"`** (public landing page always light); all other routes honor the stored user theme. This rule must survive the redesign.

### Root layout context (for completeness)
- Fonts: Inter as `--font-sans`, Space Grotesk as `--font-display` (weights 400-700); body class `font-sans`.
- Two toast systems mounted globally: shadcn `<Toaster />` (used by `use-toast` in auth flows/network status) AND Sonner `<SonnerToaster position="top-right" richColors closeButton />`. Both are in active use; keep both or migrate all callers.
- Metadata: title "Tulsyan Security Services", favicon `/tss-logo.png`.
- `<html suppressHydrationWarning>`.

---

## 7. NetworkStatus

**File:** `/Users/tarunvadde/Development/tss-frontend/components/ui/network-status.tsx`

### Status: ORPHANED. Not imported/rendered anywhere in the app right now.
If the redesign wants offline indication, this component exists but must be mounted (e.g. in root or dashboard layout) to function.

### Inventory (as implemented)
1. **Offline pill**: fixed `bottom-4 right-4 z-50`, `WifiOff` icon + text "Offline", rounded-full, `shadow-lg backdrop-blur-sm`. Hidden entirely while online.
2. **Toast on offline** (`window "offline"` event, via `use-toast`, destructive variant): title "Connection Lost", description "You're currently offline. Some features may be unavailable."
3. **Toast on reconnect** (`window "online"` event, default variant): title "Connection Restored", description "You're back online."

### Hardcoded styling (bypasses theme tokens)
- `bg-red-500/20 text-red-500 border border-red-500/20` on the pill. Should map to destructive tokens in redesign.

---

## 8. Auth context toasts (shell-level UX, `hooks/use-auth.tsx`)

All via shadcn `use-toast`; triggered from shell actions (logout) and auth pages. Service calls in `/Users/tarunvadde/Development/tss-frontend/services/auth.ts`: `login`, `logout`, `getCurrentUser`, `refreshToken`, `changePassword`, `forgotPassword`, `resetPassword`, `updateUser`.

1. Login success: "Login successful" / "Welcome back!" (then `router.push("/dashboard")`).
2. Login failure (destructive): "Login failed" / server message or "Unable to login. Please try again."
3. Logout success: "Logged out" / "You have been logged out successfully." (then `router.push("/login")`).
4. Logout failure (destructive, still clears tokens and redirects): "Error" / "Failed to logout properly."
5. Change password success: "Password changed" / "Your password has been changed successfully."
6. Change password failure (destructive): "Change password failed" / error message.
7. Forgot password success: "Reset email sent" / "Check your email for password reset instructions."
8. Forgot password failure (destructive): "Forgot password failed" / error message.
9. Reset password success: "Password reset" / "Your password has been reset successfully. Please login with your new password." (errors intentionally delegated to the page component).
10. Update profile success: "Profile updated" / "Your profile has been updated successfully."
11. Update profile failure (destructive): "Update profile failed" / error message.

---

## Cross-cutting redesign contract checklist

- [ ] 5 top-level nav items, 11 sub-items, 3 sections with 2 labeled headers ("Everyday Work", "Master Data"): exact hrefs above.
- [ ] Sidebar collapse with persistence (`localStorage["sidebar-collapsed"]`), Cmd/Ctrl+B shortcut, collapsed tooltips, collapsed active-indicator bars.
- [ ] Keyboard Shortcuts dialog + Cmd/Ctrl+Shift+K, platform-aware keycap badges.
- [ ] Help & Support dialog with mailto `vaddeofficial@gmail.com?subject=TSS Support Request`.
- [ ] Logout always behind a confirmation dialog (desktop dropdown and MobileNav both confirm; the dead sidebar mobile sheet did not).
- [ ] Account dropdown: My Profile (`/settings/profile`), Password (`/settings/security`), Log out.
- [ ] ThemeToggle with Light/Dark/System on dashboard header, auth layout, users layout; landing page forced light.
- [ ] Auth guard + "Loading..." state + redirect to `/login` in dashboard layout.
- [ ] Both toasters (shadcn + Sonner top-right richColors closeButton) unless callers migrated.
- [ ] Decide fate of orphans: `MobileSidebar`/`MobileMenuToggle` in sidebar.tsx (dead), `NetworkStatus` (unmounted), unused `ChevronRight` import, `enableSystem={false}` vs System option.
- [ ] No breadcrumbs exist today; adding them is net-new, omitting them loses nothing.

---

## Dashboard route-group error boundary

**File:** `/Users/tarunvadde/Development/tss-frontend/app/(dashboard)/error.tsx` (client)

Catches render errors for every route under `app/(dashboard)/` and renders INSIDE the shell (sidebar and header stay mounted). The global `app/error.tsx` (see landing.md section 3) covers everything else.

- Wrapper: `flex items-center justify-center p-4 bg-background text-foreground` with inline `style={{ minHeight: "calc(100vh - 200px)" }}` (vs `min-h-screen` on the global one).
- Card `w-full max-w-md rounded-2xl shadow-xl overflow-hidden` with an absolute `bg-gradient-to-br from-primary/10 to-transparent` overlay.
- Header: centered circle tile (h-12 w-12 rounded-full `bg-primary/10`) with `AlertTriangle` (h-6 w-6 `text-primary`); CardTitle "Something went wrong" (text-2xl bold, centered); CardDescription "This page could not be loaded. Please try again." (differs from the global boundary's copy).
- Content: error-message panel `bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20 overflow-auto max-h-32`, `font-mono text-sm`, fallback "Unknown error".
- Footer (`border-t`, centered): Button "Try again" (`RefreshCw` icon) -> `reset()`.
- `useEffect` logs the error to console. Icons: AlertTriangle, RefreshCw.
