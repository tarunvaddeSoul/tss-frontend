"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Phone,
  Mail,
  MapPin,
  Check,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Maximize2,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef, type ReactNode } from "react"
import {
  motion,
  useScroll,
  useSpring,
  useInView,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion"

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const companyData = {
  name: "Tulsyan Security Services Pvt. Ltd.",
  shortName: "TSS",
  fullName: "Tulsyan Security Services Pvt. Ltd.",
  founded: 2013,
  headOffice: "Indore, Madhya Pradesh",
  employees: "2000+",
  tagline: "Manpower. Machines. Material. Methods.",
  stats: [
    { label: "Years of Excellence", value: 10, suffix: "+" },
    { label: "Employees Deployed", value: 2000, suffix: "+" },
    { label: "Cities Covered", value: 15, suffix: "+" },
    { label: "Client Retention", value: 98, suffix: "%" },
  ],
  specializations: [
    {
      title: "Security Services",
      description: "Total security solutions with zero machine investment. Expertly trained personnel for all sectors.",
      image: "/slideshow/security-guards.png",
    },
    {
      title: "Facility Management",
      description: "Complete facility management for total peace of mind. We handle the details so you focus on business.",
      image: "/petrol-pump/petrol-pump.png",
    },
    {
      title: "Solid Waste Mgmt",
      description: "Comprehensive waste management solutions ensuring a healthy and compliant environment.",
      image: "/slideshow/waste-management.png",
    },
    {
      title: "Housekeeping",
      description: "Professional cleaning services creating hygienic environments for corporate and industrial spaces.",
      image: "/slideshow/before-and-after.png",
    },
    {
      title: "Payroll & HR",
      description: "Payroll management and consultancy reducing administrative burden and ensuring compliance.",
      image: "/security-guards/security-guards-1.png",
    },
    {
      title: "O&M Management",
      description: "Electrical and mechanical operations, maintenance management and allied services.",
      image: "/slideshow/traffic-management.png",
    },
  ],
  advantages: [
    "Zero investment on machines",
    "Total security solutions",
    "Less administrative burden",
    "Healthy & hygienic environment",
  ],
  leadership: [
    { name: "Kshitiz Tulsyan", designation: "Director", image: "/directors/kshitiz.jpg", bio: "Leading the strategic expansion into diverse sectors." },
    { name: "Anubhav Tulsyan", designation: "Director", image: "/directors/anubhav.jpg", bio: "Driving operational excellence and innovation." },
  ],
  certifications: [
    { name: "ISO 18788:2015", scope: "Private Security Operations" },
    { name: "ISO 14001:2015", scope: "Environmental Management" },
    { name: "ISO 45001:2018", scope: "Occupational Health & Safety" },
    { name: "ISO/IEC 27001:2022", scope: "Information Security" },
    { name: "ISO 30409:2026", scope: "Human Resource Management" },
  ],
  clients: [
    { src: "/clients/aditya-birla.png", name: "Aditya Birla Group" },
    { src: "/clients/ashoka-hotel.png", name: "Ashoka Hotel" },
    { src: "/clients/brilliant-convention-centre.png", name: "Brilliant Convention Centre" },
    { src: "/clients/electricity-department.png", name: "Electricity Department" },
    { src: "/clients/epfo.png", name: "EPFO" },
    { src: "/clients/franklin.png", name: "Franklin" },
    { src: "/clients/hotwax-systems.png", name: "HotWax Systems" },
    { src: "/clients/iit-jodhpur.png", name: "IIT Jodhpur" },
    { src: "/clients/municipal_corp.png", name: "Municipal Corporation" },
    { src: "/clients/nvda.png", name: "NVDA" },
    { src: "/clients/parishad-mhow.png", name: "Nagar Parishad Mhow" },
    { src: "/clients/prestige.png", name: "Prestige" },
    { src: "/clients/vistara.png", name: "Vistara" },
  ],
  media: [
    "/media-coverage/image.png", "/media-coverage/image 1.png",
    "/media-coverage/image 2.png", "/media-coverage/image 3.png", "/media-coverage/image 4.png",
  ],
  contactInfo: {
    address: "24 A, Chandra Nagar, MR 9 Road, Indore, MP - 452010",
    phone: ["0731-4098357", "9993997072"],
    email: "info@tulsyans.com",
    branches: ["Bhopal", "Jodhpur", "Ahmedabad", "Dewas", "Dhar", "Pithampur", "Kota"],
  },
  galleryImages: [
    { src: "/slideshow/security-guards.png", alt: "Security Team", category: "Security" },
    { src: "/slideshow/waste-management.png", alt: "Waste Management", category: "Services" },
    { src: "/slideshow/traffic-management.png", alt: "Traffic Control", category: "Security" },
    { src: "/training/training.png", alt: "Staff Training", category: "Training" },
    { src: "/slideshow/image 1.png", alt: "Facility Services", category: "Services" },
    { src: "/petrol-pump/petrol-pump.png", alt: "Petrol Pump Mgmt", category: "Operations" },
  ],
}

type GalleryImage = { src: string; alt: string; category: string }

/* ═══════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════ */

function Counter({ value, suffix }: { value: number; suffix: string }): ReactNode {
  const [display, setDisplay] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setDisplay(value)
      return
    }
    let raf = 0
    let startTime = 0
    const duration = 1400
    const step = (now: number): void => {
      if (!startTime) startTime = now
      const p = Math.min(1, (now - startTime) / duration)
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, reduced])

  return <span className="nums">{display.toLocaleString("en-IN")}{suffix}</span>
}

