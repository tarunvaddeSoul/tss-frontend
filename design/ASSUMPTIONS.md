# Assumptions

- `redesign/ui-v2` branches from `feat/online-portal-data-migration` (11 commits ahead of `main`), because the newest feature work (payroll PDFs, attendance redesign) only exists there. Rebasing onto `main` would redesign stale screens.
- Light mode is the brand's primary expression; dark mode ships complete (see DESIGN_SYSTEM.md rationale).
- The existing `brand.*` Tailwind color aliases and `craze-border-*` legacy CSS classes are presentation-layer dead weight; they are removed only where verified unused (grep before delete). Behavior unaffected.
- Landing page copy is rewritten (the task explicitly allows it) but every fact (stats, certifications, clients, contacts, branches) is preserved verbatim from `companyData`.
- Sonner + Radix toast both remain wired as today (both are mounted in root layout); only their styling changes.
- Web fonts move from Inter/Space Grotesk to Archivo/Public Sans/IBM Plex Mono via `next/font/google`. same loading mechanism, no new runtime dependency. PDF fonts embed static TTFs placed in `public/fonts` (OFL-licensed).
- The keyboard shortcuts (Cmd+B sidebar, Cmd+Shift+K shortcuts dialog) are behavior and are preserved exactly.
- `next lint` was never configured in this repo (running it prompts for first-time ESLint setup). The redesign gates on typecheck + production build; introducing an ESLint config is out of scope.
- Status badge variants were remapped to the new semantic stamps everywhere (ACTIVE -> success, INACTIVE/TERMINATED -> destructive, pending -> warning). Trigger conditions and label text are unchanged; only the color language moved.
- The temporary QA harness `app/design-preview/` was used for authed-shell and PDF visual verification and is deleted from the final branch state.
