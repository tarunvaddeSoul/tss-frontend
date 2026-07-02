# TSS Design System. "The Register"

One idea governs every surface: **a modern register**. TSSPL's business runs on registers. musters, payroll ledgers, certificates, stamped documents. The system renders that world with contemporary restraint: paper-neutral grounds, ink typography, hairline rules, serialized headers, tabular numerals, stamp-like status marks, and the logo's red used the way a rubber stamp uses red: sparingly and with authority.

## Color

Palette chosen from the business: the exact logo red (#B42025), ink and paper of documents, and a police-uniform navy as the informational counterpoint. All pairs below were computed against WCAG (script in repo history); ratios noted.

### Named values (light)

| Token | Hex | Role |
|---|---|---|
| paper (background) | `#FAFAF9` | page ground |
| surface | `#F1F1EF` | recessed panels, table headers |
| card | `#FFFFFF` | raised paper |
| ink (foreground) | `#1B1B1D` | text, primary buttons (16.5:1) |
| muted ink | `#5B5B60` | secondary text (6.5:1) |
| brand red | `#B42025` | accents, active states, destructive, key numbers (6.3:1 on paper; white-on-red 6.6:1) |
| navy | `#2E5375` | links, informational (7.7:1) |
| success | `#17693F` (text) | 6.4:1 |
| warning | `#8A5A00` (text) / `#B87700` (icons/large) | 5.7:1 / 3.5:1 |
| border (inputs) | `#8E8E93` | 3.1:1. meets non-text contrast |
| hairline | `#E4E4E1` | decorative rules only |

### Named values (dark. "night watch")

bg `#141416`, card `#1B1B1E`, fg `#EDEDEB` (15.7:1), muted `#9C9CA3` (6.7:1), red accent text `#DD5A60` (5.0:1), red fill `#C0393E` (white 5.4:1), navy `#7FA6C9` (7.2:1), success `#4CAF6E`, warning `#D99A2B`, input border `#6A6A72` (3.4:1), hairline `#26262A`.

**Light is the primary expression** (paper is the brand's material; the portal is used in daylight offices; the landing sells trust to conservative buyers). Dark mode is complete and first-class, not an afterthought.

Rules:
- Components reference semantic tokens (`bg-background`, `text-primary`, `border-input`), never raw hex.
- Primary action buttons are **ink-filled** (light) / **paper-filled** (dark). Red is *not* the default button color. red marks brand moments, active navigation, key figures, and destructive actions. This keeps a red destructive button unambiguous.
- Charts and stat surfaces use red + navy + neutrals only; semantic green/amber appear only as status.

## Typography

Typography carries the personality.

- **Display: Archivo** (variable; weights 500-800, expanded width 110-125 for headlines and key numbers). A grotesque descended from 19th-century industrial/signage lettering. the letterforms of badges and public notices. Used for headlines, page titles, stat numerals.
- **Body/UI: Public Sans**. designed for government digital services; civic, plain, excellent at small sizes. It *is* the typographic voice of compliance.
- **Data/mono: IBM Plex Mono**. serials, employee codes, currency amounts, dates in tables, the registry-line eyebrows.

Loading: `next/font/google` with `display: "swap"` and built-in fallback adjustment (no CLS). PDFs embed the same families as static TTFs registered with `@react-pdf/renderer` (public/fonts).

Scale (1.25 modular, rem): `0.6875 / 0.75 / 0.8125 / 0.875 (UI base) / 1 (body) / 1.25 / 1.5625 / 1.953 / 2.441 / 3.052 / 3.815`. Headlines: Archivo 600-700, tracking `-0.02em` to `-0.035em`. Registry eyebrows: mono 0.6875rem, tracking `+0.14em`, uppercase. Numerals in data contexts always `tabular-nums`.

## Layout, spacing, shape

- Spacing: 4px base scale (Tailwind default), card padding 20/24, section rhythm on landing 96-128px.
- Radius: `--radius: 6px` → lg 6 (cards/dialogs), md 4 (buttons/inputs), sm 2 (chips/stamps). Sharper than the old 8px; registers are rectilinear.
- Shadows: two only. `shadow-sm` equivalent for raised paper, one "document" shadow for overlays. Borders and rules do the work of depth.
- Dashboard grid: sidebar 264px (72px collapsed), content gutter 24px, max content width 1400px, page header pattern: registry line + Archivo title + actions right.
- Landing: max-w-7xl, 12-col mental grid, generous whitespace.

## Signature: the registry line

Every major surface carries a **registry line**: a mono, uppercase, letterspaced eyebrow with a serial ordinal and a hairline rule. e.g. `N° 03. PAYROLL REGISTER`. followed by the Archivo title. Page headers, landing sections, PDF headers, and empty states all use it. The numbering is real (section order, page order, document serial), never decorative. Status pills are **stamps**: uppercase mono, 2px radius, hairline border in the semantic color, tinted ground. The landing hero's thesis is a live-rendered register artifact (a payslip/muster document). the product's core artifact as the opening image.

Everything around the signature stays quiet: no gradients on text, no glows, no spotlight tricks, no noise overlays.

## Motion

Tokens: `--ease-out-brisk: cubic-bezier(0.22, 1, 0.36, 1)`; durations 150ms (micro), 200ms (default), 250ms (overlays). One orchestrated moment: the landing hero. the register artifact settles in and its rule draws across once. Everywhere else: consistent hover (background/border color only), focus (2px red ring, offset 2px, designed not removed), overlay fades. `prefers-reduced-motion: reduce` globally disables transforms/animations.

## Self-critique gate (answered before building)

*"Would I have produced this exact choice for a completely different product?"*

- Ink-filled buttons + neutral paper: yes, that alone is a default. which is why the system's identity does not rest on it; it rests on the registry line, the stamps, the mono serials, and the red-as-stamp discipline, none of which transfer to a generic SaaS.
- Archivo/Public Sans: chosen *because of* signage lettering and civic-services heritage respectively; for a consumer fintech I would not pick Public Sans.
- Initially considered a khaki/brass accent (uniform braid). dropped: it read as costume. Navy earns its place as the second institutional color (links/info) and survives grayscale.
- The hero artifact (rendered payslip) is specific to a business whose product ends in paper. It would be wrong for almost any other product. That is the point.
