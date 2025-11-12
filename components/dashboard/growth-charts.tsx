"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Users, Building2 } from "lucide-react"
import type { DashboardReportData } from "@/types/dashboard"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface GrowthChartsProps {
  data: DashboardReportData
}

const employeeChartConfig = {
  count: {
    label: "Total Employees",
    color: "hsl(var(--primary))",
  },
  newEmployees: {
    label: "New Employees",
    color: "hsl(var(--success))",
  },
} satisfies ChartConfig

const companyChartConfig = {
  count: {
    label: "Total Companies",
    color: "hsl(var(--info))",
  },
  newCompanies: {
    label: "New Companies",
    color: "hsl(var(--warning))",
  },
} satisfies ChartConfig

export function GrowthCharts({ data }: GrowthChartsProps) {
  const { growthMetrics } = data

  // Format monthly data for charts
  const employeeMonthlyData = growthMetrics.employees.monthly.map((item) => ({
    month: new Date(item.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    "Total Employees": item.count,
    "New Employees": item.newEmployees,
  }))

  const employeeYearlyData = growthMetrics.employees.yearly.map((item) => ({
    year: item.year.toString(),
    "Total Employees": item.count,
    "New Employees": item.newEmployees,
  }))

  const companyMonthlyData = growthMetrics.companies.monthly.map((item) => ({
    month: new Date(item.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    "Total Companies": item.count,
    "New Companies": item.newCompanies,
  }))

  const companyYearlyData = growthMetrics.companies.yearly.map((item) => ({
    year: item.year.toString(),
    "Total Companies": item.count,
    "New Companies": item.newCompanies,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Employee Growth */}
      <Card className="security-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Employee Growth
          </CardTitle>
          <CardDescription>Track employee growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="mt-4">
              <ChartContainer config={employeeChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={employeeMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Total Employees"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="New Employees"
                      stroke="hsl(var(--success))"
                      fillOpacity={1}
                      fill="url(#colorNew)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="yearly" className="mt-4">
              <ChartContainer config={employeeChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={employeeYearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="year"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Total Employees"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="New Employees"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--success))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Company Growth */}
      <Card className="security-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-info" />
            Company Growth
          </CardTitle>
          <CardDescription>Track company growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="mt-4">
              <ChartContainer config={companyChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={companyMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCompanyTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCompanyNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Total Companies"
                      stroke="hsl(var(--info))"
                      fillOpacity={1}
                      fill="url(#colorCompanyTotal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="New Companies"
                      stroke="hsl(var(--warning))"
                      fillOpacity={1}
                      fill="url(#colorCompanyNew)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="yearly" className="mt-4">
              <ChartContainer config={companyChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={companyYearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="year"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Total Companies"
                      stroke="hsl(var(--info))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--info))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="New Companies"
                      stroke="hsl(var(--warning))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--warning))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

