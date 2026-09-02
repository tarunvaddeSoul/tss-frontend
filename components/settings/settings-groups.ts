import type { LucideIcon } from "lucide-react"
import { Briefcase, Building2, DollarSign, Factory, Shield, ShieldCheck, User, Users } from "lucide-react"

import { Role } from "@/types/auth"

export interface SettingsLink {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export interface SettingsGroup {
  label: string
  description: string
  links: SettingsLink[]
  adminOnly?: boolean
}

const settingsGroups: SettingsGroup[] = [
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
      { title: "Service Types", description: "Manage the services TSS offers", href: "/settings/service-type", icon: ShieldCheck },
      { title: "Sectors", description: "Manage client industry sectors", href: "/settings/sector", icon: Factory },
      {
        title: "Salary Rate Schedule",
        description: "Per-day rates for Central and State categories",
        href: "/settings/salary-rate-schedule",
        icon: DollarSign,
      },
    ],
  },
  {
    label: "Administration",
    description: "Portal accounts for the internal team.",
    adminOnly: true,
    links: [
      { title: "Users", description: "Invite people and control who can sign in", href: "/settings/users", icon: Users },
    ],
  },
]

export function visibleSettingsGroups(role?: Role | null): SettingsGroup[] {
  return settingsGroups.filter((group) => !group.adminOnly || role === Role.ADMIN)
}
