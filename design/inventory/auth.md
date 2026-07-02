# Auth Pages Inventory

Scope: `app/(auth)/` (layout, loading, login, forgot-password), `app/users/` (layout, reset-password), plus supporting files `hooks/use-auth.tsx`, `components/ui/theme-toggle.tsx`, `components/ui/loader.tsx`, `services/auth.ts`, `services/token.ts`, `services/api.ts` (flow reference).

This is the redesign contract. Every numbered item must exist after the redesign.

---

## 0. Shared Auth Service Flows (reference, not a screen)

Files: `/Users/tarunvadde/Development/tss-frontend/services/auth.ts`, `/Users/tarunvadde/Development/tss-frontend/services/token.ts`, `/Users/tarunvadde/Development/tss-frontend/services/api.ts`, `/Users/tarunvadde/Development/tss-frontend/hooks/use-auth.tsx`

- Endpoints: `POST /users/login`, `POST /users/logout`, `GET /users/me`, `POST /users/refresh-token/:refreshToken`, `PUT /users/change-password`, `POST /users/forgot-password`, `PUT /users/reset-password`, `PUT /users/update/:userId`.
- Tokens stored in localStorage under keys `accessToken` and `refreshToken` (`services/token.ts`: `getAccessToken`, `getRefreshToken`, `setTokens`, `clearTokens`).
- `authService.login` stores both tokens on success. `authService.logout` posts refreshToken, always clears tokens even on API failure. `authService.isAuthenticated` = presence of `accessToken`.
- Token refresh (`services/api.ts` response interceptor): on 401 (non-auth, non-refresh request), sets `_retry`, queues concurrent requests while refreshing, calls `authService.refreshToken`, stores new tokens, replays the original request. On refresh failure: clears tokens, destructive toast "Authentication Failed" with API message, redirects to `/login` after 1s (1.5s when the refresh request itself 401s).
- Global interceptor toasts (fire on any page including auth pages, except auth endpoints which are excluded): "Could not save" (400/422), "Access Denied" (403), "Not Found" (404), "Server Error" (500), "Request Timed Out" (ECONNABORTED), "Network Error" (no response). All variant destructive.
- `useAuth` hook (AuthContext) exposes: `user`, `isLoading`, `isInitializing`, `isAuthenticated`, `login`, `logout`, `refreshUser`, `changePassword`, `forgotPassword`, `resetPassword`, `updateUser`.
- `useAuth` toasts (behavior contract):
  1. Login success: title "Login successful", description "Welcome back!", variant default; then `router.push("/dashboard")` (push happens before toast).
  2. Login failure: title "Login failed", description from `error.response.data.error.message` or fallback "Unable to login. Please try again.", destructive. (Login page ALSO renders an inline alert, so a failed login shows both toast and inline alert.)
  3. Logout success: title "Logged out", description "You have been logged out successfully."; redirects to `/login`.
  4. Logout failure: title "Error", description "Failed to logout properly.", destructive; still clears tokens and redirects to `/login`.
  5. Change password success: "Password changed" / "Your password has been changed successfully."
  6. Change password failure: "Change password failed" / error message, destructive.
  7. Forgot password success: "Reset email sent" / "Check your email for password reset instructions."
  8. Forgot password failure: "Forgot password failed" / error message, destructive.
  9. Reset password success: "Password reset" / "Your password has been reset successfully. Please login with your new password." (no auto-redirect from hook; component handles it).
  10. Reset password failure: NO toast from hook; component owns error display.
  11. Update profile success: "Profile updated" / "Your profile has been updated successfully."
  12. Update profile failure: "Update profile failed" / error message, destructive.
- On mount, AuthProvider fetches `/users/me` once (`getCurrentUser`); invalid token clears both localStorage keys silently.

---

## 1. Auth Layout (wraps /login and /forgot-password)

- Route: layout for route group `(auth)` (applies to `/login`, `/forgot-password`)
- File: `/Users/tarunvadde/Development/tss-frontend/app/(auth)/layout.tsx`

