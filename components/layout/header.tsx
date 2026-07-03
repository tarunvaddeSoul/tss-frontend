"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { MobileNav } from "@/components/layout/mobile-nav"

export function Header() {
  return (
    <header className="border-b bg-background shrink-0 z-40">
      <div className="flex h-14 items-center px-4 justify-between">
        {/* Mobile: hamburger + logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <MobileNav />
          <span className="font-display font-bold text-[15px] tracking-tight">TSS</span>
        </div>

        {/* Desktop spacer */}
        <div className="hidden lg:block" />

        <div className="ml-auto flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
