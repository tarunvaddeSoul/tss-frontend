"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, UserPlus, Building, TrendingUp, TrendingDown } from "lucide-react"
import type { DashboardReportData, CompanyEmployeeCount } from "@/types/dashboard"

interface StatCardsProps {
  data: DashboardReportData
  companyEmployeeCounts: CompanyEmployeeCount[]
}

export function StatCards({ data, companyEmployeeCounts }: StatCardsProps) {
  const { summary, employeeStats, companyStats } = data

  // Calculate companies with employees vs without employees
  const companiesWithEmployees = companyEmployeeCounts.filter((company) => company.employeeCount > 0).length
  const companiesWithoutEmployees = companyEmployeeCounts.filter((company) => company.employeeCount === 0).length

  const stats = [
    {
      title: "Total Employees",
      value: summary.totalEmployees,
      change: summary.newEmployeesThisMonth,
      changeLabel: "new this month",
      icon: Users,
      gradient: "from-primary-light/20 to-primary/20",
      iconColor: "text-primary",
    },
    {
      title: "Active Employees",
      value: summary.activeEmployees,
      change: summary.inactiveEmployees,
      changeLabel: "inactive",
      icon: UserPlus,
      gradient: "from-success/20 to-success/10",
      iconColor: "text-success",
    },
    {
      title: "Total Companies",
      value: summary.totalCompanies,
      change: summary.newCompaniesThisMonth,
      changeLabel: "new this month",
      icon: Building2,
      gradient: "from-info/20 to-info/10",
      iconColor: "text-info",
    },
    {
      title: "Active Companies",
      value: summary.activeCompanies,
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
            className="relative overflow-hidden security-card hover:border-primary/20 transition-all duration-300 group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</p>
                  <div className="flex items-baseline space-x-3">
                    <p className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {stat.value.toLocaleString()}
                    </p>
                    {stat.change > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs font-semibold bg-success/10 text-success border-success/20"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{stat.change}
                      </Badge>
                    )}
                  </div>
                  {stat.change !== undefined && (
                    <div className="flex items-center space-x-1.5 text-xs text-muted-foreground pt-1">
                      <TrendIcon className={`h-3.5 w-3.5 ${isPositive ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className="font-medium">
                        {stat.change} {stat.changeLabel}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.iconColor} opacity-90 group-hover:opacity-100 transition-opacity`}>
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
