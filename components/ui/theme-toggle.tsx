"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

// Each swatch depicts its own theme's paper and ink, so the fixed
// hexes are intentional; they must not follow the active theme.
const THEMES = [
  { value: "light", label: "Paper", paper: "#FAFAF9", ink: "#1B1B1D" },
  { value: "ledger", label: "Ledger", paper: "#E4EADF", ink: "#1D201B" },
  { value: "dark", label: "Night", paper: "#141416", ink: "#EDEDEB" },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      role="radiogroup"
      aria-label="Portal theme"
      className="inline-flex items-center gap-1 rounded-md border bg-card p-1"
    >
      {THEMES.map((t) => {
        const active = mounted && theme === t.value
        return (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${t.label} theme`}
            title={t.label}
            onClick={() => setTheme(t.value)}
            className={cn(
              "relative flex h-6 w-6 items-center justify-center rounded-sm border transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              active
                ? "border-brand ring-1 ring-brand"
                : "border-border hover:border-input",
            )}
            style={{ backgroundColor: t.paper }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: t.ink }}
            />
            <span className="sr-only">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
