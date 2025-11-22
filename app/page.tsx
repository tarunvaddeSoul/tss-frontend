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
  Star,
  Zap,
  Menu,
  X,
  ArrowRight,
  Briefcase,
  Target,
  Heart,
  Trophy,
  ChevronRight,
  Play,
  Quote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useInView } from "framer-motion"

// Company data from profile
const companyData = {
  name: "Tulsyan Security Solutions Pvt. Ltd. (TSSPL)",
  brandName: "Tulsyan Security Solutions Pvt. Ltd.",
  formerName: "Tulsyan Outsourcing Pvt. Ltd.",
  founded: 2013,
  headOffice: "Indore, Madhya Pradesh",
  employees: "2000+",
  industry: "Manpower & Outsourcing",
  overview:
    "Tulsyan Security Solutions Pvt. Ltd. is a trusted provider of comprehensive outsourcing solutions, specializing in Security Services, Housekeeping, Solid Waste Management, and Facility Management.",
  coreValues: ["Integrity", "Reliability", "Professionalism", "Responsiveness", "Customer First"],
  areasOfSpecialization: [
    {
      title: "Security Services",
      description: "Expertly trained personnel equipped with modern security systems.",
      icon: Shield,
    },
    {
      title: "Facility Management",
      description: "Comprehensive maintenance and operational support for your infrastructure.",
      icon: Briefcase,
    },
    {
      title: "Housekeeping",
      description: "Professional cleaning and hygiene maintenance standards.",
      icon: Zap,
    },
    {
      title: "Solid Waste Mgmt",
      description: "Sustainable and efficient waste processing solutions.",
      icon: CheckCircle,
    },
    {
      title: "Payroll Mgmt",
      description: "Accurate and timely payroll processing and consultancy.",
      icon: Users,
    },
  ],
  leadership: [
    { name: "Kshitiz Tulsyan", designation: "Director", image: "/directors/kshitiz.png" },
    { name: "Anubhav Tulsyan", designation: "Director", image: "/directors/anubhav.png" },
  ],
  contactInfo: {
    address: "24 A, Chandra Nagar, MR 9 Road, Indore, MP - 452010",
    phone: ["0731-4098357", "9993997072"],
    email: "info@tulsyans.com",
  },
  caseStudies: [
    {
      client: "Bharat Petroleum Corporation Limited (BPCL)",
      project: "COCO Petrol Pump Management - Madhya Pradesh",
      scope: "Managed full-time sales, service, safety, and hygiene for BPCL's largest COCO pump.",
      tenure: "3 years",
      annualSales: "11,000 KL",
      manpower: "45 employees",
      image: "/petrol-pump/petrol-pump.png",
    },
  ],
  stats: [
    { label: "Years of Excellence", value: 10, suffix: "+" },
    { label: "Security Personnel", value: 2000, suffix: "+" },
    { label: "Cities Covered", value: 15, suffix: "+" },
    { label: "Client Retention", value: 98, suffix: "%" },
  ],
}

// --- Components ---

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const springValue = useSpring(0, { duration: 2000, bounce: 0 })

  useEffect(() => {
    if (isInView) {
      springValue.set(value)
    }
  }, [isInView, value, springValue])

  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest))
    })
  }, [springValue])

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  )
}

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => {
    setOpacity(1)
  }

  const handleBlur = () => {
    setOpacity(0)
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(180,32,37,0.1), transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  )
}

