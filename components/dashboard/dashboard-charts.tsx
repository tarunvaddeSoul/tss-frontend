"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, PieChart, Building2 } from "lucide-react"
import type { DashboardReport, CompanyEmployeeCount } from "@/types/dashboard"

interface DashboardChartsProps {
  data: DashboardReport
  companyEmployeeCounts: CompanyEmployeeCount[]
}

export function DashboardCharts({ data, companyEmployeeCounts }: DashboardChartsProps) {
  const { employeesByDepartment, employeesByDesignation } = data.employeeStats

  // Calculate percentages for better visualization
  const totalEmployees = data.employeeStats.totalEmployees
  const departmentData = employeesByDepartment.map((dept) => ({
    name: dept.departmentName,
    count: dept._count.departmentName,
    percentage: ((dept._count.departmentName / totalEmployees) * 100).toFixed(1),
  }))

  const designationData = employeesByDesignation.map((designation) => ({
    name: designation.designationName,
    count: designation._count.designationName,
    percentage: ((designation._count.designationName / totalEmployees) * 100).toFixed(1),
  }))

  // Filter and sort companies with employees
  const companiesWithEmployees = companyEmployeeCounts
    .filter((company) => company.employeeCount > 0)
    .sort((a, b) => b.employeeCount - a.employeeCount)
    .map((company) => ({
      name: company.name,
      count: company.employeeCount,
      percentage: ((company.employeeCount / totalEmployees) * 100).toFixed(1),
    }))

  // Color palette for charts
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-blue-500",
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Department Distribution */}
      <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            By Department
          </CardTitle>
          <CardDescription>Employee distribution across departments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {departmentData.map((dept, index) => (
            <div key={dept.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{dept.name.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{dept.count}</Badge>
                  <span className="text-xs text-muted-foreground">{dept.percentage}%</span>
                </div>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500 ease-out`}
                  style={{ width: `${dept.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Designation Distribution */}
      <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-500" />
            By Designation
          </CardTitle>
          <CardDescription>Employee distribution by job roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {designationData.map((designation, index) => (
            <div key={designation.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{designation.name.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{designation.count}</Badge>
                  <span className="text-xs text-muted-foreground">{designation.percentage}%</span>
                </div>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full bg-gradient-to-r ${colors[(index + 2) % colors.length]} transition-all duration-500 ease-out`}
                  style={{ width: `${designation.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Company Employee Distribution */}
      <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-500" />
            By Company
          </CardTitle>
          <CardDescription>Employee distribution across companies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {companiesWithEmployees.length > 0 ? (
            companiesWithEmployees.map((company, index) => (
              <div key={company.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate" title={company.name}>
                    {company.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{company.count}</Badge>
                    <span className="text-xs text-muted-foreground">{company.percentage}%</span>
                  </div>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full bg-gradient-to-r ${colors[(index + 4) % colors.length]} transition-all duration-500 ease-out`}
                    style={{ width: `${company.percentage}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No companies with employees found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
