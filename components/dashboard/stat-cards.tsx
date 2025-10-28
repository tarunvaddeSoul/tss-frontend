"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, UserPlus, Building, TrendingUp, TrendingDown } from "lucide-react"
import type { DashboardReport, CompanyEmployeeCount } from "@/types/dashboard"

interface StatCardsProps {
  data: DashboardReport
  companyEmployeeCounts: CompanyEmployeeCount[]
}

export function StatCards({ data, companyEmployeeCounts }: StatCardsProps) {
  const { employeeStats, companyStats } = data

  // Calculate companies with employees vs without employees
  const companiesWithEmployees = companyEmployeeCounts.filter((company) => company.employeeCount > 0).length
  const companiesWithoutEmployees = companyEmployeeCounts.filter((company) => company.employeeCount === 0).length

  const stats = [
    {
      title: "Total Employees",
      value: employeeStats.totalEmployees,
      change: employeeStats.newEmployeesThisMonth,
      changeLabel: "new this month",
      icon: Users,
      gradient: "from-primary-light/20 to-primary/20",
      iconColor: "text-primary",
    },
    {
      title: "Active Employees",
      value: employeeStats.activeInactive.active,
      change: employeeStats.activeInactive.inactive,
      changeLabel: "inactive",
      icon: UserPlus,
      gradient: "from-success/20 to-success/10",
      iconColor: "text-success",
    },
    {
      title: "Total Companies",
      value: companyStats.totalCompanies,
      change: companyStats.newCompaniesThisMonth,
      changeLabel: "new this month",
      icon: Building2,
      gradient: "from-info/20 to-info/10",
      iconColor: "text-info",
    },
    {
      title: "Active Companies",
      value: companyStats.activeInactive.active,
      change: companiesWithEmployees,
      changeLabel: "with employees",
      icon: Building,
      gradient: "from-warning/20 to-warning/10",
      iconColor: "text-warning",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.change > 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <Card
            key={stat.title}
            className="relative overflow-hidden security-card hover:border-primary/20 transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-base font-medium text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-4xl font-bold tracking-tight">{stat.value.toLocaleString()}</p>
                    {stat.change > 0 && (
                    <Badge variant="secondary" className="text-sm">
                      +{stat.change}
                    </Badge>
                    )}
                  </div>
                  {stat.change !== undefined && (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <TrendIcon className="h-4 w-4" />
                      <span>
                        {stat.change} {stat.changeLabel}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-white/10 ${stat.iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
