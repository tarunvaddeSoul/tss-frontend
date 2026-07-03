"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClientEmployeeCount, SummaryStats } from "@/types/dashboard"

interface DeploymentProps {
  clientEmployeeCounts: ClientEmployeeCount[]
  summary: SummaryStats
}

export function Deployment({ clientEmployeeCounts, summary }: DeploymentProps) {
  const ranked = [...clientEmployeeCounts].sort((a, b) => b.employeeCount - a.employeeCount)
  const top = ranked.filter((c) => c.employeeCount > 0).slice(0, 10)
  const max = top[0]?.employeeCount ?? 0
  const totalDeployed = ranked.reduce((sum, c) => sum + c.employeeCount, 0)
  const emptyClients = ranked.filter((c) => c.employeeCount === 0)

  const attention: { text: string; href: string; count: number }[] = []
  if (emptyClients.length > 0) {
    attention.push({
      text: `${emptyClients.length === 1 ? "1 client has" : `${emptyClients.length} clients have`} no employees deployed`,
      href: "/clients",
      count: emptyClients.length,
    })
  }
  if (summary.inactiveClients > 0) {
    attention.push({
      text: `${summary.inactiveClients} inactive ${summary.inactiveClients === 1 ? "client" : "clients"} on record`,
      href: "/clients",
      count: summary.inactiveClients,
    })
  }
  if (summary.inactiveEmployees > 0) {
    attention.push({
      text: `${summary.inactiveEmployees.toLocaleString("en-IN")} inactive ${summary.inactiveEmployees === 1 ? "employee" : "employees"} on record`,
      href: "/employees/list",
      count: summary.inactiveEmployees,
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Deployment by client</CardTitle>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground nums">
            {totalDeployed.toLocaleString("en-IN")} deployed
          </span>
        </CardHeader>
        <CardContent>
          {top.length === 0 ? (
            <div className="py-6">
              <div className="registry-line mb-2">
                <span className="registry-eyebrow">No records on file</span>
              </div>
              <p className="text-sm text-muted-foreground">No employees are deployed to clients yet.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {top.map((client, i) => (
                <li key={client.name} className="flex items-center gap-3">
                  <span className="w-6 flex-shrink-0 font-mono text-[11px] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-40 flex-shrink-0 truncate text-sm font-medium sm:w-56" title={client.name}>
                    {client.name}
                  </span>
                  <span className="h-4 flex-1 rounded-sm bg-surface">
                    <span
                      className="block h-4 rounded-sm bg-brand/70"
                      style={{ width: max > 0 ? `${Math.max(2, (client.employeeCount / max) * 100)}%` : 0 }}
                    />
                  </span>
                  <span className="w-14 flex-shrink-0 text-right font-mono text-[13px] font-medium nums">
                    {client.employeeCount.toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Needs attention</CardTitle>
        </CardHeader>
        <CardContent>
          {attention.length === 0 ? (
            <div className="flex items-center gap-2.5 py-4 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Nothing needs attention right now.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {attention.map((item) => (
                <li key={item.text}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-brand"
                  >
                    <span className="min-w-0">{item.text}</span>
                    <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {emptyClients.length > 0 && (
            <p className="mt-3 border-t pt-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {emptyClients.slice(0, 4).map((c) => c.name).join(" · ")}
              {emptyClients.length > 4 ? ` · +${emptyClients.length - 4} more` : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
