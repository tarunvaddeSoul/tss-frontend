# ui-v2: The Register. Final summary

## Palette and rationale

Paper `#FAFAF9` / ink `#1B1B1D` / the exact logo red `#B42025` / uniform navy `#2E5375` / semantic green-amber, all shipped as HSL tokens with a complete dark "night watch" set. Rationale: TSSPL sells vigilance and compliance to government and enterprise buyers; its own artifacts are registers, musters, payslips and stamped certificates. The palette is the palette of those documents, with red used the way a rubber stamp uses red. Every shipped text pair was contrast-computed (ratios in DESIGN_SYSTEM.md); the logo red itself passes AA at body size (6.3:1), so brand color and accessible color are the same color.

## Type pairing

- Archivo (display, expanded width for headlines and key numerals): signage-lettering heritage; the voice of badges and public notices.
- Public Sans (body/UI): built for government digital services; the voice of compliance.
- IBM Plex Mono (data): serials, employee codes, currency, dates, and the registry eyebrows.

Same three families are embedded in every generated PDF (rupee glyph coverage verified in the shipped TTFs).

## Signature element

The registry line: a mono, uppercase, serial-numbered eyebrow with a hairline rule (`N° 03 · Payroll register`), used on every page header, landing section, PDF header and empty state. The numbering is real (sidebar order, section order). Status pills are stamps: mono uppercase, 2px radius, hairline semantic border. The landing hero renders the product's core artifact, a duty register, as the opening image.

## Before / after by major screen

- Landing: word-blur reveals, gradient text, glow buttons, spotlight cards and noise overlays replaced by a duty-register hero ("2,000 people on post. Every day."), serialized sections N° 01-08, a real certifications table, and an ink contact panel ("Put your premises on our register"). All 39 inventoried interactive elements preserved; copy rewritten, facts verbatim.
- Auth: floating shield icon and radial gradient replaced by a branded shell (logo, wordmark, red top rule) and registry-line cards; hardcoded green success panels became Alert success variants.
- Shell: card-toned sidebar with red filled active pills became a paper sidebar with mono section eyebrows and a red rule/tint active language; header slimmed; every page now opens with the PageHeader registry pattern.
- Dashboard home: purple-gradient h1, pink/amber gradient avatars, #8884d8 pies and the undefined security-card class are gone; stat figures in expanded Archivo, charts on the brand/info/neutral palette.
- Attendance: the mark-by-site wizard reads like a muster register (mono ordinals stepper, stamp marks, info-token tints); save is the module's one red button.
- Payroll: densest tables in the app now right-aligned mono numerals with ₹ formatting untouched; calculate/finalize are the red moments.
- Employees: 7-step wizard on the register stepper; personnel-file view with registry section headers; codes and dates in mono everywhere.
- Clients and Settings: same system, stamps for status, quiet hairline cards.
- PDFs: brand kit rebuilt (off-brand #D12702 replaced by the true logo red), same three typefaces embedded, registry headers, stamp tags, mono amounts; payslip and payroll-report proofs generated and inspected; grayscale-safe.

## Verification

Feature inventories for every route were written before any edit (design/inventory/) and each module was independently audited against them after migration: no lost elements, no rewired handlers. Typecheck and production build green at every commit; console clean; landing verified at 375/768/1440; reduced motion respected globally; dark mode complete.
