"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Shield,
  Users,
  Clock,
  Award,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Menu,
  X,
  ArrowRight,
  Quote,
  Leaf,
  Building2,
  HomeIcon as HomeIconLucide,
  Settings,
  Trophy,
  ChevronRight,
  Star,
  Maximize2,
  ArrowUpRight,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useRef, useCallback, type ReactNode, type MouseEvent as ReactMouseEvent } from "react"
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useInView, type Variants } from "framer-motion"

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
    { label: "Years of Excellence", value: 10, suffix: "+", icon: Clock },
    { label: "Employees Deployed", value: 2000, suffix: "+", icon: Users },
    { label: "Cities Covered", value: 15, suffix: "+", icon: MapPin },
    { label: "Client Retention", value: 98, suffix: "%", icon: Star },
  ],
  specializations: [
    {
      title: "Security Services",
      description: "Total security solutions with zero machine investment. Expertly trained personnel for all sectors.",
      icon: Shield,
      image: "/slideshow/security-guards.png",
    },
    {
      title: "Facility Management",
      description: "Complete facility management for total peace of mind. We handle the details so you focus on business.",
      icon: Building2,
      image: "/petrol-pump/petrol-pump.png",
    },
    {
      title: "Solid Waste Mgmt",
      description: "Comprehensive waste management solutions ensuring a healthy and compliant environment.",
      icon: Leaf,
      image: "/slideshow/waste-management.png",
    },
    {
      title: "Housekeeping",
      description: "Professional cleaning services creating hygienic environments for corporate and industrial spaces.",
      icon: HomeIconLucide,
      image: "/slideshow/before-and-after.png",
    },
    {
      title: "Payroll & HR",
      description: "Payroll management and consultancy reducing administrative burden and ensuring compliance.",
      icon: Users,
      image: "/security-guards/security-guards-1.png",
    },
    {
      title: "O&M Management",
      description: "Electrical and mechanical operations, maintenance management and allied services.",
      icon: Settings,
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

/* ═══════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const wordReveal: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ═══════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════ */

function Counter({ value, suffix }: { value: number; suffix: string }): ReactNode {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let raf = 0
    let startTime = 0
    const duration = 1400
    const step = (now: number) => {
      if (!startTime) startTime = now
      const p = Math.min(1, (now - startTime) / duration)
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <span className="tabular-nums">{display.toLocaleString("en-IN")}{suffix}</span>
}

/** Scroll-triggered reveal wrapper */
function Reveal({ children, className = "", delay = 0, once = true }: {
  children: ReactNode; className?: string; delay?: number; once?: boolean
}): ReactNode {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Tiny label with accent line used above every section title */
function SectionTag({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-[2px] w-6 bg-primary rounded-full" />
      <span className="text-[11px] font-semibold text-primary tracking-[0.18em] uppercase font-display">{children}</span>
    </div>
  )
}

/** Card that tracks the mouse and shows a radial spotlight glow on hover */
function SpotlightCard({ children, className = "", onClick }: {
  children: ReactNode; className?: string; onClick?: () => void
}): ReactNode {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouse = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`)
  }, [])

  return (
    <div ref={ref} onMouseMove={handleMouse} onClick={onClick} className={`spotlight-card ${className}`}>
      {children}
    </div>
  )
}


function Marquee({ children, speed = 35, className = "" }: { children: ReactNode; speed?: number; className?: string }): ReactNode {
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

function Lightbox({ image, onClose }: { image: { src: string; alt: string; category: string } | null; onClose: () => void }): ReactNode {
  if (!image) return null

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 cursor-zoom-out"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-5xl max-h-[85vh] aspect-video rounded-xl overflow-hidden shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={image.src} alt={image.alt} fill className="object-contain" />
        <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-primary transition-colors">
          <X className="h-5 w-5" />
        </button>
        <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/80 to-transparent text-white pointer-events-none">
          <span className="text-[10px] font-bold tracking-widest uppercase text-primary-light">{image.category}</span>
          <h3 className="text-lg md:text-xl font-bold font-display">{image.alt}</h3>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   SECTION: BENTO GALLERY
   ═══════════════════════════════════════════ */

function BentoGallery({ onImageClick }: { onImageClick: (img: { src: string; alt: string; category: string }) => void }): ReactNode {
  const images = companyData.galleryImages

  const GalleryItem = ({ img, className = "", showLabel = false }: {
    img: typeof images[0]; className?: string; showLabel?: boolean
  }): ReactNode => (
    <motion.div
      className={`relative h-full w-full rounded-xl overflow-hidden group cursor-pointer ${className}`}
      onClick={() => onImageClick(img)}
      whileHover={{ scale: 0.985 }}
      transition={{ duration: 0.25 }}
    >
      <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
      <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 text-white">
        <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/70">{img.category}</span>
        {showLabel && <h3 className="text-sm md:text-base font-bold font-display leading-tight">{img.alt}</h3>}
      </div>
      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white/15 backdrop-blur-md p-1.5 rounded-full text-white"><Maximize2 className="h-3.5 w-3.5" /></div>
      </div>
    </motion.div>
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
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; category: string } | null>(null)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  const heroRef = useRef(null)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(heroProgress, [0, 1], [0, 150])

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

  const heroWords = ["Empowering", "Your", "Growth."]

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden">
      {/* Lightbox */}
      <AnimatePresence>{selectedImage && <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />}</AnimatePresence>

      {/* Scroll progress */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[100] origin-left" style={{ scaleX }} />

      {/* ────────────────── HEADER ────────────────── */}
      <header className={`fixed top-0 left-0 z-50 w-full transition-all duration-400 ${
        scrolled ? "glass-strong py-2.5 shadow-sm" : "bg-transparent py-4 md:py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className={`relative transition-all duration-300 ${scrolled ? "w-7 h-7" : "w-8 h-8 md:w-9 md:h-9"}`}>
              <Image src="/tss-logo.png" alt="TSS" fill className="object-contain" priority />
            </div>
            <span className={`font-display font-bold tracking-tight transition-all duration-300 hidden sm:inline ${
              scrolled ? "text-sm" : "text-sm md:text-base"
            }`}>
              {companyData.fullName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-background/50 dark:bg-background/30 backdrop-blur-xl p-1 rounded-full border border-border/30">
            {navItems.map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`}
                className="px-4 py-1.5 text-[13px] font-medium rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 font-display">
                {item}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <Button asChild variant="outline" className="hidden lg:inline-flex rounded-full text-xs h-8 px-4 font-display font-semibold border-border/60 hover:bg-muted/60">
              <Link href="/login">Staff Login</Link>
            </Button>
            <Button asChild className="hidden lg:inline-flex glow-btn rounded-full bg-primary text-white hover:bg-primary-dark text-xs h-8 px-4 font-display font-semibold shadow-md shadow-primary/15">
              <Link href="#contact">Get a Quote <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
            </Button>
            <button className="lg:hidden p-2 rounded-full hover:bg-muted/60 transition-colors" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ────────────────── MOBILE MENU ────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/98 backdrop-blur-2xl">
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-12">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="relative w-7 h-7"><Image src="/tss-logo.png" alt="TSS" fill className="object-contain" /></div>
                  <span className="font-display font-bold text-sm">{companyData.shortName}</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <motion.nav variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-1 flex-1">
                {navItems.map((item) => (
                  <motion.div key={item} variants={fadeUp}>
                    <Link href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-4 px-3 text-xl font-display font-semibold rounded-xl hover:bg-primary/5 hover:text-primary transition-colors">
                      {item} <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {companyData.contactInfo.phone[0]}
                </div>
                <Button asChild className="w-full glow-btn rounded-full bg-primary text-white h-11 text-sm font-display font-semibold">
                  <Link href="#contact" onClick={() => setMobileMenuOpen(false)}>Get a Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-full h-11 text-sm font-display font-semibold border-border/60">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Staff Login</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* ────────────────── HERO ────────────────── */}
        <section ref={heroRef} id="home" className="relative min-h-screen flex flex-col justify-center noise-overlay overflow-hidden">
          {/* BG image with parallax */}
          <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
            <Image src="/slideshow/security-guards.png" alt="Tulsyan Security Services team on duty" fill className="object-cover opacity-30 dark:opacity-20" priority />
          </motion.div>
          <div className="absolute inset-0 gradient-mesh z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-[1]" />

          <motion.div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 pt-32 pb-44 md:pt-40 md:pb-52">
            <div className="max-w-3xl">
              {/* Badge */}
              <motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <Badge variant="outline"
                  className="mb-6 border-primary/20 bg-primary/5 text-primary px-3 py-1 text-[11px] font-display font-semibold tracking-wide rounded-full">
                  <Sparkles className="h-3 w-3 mr-1.5" /> Trusted since {companyData.founded}
                </Badge>
              </motion.div>

              {/* Headline word by word reveal */}
              <motion.h1
                variants={staggerContainer} initial={false} animate="visible"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold font-display tracking-tight leading-[1.05] mb-6"
              >
                {heroWords.map((word, i) => (
                  <motion.span key={i} variants={wordReveal} className={`inline-block mr-[0.3em] ${
                    i === 2 ? "gradient-text" : ""
                  }`}>
                    {word}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={false} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-[15px] md:text-base text-muted-foreground leading-relaxed max-w-lg mb-9"
              >
                For over a decade, Tulsyan Group has delivered trusted Manpower and Outsourcing solutions, now expanding into Smart Cities, Renewable Energy, and Civil Services.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={false} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Button size="lg" asChild className="glow-btn h-11 px-7 rounded-full text-[13px] font-display font-semibold bg-primary hover:bg-primary/90 text-white">
                  <Link href="#contact">Partner With Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-11 px-7 rounded-full text-[13px] font-display font-semibold border-border/60 hover:bg-muted/60">
                  <Link href="#services">Explore Services</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Strip */}
          <div className="absolute bottom-0 w-full z-10 border-t border-border/30 bg-background/60 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 md:gap-8">
                {companyData.stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 dark:bg-primary/10 flex items-center justify-center text-primary">
                      <s.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-lg md:text-xl font-bold font-display text-primary leading-none mb-0.5">
                        <Counter value={s.value} suffix={s.suffix} />
                      </div>
                      <div className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase leading-tight">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────── CLIENTS MARQUEE ────────────────── */}
        <section className="py-10 md:py-14 border-b border-border/30 bg-background overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
            <p className="text-[11px] font-semibold text-muted-foreground tracking-[0.18em] uppercase text-center font-display">Trusted by industry leaders</p>
          </div>
          <div className="fade-mask-x">
            <Marquee speed={50} className="py-2">
              {companyData.clients.map((c, i) => (
                <div key={i} className="relative h-14 md:h-16 w-28 md:w-36 flex-shrink-0 rounded-lg bg-white border border-border/40 shadow-sm grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 p-2.5 md:p-3">
                  <Image src={c.src} alt={c.name} fill className="object-contain p-1" />
                </div>
              ))}
            </Marquee>
          </div>
        </section>

        {/* ────────────────── ABOUT ────────────────── */}
        <section id="about" className="py-20 md:py-32 bg-background noise-overlay relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* Text */}
              <div className="lg:col-span-7">
                <Reveal>
                  <SectionTag>About Tulsyan Group</SectionTag>
                  <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-bold mb-6 leading-tight">
                    Diverse Portfolio.<br />
                    <span className="text-muted-foreground">Unified Excellence.</span>
                  </h2>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="space-y-4 text-[14px] md:text-[15px] text-muted-foreground leading-relaxed mb-8">
                    <p>
                      Our company has consistently grown in the Manpower and Outsourcing industry for over 10 years, leveraging expertise to drive innovation in emerging sectors like smart city projects, renewable energy, and civil service work.
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
                      <p><span className="font-semibold text-foreground">6</span> Group Firms</p>
                      <p><span className="font-semibold text-foreground">6</span> Key Sectors</p>
                      <p><span className="font-semibold text-foreground">7</span> Branch Offices</p>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.2}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {companyData.advantages.map((adv, i) => (
                      <div key={i} className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg bg-muted/40 border border-border/30">
                        <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="text-[13px] font-medium">{adv}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>

              {/* Image + Quote */}
              <div className="lg:col-span-5">
                <Reveal delay={0.15}>
                  <div className="relative">
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                      <Image src="/training/training-1.png" alt="Tulsyan Security Services staff at a training session" fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                    </div>
                    {/* Floating quote */}
                    <div className="absolute -bottom-6 -left-3 md:-left-8 bg-card p-5 rounded-xl shadow-xl max-w-[260px] border border-border/40">
                      <Quote className="h-5 w-5 text-primary mb-2" />
                      <p className="text-[13px] font-medium italic leading-relaxed">
                        &ldquo;Excellence isn&apos;t just a goal, it&apos;s an ongoing journey of creating lasting satisfaction.&rdquo;
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────── SERVICES ────────────────── */}
        <section id="services" className="py-20 md:py-32 bg-muted/20 noise-overlay relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 md:mb-16">
                <div>
                  <SectionTag>Our Expertise</SectionTag>
                  <h2 className="font-display text-3xl md:text-4xl font-bold">Comprehensive Solutions</h2>
                </div>
                <p className="text-muted-foreground text-[14px] max-w-md md:text-right leading-relaxed">
                  We don&apos;t just offer services. We deliver peace of mind through our complete range of facility solutions.
                </p>
              </div>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {companyData.specializations.map((svc, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <SpotlightCard className="rounded-2xl overflow-hidden group h-full">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={svc.image} alt={svc.title} fill className="object-cover transition-transform duration-600 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/85 dark:bg-card/85 backdrop-blur-sm flex items-center justify-center text-primary shadow-sm">
                        <svc.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="relative z-10 p-5">
                      <h4 className="text-[15px] font-bold font-display mb-1.5 group-hover:text-primary transition-colors">{svc.title}</h4>
                      <p className="text-muted-foreground text-[13px] leading-relaxed">{svc.description}</p>
                    </div>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────── GALLERY ────────────────── */}
        <section id="gallery" className="py-20 md:py-32 bg-background noise-overlay overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <Reveal>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                <div>
                  <SectionTag>Our Work</SectionTag>
                  <h2 className="font-display text-3xl md:text-4xl font-bold">Operational Excellence</h2>
                </div>
                <p className="text-muted-foreground text-[14px] max-w-sm leading-relaxed">
                  Our team in action across sectors, delivering quality and reliability every day.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <BentoGallery onImageClick={setSelectedImage} />
            </Reveal>
          </div>
        </section>

        {/* ────────────────── CERTIFICATIONS ────────────────── */}
        <section className="py-20 md:py-32 bg-muted/20 noise-overlay overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              <Reveal className="lg:col-span-5">
                <div className="grid grid-cols-2 gap-3">
                  {companyData.certifications.map((cert, i) => (
                    <div key={i} className={`relative rounded-2xl bg-card border border-border/50 shadow-sm p-4 flex flex-col items-center text-center gap-2 hover:shadow-lg transition-shadow ${
                      i === companyData.certifications.length - 1 && companyData.certifications.length % 2 === 1 ? "col-span-2" : ""
                    }`}>
                      <div className="h-11 w-11 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="font-display font-bold text-[13px] leading-tight">{cert.name}</div>
                      <div className="text-[11px] text-muted-foreground leading-tight">{cert.scope}</div>
                    </div>
                  ))}
                </div>
              </Reveal>

              <div className="lg:col-span-7">
                <Reveal>
                  <SectionTag>Certifications</SectionTag>
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Certified for Quality and Safety</h2>
                  <p className="text-muted-foreground text-[14px] mb-6 max-w-lg leading-relaxed">
                    We adhere to the highest international standards. Our certifications are a testament to our commitment across security operations, environment, safety, information security, and human resources.
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-sm max-w-md">
                    <div className="h-10 w-10 rounded-lg bg-primary/8 dark:bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-semibold text-[13px]">Also certified by government bodies</div>
                      <div className="text-[12px] text-muted-foreground">CRISIL rated, Police and BCAS verified.</div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────── CSR & MEDIA ────────────────── */}
        <section className="py-20 md:py-32 bg-background noise-overlay overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <Reveal>
              <div className="text-center max-w-xl mx-auto mb-14">
                <SectionTag>Social Responsibility</SectionTag>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Impact Beyond Business</h2>
                <p className="text-muted-foreground text-[14px] leading-relaxed">
                  From environmental initiatives to social awareness campaigns, we are committed to making a real difference.
                </p>
              </div>
            </Reveal>

            <div className="grid lg:grid-cols-5 gap-5">
              {/* Movie Feature */}
              <Reveal className="lg:col-span-3">
                <div className="relative rounded-2xl overflow-hidden group h-[380px] md:h-[440px] cursor-pointer"
                  onClick={() => setSelectedImage({ src: "/movie-on-social-issues/warning-call.png", alt: "Warning Call", category: "Social Film" })}>
                  <Image src="/movie-on-social-issues/warning-call.png" alt="Warning Call, a social awareness film produced by Tulsyan Group" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 p-6 md:p-8 text-white">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-red-300 mb-2 block">Social Film</span>
                    <h3 className="text-xl md:text-2xl font-bold font-display mb-2">&ldquo;Warning Call&rdquo;</h3>
                    <p className="text-zinc-200 text-[13px] max-w-md leading-relaxed">
                      A produced film highlighting the environmental impact of traditional funeral practices, advocating for sustainable alternatives.
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/15 backdrop-blur-md p-1.5 rounded-full text-white"><Maximize2 className="h-4 w-4" /></div>
                  </div>
                </div>
              </Reveal>

              {/* Media & Awards */}
              <Reveal delay={0.1} className="lg:col-span-2 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold font-display mb-3">Media Coverage</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {companyData.media.slice(0, 4).map((img, i) => (
                      <div key={i}
                        className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer border border-border/30 hover:shadow-md transition-shadow"
                        onClick={() => setSelectedImage({ src: img, alt: "Media Coverage", category: "Media" })}>
                        <Image src={img} alt="Media" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>

                <SpotlightCard className="rounded-xl p-4 flex items-center gap-4 cursor-pointer group flex-1"
                  onClick={() => setSelectedImage({ src: "/awards/image.png", alt: "Awards & Recognition", category: "Awards" })}>
                  <div className="h-10 w-10 rounded-lg bg-primary/8 dark:bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 relative z-10">
                    <h4 className="text-[13px] font-bold font-display">Award Winning Service</h4>
                    <p className="text-muted-foreground text-[12px]">Recognized for excellence in Security & Facility Management.</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ────────────────── LEADERSHIP ────────────────── */}
        <section className="py-20 md:py-32 bg-muted/20 noise-overlay overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <Reveal>
              <div className="text-center mb-12">
                <SectionTag>Leadership</SectionTag>
                <h2 className="font-display text-3xl md:text-4xl font-bold">Visionary Leadership</h2>
              </div>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
              {companyData.leadership.map((leader, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="group relative rounded-2xl overflow-hidden bg-card border border-border/40 hover:shadow-xl transition-all duration-300">
                    <div className="aspect-[3/4] relative transition-all duration-600">
                      <Image src={leader.image} alt={`${leader.name}, ${leader.designation}`} fill className="object-cover object-top" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 w-full p-5 text-white">
                        <h4 className="text-lg font-bold font-display">{leader.name}</h4>
                        <p className="text-primary-light text-[12px] font-semibold tracking-wide uppercase">{leader.designation}</p>
                        <p className="text-white/60 text-[13px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-400">{leader.bio}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────── CONTACT ────────────────── */}
        <section id="contact" className="relative py-20 md:py-32 bg-primary text-white overflow-hidden">
          {/* Decorative orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-[30%] -right-[15%] w-[500px] h-[500px] bg-white/[0.06] rounded-full blur-3xl" />
            <div className="absolute -bottom-[25%] -left-[10%] w-[400px] h-[400px] bg-black/[0.08] rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
              <Reveal>
                <div className="space-y-8">
                  <div>
                    <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-white/50 font-display mb-4 block">Get in Touch</span>
                    <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4">
                      Ready to Upgrade<br />Your Operations?
                    </h2>
                    <p className="text-white/60 text-[14px] leading-relaxed max-w-md">
                      Join satisfied clients who trust Tulsyan Group for outsourcing. Get a customized quote today.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: Phone, label: "Call Us", value: companyData.contactInfo.phone[0] },
                      { icon: Mail, label: "Email Us", value: companyData.contactInfo.email },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center gap-3.5 p-4 bg-white/[0.08] rounded-xl backdrop-blur-sm border border-white/[0.06]">
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <c.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-white/40 text-[10px] font-bold tracking-wider uppercase">{c.label}</div>
                          <div className="text-[15px] font-semibold font-display">{c.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="bg-white text-foreground p-6 md:p-8 rounded-2xl shadow-2xl">
                  <h3 className="text-base font-bold font-display mb-5">Our Presence</h3>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {companyData.contactInfo.branches.map((b, i) => (
                      <span key={i} className="px-2.5 py-1 text-[11px] font-medium bg-muted rounded-md border border-border/40">{b}</span>
                    ))}
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl border border-border/40 flex items-start gap-3 mb-6">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-display font-semibold text-[13px]">Head Office</div>
                      <div className="text-muted-foreground text-[12px]">{companyData.contactInfo.address}</div>
                    </div>
                  </div>
                  <Button asChild className="w-full glow-btn h-10 text-[13px] font-display font-semibold bg-primary hover:bg-primary-dark text-white rounded-xl">
                    <a href={`mailto:${companyData.contactInfo.email}`}>Contact Support <ArrowRight className="ml-2 h-3.5 w-3.5" /></a>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="py-6 bg-background border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 relative"><Image src="/tss-logo.png" alt="TSS" fill className="object-contain" /></div>
            <p className="text-[11px] text-muted-foreground">&copy; {new Date().getFullYear()} {companyData.fullName}</p>
          </div>
          <div className="flex items-center gap-5 text-[11px] font-medium text-muted-foreground">
            <Link href="#contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
