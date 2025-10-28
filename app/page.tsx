"use client"

import Link from "next/link"
import Image from "next/image"
import { Shield, Users, Clock, Award, Phone, Mail, MapPin, CheckCircle, Star, Zap, Menu, X, ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState } from "react"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
      </div>

      {/* Modern Cursor-style Navigation */}
      <header className="relative z-50 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image
                src="/tss-logo.png"
                alt="Tulsyan Security Solutions"
                width={40}
                height={40}
                className="object-contain transition-transform group-hover:scale-105"
                priority
              />
            </div>
            <span className="font-bold text-xl text-foreground">Tulsyan Security</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#home"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
            >
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Button asChild className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-sm hover:shadow-md transition-all">
              <Link href="/signup">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Link href="#home" className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground">Home</Link>
              <Link href="#features" className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground">Features</Link>
              <Link href="#about" className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground">About</Link>
              <Link href="#contact" className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground">Contact</Link>
              <div className="pt-4 flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/login">Sign in</Link>
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
        <section id="home" className="w-full py-32 lg:py-40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Trusted by 500+ Companies</span>
              </div>

              {/* Heading */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                  Revolutionary <br />
                  <span className="bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
                    Security Management
                  </span>
                </h1>
                <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                  Transform your security operations with cutting-edge technology. Manage workforce, track attendance, and process payroll all in one powerful platform.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-dark text-primary-foreground px-8 shadow-lg hover:shadow-xl transition-all group"
                  asChild
                >
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-muted px-8"
                  asChild
                >
                  <Link href="#about">
                    Watch Demo
                  </Link>
                </Button>
              </div>

              {/* Social Proof */}
              <div className="pt-12 flex items-center justify-center gap-8 text-sm text-foreground/60">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-info" />
                  <span>Setup in 5 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 lg:py-32 border-t border-border/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Features</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Everything You Need to <br />
                <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Manage Security Operations
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Workforce Management",
                  description: "Manage your entire security team from one powerful dashboard. Track assignments, schedules, and performance metrics.",
                  icon: Users,
                  color: "text-primary",
                },
                {
                  title: "Attendance Tracking",
                  description: "Real-time attendance tracking with biometric integration and automated reporting for accurate time management.",
                  icon: Clock,
                  color: "text-info",
                },
                {
                  title: "Payroll Processing",
                  description: "Streamlined payroll system with automated calculations, compliance management, and detailed reports.",
                  icon: Award,
                  color: "text-success",
                },
                {
                  title: "Analytics & Reports",
                  description: "Comprehensive analytics dashboard with custom reports and real-time insights for data-driven decisions.",
                  icon: Shield,
                  color: "text-warning",
                },
                {
                  title: "Mobile Access",
                  description: "Full-featured mobile app for iOS and Android. Manage operations on-the-go with complete functionality.",
                  icon: MapPin,
                  color: "text-primary",
                },
                {
                  title: "Advanced Security",
                  description: "Enterprise-grade security with role-based access control, audit logs, and encryption for data protection.",
                  icon: CheckCircle,
                  color: "text-success",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="security-card group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className={`w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-foreground/70 leading-relaxed">{feature.description}</p>
                    </div>
                    <div className="flex items-center text-sm text-primary group-hover:gap-2 transition-all gap-0">
                      Learn more
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-20 lg:py-32 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: "500+", label: "Companies Served", icon: Users },
                { number: "99.9%", label: "Uptime Guarantee", icon: CheckCircle },
                { number: "50K+", label: "Employees Managed", icon: Clock },
                { number: "15+", label: "Years Experience", icon: Award },
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
        <section id="about" className="w-full py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                  <span className="text-sm font-medium text-primary">About Us</span>
                </div>
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                    Pioneering the Future of{" "}
                    <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                      Security Management
                    </span>
                  </h2>
                  <p className="text-lg text-foreground/70 leading-relaxed">
                    With over a decade of excellence, Tulsyan Security Solutions has been at the forefront of revolutionizing security operations. We combine cutting-edge technology with deep industry expertise to deliver unparalleled workforce management solutions.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-8">
                  <Card className="security-card">
                    <CardContent className="p-6 space-y-3">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Expert Team</h3>
                        <p className="text-sm text-foreground/70">Industry veterans with 15+ years experience</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="security-card">
                    <CardContent className="p-6 space-y-3">
                      <Clock className="h-8 w-8 text-info" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">24/7 Support</h3>
                        <p className="text-sm text-foreground/70">Round-the-clock assistance and monitoring</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="relative">
                <Card className="security-card shadow-2xl">
                  <CardContent className="p-8">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20">
                      <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <Shield className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-foreground">Advanced Security Dashboard</p>
                          <p className="text-sm text-foreground/70 mt-2">Real-time monitoring and control</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-20 lg:py-32 bg-muted/30 border-t border-border/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Get In Touch</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  Ready to Transform Your{" "}
                  <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    Security Operations?
                  </span>
                </h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                  Let's discuss how we can help streamline your security management and boost your operational efficiency.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  {[
                    { icon: Phone, title: "Phone", content: "+91 98765 43210", href: "tel:+919876543210" },
                    { icon: Mail, title: "Email", content: "contact@tulsyansecurity.com", href: "mailto:contact@tulsyansecurity.com" },
                    { icon: MapPin, title: "Address", content: "123 Business District, Mumbai, India" },
                  ].map((contact, index) => (
                    <Link key={index} href={contact.href || "#"} className="block">
                      <Card className="security-card group cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <contact.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{contact.title}</h3>
                              <p className="text-sm text-foreground/70">{contact.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <Card className="security-card">
                  <CardContent className="p-8">
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
                      <textarea
                        placeholder="Your Message"
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                      >
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
                  <Image
                    src="/tss-logo.png"
                    alt="Tulsyan Security Solutions"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="font-bold text-xl text-foreground">Tulsyan Security</span>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Transforming security management with innovative technology and unmatched expertise.
              </p>
            </div>

            {[
              { title: "Company", links: ["About Us", "Careers", "News", "Contact"] },
              { title: "Services", links: ["Workforce Management", "Attendance Tracking", "Payroll System", "Security Analytics"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"] },
            ].map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-semibold text-foreground">{section.title}</h3>
                <div className="space-y-2">
                  {section.links.map((link) => (
                    <Link
                      key={link}
                      href="#"
                      className="block text-sm text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {link}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-foreground/60">
              &copy; {new Date().getFullYear()} Tulsyan Security Solutions. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Twitter", "LinkedIn", "Facebook"].map((social) => (
                <Link
                  key={social}
                  href="#"
                  className="text-xs text-foreground/70 hover:text-foreground transition-colors"
                >
                  {social}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
