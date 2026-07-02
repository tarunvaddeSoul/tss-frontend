# Inner-page migration contract (Phase 3d)

Read DESIGN_SYSTEM.md first. This file is the mechanical contract for migrating a module's pages to the register system. HARD RULES:

1. **Zero behavioral change.** Only className, layout JSX, copy, and icon choices change. Every handler, prop, service call, state variable, route, dialog, toast trigger and keyboard shortcut stays byte-identical in behavior. If a redesign idea needs a behavior change, skip it and append a line to design/DEFERRED.md instead.
2. **No feature loss.** Before editing a file, list its interactive elements from the module inventory (design/inventory/<module>.md). After editing, re-verify each one exists and works. Table columns: same set, same order unless the inventory notes an explicit exception.
3. **No em dashes (—) or en dashes (–) anywhere.** Use periods, commas, colons, "·" separators, or hyphens.
4. **No new comments.** Do not add explanatory comments to code.
5. Match file idiom (client components, explicit return types where the file already has them).

## Page header pattern

Replace ad-hoc page title blocks with `PageHeader` from `@/components/layout/page-header`:

```tsx
<PageHeader
  no="03"                      // module register number, see table
  eyebrow="Payroll register"   // module noun phrase, sentence case
  title="Run Payroll"
  description="Calculate monthly payroll for a client site."
  actions={<><Button variant="outline"><Download /> Export</Button><Button><Plus /> Add employee</Button></>}
/>
```

Module numbers (sidebar order, real): 01 Dashboard · 02 Attendance · 03 Payroll · 04 Employees · 05 Clients · 06 Settings. Sub-pages reuse the module number (optionally "02.3" style if the page lists an explicit sequence).

## Color discipline

- NEVER raw palette classes (`green-500`, `red-500`, `purple-600`, `pink-500`, `amber-500`, `zinc-*`, gradients like `from-primary to-purple-600`). Replace with semantic tokens.
- Status colors: `success`, `warning`, `destructive`, `info` tokens or Badge variants.
- Red = `brand` tokens. Use it ONLY for: active nav, the module's single "money moment" button (`variant="brand"`: Generate payslips, Finalize payroll, Mark attendance save), key figures, stamps. Everything else stays ink/neutral.
- `text-primary` in old code usually meant red. Decide intent: accent red → `text-brand`; generic emphasis → `text-foreground`.
- Remove `security-card` class references (it is undefined CSS). Remove decorative gradient icon tiles; use plain lucide icon in a `bg-surface` tile or no tile.
- Recharts: series colors `hsl(var(--brand))`, `hsl(var(--info))`, then `hsl(var(--muted-foreground))`, `hsl(var(--warning))`, `hsl(var(--success))`. Grid/axis stroke `hsl(var(--border))` / tick fill `hsl(var(--muted-foreground))`. No `#8884d8`.

## Badges = stamps

Badge renders mono uppercase now. Map states: ACTIVE→`success`, INACTIVE/TERMINATED→`destructive`, pending/draft-in-progress→`warning`, informational/neutral→`info` or default, counts→default. Remove custom pill styling (`bg-green-100 text-green-800` etc.) in favor of variants.

## Tables

- Wrap tables in `<div className="rounded-md border">` if not already.
- Numeric cells: right-aligned, `font-mono text-[13px]`. Currency uses ₹ with `toLocaleString("en-IN")` exactly as before (do not change formatting logic).
- Codes, dates, phone numbers: `font-mono text-[13px]`.
- Entity name column: `font-medium`.
- Keep every column, sort, filter, pagination, row action.

## Forms

- Primitives already restyled; remove per-field custom classes that fight them.
- One primary action per form, labeled by what it does ("Save changes", "Create employee"), `variant="default"` (ink); cancel is `outline` or `ghost`.
- Multi-step wizards: stepper items = mono step ordinals (01, 02 ...) + label; current step `text-brand` + brand underline/rule; completed steps get a check and `text-success`; keep all step logic, error badges, draft-save behavior.

## Empty / error / loading states

- Empty: registry-line eyebrow ("No records on file"), one sentence of prose, then the primary action button. Never a bare "No data".
- Error: keep exact retry handlers; use Alert `destructive` variant or the existing error card pattern with precise message.
- Loading: Skeletons shaped like the final layout; `Loader` component for full-page.

## Motion

No new animations. Keep existing functional transitions. Remove decorative framer-motion wrappers (scale/fade-in-per-card) unless they communicate state; page content should not stagger-animate on every visit.
