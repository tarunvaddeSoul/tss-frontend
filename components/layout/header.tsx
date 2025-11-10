"use client"

import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"

export function Header() {
  const { user, logout } = useAuth()

  const getInitials = (name: string | undefined) => {
    if (!name) return "U"
    const nameParts = name.trim().split(/\s+/)
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <header className="border-b bg-card shrink-0 z-40">
      <div className="flex h-16 items-center px-4 justify-between">
        {/* Mobile logo - hidden on desktop */}
        <div className="font-semibold text-lg lg:hidden">TSS</div>

        {/* Desktop spacer */}
        <div className="hidden lg:block" />

        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 bg-primary/10 hover:bg-primary/20 transition-colors">
                  <AvatarFallback className="text-primary font-medium">{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/security">Security</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
