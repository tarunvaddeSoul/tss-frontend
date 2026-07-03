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
    color: "hsl(var(--brand))",
  },
  newEmployees: {
    label: "New Employees",
    color: "hsl(var(--info))",
  },
} satisfies ChartConfig

const clientChartConfig = {
  count: {
    label: "Total Clients",
    color: "hsl(var(--info))",
  },
  newClients: {
    label: "New Clients",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig

export function GrowthCharts({ data }: GrowthChartsProps) {
  const { growthMetrics } = data

  // Format monthly data for charts
  const employeeMonthlyData = growthMetrics.employees.monthly.map((item) => ({
    month: new Date(item.month + "-01").toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    "Total Employees": item.count,
    "New Employees": item.newEmployees,
  }))

  const employeeYearlyData = growthMetrics.employees.yearly.map((item) => ({
    year: item.year.toString(),
    "Total Employees": item.count,
    "New Employees": item.newEmployees,
  }))

  const clientMonthlyData = growthMetrics.clients.monthly.map((item) => ({
    month: new Date(item.month + "-01").toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    "Total Clients": item.count,
    "New Clients": item.newClients,
  }))

  const clientYearlyData = growthMetrics.clients.yearly.map((item) => ({
    year: item.year.toString(),
    "Total Clients": item.count,
    "New Clients": item.newClients,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Employee Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
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
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Total Employees"
                      stroke="hsl(var(--brand))"
                      fillOpacity={0.1}
                      fill="hsl(var(--brand))"
                    />
                    <Area
                      type="monotone"
                      dataKey="New Employees"
                      stroke="hsl(var(--info))"
                      fillOpacity={0.1}
                      fill="hsl(var(--info))"
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
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Total Employees"
                      stroke="hsl(var(--brand))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--brand))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="New Employees"
                      stroke="hsl(var(--info))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--info))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Client Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            Client Growth
          </CardTitle>
          <CardDescription>Track client growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="mt-4">
              <ChartContainer config={clientChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={clientMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Total Clients"
                      stroke="hsl(var(--info))"
                      fillOpacity={0.1}
                      fill="hsl(var(--info))"
                    />
                    <Area
                      type="monotone"
                      dataKey="New Clients"
                      stroke="hsl(var(--muted-foreground))"
                      fillOpacity={0.1}
                      fill="hsl(var(--muted-foreground))"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="yearly" className="mt-4">
              <ChartContainer config={clientChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clientYearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Total Clients"
                      stroke="hsl(var(--info))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--info))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="New Clients"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--muted-foreground))", r: 4 }}
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