### Interactive inventory
1. ThemeToggle button (top-right, absolute `top-4 right-4 z-20`): outline icon button, opens dropdown. Icons Sun/Moon/Stars cross-fade by active theme; sr-only label "Toggle theme".
2. Dropdown item "Light" (Sun icon) sets theme light.
3. Dropdown item "Dark" (Moon icon) sets theme dark.
4. Dropdown item "System" (Stars icon) sets theme system.

### Data displayed
- Footer copyright: "(c) {current year} Tulsyan Security Services. All rights reserved." (computed via `new Date().getFullYear()`).
- No service calls of its own; AuthProvider fetch of `/users/me` via `authService.getCurrentUser` runs here.

### States
- Initializing (`isInitializing` true): full-screen centered pulsing Shield icon (`h-12 w-12 text-primary animate-pulse`) + text "Loading..." (`text-muted-foreground text-sm`) on gradient background.
- Logged-in guard: if `user` exists after init, `router.push("/dashboard")` (auth pages unreachable when authenticated).
- No error state (missing).

### Current styling
- Full-screen: `min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex flex-col items-center justify-center p-4`.
- Radial glow overlay: arbitrary-value class `bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_50%)]` on `absolute inset-0`.
- Content wrapper: framer-motion div (`initial={false}`, animate opacity/y, 0.5s), `z-10 w-full max-w-md relative`.
- Footer: `mt-8 text-center text-sm text-muted-foreground`.
- Icons: Shield (lucide). ThemeToggle uses Sun, Moon, Stars.

### Navigation
- Auto-redirect to `/dashboard` when authenticated. Children provide the rest.

---

## 2. Auth Loading Screen

- Route: suspense fallback for `(auth)` routes
- File: `/Users/tarunvadde/Development/tss-frontend/app/(auth)/loading.tsx`

### Interactive inventory
- None.

### Data displayed
- Loader component with text "Loading...", size lg (Loader2 icon `h-12 w-12 text-primary animate-spin`, text `text-muted-foreground text-base`).

### States
- This IS the loading state.

### Current styling
- `flex items-center justify-center h-screen bg-gradient-to-br from-background/90 to-background`.
- Icon: Loader2 (lucide).

### Navigation
- None.

---

## 3. Login Page

- Route: `/login`
- File: `/Users/tarunvadde/Development/tss-frontend/app/(auth)/login/page.tsx`

### Interactive inventory
1. Form field "Email": name `email`, text input, placeholder `your.email@example.com`, Mail icon absolutely positioned inside left (`pl-10` input). Zod validation: valid email, message "Please enter a valid email address". Inline FormMessage under field.
2. Form field "Password": name `password`, `type="password"`, placeholder `••••••••`, Lock icon inside left. Zod validation: min 6 chars ("Password must be at least 6 characters"), regex uppercase ("Password must contain at least one uppercase letter"), regex lowercase ("Password must contain at least one lowercase letter"), regex digit ("Password must contain at least one number"). NOTE: no max length here (reset page has max 20); no show/hide password toggle exists.
3. Link "Forgot password?" -> `/forgot-password` (right-aligned below password, `text-sm text-primary hover:text-primary/80`).
4. Button "Login": submit, full width, disabled while loading; loading state shows Loader2 spinner + "Logging in...".
5. Inline error Alert (destructive variant, AlertCircle icon) above fields, conditional on `error` state. Messages: 401 -> "Email or password is incorrect"; 429 -> "Too many attempts. Please wait a minute and try again"; no response -> "Cannot reach the server. Check your connection."; else API `message` or "Unable to login. Please try again.".
6. Toasts (via useAuth): success "Login successful" / "Welcome back!"; failure "Login failed" + message (shown alongside the inline alert).

### Data displayed
- Static branding only: Shield icon, title "Welcome Back", description "Enter your credentials to access your account". Submits via `useAuth().login` -> `authService.login` (`POST /users/login`), then `authService.getCurrentUser`.

