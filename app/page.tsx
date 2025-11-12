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
  ChevronRight,
  Building2,
  Briefcase,
  TrendingUp,
  Target,
  Heart,
  Leaf,
  Globe,
  FileText,
  PhoneCall,
  ExternalLink,
  Award as AwardIcon,
  Sparkles,
  Recycle,
  Wrench,
  DollarSign,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState } from "react"

// Company data from profile
const companyData = {
  name: "Tulsyan Security Services Pvt. Ltd. (TSSPL)",
  formerName: "Tulsyan Outsourcing Pvt. Ltd.",
  founded: 2013,
  headOffice: "Indore, Madhya Pradesh, India",
  employees: "2000+",
  industry: "Manpower and Outsourcing Services",
  overview: "Tulsyan Security Services Pvt. Ltd. is a trusted provider of comprehensive outsourcing solutions, specializing in Security Services, Housekeeping, Solid Waste Management, Payroll Management, Electricity Meter Reading and Bill Distribution, and complete Facility Management. With over a decade of consistent growth, TSSPL has expanded its expertise into emerging sectors such as Smart City projects, Renewable Energy, and Civil Service Work.",
  coreValues: ["Integrity", "Reliability", "Professionalism", "Responsiveness", "Customer First"],
  missionStatement: [
    "Provide high-quality, affordable contract outsourcing solutions.",
    "Create and cultivate long-term relationships with clients.",
    "Respond immediately to the changing needs of clients.",
    "Achieve complete customer satisfaction.",
    "Continuously improve customer service standards.",
  ],
  competitiveAdvantages: [
    "Zero investment required on machines or equipment.",
    "Comprehensive security and facility management under one roof.",
    "Reduced administrative burden for manpower control.",
    "Hygienic and well-maintained environments.",
    "No downtime stress for machine breakdowns or consumable inventory management.",
  ],
  areasOfSpecialization: [
    "Security Services",
    "Meter Reading and Bill Distribution",
    "Solid Waste Management",
    "Housekeeping",
    "Electrical & Mechanical (E&M) / Operations & Maintenance (O&M) Management",
    "Payroll Management and Consultancy",
    "Facility Management",
  ],
  leadership: [
    { name: "Kshitiz Tulsyan", designation: "Director", image: "/directors/kshitiz.png" },
    { name: "Anubhav Tulsyan", designation: "Director", image: "/directors/anubhav.png" },
  ],
  contactInfo: {
    address: "24 A, Chandra Nagar, MR 9 Road, Indore, Madhya Pradesh - 452010, India",
    branchOffices: ["Bhopal", "Jodhpur", "Ahmedabad", "Dewas", "Dhar", "Pithampur", "Kota"],
    phone: ["0731-4098357", "9993997072"],
    email: "info@tulsyans.com",
    website: "www.tulsyans.com",
  },
  certifications: [
    "Security Leadership Award",
    "Best Security Agency Award (Madhya Pradesh)",
    "Young Entrepreneur Award",
    "Special recognition for Sanitation Training Workshop",
  ],
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
  csrInitiatives: [
    {
      initiative: "Traffic Management",
      impact: "Reduced congestion, improved road safety, and enhanced transport efficiency.",
    },
    {
      initiative: "Waste Management",
      impact: "Transformed a dumping site into a public-friendly area and selfie point.",
    },
    {
      initiative: "Social Awareness Film - 'Warning Call'",
      impact: "Highlighted environmental issues like deforestation and pollution caused by traditional funeral practices.",
    },
  ],
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currentYear = new Date().getFullYear()
  const yearsOfExperience = currentYear - companyData.founded

  const logoSrc = "/tss-logo.png"

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image
                src={logoSrc}
                alt={companyData.name}
                width={40}
                height={40}
                className="object-contain transition-transform group-hover:scale-105"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground leading-tight">Tulsyan Security</span>
              <span className="text-xs text-muted-foreground">Services Pvt. Ltd.</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#home" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2">
              Home
            </Link>
            <Link href="#services" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2">
              Services
            </Link>
            <Link href="#about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2">
              About Us
            </Link>
            <Link href="#contact" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Button asChild className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-sm hover:shadow-md transition-all">
              <Link href="#contact">Request a Quote</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Link href="#home" className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground">Home</Link>
              <Link href="#services" className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground">Services</Link>
              <Link href="#about" className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground">About Us</Link>
              <Link href="#contact" className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground">Contact</Link>
              <div className="pt-4">
                <Button className="w-full bg-primary hover:bg-primary-dark" asChild>
                  <Link href="#contact">Request a Quote</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section id="home" className="w-full py-20 lg:py-32 relative overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm">
                  <AwardIcon className="h-4 w-4 mr-2" />
                  {yearsOfExperience}+ Years of Excellence • {companyData.employees} Employees
                </Badge>

                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                    Comprehensive{" "}
                    <span className="bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
                      Outsourcing Solutions
                    </span>
                    <br />
                    <span className="text-3xl md:text-4xl lg:text-5xl">Since {companyData.founded}</span>
                  </h1>
                  <p className="text-lg md:text-xl text-foreground/70 max-w-2xl leading-relaxed">
                    {companyData.overview}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="bg-primary hover:bg-primary-dark text-primary-foreground px-8 shadow-lg hover:shadow-xl transition-all group" asChild>
                    <Link href="#contact">
                      Request a Quote
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-border hover:bg-muted px-8" asChild>
                    <Link href="#services">
                      <Briefcase className="mr-2 h-5 w-5" />
                      Our Services
                    </Link>
                  </Button>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-6 text-sm text-foreground/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Trusted by {companyData.employees}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{companyData.headOffice}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-warning" />
                    <span>Award-Winning Services</span>
                  </div>
                </div>
              </div>

              {/* Right Image - Security Guards */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20">
                  <Image
                    src="/security-guards/security-guards.png"
                    alt="Professional Security Guards"
                    width={600}
                    height={400}
                    className="object-cover w-full h-auto"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-card border-2 border-primary/20 rounded-xl p-4 shadow-xl hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{companyData.employees}</p>
                      <p className="text-xs text-muted-foreground">Trained Professionals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="w-full py-16 lg:py-24 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Target className="h-4 w-4 mr-2" />
                Our Core Values
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">What We Stand For</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {companyData.coreValues.map((value, index) => (
                <Card key={index} className="text-center border-2 hover:border-primary/50 transition-all hover:shadow-lg bg-gradient-to-br from-card to-card/50 group">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                      <Star className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base leading-tight">{value}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section with Images */}
        <section id="services" className="w-full py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Briefcase className="h-4 w-4 mr-2" />
                Our Services
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Comprehensive{" "}
                <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Outsourcing Solutions
                </span>
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                One-stop solution for all your outsourcing and facility management needs
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {companyData.areasOfSpecialization.map((service, index) => {
                const icons = [Shield, FileText, Recycle, Building2, Wrench, DollarSign, Globe]
                const Icon = icons[index % icons.length]
                return (
                  <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card via-card/95 to-card/90 overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                      {index === 0 && (
                        <Image
                          src="/security-guards/security-guards-1.png"
                          alt="Security Services"
                          fill
                          className="object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Icon className="h-10 w-10 text-primary" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-foreground leading-tight mb-2">{service}</h3>
                      <p className="text-sm text-muted-foreground">Professional {service.toLowerCase()} solutions tailored to your needs</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Security Services Detailed Section */}
        <section className="w-full py-20 lg:py-32 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/security-guards/security-guards-1.png"
                    alt="Professional Security Services"
                    width={600}
                    height={500}
                    className="object-cover w-full h-auto"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Shield className="h-4 w-4 mr-2" />
                  Core Business
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  Professional{" "}
                  <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    Security Services
                  </span>
                </h2>
                <p className="text-lg text-foreground/70 leading-relaxed">
                  Security Services is the core business of TSSPL. The company employs well-trained security guards equipped with modern security systems, supervised by ex-Army personnel to ensure discipline and operational excellence.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  {[
                    "Site risk assessment",
                    "Security policy and governance",
                    "Incident management",
                    "Access control and authentication",
                    "Security monitoring",
                    "Asset protection",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>
                <Button size="lg" variant="outline" className="mt-4" asChild>
                  <Link href="#contact">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Training Section */}
        <section className="w-full py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 order-2 lg:order-1">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Training Excellence
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  Comprehensive{" "}
                  <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    Training Programs
                  </span>
                </h2>
                <p className="text-lg text-foreground/70 leading-relaxed">
                  Our rigorous training programs ensure that every team member is equipped with the latest skills and knowledge. From security protocols to emergency response, we maintain the highest standards of professional development.
                </p>
                <div className="space-y-4 pt-4">
                  {[
                    "Regular firefighting and emergency response training",
                    "Professional grooming and behavior standards",
                    "Security training and awareness programs",
                    "Monthly review meetings for continuous improvement",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative order-1 lg:order-2">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/training/training.png"
                    alt="Training Programs"
                    width={600}
                    height={500}
                    className="object-cover w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-card border-2 border-primary/20 rounded-xl p-4 shadow-xl hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Certified</p>
                      <p className="text-xs text-muted-foreground">Training Programs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="w-full py-20 lg:py-32 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-4 mb-12">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Zap className="h-4 w-4 mr-2" />
                  Why Choose Us
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Our{" "}
                  <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    Competitive Advantages
                  </span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyData.competitiveAdvantages.map((advantage, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                          <CheckCircle className="h-7 w-7 text-primary" />
                        </div>
                        <p className="text-foreground leading-relaxed text-base pt-1">{advantage}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: companyData.employees, label: "Employees", icon: Users, color: "text-primary" },
                { number: `${yearsOfExperience}+`, label: "Years Experience", icon: Clock, color: "text-success" },
                { number: `${companyData.contactInfo.branchOffices.length}+`, label: "Branch Offices", icon: Building2, color: "text-info" },
                { number: "100%", label: "Client Satisfaction", icon: Award, color: "text-warning" },
              ].map((stat, index) => (
                <div key={index} className="text-center space-y-4 group">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{stat.number}</div>
                  <div className="text-base text-foreground/70 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Case Study Section */}
        <section className="w-full py-20 lg:py-32 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Trophy className="h-4 w-4 mr-2" />
                Success Stories
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Our{" "}
                <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Case Studies
                </span>
              </h2>
            </div>
            {companyData.caseStudies.map((study, index) => (
              <Card key={index} className="max-w-5xl mx-auto border-2 hover:border-primary/50 transition-all overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto">
                    <Image
                      src={study.image}
                      alt={study.project}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
                    <Badge className="w-fit mb-4 bg-primary/10 text-primary border-primary/20">
                      {study.client}
                    </Badge>
                    <h3 className="text-2xl font-bold text-foreground mb-4">{study.project}</h3>
                    <p className="text-foreground/70 mb-6 leading-relaxed">{study.scope}</p>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-2xl font-bold text-primary">{study.tenure}</p>
                        <p className="text-xs text-muted-foreground">Tenure</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{study.annualSales}</p>
                        <p className="text-xs text-muted-foreground">Annual Sales</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{study.manpower}</p>
                        <p className="text-xs text-muted-foreground">Manpower</p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Leadership Section */}
        <section id="about" className="w-full py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Users className="h-4 w-4 mr-2" />
                  Leadership
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Meet Our{" "}
                  <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    Leadership Team
                  </span>
                </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                  Guided by experienced directors committed to excellence and innovation
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {companyData.leadership.map((leader, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-xl overflow-hidden group">
                    <div className="relative h-64 bg-gradient-to-br from-primary/10 to-primary/5">
                      <Image
                        src={leader.image}
                        alt={leader.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold text-foreground mb-2">{leader.name}</h3>
                      <p className="text-primary font-semibold">{leader.designation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border-2 hover:border-primary/30 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      Mission Statement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {companyData.missionStatement.map((mission, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-foreground/80 text-sm leading-relaxed">{mission}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border-2 hover:border-primary/30 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      Certifications & Awards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {companyData.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-muted/50 via-muted/40 to-muted/30 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Award className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-foreground text-sm leading-relaxed">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Awards Section */}
        <section className="w-full py-20 lg:py-32 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-4 mb-12">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Trophy className="h-4 w-4 mr-2" />
                  Recognition
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  Awards &{" "}
                  <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    Certifications
                  </span>
                </h2>
              </div>
              <Card className="border-2 hover:border-primary/50 transition-all overflow-hidden">
                <div className="relative h-96">
                  <Image
                    src="/awards/image.png"
                    alt="Awards and Certifications"
                    fill
                    className="object-contain"
                  />
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CSR Initiatives */}
        <section className="w-full py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Heart className="h-4 w-4 mr-2" />
                Corporate Social Responsibility
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Our{" "}
                <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  CSR Initiatives
                </span>
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Committed to making a positive impact in our communities
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {companyData.csrInitiatives.map((initiative, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      {initiative.initiative}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70 leading-relaxed">{initiative.impact}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-20 lg:py-32 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Phone className="h-4 w-4 mr-2" />
                  Get In Touch
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Ready to Partner with{" "}
                  <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    Tulsyan Security Services?
                  </span>
                </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                  Let's discuss how we can help streamline your operations and boost efficiency.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <MapPin className="h-8 w-8 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground mb-2 text-lg">Head Office</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{companyData.contactInfo.address}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Phone className="h-8 w-8 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground mb-3 text-lg">Phone</h3>
                          <div className="space-y-2">
                            {companyData.contactInfo.phone.map((phone, index) => (
                              <a key={index} href={`tel:${phone}`} className="block text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                                {phone}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground mb-2 text-lg">Email</h3>
                          <a href={`mailto:${companyData.contactInfo.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors break-all font-medium">
                            {companyData.contactInfo.email}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                    <CardContent className="p-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Building2 className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground text-lg">Branch Offices</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {companyData.contactInfo.branchOffices.map((branch, index) => (
                            <Badge key={index} variant="outline" className="text-sm px-3 py-1.5 border-2 hover:border-primary/50 transition-colors">
                              {branch}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border-2">
                  <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>Fill out the form below and we'll get back to you soon.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="First Name"
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                      <textarea
                        placeholder="Your Message"
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
                      />
                      <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                        Send Message
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Image src={logoSrc} alt={companyData.name} width={40} height={40} className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-foreground leading-tight">Tulsyan Security</span>
                  <span className="text-xs text-muted-foreground">Services Pvt. Ltd.</span>
                </div>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {companyData.overview.substring(0, 120)}...
              </p>
              <div className="flex gap-4">
                <a href={`mailto:${companyData.contactInfo.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
                <a href={`tel:${companyData.contactInfo.phone[0]}`} className="text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Services</h3>
              <div className="space-y-2">
                {companyData.areasOfSpecialization.slice(0, 5).map((service) => (
                  <Link key={service} href="#services" className="block text-sm text-foreground/70 hover:text-foreground transition-colors">
                    {service}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Company</h3>
              <div className="space-y-2">
                <Link href="#about" className="block text-sm text-foreground/70 hover:text-foreground transition-colors">
                  About Us
                </Link>
                <Link href="#contact" className="block text-sm text-foreground/70 hover:text-foreground transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Contact Info</h3>
              <div className="space-y-3 text-sm text-foreground/70">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="break-words">{companyData.contactInfo.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{companyData.contactInfo.phone[0]}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="break-all">{companyData.contactInfo.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-foreground/60">
              &copy; {currentYear} {companyData.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-foreground/60">
              <span>Formerly: {companyData.formerName}</span>
              <span>•</span>
              <span>Est. {companyData.founded}</span>
              <span>•</span>
              <Link href="/login" className="text-foreground/40 hover:text-foreground/60 transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
