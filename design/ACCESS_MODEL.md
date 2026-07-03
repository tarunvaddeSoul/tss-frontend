# Access model: how the internal team signs up and logs in

## Recommendation (implemented)

This is an internal operations portal, not a consumer app, so **there is no public self-signup** and there should not be. Anyone who could self-register could create an account that sees payroll, salaries, and employee PII. The right model for this kind of product is **admin-invite only**:

1. An existing admin opens **Settings → Users** (visible only to ADMIN) and clicks **Invite user**: name, email, mobile, role, department.
2. The backend creates the account with a random throwaway password (never shown to anyone), then emails the person a set-password link (the existing forgot/reset-password flow).
3. The invited person clicks the link, sets their own password, and logs in at `/login`. No password is ever typed by the admin or sent in plain text.
4. Admins manage the team from the same page: change role, deactivate (blocks login immediately), reactivate, or re-send the set-password link.

This keeps the landing page honest for the public (Staff Login is a quiet footer link, not a header CTA) while giving the team a real, safe onboarding path.

## Why not the alternatives

- **Public signup page:** unacceptable for a payroll/PII system.
- **Admin types a password and shares it:** passwords in chat/email, no forced rotation, poor audit. The invite+reset flow avoids handling passwords entirely.
- **Leave it API/Swagger only:** not operable by non-engineers; the office admin cannot onboard staff.

## What was built

**Backend (`ems-backend`, branch `feat/user-admin-endpoints`)**
- `GET /users` (ADMIN) — list all accounts with role, active status, department; passwords never returned.
- `PUT /users/update/:id` now accepts `isActive` (ADMIN only) in addition to the existing role/department/name/email/mobile it already supported.
- Login now rejects deactivated accounts with a clear message.

**Frontend (`tss-frontend`, branch `redesign/ui-v2`)**
- `Settings → Users` page (ADMIN-only nav): user table, Invite dialog, inline role change, deactivate/reactivate, re-send set-password link. Self-row role/deactivate are disabled so an admin can't lock themselves out.
- `services/userAdminService.ts` wraps list/invite/role/active/reset.
- Login schema relaxed to "password required" only; complexity rules stay on the set-password and reset-password forms where they belong.
- Landing page: Staff Login removed from the header and mobile menu; it remains a footer link.

## Production invite flow (implemented)
- Dedicated `POST /users/invite` (ADMIN): creates a **pending** account (`invitePending=true`) and emails a proper invite ("Set your password", 72h expiry) that is visually distinct from a password reset. Re-inviting a pending user re-issues the link; inviting an email that already belongs to an active account returns 409.
- Users list shows an **Invited** status (amber) until the person sets their password; setting it via the link flips `invitePending=false` and the row becomes Active. Row action is "Resend invite" while pending, "Reset link" once active.
- The set-password page reads `?invite=1` and switches copy to "Account activation / Set your password / Welcome to the TSS Ops Portal", and **clears any existing browser session on success** so the person always lands on a clean login instead of bouncing into whatever account the browser was already in.
- Deactivated accounts are refused at login with a clear message.

## Delete vs deactivate (both implemented)
- **Deactivate** is the everyday "remove": it blocks login but keeps the account and preserves the audit trail (payroll/attendance records carry loose `createdById`/`finalizedById`/`markedById` strings that would otherwise point at a missing user). Use it for real staff, offboarding, or temporary suspension. Reactivating restores access with the same password, no new link.
- **Delete** (`DELETE /users/:id`, ADMIN) permanently removes the account and its tokens. Guards: cannot delete yourself; cannot delete the last administrator (prevents org lockout). The confirm dialog steers admins to deactivate for anyone who has processed work, since the audit IDs are not FKs and would be orphaned. Delete is meant for mistaken invites, duplicates, and never-activated accounts.

## Still deferred
- First-ever admin is created by the seed script; document that as the bootstrap step for a fresh deployment.
- Audit fields (`createdById`, `finalizedById`, `markedById`) are loose strings, not FKs to User. If strict audit integrity is ever required, make them real relations with `onDelete: Restrict` so the DB itself blocks deleting a user with history (today the app-level confirm copy is the only guard).
