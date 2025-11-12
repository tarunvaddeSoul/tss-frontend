"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserPlus, DollarSign, Building2, Calendar } from "lucide-react"
import type { DashboardReportData } from "@/types/dashboard"

interface RecentActivityProps {
  data: DashboardReportData
}

export function RecentActivity({ data }: RecentActivityProps) {
  const { recentJoinees, recentPayrolls } = data.recentActivity

  const formatDate = (dateString: string) => {
    // Handle both DD-MM-YYYY and YYYY-MM-DD formats
    let date: Date
    if (dateString.includes("-")) {
      const parts = dateString.split("-")
      if (parts[0].length === 4) {
        // YYYY-MM-DD format
        date = new Date(dateString)
      } else {
        // DD-MM-YYYY format
        date = new Date(parts[2] + "-" + parts[1] + "-" + parts[0])
      }
    } else {
      date = new Date(dateString)
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Joinees */}
      <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-500" />
            Recent Joinees
          </CardTitle>
          <CardDescription>Latest employees who joined the company</CardDescription>
        </CardHeader>
        <CardContent>
          {recentJoinees.length > 0 ? (
            <div className="space-y-4">
              {recentJoinees.slice(0, 5).map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{employee.id}</span>
                      {employee.age && (
                        <>
                          <span>•</span>
                          <span>Age {employee.age}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs mb-1">
                      {formatDate(employee.employeeOnboardingDate)}
                    </Badge>
                    {employee.category && (
                      <p className="text-xs text-muted-foreground">{employee.category}</p>
                    )}
                  </div>
                </div>
              ))}
              {recentJoinees.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{recentJoinees.length - 5} more recent joinees
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No recent joinees</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payrolls */}
      <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Recent Payrolls
          </CardTitle>
          <CardDescription>Latest payroll records processed</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayrolls.length > 0 ? (
            <div className="space-y-4">
              {recentPayrolls.slice(0, 5).map((payroll) => (
                <div
                  key={payroll.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-sm">
                      {getInitials(payroll.employee.firstName, payroll.employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {payroll.employee.firstName} {payroll.employee.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate">{payroll.company.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-500">
                      {payroll.salaryData?.calculations?.netSalary || payroll.salaryData?.netSalary
                        ? formatCurrency(payroll.salaryData.calculations?.netSalary ?? payroll.salaryData.netSalary)
                        : "N/A"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{payroll.month}</span>
                    </div>
                  </div>
                </div>
              ))}
              {recentPayrolls.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{recentPayrolls.length - 5} more recent payrolls
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No recent payrolls</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