### States
- Loading: button disabled + spinner + "Logging in..." label.
- Error: inline destructive alert + toast (both).
- Empty: n/a (form).
- Success: redirect to `/dashboard` + success toast.

### Current styling
- `Card` with `border shadow-lg`; CardHeader `space-y-1`; centered Shield in framer-motion div (scale/opacity, 0.5s); CardTitle `text-2xl font-bold text-center`; CardDescription centered.
- Form `space-y-4`; input icons `absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4`; inputs `pl-10`.
- All theme-token colors; no hardcoded palette classes on this page.
- Icons: Shield, Mail, Lock, Loader2, AlertCircle (lucide).

### Navigation
- To `/forgot-password` (link). To `/dashboard` (on success, via hook). Layout redirects here-away if already authenticated.

---

## 4. Forgot Password Page

- Route: `/forgot-password`
- File: `/Users/tarunvadde/Development/tss-frontend/app/(auth)/forgot-password/page.tsx`

### Interactive inventory
1. Form field "Email": name `email`, text input, placeholder `your.email@example.com`, Mail icon inside left. Zod: valid email, "Please enter a valid email address".
2. Button "Send Reset Link": submit, full width, disabled while loading; loading shows Loader2 spinner + "Sending...".
3. Button (outline, full width) "Back to Login" with ArrowLeft icon -> `/login` (form state, below submit).
4. Success state button (outline) "Back to Login" with ArrowLeft icon -> `/login`.
5. Toasts (via useAuth): success "Reset email sent" / "Check your email for password reset instructions."; failure "Forgot password failed" + message (destructive). Page itself shows NO inline error alert; failures are toast-only plus `console.error`.

### Data displayed
- Static: Shield icon, title "Forgot Password", description "Enter your email to receive a password reset link". Submits via `useAuth().forgotPassword` -> `authService.forgotPassword` (`POST /users/forgot-password`).

### States
- Loading: disabled button + spinner + "Sending...".
- Success: form replaced by animated success panel: heading "Reset Link Sent!", body "We've sent a password reset link to your email address. Please check your inbox and follow the instructions.", plus Back to Login button.
- Error: toast only (no inline alert, noted as missing).

### Current styling
- Same Card pattern as login (`border shadow-lg`, centered Shield with framer-motion scale-in `initial={{ scale: 0.8, opacity: 0 }}`).
- HARDCODED COLORS in success panel: `bg-green-500/10 text-green-500 p-4 rounded-lg border border-green-500/20` (bypasses theme tokens).
- Icons: Shield, Mail, ArrowLeft, Loader2 (lucide).

### Navigation
- To `/login` (both states). Success state stays on page until user clicks.

---

## 5. Users Layout (wraps /users/reset-password)

- Route: layout for `/users/*`
- File: `/Users/tarunvadde/Development/tss-frontend/app/users/layout.tsx`

### Interactive inventory
1. ThemeToggle button top-right (same 4 interactive elements as auth layout: trigger + Light/Dark/System items).

### Data displayed
- Footer copyright "(c) {year} Tulsyan Security Services. All rights reserved.".

### States
- No initializing guard and NO logged-in redirect (unlike the `(auth)` layout, a logged-in user can view reset-password). No loading.tsx for this segment.

### Current styling
- Identical shell to auth layout: gradient background, radial-glow arbitrary class `bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_50%)]`, `max-w-md` motion wrapper (this one animates from `opacity: 0, y: 20`, not `initial={false}`), footer `text-sm text-muted-foreground`.
- Imports Shield from lucide but does not render it (dead import).

### Navigation
- None of its own.

---

## 6. Reset Password Page

- Route: `/users/reset-password?token=<resetToken>` (token read from query string)
- File: `/Users/tarunvadde/Development/tss-frontend/app/users/reset-password/page.tsx`

