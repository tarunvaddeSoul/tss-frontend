# Inventory: Public Landing Page + Root App Shell

Scope: `app/page.tsx`, `app/layout.tsx`, `app/error.tsx`, `app/loading.tsx` (+ imported components `components/ui/loader.tsx`, `components/theme-provider.tsx`, custom utility classes from `app/globals.css`).

---

## 1. Landing Page

- **Route:** `/`
- **File:** `/Users/tarunvadde/Development/tss-frontend/app/page.tsx` (client component, 898 lines)
- **Purpose:** Public marketing site for Tulsyan Security Services Pvt. Ltd. (TSS). Entirely static content from an in-file `companyData` object. No service calls.

### Section order (top to bottom)

1. Lightbox overlay (conditional, `AnimatePresence`)
2. Scroll progress bar (fixed 2px `bg-primary` bar at top, `useScroll` + `useSpring` scaleX)
3. Fixed Header (transparent -> `glass-strong` after 40px scroll)
4. Mobile menu full-screen overlay (conditional)
5. `<main>`:
   1. **Hero** (`id="home"`) with animated headline, badge, 2 CTAs, parallax bg image, and a bottom **Stats Strip** (4 animated counters)
   2. **Clients Marquee** (13 client logos, infinite scroll)
   3. **About** (`id="about"`) with advantages checklist, group-firm figures, training image + floating quote card
   4. **Services** (`id="services"`) with 6 SpotlightCard service cards
   5. **Gallery** (`id="gallery"`) bento grid of 6 clickable images
   6. **Certifications** (5 ISO cards + government-certification callout; no anchor id)
   7. **CSR & Media** ("Warning Call" film feature + 4 media-coverage thumbnails + awards card; no anchor id)
   8. **Leadership** (2 director cards; no anchor id)
   9. **Contact** (`id="contact"`, primary-red section: contact channel cards + white "Our Presence" card)
6. Footer

### Interactive inventory

**Header (fixed, all breakpoints)**
1. Logo link: TSS logo image + full company name text -> `href="/"`. Logo shrinks (w-8/9 -> w-7) and name text shrinks on scroll.
2. Desktop nav pill (hidden below `lg`): 5 anchor links "Home" `#home`, "About" `#about`, "Services" `#services`, "Gallery" `#gallery`, "Contact" `#contact`. Rounded-full pill container `bg-background/50 backdrop-blur-xl border border-border/30`.
3. Button "Staff Login" (outline, rounded-full, hidden below `lg`) -> `href="/login"`.
4. Button "Get a Quote" with `ArrowUpRight` icon (`glow-btn`, `bg-primary text-white hover:bg-primary-dark`, hidden below `lg`) -> `href="#contact"`.
5. Mobile hamburger button (`Menu` icon, visible below `lg`) -> opens mobile menu overlay; sets `document.body.style.overflow = "hidden"` while open.

**Mobile menu (full-screen overlay, `z-[60]`, `bg-background/98 backdrop-blur-2xl`)**
6. Logo link (logo + short name "TSS") -> `href="/"`, closes menu.
7. Close button (`X` icon) -> closes menu.
8. 5 nav links (same anchors as desktop) each with trailing `ChevronRight` icon; staggered fade-up animation; each closes menu on click.
9. Static phone row: `Phone` icon + "0731-4098357" (display only, NOT a `tel:` link).
10. Button "Get a Quote" with `ArrowRight` icon -> `#contact`, closes menu.
11. Button "Staff Login" (outline) -> `/login`, closes menu.

