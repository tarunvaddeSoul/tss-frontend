# Design Brief. TSS Portal & Site

## What the product is

Two products share this codebase:

1. **A public company profile** (`/`) for Tulsyan Security Services Pvt. Ltd. (TSSPL), an Indore-based manpower and outsourcing company: security guards, housekeeping, solid waste management, facility management, meter reading, payroll consultancy. 2000+ deployed staff, ISO-certified, clients are municipal corporations, government departments, institutions (IIT Jodhpur, EPFO), hotels and enterprises (Aditya Birla, Vistara).
2. **An internal operations portal** (`/dashboard` and below) used by TSSPL's office staff to run the business: employee master data, site-wise attendance (musters), monthly payroll with statutory deductions (PF, ESIC, professional tax), client and rate management, and generated documents (payslips, payroll registers, attendance reports).

## The single most important job

- **Landing page:** convince a procurement officer or facility head that TSSPL is a disciplined, certified, government-grade contractor. The buying decision here is about *trust and compliance*, not innovation. Certifications, client roster, and scale are the proof; the page's job is to present them with authority.
- **Dashboard:** let a payroll/HR administrator get through high-volume, repetitive clerical work (mark attendance, run payroll, look up an employee) quickly and without errors. Density, legibility and unambiguous states matter more than delight.

## Three highest-traffic journeys (traced through code)

1. **Mark attendance by site**. `/attendance/mark-by-site` (daily): pick client site → month grid → mark/adjust days → save (`attendanceService`). Alternative: bulk Excel via `/attendance/upload`.
2. **Run payroll → payslip PDFs**. `/payroll/calculate` → review per-employee calculations → generate documents (`payrollService`, `components/payroll/pdf/*`). Monthly, business-critical, ends in a PDF a guard receives.
3. **Employee lifecycle**. `/employees` list → view/add/edit multi-step form (personal → statutory IDs → salary). Continuous onboarding/attrition at 2000+ headcount.

## First five seconds

A first-time visitor should feel: **institutional trust** and **order/discipline**. Justification: TSSPL sells vigilance and compliance to government and enterprise buyers. The company's own proof artifacts are ISO certificates, police verifications, and a decade of registers kept correctly. Nothing in the business argues for "playful" or "cutting-edge tech"; everything argues for "this firm keeps its books straight and its posts manned."

## The product's world (its real materials)

Muster rolls. Duty registers. Shift charts. ID badges and uniforms. Payslips. PF/ESIC challans. ISO certificates with serial numbers. Site logs, gate passes, verification stamps. The vocabulary is **sites, posts, shifts, deployment, musters, registers, rates, serials**. The logo itself is a vigilant eye.

Distinctive design therefore comes from **the register and the stamp**. the graphic language of official Indian institutional paperwork, executed with modern restraint. not from a SaaS mood board. This is the seed of the design system's signature (see DESIGN_SYSTEM.md: "the registry line").

## What the current design is, and why it changes

The current UI is a competent shadcn/Tailwind assembly with a red theme, but its expressive layer is template-grade: gradient text, glow buttons, spotlight-hover cards, word-by-word blur reveals, noise overlays, pill navigation. Those are the tells of assembled-not-designed. The redesign keeps the red (it is the logo's red, and it survives AA at body size), strips the generic effects, and rebuilds every surface on one idea the business actually owns: **the modern register**.
