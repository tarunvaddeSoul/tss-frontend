"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { employeeName, formatDate, formatMoney, formatMonth, label } from "@/lib/labels"
import type { DashboardReportData, RecentJoinee } from "@/types/dashboard"

interface RecentActivityProps {
  data: DashboardReportData
}

const joineeName = (joinee: RecentJoinee): string =>
  [joinee.title ? label.title(joinee.title) : "", employeeName(joinee)].filter(Boolean).join(" ")

const initials = (joinee: RecentJoinee): string =>
  employeeName(joinee)
    .split(" ")
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("") || "?"

const payslipCount = (count: number): string => `${count.toLocaleString("en-IN")} ${count === 1 ? "payslip" : "payslips"}`

export function RecentActivity({ data }: RecentActivityProps): JSX.Element {
  const joinees = (data.recentActivity?.recentJoinees ?? []).slice(0, 6)
  const runs = (data.recentActivity?.recentPayrolls ?? []).slice(0, 6)

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
                    <AvatarFallback className="bg-surface font-mono text-[11px]">{initials(joinee)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{joineeName(joinee)}</p>
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
                      {payslipCount(run.recordCount)} ·{" "}
                      {run.finalizedAt ? `finalized ${formatDate(run.finalizedAt)}` : "not finalized yet"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {typeof run.totalNet === "number" && (
                      <span className="font-mono text-[13px] font-semibold tabular-nums">{formatMoney(run.totalNet)}</span>
                    )}
                    <Badge variant="info">{formatMonth(run.month)}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