**Hero (`#home`)**
12. Badge (non-interactive): `Sparkles` icon + "Trusted since 2013" (outline variant, `border-primary/20 bg-primary/5 text-primary`, rounded-full).
13. Animated headline "Empowering Your Growth." with word-by-word blur/fade reveal; the word "Growth." uses `gradient-text`.
14. Subheading paragraph (decade of Manpower/Outsourcing, Smart Cities, Renewable Energy, Civil Services).
15. Button "Partner With Us" with `ArrowRight` icon (`glow-btn`, primary) -> `href="#contact"`.
16. Button "Explore Services" (outline) -> `href="#services"`.
17. Parallax background image (`/slideshow/security-guards.png`, opacity-30, translates 0->150px on scroll) + `gradient-mesh` overlay + vertical background gradient.
18. Stats strip (bottom-pinned, `bg-background/60 backdrop-blur-xl border-t`): 4 items, each icon-in-tile + animated `Counter` (requestAnimationFrame ease-out cubic count-up, 1400ms, `toLocaleString("en-IN")`):
    - `Clock` "Years of Excellence" 10+
    - `Users` "Employees Deployed" 2000+ (renders "2,000+")
    - `MapPin` "Cities Covered" 15+
    - `Star` "Client Retention" 98%

**Clients marquee**
19. Label "Trusted by industry leaders" (centered, uppercase micro-label).
20. Infinite left-scrolling `Marquee` (framer-motion, speed 50s per loop, content quadrupled: 2 motion tracks x 2 copies) inside `fade-mask-x` edge fade. 13 logo tiles, each `bg-white border shadow-sm`, `grayscale opacity-70` -> full color/opacity on hover. Not clickable. Logos (src -> alt): aditya-birla.png "Aditya Birla Group", ashoka-hotel.png "Ashoka Hotel", brilliant-convention-centre.png "Brilliant Convention Centre", electricity-department.png "Electricity Department", epfo.png "EPFO", franklin.png "Franklin", hotwax-systems.png "HotWax Systems", iit-jodhpur.png "IIT Jodhpur", municipal_corp.png "Municipal Corporation", nvda.png "NVDA", parishad-mhow.png "Nagar Parishad Mhow", prestige.png "Prestige", vistara.png "Vistara".

**About (`#about`)**
21. SectionTag "About Tulsyan Group"; H2 "Diverse Portfolio. / Unified Excellence." (second line muted).
22. Paragraph about 10+ years growth; inline figures row: "6 Group Firms", "6 Key Sectors", "7 Branch Offices" (bold numbers).
23. 4 advantage chips (2-col grid), each `CheckCircle` icon + text: "Zero investment on machines", "Total security solutions", "Less administrative burden", "Healthy & hygienic environment".
24. Training image `/training/training-1.png` (aspect-video, rounded-2xl) with floating quote card (`Quote` icon + italic quote "Excellence isn't just a goal, it's an ongoing journey of creating lasting satisfaction.") offset bottom-left.

**Services (`#services`)**
25. SectionTag "Our Expertise"; H2 "Comprehensive Solutions"; right-aligned intro paragraph.
26. 6 `SpotlightCard` cards (mouse-tracked radial glow via `--spotlight-x/y` CSS vars; hover border/shadow). Each: 16/10 image (hover scale-105), icon tile top-right (`bg-white/85` blur), title (hover -> primary), description. NOT clickable/linked. Cards:
    1. "Security Services" - `Shield` - `/slideshow/security-guards.png`
    2. "Facility Management" - `Building2` - `/petrol-pump/petrol-pump.png`
    3. "Solid Waste Mgmt" - `Leaf` - `/slideshow/waste-management.png`
    4. "Housekeeping" - `HomeIcon` (aliased HomeIconLucide) - `/slideshow/before-and-after.png`
    5. "Payroll & HR" - `Users` - `/security-guards/security-guards-1.png`
    6. "O&M Management" - `Settings` - `/slideshow/traffic-management.png`

**Gallery (`#gallery`) - bento grid**
27. SectionTag "Our Work"; H2 "Operational Excellence"; intro paragraph.
28. 6 clickable image tiles (2/4-col bento, fixed row heights 130/160/180/210px by breakpoint), each opens Lightbox. Hover: card scale 0.985, image scale-110, gradient darkens, `Maximize2` pill appears top-right. Category micro-label always visible; alt title shown when `showLabel`. Grid placement:
    - `/slideshow/security-guards.png` "Security Team" / Security (2x2, labeled)
    - `/slideshow/waste-management.png` "Waste Management" / Services (1x1)
    - `/training/training.png` "Staff Training" / Training (1x2, labeled)
    - `/slideshow/traffic-management.png` "Traffic Control" / Security (1x1)
    - `/slideshow/image 1.png` "Facility Services" / Services (2x1, labeled)
    - `/petrol-pump/petrol-pump.png` "Petrol Pump Mgmt" / Operations (2x1, labeled)

