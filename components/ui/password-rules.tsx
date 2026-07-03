"use client"

import { Check, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"

interface Rule {
  key: string
  label: string
  test: (value: string) => boolean
}

const RULES: Rule[] = [
  { key: "length", label: "6-20 characters", test: (v) => v.length >= 6 && v.length <= 20 },
  { key: "upper", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { key: "digit", label: "One number", test: (v) => /[0-9]/.test(v) },
]

/**
 * Live password requirement check, register-style: each rule is a ledger row
 * that gets ticked as it passes, and the whole entry earns a VERIFIED stamp
 * once every rule is met (and the confirmation matches, when provided).
 */
export function PasswordRules({
  password,
  confirm,
  className,
}: {
  password: string
  confirm?: string
  className?: string
}) {
  const results = RULES.map((rule) => ({ ...rule, met: rule.test(password) }))
  const showMatchRow = confirm !== undefined && confirm.length > 0
  const matches = showMatchRow && password.length > 0 && password === confirm
  const metCount = results.filter((r) => r.met).length
  const allMet = metCount === RULES.length && (confirm === undefined || matches || confirm.length === 0)
  const verified = metCount === RULES.length && (confirm === undefined ? true : matches)

  return (
    <div className={cn("rounded-md border bg-surface/50 px-3.5 py-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="registry-line flex-1">
          <span className="registry-eyebrow">Password check</span>
        </div>
        <div aria-live="polite" className="flex h-6 items-center">
          {verified ? (
            <span className="stamp -rotate-6 border-success bg-success/[0.06] text-success stamp-in">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          ) : (
            <span className="font-mono text-[11px] text-muted-foreground nums">
              {metCount} / {RULES.length}
            </span>
          )}
        </div>
      </div>

      <ul className="mt-2.5 grid grid-cols-1 gap-y-1.5 sm:grid-cols-2 sm:gap-x-4">
        {results.map((rule) => (
          <li
            key={rule.key}
            className={cn(
              "flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] transition-colors duration-150",
              rule.met ? "text-success" : "text-muted-foreground",
            )}
          >
            {rule.met ? (
              <Check className="h-3 w-3 flex-shrink-0" />
            ) : (
              <span className="flex h-3 w-3 flex-shrink-0 items-center justify-center">
                <span className="h-1 w-1 rounded-full bg-current opacity-50" />
              </span>
            )}
            {rule.label}
            <span className="sr-only">{rule.met ? "(met)" : "(not met)"}</span>
          </li>
        ))}
        {showMatchRow && (
          <li
            className={cn(
              "flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] transition-colors duration-150 sm:col-span-2",
              matches ? "text-success" : "text-muted-foreground",
            )}
          >
            {matches ? (
              <Check className="h-3 w-3 flex-shrink-0" />
            ) : (
              <span className="flex h-3 w-3 flex-shrink-0 items-center justify-center">
                <span className="h-1 w-1 rounded-full bg-current opacity-50" />
              </span>
            )}
            Both passwords match
            <span className="sr-only">{matches ? "(met)" : "(not met)"}</span>
          </li>
        )}
      </ul>
    </div>
  )
}
