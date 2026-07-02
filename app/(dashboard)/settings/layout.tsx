"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Shield, ChevronRight, Building2, Briefcase, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingsNavItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface SettingsGroup {
  label: string
  items: SettingsNavItem[]
}

const settingsGroups: SettingsGroup[] = [
  {
    label: "My Account",
    items: [
      { title: "My Profile", href: "/settings/profile", icon: <User className="h-4 w-4" /> },
      { title: "Password", href: "/settings/security", icon: <Shield className="h-4 w-4" /> },
    ],
  },
  {
    label: "Company Setup",
    items: [
      { title: "Departments", href: "/settings/department", icon: <Building2 className="h-4 w-4" /> },
      { title: "Designations", href: "/settings/designation", icon: <Briefcase className="h-4 w-4" /> },
      { title: "Salary Rate Schedule", href: "/settings/salary-rate-schedule", icon: <DollarSign className="h-4 w-4" /> },
    ],
  },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl rounded-2xl overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Settings</h2>
              <nav className="space-y-5">
                {settingsGroups.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {group.label}
                    </p>
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          pathname === item.href
                            ? "bg-primary/20 text-primary"
                            : "text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/5",
                        )}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                        {pathname === item.href && <ChevronRight className="ml-auto h-4 w-4" />}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