**Lightbox (modal, `z-[100]`)**
29. Trigger: any gallery tile, the movie feature, media thumbnails, or awards card. Contents: full image (`object-contain`, max-w-5xl, aspect-video), category label (uppercase, `text-primary-light`) + title over bottom black gradient.
30. Close paths: click backdrop (`bg-black/90 backdrop-blur-xl`, `cursor-zoom-out`), X button (top-right, `bg-black/60` circle, hover `bg-primary`), **Escape key** (window keydown listener). Inner click stopPropagation. Spring scale-in animation.

**Certifications section**
31. Left: 2-col grid of 5 certification cards (last card spans 2 cols when odd count). Each: `Award` icon in green tile (`bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400`), name, scope:
    - ISO 18788:2015 - Private Security Operations
    - ISO 14001:2015 - Environmental Management
    - ISO 45001:2018 - Occupational Health & Safety
    - ISO/IEC 27001:2022 - Information Security
    - ISO 30409:2026 - Human Resource Management
32. Right: SectionTag "Certifications"; H2 "Certified for Quality and Safety"; paragraph; callout card with `Shield` icon: "Also certified by government bodies" / "CRISIL rated, Police and BCAS verified."
33. Note: text-only; images in `/public/certifications/` are NOT used here.

**CSR & Media section**
34. Centered header: SectionTag "Social Responsibility"; H2 "Impact Beyond Business"; paragraph.
35. Movie feature card (lg:col-span-3, h-380/440, clickable) -> opens Lightbox with `{src: "/movie-on-social-issues/warning-call.png", alt: "Warning Call", category: "Social Film"}`. Overlay text: red "SOCIAL FILM" label (`text-red-300`), title ""Warning Call"", description (`text-zinc-200`). Hover: image scale, `Maximize2` pill.
36. "Media Coverage" heading + 2x2 grid of first 4 of 5 media images (`/media-coverage/image.png`, `image 1.png`, `image 2.png`, `image 3.png`; `image 4.png` is in data but sliced off). Each clickable -> Lightbox `{alt: "Media Coverage", category: "Media"}`.
37. Awards `SpotlightCard` (clickable) -> Lightbox `{src: "/awards/image.png", alt: "Awards & Recognition", category: "Awards"}`. `Trophy` icon tile (scales on hover), "Award Winning Service" + description.

**Leadership section**
38. Centered SectionTag "Leadership"; H2 "Visionary Leadership".
39. 2 director cards (3/4 aspect portrait, bottom gradient overlay): name, uppercase designation (`text-primary-light`), bio revealed on hover (opacity 0 -> 100):
    - Kshitiz Tulsyan, Director, `/directors/kshitiz.jpg`, "Leading the strategic expansion into diverse sectors."
    - Anubhav Tulsyan, Director, `/directors/anubhav.jpg`, "Driving operational excellence and innovation."

**Contact (`#contact`, `bg-primary text-white`)**
40. Decorative blurred orbs (white/6 and black/8 circles).
41. Label "Get in Touch"; H2 "Ready to Upgrade / Your Operations?"; paragraph.
42. 2 static contact cards (`bg-white/[0.08]` glass rows, NOT links): `Phone` "Call Us" 0731-4098357; `Mail` "Email Us" info@tulsyans.com. (Second phone "9993997072" exists in data but is only shown here as index [0]; it is never rendered anywhere.)
43. White card "Our Presence": 7 branch chips (Bhopal, Jodhpur, Ahmedabad, Dewas, Dhar, Pithampur, Kota); Head Office block with `MapPin` icon + address "24 A, Chandra Nagar, MR 9 Road, Indore, MP - 452010".
44. Button "Contact Support" with `ArrowRight` icon -> `<a href="mailto:info@tulsyans.com">` (only real external action on the page).

