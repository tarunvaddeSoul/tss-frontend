"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PayrollReportRecord } from "@/utils/payroll-export"

interface MonthPulseProps {
  records: PayrollReportRecord[] | null
  monthLabel: string
  activeClients: number
}

const inr = (n: number): string => `₹${Math.round(n).toLocaleString("en-IN")}`

export function MonthPulse({ records, monthLabel, activeClients }: MonthPulseProps) {
  if (records === null) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="registry-line mb-1.5">
            <span className="registry-eyebrow">This month · {monthLabel}</span>
          </div>
          <p className="text-sm text-muted-foreground">Payroll figures are unavailable right now.</p>
        </CardContent>
      </Card>
    )
  }

  let totalNet = 0
  let totalPF = 0
  let totalESIC = 0
  for (const record of records) {
    const salaryData = record.salaryData as any
    const calculations = salaryData?.calculations || {}
    const deductions = salaryData?.deductions || {}
    totalNet += calculations?.netSalary ?? salaryData?.netSalary ?? 0
    totalPF += deductions?.pf ?? salaryData?.pf ?? 0
    totalESIC += deductions?.esic ?? salaryData?.esic ?? 0
  }
  const employeesPaid = new Set(records.map((r) => r.employeeId)).size
  const clientsCovered = new Set(records.map((r) => r.clientId)).size
  const coveragePct = activeClients > 0 ? Math.min(100, Math.round((clientsCovered / activeClients) * 100)) : 0

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="registry-line mb-1.5">
              <span className="registry-eyebrow">This month · {monthLabel}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              No payroll on record yet for {monthLabel}.
            </p>
          </div>
          <Button asChild variant="brand" size="sm" className="flex-shrink-0">
            <Link href="/payroll/calculate">
              Run payroll <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="registry-line mb-5">
          <span className="registry-eyebrow">This month · {monthLabel}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          <div>
            <div className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Net payout
            </div>
            <div className="font-display font-expanded text-[1.75rem] font-bold leading-none text-brand nums">
              {inr(totalNet)}
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground nums">
              across {employeesPaid.toLocaleString("en-IN")} employees
            </div>
          </div>

          <div>
            <div className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              PF due
            </div>
            <div className="font-display font-expanded text-[1.75rem] font-bold leading-none nums">
              {inr(totalPF)}
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">employee contribution</div>
          </div>

          <div>
            <div className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              ESIC due
            </div>
            <div className="font-display font-expanded text-[1.75rem] font-bold leading-none nums">
              {inr(totalESIC)}
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">employee contribution</div>
          </div>

          <div>
            <div className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Payroll coverage
            </div>
            <div className="font-display font-expanded text-[1.75rem] font-bold leading-none nums">
              {clientsCovered}<span className="text-muted-foreground/60"> / {activeClients}</span>
            </div>
            <div className="mt-2 h-1 w-full max-w-[160px] rounded-sm bg-surface">
              <div className="h-1 rounded-sm bg-brand" style={{ width: `${coveragePct}%` }} />
            </div>
            <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">
              <Link href="/payroll/calculate">
                Run payroll <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
