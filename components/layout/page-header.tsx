import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Registry-line page header. `no` is the module's real register number
 * (sidebar order): 01 Dashboard, 02 Attendance, 03 Payroll, 04 Employees,
 * 05 Clients, 06 Settings. Sub-pages append a dot ordinal, e.g. "02.3".
 */
export function PageHeader({
  no,
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  no?: string
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}): ReactNode {
  return (
    <div className={cn("mb-6", className)}>
      <div className="registry-line mb-2">
        <span className="registry-eyebrow">
          {no ? <strong>N° {no}</strong> : null}
          {no ? " · " : null}
          {eyebrow}
        </span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
