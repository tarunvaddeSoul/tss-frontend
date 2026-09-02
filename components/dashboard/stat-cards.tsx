"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, UserPlus, Building, TrendingUp } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { DashboardReportData, ClientEmployeeCount } from "@/types/dashboard"

interface StatCardsProps {
  data: DashboardReportData
  clientEmployeeCounts: ClientEmployeeCount[]
}

interface Stat {
  title: string
  value: number
  icon: LucideIcon
  newThisMonth?: number
  note?: string
}

export function StatCards({ data, clientEmployeeCounts }: StatCardsProps): JSX.Element {
  const { summary } = data

  const clientsWithEmployees = clientEmployeeCounts.filter((client) => client.employeeCount > 0).length

  const stats: Stat[] = [
    {
      title: "Total Employees",
      value: summary.totalEmployees,
      newThisMonth: summary.newEmployeesThisMonth,
      icon: Users,
    },
    {
      title: "Active Employees",
      value: summary.activeEmployees,
      note: `${summary.inactiveEmployees.toLocaleString("en-IN")} inactive`,
      icon: UserPlus,
    },
    {
      title: "Total Clients",
      value: summary.totalClients,
      newThisMonth: summary.newClientsThisMonth,
      icon: Building2,
    },
    {
      title: "Active Clients",
      value: summary.activeClients,
      note: `${clientsWithEmployees.toLocaleString("en-IN")} with employees deployed`,
      icon: Building,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        const grew = (stat.newThisMonth ?? 0) > 0

        return (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="registry-eyebrow">{stat.title}</p>
                  <div className="flex items-baseline gap-3">
                    <p className="font-display font-expanded text-4xl font-bold tracking-tight tabular-nums">
                      {stat.value.toLocaleString("en-IN")}
                    </p>
                    {grew && (
                      <Badge variant="success">
                        <TrendingUp />
                        +{stat.newThisMonth}
                      </Badge>
                    )}
                  </div>
                  <p className="pt-1 text-xs font-medium text-muted-foreground">
                    {stat.newThisMonth === undefined
                      ? stat.note
                      : grew
                        ? `${stat.newThisMonth} new this month`
                        : "None added this month"}
                  </p>
                </div>
                <div className="rounded-md bg-surface p-2.5 text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