**Footer**
45. Logo (w-5) + copyright "© {currentYear} Tulsyan Security Services Pvt. Ltd." (year from `new Date().getFullYear()`).
46. Link "Contact" -> `#contact`.
47. Link "Staff Login" -> `/login`.

**Global page behaviors**
48. Scroll progress bar (item 2 above).
49. Scroll listener (passive) toggles `scrolled` state at 40px for header restyle.
50. Body scroll lock while mobile menu open.
51. `Reveal` wrapper: every section animates in via `useInView` (once, -60px margin, fade + 36px rise).
52. Keyboard shortcut: **Escape** closes Lightbox (the only keyboard shortcut).

### Data displayed

All from the hardcoded `companyData` constant inside `app/page.tsx` (lines 38-140): company identity (name/shortName/founded/tagline - tagline "Manpower. Machines. Material. Methods." is defined but NOT rendered), 4 stats, 6 specializations, 4 advantages, 2 leaders, 5 certifications, 13 clients, 5 media images (4 rendered), contactInfo (address, 2 phones - 1 rendered, email, 7 branches), 6 gallery images. **No calls to `/services`** - the redesign has zero data-fetching to preserve on this page, but every literal above must survive.

### States

- Loading: none on the page itself (static). Route-level fallback is `app/loading.tsx` (see below).
- Empty: N/A (static data).
- Error: none page-specific; global `app/error.tsx` boundary applies.

### Current styling

- Layout: `min-h-screen bg-background font-sans text-foreground overflow-x-hidden`; sections use `max-w-7xl mx-auto px-4 md:px-8`, `py-20 md:py-32`; alternating `bg-background` / `bg-muted/20` section backgrounds; heavy framer-motion (useScroll, useSpring, useTransform, useInView, AnimatePresence, Variants: `fadeUp`, `staggerContainer`, `wordReveal`).
- Custom CSS classes (defined in `app/globals.css` @layer utilities): `noise-overlay` (SVG grain ::after), `spotlight-card` (mouse-tracked radial glow, hardcoded `hsl(358 70% 42% / 0.06)`), `glow-btn` (blurred gradient halo on hover, hardcoded 358-hue hsl values), `gradient-mesh` (3 radial gradients incl. hardcoded blue `hsl(218 83% 56%)`), `gradient-text` (hardcoded red gradient `hsl(358...)/hsl(0 70% 55%)`), `fade-mask-x` (marquee edge mask), `glass` / `glass-strong` (backdrop-blur header). Non-token CSS vars used: `--primary-dark`, `--primary-light`, `--font-display` (Space Grotesk), `--spotlight-x/y` set via inline `el.style.setProperty`.
- Hardcoded colors bypassing theme tokens: `bg-black/90`, `bg-black/60`, `bg-black/0`, `bg-white`, `bg-white/85`, `bg-white/15`, `bg-white/10`, `bg-white/[0.08]`, `bg-white/[0.06]`, `bg-black/[0.08]`, `text-white`, `text-white/40-70`, `text-zinc-200`, `text-red-300`, `bg-green-50 dark:bg-green-900/20`, `text-green-600 dark:text-green-400`, many `from-black/x` gradient overlays, `bg-primary/8` (non-standard opacity step), hex-free but hsl-hardcoded values in globals.css utilities, `::selection` hardcoded `hsl(358 70% 42%)`.
- Suspicious Tailwind: `duration-400`, `duration-600`, `transition-transform duration-600` (non-default durations; no-ops unless configured), dozens of arbitrary values (`text-[13px]`, `text-[11px]`, `tracking-[0.18em]`, `z-[100]`, `z-[60]`, `auto-rows-[130px]`...).
- Icons (lucide-react): Shield, Users, Clock, Award, Phone, Mail, MapPin, CheckCircle, Menu, X, ArrowRight, Quote, Leaf, Building2, Home (as HomeIconLucide), Settings, Trophy, ChevronRight, Star, Maximize2, ArrowUpRight, Sparkles.
- Known code smell: `Lightbox` calls `useEffect` AFTER an early `return null` (conditional hook, works only because mount/unmount is controlled by `AnimatePresence`).

