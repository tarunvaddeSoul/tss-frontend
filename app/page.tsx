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
  Zap,
  Menu,
  X,
  ArrowRight,
  Play,
  Quote,
  Leaf,
  Building2,
  HomeIcon as HomeIconLucide,
  Settings,
  Trophy,
  ChevronRight,
  Star,
  ChevronLeft,
  Maximize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useInView } from "framer-motion"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Card } from "@/components/ui/card" // Kept for compatibility if needed, though we use custom styling

// --- Data ---

const companyData = {
  name: "Tulsyan Security Services Pvt. Ltd.",
  shortName: "Tulsyan Security Services Pvt. Ltd.",
  founded: 2013,
  headOffice: "Indore, Madhya Pradesh",
  employees: "2000+",
  industry: "Manpower Services",
  tagline: "Complete Solutions: Manpower, Machines, Material, Methods",
  mission: [
    "Provide high Quality, Affordable contract Outsourcing solutions.",
    "Create and cultivate long-term relationship with clients.",
    "Respond immediately to the changing needs of clients.",
    "Achieve Complete customer satisfaction.",
    "Improve Customer services Standards continuously.",
  ],
  coreValues: ["Integrity", "Customer First", "Professionalism", "Responsiveness", "Reliability"],
  sectors: [
    "Wealth Management",
    "Housekeeping Material Supply",
    "Garment",
    "Social Service",
    "Graphic Designing",
    "Recruitment Consultancy",
  ],
  stats: [
    { label: "Years of Excellence", value: 10, suffix: "+" },
    { label: "Employees", value: 2000, suffix: "+" },
    { label: "Cities Covered", value: 15, suffix: "+" },
    { label: "Client Retention", value: 98, suffix: "%" },
  ],
  specializations: [
    {
      title: "Security Services",
      description: "Total security solutions with zero investment on machines. Expertly trained personnel for all sectors.",
      icon: Shield,
      image: "/slideshow/security-guards.png"
    },
    {
      title: "Facility Management",
      description: "Complete Facility Management Services for total peace of mind. We handle the details so you can focus on business.",
      icon: Building2,
      image: "/slideshow/image 1.png"
    },
    {
      title: "Solid Waste Mgmt",
      description: "Comprehensive waste management solutions ensuring a healthy and compliant environment.",
      icon: Leaf,
      image: "/slideshow/waste-management.png"
    },
    {
      title: "Housekeeping",
      description: "Professional cleaning services creating hygienic environments for corporate and industrial spaces.",
      icon: HomeIconLucide,
      image: "/waste-management/image.png"
    },
    {
      title: "Payroll & HR",
      description: "Payroll Management & Consultancy Services reducing administrative burden and ensuring compliance.",
      icon: Users,
      image: "/training/training.png" // Placeholder
    },
    {
      title: "O&M Management",
      description: "Electrical & Mechanical / Operations & Maintenance Management & Allied Services.",
      icon: Settings,
      image: "/petrol-pump/petrol-pump.png"
    },
  ],
  advantages: [
    "Zero investment on Machines",
    "Total Security Solutions",
    "Less administrative burden to control manpower",
    "Healthy and Hygienic environment",
    "No stress for machine break-downs",
    "No stress for inventory of chemicals and consumables",
  ],
  leadership: [
    {
      name: "Kshitiz Tulsyan",
      designation: "Director",
      image: "/directors/kshitiz.jpg",
      bio: "Leading the strategic expansion into diverse sectors."
    },
    {
      name: "Anubhav Tulsyan",
      designation: "Director",
      image: "/directors/anubhav.jpg",
      bio: "Driving operational excellence and innovation."
    },
  ],
  certifications: [
    { name: "ISO 18788 : 2015", scope: "Private Security Operations" },
    { name: "ISO 14001 : 2015", scope: "Environmental Mgt Sys" },
    { name: "ISO 45001 : 2018", scope: "Occupational Health & Safety" },
    { name: "ISO/IEC : 27001 : 2022", scope: "Information Security Mgt" },
    { name: "ISO 30409 : 2026", scope: "Human Resource Mgt" },
  ],
  clients: [
    "/clients/aditya-birla.png",
    "/clients/ashoka-hotel.png",
    "/clients/brilliant-convention-centre.png",
    "/clients/electricity-department.png",
    "/clients/epfo.png",
    "/clients/franklin.png",
    "/clients/hotwax-systems.png",
    "/clients/iit-jodhpur.png",
    "/clients/municipal_corp.png",
    "/clients/nvda.png",
    "/clients/parishad-mhow.png",
    "/clients/prestige.png",
    "/clients/vistara.png",
  ],
  media: [
    "/media-coverage/image.png",
    "/media-coverage/image 1.png",
    "/media-coverage/image 2.png",
    "/media-coverage/image 3.png",
    "/media-coverage/image 4.png",
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
  ]
}

