"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { visibleSettingsGroups } from "@/components/settings/settings-groups"

export default function SettingsLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname()
  const { user } = useAuth()
  const groups = visibleSettingsGroups(user?.role)

  return (
    <div className="mx-auto w-full max-w-[1400px] py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="rounded-md border bg-card">
            <div className="p-4">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em] mb-4">Settings</h2>
              <nav className="space-y-5">
                {groups.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <p className="px-3 pb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {group.label}
                    </p>
                    {group.links.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                            pathname === item.href
                              ? "bg-brand/10 text-brand font-medium"
                              : "text-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {pathname === item.href && <ChevronRight className="ml-auto h-4 w-4" />}
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
