import type React from "react"

import Link from "next/link"
import { User, Shield, Building2, Briefcase, DollarSign, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"

interface SettingsLink {
  title: string
  description: string
  href: string
  icon: React.ElementType
}

const groups: { label: string; description: string; links: SettingsLink[] }[] = [
  {
    label: "My Account",
    description: "Your personal login and profile.",
    links: [
      { title: "My Profile", description: "Name, email, mobile and department", href: "/settings/profile", icon: User },
      { title: "Password", description: "Change your login password", href: "/settings/security", icon: Shield },
    ],
  },
  {
    label: "Company Setup",
    description: "Shared configuration for the whole company.",
    links: [
      { title: "Departments", description: "Manage employee and user departments", href: "/settings/department", icon: Building2 },
      { title: "Designations", description: "Manage job designations", href: "/settings/designation", icon: Briefcase },
      {
        title: "Salary Rate Schedule",
        description: "Per-day rates for Central and State categories",
        href: "/settings/salary-rate-schedule",
        icon: DollarSign,
      },
    ],
  },
]

export default function SettingsOverviewPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        no="06"
        eyebrow="Settings register"
        title="Settings"
        description="Manage your account and the company configuration."
      />

      {groups.map((group) => (
        <section key={group.label} className="space-y-3">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-[-0.02em]">{group.label}</h2>
            <p className="text-sm text-muted-foreground">{group.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.links.map((link) => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href} className="group">
                  <Card className="transition-colors hover:border-foreground/30 hover:bg-muted/40">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface text-muted-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{link.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{link.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