function Reveal({ children, className = "", delay = 0 }: {
  children: ReactNode; className?: string; delay?: number
}): ReactNode {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Registry line: the system's signature section header. Numbering is real section order. */
function SectionHead({ no, title, children }: { no: string; title: string; children?: ReactNode }): ReactNode {
  return (
    <div className="mb-10 md:mb-14">
      <div className="registry-line mb-3">
        <span className="registry-eyebrow"><strong>N° {no}</strong> · {title}</span>
      </div>
      {children}
    </div>
  )
}

function Marquee({ children, speed = 35, className = "" }: { children: ReactNode; speed?: number; className?: string }): ReactNode {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={`flex gap-10 md:gap-14 items-center overflow-x-auto scrollbar-sleek ${className}`}>{children}</div>
  }
  return (
    <div className={`flex overflow-hidden ${className}`}>
      {[0, 1].map((k) => (
        <motion.div
          key={k}
          className="flex flex-shrink-0 gap-10 md:gap-14 items-center"
          initial={{ x: 0 }}
          animate={{ x: "-100%" }}
          transition={{ ease: "linear", duration: speed, repeat: Infinity }}
        >
          {children}
          {children}
        </motion.div>
      ))}
    </div>
  )
}

function Lightbox({ image, onClose }: { image: GalleryImage; onClose: () => void }): ReactNode {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-5xl max-h-[85vh] aspect-video overflow-hidden rounded-md border border-white/10 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-contain bg-black" />
        <button
          onClick={onClose}
          aria-label="Close image"
          className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-sm hover:bg-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/80 to-transparent text-white pointer-events-none">
          <span className="registry-eyebrow !text-white/60">{image.category}</span>
          <h3 className="text-lg md:text-xl font-semibold font-display">{image.alt}</h3>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   HERO ARTIFACT: the duty register
   ═══════════════════════════════════════════ */

const registerRows = [
  { site: "Smart City Project", detail: "Security · Housekeeping", status: "COVERED" },
  { site: "University Campus", detail: "Security · 3 shifts", status: "COVERED" },
  { site: "Convention Centre", detail: "Facility Management", status: "ON DUTY" },
  { site: "Power Distribution", detail: "Meter Reading · Billing", status: "ON DUTY" },
  { site: "Municipal Zone", detail: "Solid Waste Management", status: "COVERED" },
]

function DutyRegister(): ReactNode {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-md"
      aria-hidden="true"
    >
      <div className="rounded-md border border-border bg-card shadow-[0_16px_40px_-16px_rgba(27,27,29,0.18)]">
        {/* document head */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Image src="/tss-logo.png" alt="" width={22} height={22} className="object-contain" />
            <div>
              <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-foreground">DUTY REGISTER</div>
              <div className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground">TSS · HEAD OFFICE · INDORE</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground">SHIFT</div>
            <div className="font-mono text-[11px] font-semibold text-foreground">DAY · 08:00-20:00</div>
          </div>
        </div>

        {/* rows */}
        <div>
          {registerRows.map((row, i) => (
            <motion.div
              key={row.site}
              initial={reduced ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.55 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate text-[13px] font-medium text-foreground">{row.site}</span>
                </div>
                <div className="pl-[26px] text-[11px] text-muted-foreground">{row.detail}</div>
              </div>
              <span className={`stamp ${row.status === "ON DUTY" ? "border-brand/40 bg-brand/[0.06] text-brand" : "border-success/40 bg-success/[0.06] text-success"}`}>
                {row.status}
              </span>
            </motion.div>
          ))}
        </div>

        {/* document foot: the red seal */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
          <div className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
            ALL POSTS ACCOUNTED FOR
          </div>
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 1.3, rotate: -14 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ duration: 0.35, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
            className="stamp border-brand text-brand"
          >
            <ShieldCheck className="h-3 w-3" /> Verified
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   BENTO GALLERY
   ═══════════════════════════════════════════ */

function BentoGallery({ onImageClick }: { onImageClick: (img: GalleryImage) => void }): ReactNode {
  const images = companyData.galleryImages

  const GalleryItem = ({ img, showLabel = false }: { img: GalleryImage; showLabel?: boolean }): ReactNode => (
    <button
      type="button"
      className="group relative h-full w-full overflow-hidden rounded-md border border-border text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={() => onImageClick(img)}
      aria-label={`View ${img.alt}`}
    >
      <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
      <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 text-white">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white/70">{img.category}</span>
        {showLabel && <h3 className="text-sm md:text-base font-semibold font-display leading-tight">{img.alt}</h3>}
      </div>
      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-white/15 backdrop-blur-md p-1.5 rounded-sm text-white"><Maximize2 className="h-3.5 w-3.5" /></div>
      </div>
    </button>
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 auto-rows-[130px] sm:auto-rows-[160px] md:auto-rows-[180px] lg:auto-rows-[210px]">
      <div className="col-span-2 row-span-2"><GalleryItem img={images[0]} showLabel /></div>
      <div className="col-span-1 row-span-1"><GalleryItem img={images[1]} /></div>
      <div className="col-span-1 row-span-2"><GalleryItem img={images[3]} showLabel /></div>
      <div className="col-span-1 row-span-1"><GalleryItem img={images[2]} /></div>
      <div className="col-span-2 row-span-1"><GalleryItem img={images[4]} showLabel /></div>
      <div className="col-span-2 row-span-1"><GalleryItem img={images[5]} showLabel /></div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function HomePage(): ReactNode {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  const navItems = ["Home", "About", "Services", "Gallery", "Contact"]

  useEffect(() => {
    const h = (): void => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", h, { passive: true })
    return () => window.removeEventListener("scroll", h)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden">
      <AnimatePresence>
        {selectedImage && <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />}
      </AnimatePresence>

      {/* Scroll progress: the page's ruler */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-brand z-[100] origin-left" style={{ scaleX }} />

      {/* ────────────────── HEADER ────────────────── */}
      <header className={`fixed top-0 left-0 z-50 w-full transition-all duration-200 ${
        scrolled ? "bg-background/95 backdrop-blur-sm border-b border-border py-2.5" : "bg-transparent py-4 md:py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className={`relative transition-all duration-200 ${scrolled ? "w-7 h-7" : "w-8 h-8 md:w-9 md:h-9"}`}>
              <Image src="/tss-logo.png" alt="TSS" fill sizes="36px" className="object-contain" priority />
            </div>
            <span className="hidden sm:block leading-tight">
              <span className="block font-display font-bold text-sm tracking-tight">Tulsyan Security Services</span>
              <span className="block font-mono text-[9px] tracking-[0.18em] uppercase text-muted-foreground">Pvt. Ltd. · Est. 2013</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 underline-offset-8 decoration-brand decoration-2 hover:underline"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="brand" size="sm" className="hidden lg:inline-flex">
              <Link href="#contact">Get a Quote <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
            </Button>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ────────────────── MOBILE MENU ────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background">
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-10">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="relative w-7 h-7"><Image src="/tss-logo.png" alt="TSS" fill sizes="28px" className="object-contain" /></div>
                  <span className="font-display font-bold text-sm">{companyData.shortName}</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-accent rounded-md transition-colors" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col flex-1">
                {navItems.map((item, i) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between border-b border-border py-4 text-xl font-display font-semibold hover:text-brand transition-colors"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      {item}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </nav>

              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {companyData.contactInfo.phone[0]}
                </div>
                <Button asChild variant="brand" className="w-full h-11">
                  <Link href="#contact" onClick={() => setMobileMenuOpen(false)}>Get a Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* ────────────────── HERO ────────────────── */}
        <section id="home" className="relative flex min-h-screen flex-col justify-center overflow-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 pt-32 pb-40 md:px-8 md:pt-36 md:pb-48">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
              <div>
                <Reveal>
                  <div className="registry-line mb-6 max-w-md">
                    <span className="registry-eyebrow"><strong>Est. {companyData.founded}</strong> · Indore, Madhya Pradesh</span>
                  </div>
                </Reveal>

                <Reveal delay={0.08}>
                  <h1 className="font-display font-bold font-expanded text-[2.6rem] leading-[1.04] tracking-[-0.02em] sm:text-5xl md:text-6xl lg:text-[4.2rem] mb-6">
                    2,000 people<br />on post.<br />
                    <span className="text-brand">Every day.</span>
                  </h1>
                </Reveal>

                <Reveal delay={0.16}>
                  <p className="mb-9 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
                    Tulsyan Security Services keeps premises guarded, facilities running and payrolls
                    compliant for governments, institutions and enterprises, and has for over a decade.
                  </p>
                </Reveal>

                <Reveal delay={0.24}>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button size="lg" variant="brand" asChild>
                      <Link href="#contact">Get a quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="#services">Explore services</Link>
                    </Button>
                  </div>
                </Reveal>
              </div>

              <div className="flex justify-center lg:justify-end">
                <DutyRegister />
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="absolute bottom-0 z-10 w-full border-t border-border bg-background/90 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-6">
              <div className="grid grid-cols-2 gap-y-5 gap-x-6 md:grid-cols-4 md:gap-8">
                {companyData.stats.map((s, i) => (
                  <div key={i}>
                    <div className="font-display font-expanded text-2xl font-bold leading-none text-foreground md:text-[1.75rem]">
                      <Counter value={s.value} suffix={s.suffix} />
                    </div>
                    <div className="mt-1.5 font-mono text-[10px] font-medium uppercase leading-tight tracking-[0.14em] text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────── N° 01 · CLIENTS ────────────────── */}
        <section className="border-b border-border py-14 md:py-16 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="registry-line mb-8">
              <span className="registry-eyebrow"><strong>N° 01</strong> · Clients on record</span>
            </div>
          </div>
          <div className="fade-mask-x">
            <Marquee speed={50} className="py-2">
              {companyData.clients.map((c, i) => (
                <div key={i} className="relative h-14 w-28 flex-shrink-0 rounded-md border border-border bg-white p-2.5 opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 md:h-16 md:w-36 md:p-3">
                  <Image src={c.src} alt={c.name} fill sizes="144px" className="object-contain p-1" />
                </div>
              ))}
            </Marquee>
          </div>
        </section>

        {/* ────────────────── N° 02 · ABOUT ────────────────── */}
        <section id="about" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHead no="02" title="The firm" />
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <Reveal>
                  <h2 className="mb-6 font-display text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
                    A decade of keeping order.
                  </h2>
                  <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                    Since 2013 the Tulsyan Group has grown steadily in manpower and outsourcing:
                    guarding sites, running facilities and managing payrolls. Today it also works in
                    smart city projects, renewable energy and civil services.
                  </p>
                  <p className="mb-8 font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
                    {companyData.tagline}
                  </p>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="mb-8 flex flex-wrap gap-x-8 gap-y-2 border-y border-border py-4">
                    {[["6", "Group firms"], ["6", "Key sectors"], ["7", "Branch offices"]].map(([n, label]) => (
                      <div key={label} className="flex items-baseline gap-2">
                        <span className="font-display font-expanded text-xl font-bold nums">{n}</span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>

                <Reveal delay={0.18}>
                  <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {companyData.advantages.map((adv, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-[13px] font-medium">
                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-brand" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>

              <div className="lg:col-span-5">
                <Reveal delay={0.12}>
                  <div className="relative aspect-video overflow-hidden rounded-md border border-border">
                    <Image src="/training/training-1.png" alt="Tulsyan Security Services staff at a training session" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
                  </div>
                  <blockquote className="mt-5 border-l-2 border-brand pl-4">
                    <p className="text-sm font-medium leading-relaxed text-foreground">
                      &ldquo;Excellence isn&apos;t just a goal, it&apos;s an ongoing journey of creating lasting satisfaction.&rdquo;
                    </p>
                  </blockquote>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────── N° 03 · SERVICES ────────────────── */}
        <section id="services" className="border-t border-border bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHead no="03" title="Areas of specialization">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <h2 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">Complete solutions.</h2>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-right">
                  Manpower, machines, material and methods. One contractor, the whole job.
                </p>
              </div>
            </SectionHead>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
              {companyData.specializations.map((svc, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="group h-full overflow-hidden rounded-md border border-border bg-card transition-colors duration-200 hover:border-foreground/25">
                    <div className="relative aspect-[16/10] overflow-hidden border-b border-border">
                      <Image src={svc.image} alt={svc.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-baseline gap-2.5">
                        <span className="font-mono text-[11px] font-semibold text-brand">{String(i + 1).padStart(2, "0")}</span>
                        <h4 className="font-display text-[15px] font-semibold tracking-[-0.01em]">{svc.title}</h4>
                      </div>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">{svc.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────── N° 04 · GALLERY ────────────────── */}
        <section id="gallery" className="border-t border-border py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHead no="04" title="Field record">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <h2 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">The work, on the ground.</h2>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Teams on duty across sectors: security, sanitation, training and operations.
                </p>
              </div>
            </SectionHead>
            <Reveal delay={0.08}>
              <BentoGallery onImageClick={setSelectedImage} />
            </Reveal>
          </div>
        </section>

        {/* ────────────────── N° 05 · CERTIFICATIONS ────────────────── */}
        <section className="border-t border-border bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHead no="05" title="Certifications">
              <h2 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">Certified, audited, verified.</h2>
            </SectionHead>

            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <Reveal className="lg:col-span-7">
                <div className="overflow-hidden rounded-md border border-border bg-card">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border bg-surface">
                        <th className="px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground w-14">S.No</th>
                        <th className="px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Certification</th>
                        <th className="px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Scope</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyData.certifications.map((cert, i) => (
                        <tr key={cert.name} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</td>
                          <td className="px-4 py-3.5 font-mono text-[13px] font-semibold text-foreground whitespace-nowrap">{cert.name}</td>
                          <td className="px-4 py-3.5 text-[13px] text-muted-foreground">{cert.scope}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>

              <div className="lg:col-span-5">
                <Reveal delay={0.1}>
                  <p className="mb-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    Every engagement runs under audited international standards, from private
                    security operations to information security and occupational safety.
                  </p>
                  <div className="flex items-start gap-3 rounded-md border border-border bg-card p-4">
                    <span className="stamp mt-0.5 border-brand text-brand"><ShieldCheck className="h-3 w-3" /> Verified</span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold">Also certified by government bodies</div>
                      <div className="text-[12px] text-muted-foreground">CRISIL rated, Police and BCAS verified.</div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────── N° 06 · IMPACT ────────────────── */}
        <section className="border-t border-border py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHead no="06" title="Beyond the contract">
              <h2 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">Impact beyond business.</h2>
            </SectionHead>

            <div className="grid gap-5 lg:grid-cols-5">
              <Reveal className="lg:col-span-3">
                <button
                  type="button"
                  className="group relative block h-[380px] w-full overflow-hidden rounded-md border border-border text-left md:h-[440px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => setSelectedImage({ src: "/movie-on-social-issues/warning-call.png", alt: "Warning Call", category: "Social Film" })}
                  aria-label="View Warning Call film poster"
                >
                  <Image src="/movie-on-social-issues/warning-call.png" alt="Warning Call, a social awareness film produced by Tulsyan Group" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 p-6 text-white md:p-8">
                    <span className="registry-eyebrow !text-white/60 mb-2 block">Social film</span>
                    <h3 className="mb-2 font-display text-xl font-bold md:text-2xl">&ldquo;Warning Call&rdquo;</h3>
                    <p className="max-w-md text-[13px] leading-relaxed text-white/80">
                      A produced film highlighting the environmental impact of traditional funeral practices, advocating for sustainable alternatives.
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-sm bg-white/15 p-1.5 text-white backdrop-blur-md"><Maximize2 className="h-4 w-4" /></div>
                  </div>
                </button>
              </Reveal>

              <Reveal delay={0.1} className="flex flex-col gap-4 lg:col-span-2">
                <div>
                  <div className="registry-line mb-3">
                    <span className="registry-eyebrow">Media coverage</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {companyData.media.slice(0, 4).map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        className="group relative aspect-video overflow-hidden rounded-md border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onClick={() => setSelectedImage({ src: img, alt: "Media Coverage", category: "Media" })}
                        aria-label={`View media coverage ${i + 1}`}
                      >
                        <Image src={img} alt="Media" fill sizes="(max-width: 1024px) 50vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="group flex flex-1 items-center gap-4 rounded-md border border-border bg-card p-4 text-left transition-colors duration-200 hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => setSelectedImage({ src: "/awards/image.png", alt: "Awards & Recognition", category: "Awards" })}
                  aria-label="View awards and recognition"
                >
                  <span className="stamp border-brand/40 bg-brand/[0.06] text-brand">Awarded</span>
                  <span className="min-w-0">
                    <span className="block font-display text-[13px] font-semibold">Award-winning service</span>
                    <span className="block text-[12px] text-muted-foreground">Recognized for excellence in security and facility management.</span>
                  </span>
                </button>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ────────────────── N° 07 · LEADERSHIP ────────────────── */}
        <section className="border-t border-border bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHead no="07" title="Directors">
              <h2 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">The people responsible.</h2>
            </SectionHead>

            <div className="mx-auto grid max-w-2xl gap-5 sm:grid-cols-2">
              {companyData.leadership.map((leader, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="overflow-hidden rounded-md border border-border bg-card">
                    <div className="relative aspect-[3/4] border-b border-border">
                      <Image src={leader.image} alt={`${leader.name}, ${leader.designation}`} fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover object-top" />
                    </div>
                    <div className="p-5">
                      <h4 className="font-display text-lg font-bold tracking-[-0.01em]">{leader.name}</h4>
                      <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">{leader.designation}</p>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">{leader.bio}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────── N° 08 · CONTACT ────────────────── */}
        <section id="contact" className="bg-[hsl(240,4%,11%)] py-20 text-[hsl(60,10%,98%)] md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="registry-line mb-10 md:mb-14 [&::after]:!bg-white/15">
              <span className="registry-eyebrow !text-white/50"><strong className="!text-[hsl(357,66%,61%)]">N° 08</strong> · Get in touch</span>
            </div>

            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <h2 className="mb-4 font-display text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
                  Put your premises<br />on our register.
                </h2>
                <p className="mb-10 max-w-md text-sm leading-relaxed text-white/60">
                  Tell us what needs guarding, cleaning, managing or counting. We will send a
                  customized quote.
                </p>

                <div className="space-y-5">
                  {[
                    { icon: Phone, label: "Call us", value: companyData.contactInfo.phone[0] },
                    { icon: Mail, label: "Email us", value: companyData.contactInfo.email },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-4 border-b border-white/10 pb-5">
                      <c.icon className="h-4 w-4 text-[hsl(357,66%,61%)]" />
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">{c.label}</div>
                        <div className="font-mono text-[15px] font-semibold">{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-6 md:p-8">
                  <div className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Our presence</div>
                  <div className="mb-7 flex flex-wrap gap-2">
                    {companyData.contactInfo.branches.map((b, i) => (
                      <span key={i} className="stamp border-white/20 text-white/80">{b}</span>
                    ))}
                  </div>
                  <div className="mb-7 flex items-start gap-3 border-t border-white/10 pt-5">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(357,66%,61%)]" />
                    <div>
                      <div className="text-[13px] font-semibold">Head Office</div>
                      <div className="text-[13px] text-white/60">{companyData.contactInfo.address}</div>
                    </div>
                  </div>
                  <Button asChild variant="brand" className="h-10 w-full">
                    <a href={`mailto:${companyData.contactInfo.email}`}>Contact Support <ArrowRight className="ml-2 h-3.5 w-3.5" /></a>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="border-t border-border bg-background py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="relative h-5 w-5"><Image src="/tss-logo.png" alt="TSS" fill sizes="20px" className="object-contain" /></div>
            <p className="font-mono text-[11px] text-muted-foreground">&copy; {new Date().getFullYear()} {companyData.fullName}</p>
          </div>
          <div className="flex items-center gap-5 text-[11px] font-medium text-muted-foreground">
            <Link href="#contact" className="transition-colors hover:text-brand">Contact</Link>
            <Link href="/login" className="transition-colors hover:text-brand">Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