// --- Main Page ---

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      
      // Determine active section
      const sections = ["home", "services", "about", "contact"]
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveTab(section)
            break
          }
        }
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const logoSrc = "/tss-logo.png"

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
      
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-primary z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Header */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[90%] max-w-7xl transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-md border border-border/50 shadow-lg rounded-full py-3 px-6 dark:bg-background/80"
            : "bg-transparent py-6 px-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`relative transition-all duration-300 ${scrolled ? "w-8 h-8" : "w-10 h-10"}`}>
              <Image
                src={logoSrc}
                alt={companyData.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold tracking-tight text-foreground transition-all duration-300 ${scrolled ? "text-sm" : "text-lg md:text-xl"}`}>
                Tulsyan Security <span className="hidden md:inline">Solutions Pvt. Ltd.</span><span className="md:hidden">Solutions</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className={`hidden md:flex items-center gap-1 rounded-full p-1.5 transition-colors duration-300 ${scrolled ? "bg-transparent border-none" : "bg-muted/50 backdrop-blur-md border border-white/5"}`}>
            {["Home", "Services", "About", "Contact"].map((item) => {
              const isActive = activeTab === item.toLowerCase()
              return (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setActiveTab(item.toLowerCase())}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 border border-transparent
                    hover:text-brand-primary hover:bg-brand-primary/10 hover:border-brand-primary
                    ${isActive 
                      ? "text-brand-primary bg-brand-primary/10 border-brand-primary" 
                      : scrolled ? "text-foreground/70" : "text-muted-foreground"
                    }`}
                >
                  {item}
            </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
            <ThemeToggle />
            </div>
            <Button 
              asChild 
              className={`rounded-full bg-brand-primary text-white hover:bg-brand-primary-dark shadow-lg hover:shadow-brand-primary/25 transition-all duration-300 ${scrolled ? "h-9 px-4 text-xs" : "h-11 px-6"}`}
            >
              <Link href="#contact">Book a Call</Link>
            </Button>
            
            <button 
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-[60] bg-background"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-12">
                <span className="font-bold text-xl">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-muted rounded-full">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-col gap-6 text-2xl font-medium">
                {["Home", "Services", "About", "Contact"].map((item) => {
                  const isActive = activeTab === item.toLowerCase()
                  return (
                    <Link
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      onClick={() => {
                        setActiveTab(item.toLowerCase())
                        setMobileMenuOpen(false)
                      }}
                      className={`transition-colors ${isActive ? "text-brand-primary" : "hover:text-brand-primary"}`}
                    >
                      {item}
                    </Link>
                  )
                })}
              </div>
              <div className="mt-auto space-y-6">
                <div className="p-6 bg-muted/50 rounded-3xl">
                   <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Get in Touch</h4>
                   <p className="text-lg mb-2">{companyData.contactInfo.phone[0]}</p>
                   <p className="text-muted-foreground">{companyData.contactInfo.email}</p>
                </div>
                <Button className="w-full h-12 rounded-xl text-lg bg-brand-primary text-white" onClick={() => setMobileMenuOpen(false)} asChild>
                  <Link href="#contact">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section id="home" className="relative w-full min-h-screen flex items-center pt-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(180,32,37,0.03),transparent_50%)]" />
          
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 text-center lg:text-left space-y-8 z-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border/50 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Now serving 15+ cities</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                  Security Beyond <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 text-brand-primary">Guardianship.</span>
                    <span className="absolute bottom-2 left-0 right-0 h-3 bg-brand-primary/10 -rotate-1 z-0 rounded-full" />
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  We provide comprehensive facility management and security solutions that empower businesses to operate without interruption.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-4">
                  <Button size="lg" className="rounded-full h-14 px-8 text-base bg-brand-primary hover:bg-brand-primary-dark text-white shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-1 transition-all duration-300" asChild>
                    <Link href="#contact">
                      Partner With Us
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-2 hover:bg-muted hover:text-foreground transition-all duration-300" asChild>
                    <Link href="#services" className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                          <Play className="h-3 w-3 fill-brand-primary text-brand-primary" />
                       </div>
                       <span>View Services</span>
                    </Link>
                  </Button>
                </div>

                <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                         <Users className="h-5 w-5 opacity-50" />
                  </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">2000+</div>
                    <div>Professionals Deployed</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex-1 relative w-full max-w-[600px] lg:max-w-none"
              >
                <div className="relative aspect-square md:aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-primary/10 border border-white/10">
                  <Image
                    src="/security-guards/security-guards.png"
                    alt="Security Team"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover hover:scale-105 transition-transform duration-[1.5s]"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none" />
                  
                  {/* Floating Cards */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white max-w-[200px]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-400" />
                      <span className="font-bold text-sm">ISO 9001:2015</span>
                    </div>
                    <p className="text-xs opacity-80">Certified for Quality Management Systems</p>
                  </motion.div>
                </div>
                
                {/* Decorative Blur */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-primary/20 blur-[100px] rounded-full opacity-50" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="py-12 border-y border-border/50 bg-muted/20">
           <div className="container mx-auto px-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                {companyData.stats.map((stat, i) => (
                   <div key={i} className="text-center space-y-2">
                      <div className="text-4xl md:text-5xl font-bold text-brand-primary tabular-nums">
                         <Counter value={stat.value} suffix={stat.suffix} />
            </div>
                      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                    </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-32 relative">
           <div className="container mx-auto px-6">
             <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div className="max-w-2xl space-y-4">
                   <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Expertise in Action</h2>
                   <p className="text-lg text-muted-foreground">
                     We don't just offer services; we deliver peace of mind through our comprehensive range of facility solutions.
                   </p>
                </div>
                <Button variant="ghost" className="group text-brand-primary hover:text-brand-primary-dark hover:bg-brand-primary/5" asChild>
                  <Link href="#contact">
                     View All Capabilities <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyData.areasOfSpecialization.map((item, idx) => (
                   <SpotlightCard key={idx} className="group h-full bg-muted/30 border-border/50">
                      <div className="p-8 h-full flex flex-col">
                         <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                            <item.icon className="h-7 w-7" />
                         </div>
                         <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                         <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                            {item.description}
                         </p>
                         <div className="flex items-center text-sm font-semibold text-brand-primary">
                            Learn More <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                         </div>
                      </div>
                   </SpotlightCard>
                ))}
            </div>
          </div>
        </section>

        {/* About / Why Us */}
        <section id="about" className="py-32 bg-foreground text-background relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-zinc-900/50 skew-x-12 translate-x-1/4 pointer-events-none" />
           
           <div className="container mx-auto px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                 <div className="space-y-10">
                    <Badge variant="outline" className="text-white border-white/20 py-1 px-4">About Us</Badge>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                       Founded on Trust. <br />
                       <span className="text-zinc-500">Built for Reliability.</span>
                </h2>
                    <div className="space-y-6 text-lg text-zinc-400">
                       <p>
                          Since {companyData.founded}, {companyData.name} has been at the forefront of the outsourcing industry in Central India.
                       </p>
                       <p>
                          What started as a security agency has evolved into a multi-faceted facility management partner for over 50+ major corporations.
                       </p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-6 pt-4">
                       {companyData.coreValues.slice(0,4).map((val, i) => (
                          <div key={i} className="flex items-center gap-3 text-white">
                             <CheckCircle className="h-5 w-5 text-brand-primary" />
                             <span>{val}</span>
                    </div>
                  ))}
                    </div>

                    <div className="pt-8">
                       <div className="flex items-center gap-4">
                          <div className="flex -space-x-4">
                             {companyData.leadership.map((leader, i) => (
                                <div key={i} className="relative w-14 h-14 rounded-full border-2 border-black overflow-hidden">
                                   <Image src={leader.image} alt={leader.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                      </div>
                ))}
              </div>
                          <div>
                             <div className="text-white font-medium">Lead by Industry Veterans</div>
                             <div className="text-zinc-500 text-sm">The Tulsyan Brothers</div>
            </div>
          </div>
                    </div>
                  </div>
                 
                 <div className="relative h-[600px] w-full rounded-[2rem] overflow-hidden bg-zinc-800 border border-white/5">
                    <Image
                       src="/training/training.png" 
                       alt="Training Session" 
                       fill 
                       sizes="(max-width: 768px) 100vw, 50vw"
                       className="object-cover opacity-60 hover:opacity-80 transition-opacity duration-700"
                    />
                    <div className="absolute bottom-0 left-0 p-10 w-full bg-gradient-to-t from-black/90 to-transparent">
                       <Quote className="h-12 w-12 text-brand-primary mb-6 opacity-50" />
                       <p className="text-2xl font-medium text-white italic mb-4">
                          "Our mission is to provide peace of mind. When you partner with us, you're not just hiring guards; you're securing your legacy."
                       </p>
                       <p className="text-zinc-400 font-semibold">- Kshitiz Tulsyan, Director</p>
                    </div>
                 </div>
                </div>
          </div>
        </section>

        {/* Case Study Spotlight */}
        <section className="py-32">
           <div className="container mx-auto px-6">
              <div className="rounded-[3rem] overflow-hidden bg-muted relative">
                 <div className="grid lg:grid-cols-2">
                    <div className="p-12 lg:p-24 flex flex-col justify-center space-y-8">
                       <Badge className="w-fit bg-brand-primary text-white hover:bg-brand-primary-dark">Success Story</Badge>
                       <h3 className="text-4xl font-bold">{companyData.caseStudies[0].project}</h3>
                       <p className="text-xl text-muted-foreground">
                          {companyData.caseStudies[0].scope}
                       </p>
                       <div className="grid grid-cols-2 gap-8 py-8 border-y border-border/50">
                          <div>
                             <div className="text-3xl font-bold text-foreground">{companyData.caseStudies[0].tenure}</div>
                             <div className="text-sm text-muted-foreground">Partnership Duration</div>
                          </div>
                          <div>
                             <div className="text-3xl font-bold text-foreground">{companyData.caseStudies[0].manpower}</div>
                             <div className="text-sm text-muted-foreground">Dedicated Staff</div>
                          </div>
                        </div>
                       <Button variant="outline" className="w-fit rounded-full px-8 border-foreground hover:bg-foreground hover:text-background transition-colors" asChild>
                          <Link href="#contact">Request Similar Solution</Link>
                       </Button>
                    </div>
                    <div className="relative min-h-[400px] lg:min-h-full">
                  <Image
                          src={companyData.caseStudies[0].image} 
                          alt="Case Study" 
                    fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                  />
                </div>
            </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-24 relative overflow-hidden">
           <div className="absolute inset-0 bg-brand-primary/5 -z-10" />
           <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                 <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                    Ready to Upgrade Your Operations?
                </h2>
                 <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Join the league of satisfied clients who trust Tulsyan Security Services for their manpower needs.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Card className="flex-1 p-8 border-0 shadow-xl hover:-translate-y-2 transition-transform duration-300 bg-background">
                       <Phone className="h-10 w-10 text-brand-primary mb-4 mx-auto" />
                       <h3 className="font-bold text-lg mb-2">Call Us Directly</h3>
                       <p className="text-muted-foreground mb-6">Immediate assistance for your queries</p>
                       <Button className="w-full rounded-full bg-brand-primary text-white hover:bg-brand-primary-dark" asChild>
                          <a href={`tel:${companyData.contactInfo.phone[0]}`}>
                             Call {companyData.contactInfo.phone[0]}
                          </a>
                       </Button>
                  </Card>

                    <Card className="flex-1 p-8 border-0 shadow-xl hover:-translate-y-2 transition-transform duration-300 bg-background">
                       <Mail className="h-10 w-10 text-brand-primary mb-4 mx-auto" />
                       <h3 className="font-bold text-lg mb-2">Email Us</h3>
                       <p className="text-muted-foreground mb-6">Get a detailed quote within 24 hours</p>
                       <Button variant="outline" className="w-full rounded-full border-2 border-muted-foreground/20 hover:border-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300" asChild>
                          <a href={`mailto:${companyData.contactInfo.email}`}>
                             Send an Email
                          </a>
                       </Button>
                  </Card>
                </div>

                 <div className="pt-16 pb-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground border-t border-border/50 mt-16">
                     <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{companyData.contactInfo.address}</span>
                     </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-background border-t border-border">
         <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {companyData.name}. All rights reserved.</p>
            <div className="flex gap-8">
               <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
               <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
               <Link href="/login" className="hover:text-foreground transition-colors">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