### Navigation from this page

- In-page anchors: `#home`, `#about`, `#services`, `#gallery`, `#contact` (header nav, mobile menu, hero CTAs, footer).
- `/login` (header, mobile menu, footer: "Staff Login").
- `/` (logo links).
- `mailto:info@tulsyans.com` (Contact Support button).
- No other routes reachable.

---

## 2. Root Layout

- **Route:** wraps all routes
- **File:** `/Users/tarunvadde/Development/tss-frontend/app/layout.tsx`
- Fonts: Inter (`--font-sans`) + Space Grotesk 400/500/600/700 (`--font-display`) via `next/font/google`; body class `font-sans`.
- Metadata: title "Tulsyan Security Services", description "Security management system for Tulsyan Security Services", favicon `/tss-logo.png`.
- `ThemeProvider` (`components/theme-provider.tsx`): wraps next-themes with `attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange`; **forces light theme on `/` only** (pathname check), all other routes keep user theme. Must be preserved in redesign.
- Two toast systems mounted globally: shadcn `<Toaster />` (`components/ui/toaster`) AND sonner `<SonnerToaster position="top-right" richColors closeButton />`. No toasts fire on the landing page itself.
- `suppressHydrationWarning` on `<html lang="en">`.

## 3. Global Error Boundary

- **Route:** any route error
- **File:** `/Users/tarunvadde/Development/tss-frontend/app/error.tsx` (client)
- Centered max-w-md Card on `bg-background`: gradient overlay `from-primary/10`, `AlertTriangle` icon in `bg-primary/10` circle, title "Something went wrong", description "The page could not be loaded. Please try again.", error message box (`bg-destructive/10 text-destructive border-destructive/20`, mono, max-h-32 scroll, fallback text "Unknown error"), footer Button "Try again" with `RefreshCw` icon -> calls `reset()`. Also `console.error(error)` on mount.

## 4. Global Loading

- **Route:** any route suspense fallback
- **File:** `/Users/tarunvadde/Development/tss-frontend/app/loading.tsx`
- Full-screen centered `<Loader size="lg" />` from `components/ui/loader.tsx`: `Loader2` lucide spinner (h-12 w-12, `text-primary animate-spin`), no text. (Loader component also exports `InlineLoader` and `ButtonLoader` variants and supports `text`, `fullPage`, `height` props used elsewhere in the app.)

---

## Public assets referenced (by these files)

- Logo: `/tss-logo.png` (header, mobile menu, footer, favicon)
- Slideshow: `/slideshow/security-guards.png` (hero bg + service + gallery), `/slideshow/waste-management.png`, `/slideshow/traffic-management.png`, `/slideshow/before-and-after.png`, `/slideshow/image 1.png`
- Petrol pump: `/petrol-pump/petrol-pump.png`
- Security guards: `/security-guards/security-guards-1.png`
- Training: `/training/training.png`, `/training/training-1.png`
- Directors: `/directors/kshitiz.jpg`, `/directors/anubhav.jpg`
- Clients (13): `/clients/aditya-birla.png`, `ashoka-hotel.png`, `brilliant-convention-centre.png`, `electricity-department.png`, `epfo.png`, `franklin.png`, `hotwax-systems.png`, `iit-jodhpur.png`, `municipal_corp.png`, `nvda.png`, `parishad-mhow.png`, `prestige.png`, `vistara.png`
- Media coverage: `/media-coverage/image.png`, `image 1.png`, `image 2.png`, `image 3.png` rendered; `image 4.png` listed in data but sliced off by `.slice(0, 4)`
- Movie: `/movie-on-social-issues/warning-call.png`
- Awards: `/awards/image.png`
- Unreferenced by these files (exist in `/public` but unused here): `certifications/*`, `waste-management/*`, `fonts/*`, `directors/anubhav-old.png`, `movie-on-social-issues/on-news.png`, `security-guards/security-guards.png`, `slideshow/security-guards-1.png`, `slideshow/waste-management-news.png`.
