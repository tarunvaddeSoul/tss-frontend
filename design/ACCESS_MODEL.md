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

## Deferred (needs backend, noted for later)
- A dedicated invite endpoint would be cleaner than register + forgot-password (one request, no throwaway password, an "invited/pending" status until first login). Current approach works with existing endpoints.
- No hard-delete endpoint for users exists; deactivation is the intended "remove". Add `DELETE /users/:id` (ADMIN) if hard delete is ever needed.
- First-ever admin is created by the seed script; document that as the bootstrap step for a fresh deployment.
