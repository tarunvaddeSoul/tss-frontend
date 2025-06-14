import Link from "next/link"
import { Shield, Users, Clock, Award, Phone, Mail, MapPin, CheckCircle, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Cursor-style Navigation */}
      <header className="relative z-50 px-4 lg:px-6 h-16 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">TSS</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#home"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="#achievements"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Achievements
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section id="home" className="w-full py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-6 max-w-4xl">
                <div className="inline-flex items-center gap-2 bg-muted rounded-full px-6 py-2 border border-border">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Trusted by 500+ Companies</span>
                </div>

                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Tulsyan Security
                  </span>
                  <br />
                  <span className="text-foreground">Solutions</span>
                </h1>

                <p className="mx-auto max-w-[700px] text-xl text-muted-foreground leading-relaxed">
                  Revolutionary security management platform that transforms how you handle workforce operations,
                  attendance tracking, and payroll management with cutting-edge technology.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-primary/25 transition-all duration-300"
                  asChild
                >
                  <Link href="/login">
                    <Zap className="mr-2 h-5 w-5" />
                    Get Started Now
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-muted px-8 py-6 text-lg rounded-lg transition-all duration-300"
                  asChild
                >
                  <Link href="#about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-20 md:py-32 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-background rounded-full px-4 py-2 border border-border">
                    <span className="text-sm text-primary font-medium">About Us</span>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                    Pioneering the Future of
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {" "}
                      Security Management
                    </span>
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    With over a decade of excellence, Tulsyan Security Solutions has been at the forefront of
                    revolutionizing security operations. We combine cutting-edge technology with deep industry expertise
                    to deliver unparalleled workforce management solutions.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardContent className="p-6">
                      <Users className="h-8 w-8 text-primary mb-3" />
                      <h3 className="font-semibold text-foreground mb-2">Expert Team</h3>
                      <p className="text-sm text-muted-foreground">Industry veterans with 15+ years experience</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardContent className="p-6">
                      <Clock className="h-8 w-8 text-accent mb-3" />
                      <h3 className="font-semibold text-foreground mb-2">24/7 Support</h3>
                      <p className="text-sm text-muted-foreground">Round-the-clock assistance and monitoring</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="relative">
                <Card className="bg-card/50 backdrop-blur-sm border-border shadow-xl">
                  <CardContent className="p-8">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                          <Shield className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <p className="text-foreground font-medium">Advanced Security Dashboard</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section id="achievements" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-8 mb-16">
              <div className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-2 border border-border">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Our Achievements</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                Proven Track Record of
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {" "}
                  Excellence
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: "500+", label: "Companies Served", icon: Users },
                { number: "99.9%", label: "Uptime Guarantee", icon: CheckCircle },
                { number: "50K+", label: "Employees Managed", icon: Clock },
                { number: "15+", label: "Years Experience", icon: Award },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/80 transition-all duration-300"
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                      <stat.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold text-foreground">{stat.number}</h3>
                      <p className="text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-16 grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Advanced Analytics",
                  description: "Real-time insights and comprehensive reporting for data-driven decisions",
                  icon: "📊",
                },
                {
                  title: "Seamless Integration",
                  description: "Easy integration with existing systems and third-party applications",
                  icon: "🔗",
                },
                {
                  title: "Mobile First",
                  description: "Fully responsive design optimized for mobile and tablet devices",
                  icon: "📱",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/80 transition-all duration-300"
                >
                  <CardContent className="p-8">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-20 md:py-32 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-8 mb-16">
              <div className="inline-flex items-center gap-2 bg-background rounded-full px-4 py-2 border border-border">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Get In Touch</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                Ready to Transform Your
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {" "}
                  Security Operations?
                </span>
              </h2>
              <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
                Let's discuss how we can help streamline your security management and boost your operational efficiency.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="grid gap-6">
                  {[
                    { icon: Phone, title: "Phone", content: "+91 98765 43210", href: "tel:+919876543210" },
                    {
                      icon: Mail,
                      title: "Email",
                      content: "contact@tulsyansecurity.com",
                      href: "mailto:contact@tulsyansecurity.com",
                    },
                    { icon: MapPin, title: "Address", content: "123 Business District, Mumbai, India", href: "#" },
                  ].map((contact, index) => (
                    <Link
                      key={index}
                      href={contact.href}
                      className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:bg-card/80 transition-all duration-300 flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <contact.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{contact.title}</h3>
                        <p className="text-muted-foreground">{contact.content}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="First Name"
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Last Name"
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Your Message"
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      ></textarea>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg rounded-lg shadow-lg hover:shadow-primary/25 transition-all duration-300"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-card/50 backdrop-blur-sm border-t border-border">
        <div className="container px-4 md:px-6 py-12 mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">TSS</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Transforming security management with innovative technology and unmatched expertise.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Company</h3>
              <div className="space-y-2">
                {["About Us", "Careers", "News", "Contact"].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Services</h3>
              <div className="space-y-2">
                {["Workforce Management", "Attendance Tracking", "Payroll System", "Security Analytics"].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Legal</h3>
              <div className="space-y-2">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Tulsyan Security Solutions. All rights reserved.
            </p>
            <div className="flex gap-4">
              {["Twitter", "LinkedIn", "Facebook"].map((social) => (
                <Link
                  key={social}
                  href="#"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
