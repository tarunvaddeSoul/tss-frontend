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
    { name: "Kshitiz Tulsyan", designation: "Director" },
    { name: "Anubhav Tulsyan", designation: "Director" },
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
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currentYear = new Date().getFullYear()
  const yearsOfExperience = currentYear - companyData.founded

  // Use single logo that works in both light and dark modes
  const logoSrc = "/tss-logo.png"

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0">
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
            <Link href="/login" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Login
            </Link>
            <Button asChild className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-sm hover:shadow-md transition-all">
              <Link href="/signup">Get Started</Link>
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
              <div className="pt-4 flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary-dark" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section id="home" className="w-full py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
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
                <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  {companyData.overview}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-primary-foreground px-8 shadow-lg hover:shadow-xl transition-all group" asChild>
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-border hover:bg-muted px-8" asChild>
                  <Link href="#contact">
                    <PhoneCall className="mr-2 h-5 w-5" />
                    Contact Us
                  </Link>
                </Button>
              </div>

              <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-foreground/60">
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
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {companyData.coreValues.map((value, index) => (
                <Card key={index} className="text-center border-2 hover:border-primary/50 transition-all hover:shadow-md bg-gradient-to-br from-card to-card/50">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Star className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm leading-tight break-words">{value}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyData.areasOfSpecialization.map((service, index) => {
                const icons = [Shield, FileText, Leaf, Building2, Zap, Briefcase, Globe]
                const Icon = icons[index % icons.length]
                return (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card via-card/95 to-card/90 hover:from-primary/5 hover:to-card/95">
                    <CardContent className="p-8">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all shadow-sm">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground leading-tight min-h-[3rem] flex items-center">{service}</h3>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
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
                  <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 hover:from-primary/5 hover:to-card/95">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <CheckCircle className="h-7 w-7 text-primary" />
                        </div>
                        <p className="text-foreground leading-relaxed text-base break-words pt-1">{advantage}</p>
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
                { number: companyData.employees, label: "Employees", icon: Users },
                { number: `${yearsOfExperience}+`, label: "Years Experience", icon: Clock },
                { number: `${companyData.contactInfo.branchOffices.length}+`, label: "Branch Offices", icon: Building2 },
                { number: "100%", label: "Client Satisfaction", icon: Award },
              ].map((stat, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <stat.icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-foreground">{stat.number}</div>
                  <div className="text-sm text-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-20 lg:py-32 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Users className="h-4 w-4 mr-2" />
                  About Us
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Leading{" "}
                  <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    Outsourcing Solutions Provider
                  </span>
                </h2>
                <p className="text-base md:text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  Founded in {companyData.founded}, {companyData.name} has been at the forefront of providing comprehensive outsourcing solutions. The company is guided by a strong commitment to excellence, reliability, and long-term client partnerships.
                </p>
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
                          <span className="text-foreground/80 text-sm leading-relaxed break-words">{mission}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border-2 hover:border-primary/30 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      Leadership
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {companyData.leadership.map((leader, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-muted/50 via-muted/40 to-muted/30 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Users className="h-7 w-7 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground break-words">{leader.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{leader.designation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Certifications & Awards */}
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
                  <div className="grid sm:grid-cols-2 gap-4">
                    {companyData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-muted/50 via-muted/40 to-muted/30 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-foreground text-sm break-words leading-relaxed">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-20 lg:py-32">
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
                          <p className="text-sm text-muted-foreground leading-relaxed break-words">{companyData.contactInfo.address}</p>
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
                              <a key={index} href={`tel:${phone}`} className="block text-sm text-muted-foreground hover:text-primary transition-colors break-words font-medium">
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
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <textarea
                        placeholder="Your Message"
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
              <p className="text-sm text-foreground/70 leading-relaxed break-words">
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
                <Link href="/login" className="block text-sm text-foreground/70 hover:text-foreground transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="block text-sm text-foreground/70 hover:text-foreground transition-colors">
                  Get Started
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
                  <span className="break-words">{companyData.contactInfo.phone[0]}</span>
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
            <div className="flex gap-6 text-xs text-foreground/60">
              <span>Formerly: {companyData.formerName}</span>
              <span>•</span>
              <span>Est. {companyData.founded}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
