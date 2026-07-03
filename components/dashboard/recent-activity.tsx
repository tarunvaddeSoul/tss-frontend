"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { label, formatDate } from "@/lib/labels"
import type { DashboardReportData, RecentPayroll } from "@/types/dashboard"

interface RecentActivityProps {
  data: DashboardReportData
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const monthShort = (monthStr: string): string => {
  if (!monthStr || !monthStr.includes("-")) return monthStr || "-"
  const [year, monthNum] = monthStr.split("-")
  const name = MONTH_NAMES[parseInt(monthNum, 10) - 1]
  return name ? `${name}-${year.slice(-2)}` : monthStr
}

interface PayrollRun {
  clientId: string
  clientName: string
  month: string
  payslips: number
  latest: string
}

const groupRuns = (records: RecentPayroll[]): PayrollRun[] => {
  const runs = new Map<string, PayrollRun>()
  for (const record of records) {
    const key = `${record.clientId}-${record.month}`
    const existing = runs.get(key)
    if (existing) {
      existing.payslips += 1
      if (record.createdAt > existing.latest) existing.latest = record.createdAt
    } else {
      runs.set(key, {
        clientId: record.clientId,
        clientName: record.client?.name || "Unknown client",
        month: record.month,
        payslips: 1,
        latest: record.createdAt,
      })
    }
  }
  return [...runs.values()].sort((a, b) => (a.latest < b.latest ? 1 : -1)).slice(0, 6)
}

export function RecentActivity({ data }: RecentActivityProps) {
  const joinees = (data.recentActivity?.recentJoinees ?? []).slice(0, 6)
  const runs = groupRuns(data.recentActivity?.recentPayrolls ?? [])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Recent joinees</CardTitle>
          <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
            <Link href="/employees/list">
              All employees <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {joinees.length === 0 ? (
            <div className="py-6">
              <div className="registry-line mb-2">
                <span className="registry-eyebrow">No records on file</span>
              </div>
              <p className="text-sm text-muted-foreground">No new joinees in this period.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {joinees.map((joinee) => (
                <li key={joinee.id} className="flex items-center gap-3 py-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-surface font-mono text-[11px]">
                      {`${joinee.firstName?.[0] ?? ""}${joinee.lastName?.[0] ?? ""}` || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {[label.title(joinee.title), joinee.firstName, joinee.lastName].filter(Boolean).join(" ")}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      joined {formatDate(joinee.employeeOnboardingDate)}
                    </p>
                  </div>
                  <Badge variant={joinee.status === "ACTIVE" ? "success" : "destructive"}>
                    {label.status(joinee.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Recent payroll runs</CardTitle>
          <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
            <Link href="/payroll/reports">
              Payroll reports <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <div className="py-6">
              <div className="registry-line mb-2">
                <span className="registry-eyebrow">No records on file</span>
              </div>
              <p className="text-sm text-muted-foreground">No payroll has been recorded recently.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {runs.map((run) => (
                <li key={`${run.clientId}-${run.month}`} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{run.clientName}</p>
                    <p className="font-mono text-[11px] text-muted-foreground nums">
                      {run.payslips.toLocaleString("en-IN")} payslips · {formatDate(run.latest)}
                    </p>
                  </div>
                  <Badge variant="info">{monthShort(run.month)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
