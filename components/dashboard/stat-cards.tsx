"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, UserPlus, Building, TrendingUp, TrendingDown } from "lucide-react"
import type { DashboardReportData, ClientEmployeeCount } from "@/types/dashboard"

interface StatCardsProps {
  data: DashboardReportData
  clientEmployeeCounts: ClientEmployeeCount[]
}

export function StatCards({ data, clientEmployeeCounts }: StatCardsProps) {
  const { summary, employeeStats, clientStats } = data

  // Calculate clients with employees vs without employees
  const clientsWithEmployees = clientEmployeeCounts.filter((client) => client.employeeCount > 0).length
  const clientsWithoutEmployees = clientEmployeeCounts.filter((client) => client.employeeCount === 0).length

  const stats = [
    {
      title: "Total Employees",
      value: summary.totalEmployees,
      change: summary.newEmployeesThisMonth,
      changeLabel: "new this month",
      icon: Users,
    },
    {
      title: "Active Employees",
      value: summary.activeEmployees,
      change: summary.inactiveEmployees,
      changeLabel: "inactive",
      icon: UserPlus,
    },
    {
      title: "Total Clients",
      value: summary.totalClients,
      change: summary.newClientsThisMonth,
      changeLabel: "new this month",
      icon: Building2,
    },
    {
      title: "Active Clients",
      value: summary.activeClients,
      change: clientsWithEmployees,
      changeLabel: "with employees",
      icon: Building,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isPositive = stat.change > 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

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
                    {stat.change > 0 && (
                      <Badge variant="success">
                        <TrendingUp />
                        +{stat.change}
                      </Badge>
                    )}
                  </div>
                  {stat.change !== undefined && (
                    <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                      <TrendIcon className={`h-3.5 w-3.5 ${isPositive ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className="font-medium">
                        {stat.change} {stat.changeLabel}
                      </span>
                    </div>
                  )}
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