### Interactive inventory
1. Form field "New Password": name `newPassword`, `type="password"`, placeholder `••••••••`, Lock icon inside left. Zod: min 6 ("Password must be at least 6 characters"), max 20 ("Password must be at most 20 characters"), uppercase regex, lowercase regex, digit regex (same messages as login). Helper text under field: "Must be 6-20 characters with uppercase, lowercase, and number" (`text-xs text-muted-foreground`).
2. Form field "Confirm Password": name `confirmPassword`, `type="password"`, placeholder `••••••••`, Lock icon. Zod refine: must equal newPassword, message "Passwords don't match" attached to confirmPassword.
3. Button "Reset Password": submit, full width, disabled while loading; loading shows Loader2 + "Resetting...".
4. Inline error Alert (destructive, AlertCircle) above fields when `error` set.
5. Success-state button "Go to Login" -> `/login` (default variant).
6. CardFooter link "Login" inside text "Remember your password? Login" -> `/login` (`text-primary hover:text-primary/80`).
7. CardFooter button (outline, full width) "Request New Reset Link" with ArrowLeft icon -> `/forgot-password`.
8. Missing-token screen button (outline, full width) "Back to Forgot Password" with ArrowLeft icon -> `/forgot-password`.
9. Toasts (component-fired on error): 401 -> title "Invalid Reset Link", description "This reset link has expired or is invalid. Please request a new password reset link."; 400 -> title "Validation Error", description = API message; other -> title "Reset Password Failed", description = API message or "Unable to reset password. Please try again.". All destructive, each mirrored by the inline alert. Success toast comes from useAuth: "Password reset" / "Your password has been reset successfully. Please login with your new password.".
10. Auto-redirect: 3 seconds after success, `router.push("/login")`.

### Data displayed
- Static: Shield icon, title "Reset Password", description "Enter your new password". Submits `{ resetToken, newPassword }` via `useAuth().resetPassword` -> `authService.resetPassword` (`PUT /users/reset-password`).
- Submitting with no token sets inline error "Invalid reset link. Please request a new password reset." (defensive; the no-token branch normally renders instead).

### States
- Missing token (no `?token=`): dedicated screen. Card with Shield, title "Invalid Reset Link", description "The password reset link is invalid or missing a token.", destructive alert with bold "Invalid Reset Link:" prefix and text "The password reset link is invalid or missing a token. Please request a new password reset.", and Back to Forgot Password button. No footer on this variant.
- Loading: disabled submit + spinner + "Resetting...".
- Error: inline destructive alert + matching toast.
- Success: form replaced by animated Alert: bold "Password Reset Successful!" + "Your password has been reset successfully. You will be redirected to the login page in a few seconds.", plus "Go to Login" button; auto-redirect after 3s. CardFooter remains visible.

### Current styling
- Card `w-full border shadow-lg`; same centered Shield motion intro; CardFooter `flex flex-col space-y-4 border-t`.
- HARDCODED COLORS in success alert: `bg-green-500/10 border-green-500/20`, icon `text-green-500`, description `text-green-500`.
- Icons: Shield, Lock, ArrowLeft, Loader2, AlertCircle (lucide).

### Navigation
- To `/login` (footer link, success button, 3s auto-redirect). To `/forgot-password` (footer button, missing-token button).

---

## Cross-cutting notes for the redesigner

- Both layouts share the same visual shell but differ: `(auth)` layout has the auth-guard redirect + init loading screen and `initial={false}` motion; `users` layout has neither guard nor loading and animates in from y=20. Keep both behaviors.
- Password rules are duplicated (login schema lacks the max-20 rule that reset has). Preserve as-is unless told otherwise.
- No show/hide password toggle anywhere; adding one would be new scope.
- The only theme-token violations in this scope are the green success treatments on forgot-password and reset-password (`green-500` family) and the arbitrary radial-gradient utility in both layouts (uses `hsl(var(--primary)/0.1)` so it tracks the theme, but is an arbitrary class).
- Dead import: `Shield` in `app/users/layout.tsx`.
- Toast system: `components/ui/use-toast` (shadcn). Every auth mutation has toast feedback; login and reset-password double up with inline alerts by design.