// --- Components ---

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const springValue = useSpring(0, { duration: 2000, bounce: 0 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      springValue.set(value)
    }
  }, [isInView, value, springValue])

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return () => unsubscribe()
  }, [springValue])

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  )
}

function FooterThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}

function Marquee({ children, direction = "left", speed = 30, className = "" }: { children: React.ReactNode, direction?: "left" | "right", speed?: number, className?: string }) {
  return (
    <div className={`flex overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        className="flex flex-shrink-0 gap-12 items-center"
        initial={{ x: direction === "left" ? 0 : "-100%" }}
        animate={{ x: direction === "left" ? "-100%" : 0 }}
        transition={{ ease: "linear", duration: speed, repeat: Infinity }}
      >
        {children}
        {children}
      </motion.div>
      <motion.div
        className="flex flex-shrink-0 gap-12 items-center"
        initial={{ x: direction === "left" ? 0 : "-100%" }}
        animate={{ x: direction === "left" ? "-100%" : 0 }}
        transition={{ ease: "linear", duration: speed, repeat: Infinity }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}

function Lightbox({ image, onClose }: { image: { src: string, alt: string, category: string } | null, onClose: () => void }) {
  if (!image) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-6xl h-auto max-h-[90vh] aspect-video rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-primary transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white pointer-events-none">
          <Badge className="bg-primary text-white border-none mb-2">{image.category}</Badge>
          <h3 className="text-3xl font-bold">{image.alt}</h3>
        </div>
      </motion.div>
    </motion.div>
  )
}

function BentoGallery({ onImageClick }: { onImageClick: (img: any) => void }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[800px] md:h-[600px]">
      {/* Large Item */}
      <motion.div
        className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-shadow"
        onMouseEnter={() => setHoveredIndex(0)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => onImageClick(companyData.galleryImages[0])}
        whileHover={{ scale: 0.99 }}
        transition={{ duration: 0.4 }}
      >
        <Image
          src={companyData.galleryImages[0].src}
          alt={companyData.galleryImages[0].alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
        <div className="absolute bottom-6 left-6 text-white">
          <Badge className="bg-primary border-none mb-2">{companyData.galleryImages[0].category}</Badge>
          <h3 className="text-2xl font-bold">{companyData.galleryImages[0].alt}</h3>
        </div>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
            <Maximize2 className="h-5 w-5" />
          </div>
        </div>
      </motion.div>

      {/* Medium Items */}
      <motion.div
        className="md:col-span-1 md:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl"
        onClick={() => onImageClick(companyData.galleryImages[1])}
        whileHover={{ scale: 0.99 }}
      >
        <Image
          src={companyData.galleryImages[1].src}
          alt={companyData.galleryImages[1].alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
        <div className="absolute bottom-4 left-4 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="font-bold">{companyData.galleryImages[1].alt}</span>
        </div>
      </motion.div>

      <motion.div
        className="md:col-span-1 md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl"
        onClick={() => onImageClick(companyData.galleryImages[3])}
        whileHover={{ scale: 0.99 }}
      >
        <Image
          src={companyData.galleryImages[3].src}
          alt={companyData.galleryImages[3].alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <Badge variant="secondary" className="bg-white/20 backdrop-blur-md border-none mb-2 text-white">{companyData.galleryImages[3].category}</Badge>
          <h3 className="text-xl font-bold">{companyData.galleryImages[3].alt}</h3>
        </div>
      </motion.div>

      {/* More Items */}
      <motion.div
        className="md:col-span-1 md:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl"
        onClick={() => onImageClick(companyData.galleryImages[2])}
        whileHover={{ scale: 0.99 }}
      >
        <Image
          src={companyData.galleryImages[2].src}
          alt={companyData.galleryImages[2].alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
        <div className="absolute bottom-4 left-4 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="font-bold">{companyData.galleryImages[2].alt}</span>
        </div>
      </motion.div>

      <motion.div
        className="md:col-span-2 md:row-span-1 relative rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl"
        onClick={() => onImageClick(companyData.galleryImages[5])}
        whileHover={{ scale: 0.99 }}
      >
        <Image
          src={companyData.galleryImages[5].src}
          alt={companyData.galleryImages[5].alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h3 className="text-xl font-bold">{companyData.galleryImages[5].alt}</h3>
          <p className="text-white/80 text-sm">Operational Excellence</p>
        </div>
      </motion.div>
    </div>
  )
}

// --- Main Page ---

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ src: string, alt: string, category: string } | null>(null)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary text-foreground overflow-x-hidden">
      <AnimatePresence>
        {selectedImage && <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />}
      </AnimatePresence>

      {/* Scroll Progress */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left" style={{ scaleX }} />

      {/* Header */}
      <header className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-3" : "bg-transparent py-6"}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`relative transition-all duration-300 ${scrolled ? "w-8 h-8" : "w-12 h-12"}`}>
              <Image src="/tss-logo.png" alt={companyData.name} fill className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold tracking-tight text-foreground transition-all duration-300 ${scrolled ? "text-lg" : "text-xl md:text-2xl"}`}>
                {companyData.shortName}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-background/50 backdrop-blur-sm p-1.5 rounded-full border border-border/50 shadow-sm">
            {["Home", "About", "Services", "Gallery", "Contact"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-5 py-2 text-sm font-medium rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button asChild className="hidden md:inline-flex rounded-full bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20">
              <Link href="#contact">Get a Quote</Link>
            </Button>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-[60] bg-background"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-12">
                <span className="font-bold text-xl text-primary">{companyData.shortName}</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-muted rounded-full">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-col gap-6 text-2xl font-medium">
                {["Home", "About", "Services", "Gallery", "Contact"].map((item) => (
                  <Link key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}>
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section id="home" className="relative w-full min-h-[100vh] flex items-center pt-20 overflow-hidden bg-background text-foreground">
          <div className="absolute inset-0 z-0">
            {/* Parallax Background Image */}
            <motion.div
              className="relative w-full h-full"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            >
              <Image
                src="/slideshow/security-guards.png"
                alt="Background"
                fill
                className="object-cover opacity-20 dark:opacity-40"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="container mx-auto px-6 relative z-10 mt-10">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Badge variant="secondary" className="mb-6 bg-primary text-white border-none px-4 py-1 text-sm tracking-wide">
                  Since {companyData.founded}
                </Badge>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-8">
                  Empowering <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-500">
                    Your Growth.
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mb-10">
                  For over a decade, Tulsyan Group has been a trusted partner in Manpower and Outsourcing. We are now expanding into Smart Cities, Renewable Energy, and Civil Services to drive innovation.
                </p>
                <div className="flex flex-col sm:flex-row gap-5">
                  <Button size="lg" className="h-14 px-8 rounded-full text-base bg-primary hover:bg-primary/90 text-white border-none" asChild>
                    <Link href="#contact">Partner With Us</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-base bg-background/50 border-border hover:bg-background hover:text-foreground backdrop-blur-sm" asChild>
                    <Link href="#services">Explore Services</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Floating Stats Bar */}
          <div className="absolute bottom-0 w-full bg-background/80 backdrop-blur-md border-t border-border py-6 hidden md:block">
            <div className="container mx-auto px-6">
              <div className="flex justify-start gap-16 text-foreground">
                {companyData.stats.map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="text-3xl font-bold text-primary">
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About / Why Us Section */}
        <section id="about" className="py-32 bg-background">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-4">About Tulsyan Group</h2>
                <h3 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">Diverse Portfolio.<br />Unified Excellence.</h3>
                <div className="space-y-6 text-lg text-muted-foreground">
                  <p>
                    Our company has consistently grown in the Manpower and Outsourcing industry for over 10 years. We are now leveraging our expertise to drive innovation in emerging sectors like smart city projects, renewable energy, and civil service work.
                  </p>
                  <p>
                    <span className="font-bold text-foreground">Group Firms:</span> Tulsyan Associates, Tulsyan Enterprises, Tulsyan Fashion House, Tulsyan Foundation, Mana Enterprises, Dream Big Outsourcing Pvt. Ltd.
                  </p>
                  <p>
                    <span className="font-bold text-foreground">Key Sectors:</span> Wealth Management, Housekeeping Material Supply, Garment, Social Service, Graphic Designing, Recruitment Consultancy.
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-6">
                  {companyData.advantages.slice(0, 4).map((adv, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                      <span className="font-medium">{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="relative aspect-square rounded-[3rem] overflow-hidden">
                  <Image src="/training/training.png" alt="Training" fill className="object-cover" />
                  <div className="absolute inset-0 bg-primary/10" />
                </div>
                <div className="absolute -bottom-10 -left-10 bg-card p-8 rounded-3xl shadow-2xl max-w-xs border border-border">
                  <Quote className="h-10 w-10 text-primary mb-4" />
                  <p className="font-medium text-lg italic">"Excellence isn't just a goal—it's an ongoing journey of creating lasting customer satisfaction."</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-32 bg-secondary/5">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-4">Our Expertise</h2>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Comprehensive Solutions</h3>
              <p className="text-lg text-muted-foreground">We don't just offer services; we deliver peace of mind through our comprehensive range of facility solutions.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companyData.specializations.map((service, i) => (
                <div key={i} className="group bg-background rounded-3xl p-2 border border-border hover:border-primary/50 transition-colors hover:shadow-lg">
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                    <Image src={service.image} alt={service.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-sm">
                      <service.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="px-4 pb-6">
                    <h4 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{service.title}</h4>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section (New & Creative) */}
        <section id="gallery" className="py-32 bg-muted text-foreground overflow-hidden">
          <div className="container mx-auto px-6 mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <h2 className="text-primary font-bold tracking-widest uppercase mb-2">Our Work</h2>
              <h3 className="text-4xl md:text-5xl font-bold">Operational Excellence</h3>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground max-w-md">Witness our team in action across various sectors, delivering quality and reliability.</p>
            </div>
          </div>

          <div className="container mx-auto px-6">
            <BentoGallery onImageClick={setSelectedImage} />
          </div>
        </section>

        {/* Clients Marquee */}
        <section className="py-24 border-b border-border bg-background overflow-hidden">
          <div className="container mx-auto px-6 text-center mb-12">
            <h3 className="text-2xl font-bold text-muted-foreground">Trusted by Industry Leaders</h3>
          </div>
          <div className="w-full max-w-[100vw] overflow-hidden">
            <Marquee speed={40} className="py-8">
              {companyData.clients.map((client, i) => (
                <div key={i} className="relative h-16 w-40 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 flex-shrink-0">
                  <Image src={client} alt="Client" fill className="object-contain" />
                </div>
              ))}
            </Marquee>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-32 bg-secondary/5">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2">
                <div className="relative aspect-[4/5] w-full max-w-md mx-auto rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute inset-0 bg-primary/20 rounded-3xl transform translate-x-4 translate-y-4" />
                  <div className="relative bg-white p-6 rounded-3xl shadow-xl h-full border border-border">
                    <Image src="/certifications/certified-by-governments.png" alt="Certifications" fill className="object-contain p-6" />
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-4">Certifications</h2>
                <h3 className="text-4xl font-bold mb-6">Certified for Quality & Safety</h3>
                <p className="text-lg text-muted-foreground mb-10">
                  We adhere to the highest international standards. Our certifications are a testament to our commitment to excellence.
                </p>
                <div className="grid gap-4">
                  {companyData.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold">{cert.name}</div>
                          <div className="text-sm text-muted-foreground">{cert.scope}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CSR & Media Section */}
        <section className="py-32 bg-background overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-4">Social Responsibility</h2>
              <h3 className="text-4xl font-bold mb-6">Impact Beyond Business</h3>
              <p className="text-lg text-muted-foreground">
                We believe in giving back. From environmental initiatives to social awareness campaigns, we are committed to making a difference.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Movie Card */}
              <div 
                className="relative rounded-[2.5rem] overflow-hidden group h-[500px] cursor-pointer"
                onClick={() => setSelectedImage({
                  src: "/movie-on-social-issues/warning-call.png",
                  alt: "Warning Call",
                  category: "Social Film"
                })}
              >
                <Image
                  src="/movie-on-social-issues/warning-call.png"
                  alt="Warning Call Movie"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                <div className="absolute bottom-0 p-10 text-white">
                  <Badge className="bg-red-600 text-white mb-4 border-none">Social Film</Badge>
                  <h3 className="text-3xl font-bold mb-4">"Warning Call"</h3>
                  <p className="text-zinc-200 text-lg mb-6 max-w-md">
                    A produced film highlighting the environmental impact of traditional funeral practices, advocating for sustainable alternatives.
                  </p>
                  <Button
                    variant="outline"
                    className="border-white/20 rounded-full
                      bg-transparent text-white hover:bg-white hover:text-black
                      dark:text-white dark:border-white/20
                      dark:hover:bg-white dark:hover:text-black
                      text-black border-black/20 hover:bg-black hover:text-white
                      dark:hover:bg-white dark:hover:text-black
                    "
                    style={{
                      color: "var(--button-text-color, #fff)",
                      borderColor: "var(--button-border-color, rgba(255,255,255,0.2))",
                      backgroundColor: "var(--button-bg, transparent)"
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add trailer logic here if needed, for now it just stops propagation so lightbox doesn't open
                    }}
                  >
                    Watch Trailer <Play className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                      <Maximize2 className="h-5 w-5" />
                   </div>
                </div>
              </div>

              {/* Media Grid */}
              <div className="flex flex-col justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Media Coverage</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {companyData.media.slice(0, 4).map((img, i) => (
                      <div 
                        key={i} 
                        className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 group cursor-pointer"
                        onClick={() => setSelectedImage({
                          src: img,
                          alt: "Media Coverage",
                          category: "Media"
                        })}
                      >
                        <Image
                          src={img}
                          alt="Media Coverage"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white">
                              <Maximize2 className="h-3 w-3" />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div 
                  className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex flex-col gap-6 cursor-pointer group"
                  onClick={() => setSelectedImage({
                    src: "/awards/image.png",
                    alt: "Awards & Recognition",
                    category: "Awards"
                  })}
                >
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-full bg-white shadow-sm flex items-center justify-center text-primary flex-shrink-0">
                      <Trophy className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">Award Winning Service</h4>
                      <p className="text-muted-foreground">Recognized for excellence in Security & Facility Management.</p>
                    </div>
                  </div>
                  <div className="relative h-24 w-full mt-2 grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100 group-hover:scale-105 duration-500">
                    <Image src="/awards/image.png" alt="Awards" fill className="object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="py-32 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16">Visionary Leadership</h2>
            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              {companyData.leadership.map((leader, i) => (
                <div key={i} className="group relative rounded-[2.5rem] overflow-hidden">
                  <div className="aspect-[3/4] w-full relative grayscale group-hover:grayscale-0 transition-all duration-500">
                    <Image src={leader.image} alt={leader.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h4 className="text-3xl font-bold mb-1">{leader.name}</h4>
                      <p className="text-primary font-medium mb-4">{leader.designation}</p>
                      <p className="text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{leader.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-32 bg-primary text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-10">
                <h2 className="text-5xl font-bold leading-tight">Ready to Upgrade Your Operations?</h2>
                <p className="text-xl text-white/80">Join the league of satisfied clients who trust Tulsyan Group for their outsourcing needs. Get a customized quote today.</p>

                <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"><Phone className="h-6 w-6" /></div>
                    <div>
                      <div className="text-white/60 uppercase text-sm font-bold">Call Us</div>
                      <div className="text-2xl font-bold">{companyData.contactInfo.phone[0]}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"><Mail className="h-6 w-6" /></div>
                    <div>
                      <div className="text-white/60 uppercase text-sm font-bold">Email Us</div>
                      <div className="text-2xl font-bold">{companyData.contactInfo.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white text-foreground p-10 rounded-[2.5rem] shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Our Presence</h3>
                <div className="flex flex-wrap gap-3 mb-8">
                  {companyData.contactInfo.branches.map((branch, i) => (
                    <Badge key={i} variant="secondary" className="px-4 py-2">{branch}</Badge>
                  ))}
                </div>
                <div className="p-6 bg-muted rounded-2xl border border-border flex items-center gap-4">
                  <MapPin className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-bold">Head Office</div>
                    <div className="text-muted-foreground">{companyData.contactInfo.address}</div>
                  </div>
                </div>
                <Button className="w-full mt-8 h-14 text-lg bg-primary hover:bg-primary-dark text-white">Contact Support</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 relative">
              <Image src="/tss-logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {companyData.name}</p>
          </div>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-primary">Privacy</Link>
            <Link href="#" className="hover:text-primary">Terms</Link>
            <FooterThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  )
}
