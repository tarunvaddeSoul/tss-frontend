"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, TrendingUp } from "lucide-react"
import { formatDate, label } from "@/lib/labels"
import type { DashboardReportData } from "@/types/dashboard"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ClientTenureProps {
  data: DashboardReportData
}

const tenureChartConfig = {
  "0-6 months": {
    label: "0-6 months",
    color: "hsl(var(--brand))",
  },
  "6-12 months": {
    label: "6-12 months",
    color: "hsl(var(--info))",
  },
  "1-2 years": {
    label: "1-2 years",
    color: "hsl(var(--muted-foreground))",
  },
  "2-5 years": {
    label: "2-5 years",
    color: "hsl(var(--warning))",
  },
  "5+ years": {
    label: "5+ years",
    color: "hsl(var(--success))",
  },
} satisfies ChartConfig

const COLORS = [
  "hsl(var(--brand))",
  "hsl(var(--info))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
]

export function ClientTenure({ data }: ClientTenureProps) {
  const { tenure } = data.clientStats
  const { tenureDistribution, averageTenureMonths, averageTenureYears, clients } = tenure

  // Prepare data for pie chart
  const pieData = Object.entries(tenureDistribution).map(([name, value]) => ({
    name,
    value,
  }))

  // Prepare data for bar chart (top clients by tenure)
  const topClients = [...clients]
    .sort((a, b) => b.monthsWithUs - a.monthsWithUs)
    .slice(0, 10)
    .map((client) => ({
      name: client.name.length > 15 ? client.name.substring(0, 15) + "..." : client.name,
      fullName: client.name,
      months: client.monthsWithUs,
      years: client.yearsWithUs,
      group: client.tenureGroup,
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border bg-card p-2 shadow-sm">
          <div className="grid gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">{payload[0].name}</span>
              <span className="font-bold text-muted-foreground">{payload[0].value} clients</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="registry-eyebrow">Average Tenure</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="font-display font-expanded text-3xl font-bold tabular-nums">{averageTenureYears.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">years</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {averageTenureMonths.toFixed(1)} months
                </p>
              </div>
              <div className="p-3 rounded-md bg-surface text-muted-foreground">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="registry-eyebrow">Total Clients</p>
                <p className="font-display font-expanded text-3xl font-bold tabular-nums mt-2">{clients.length}</p>
                <p className="text-xs text-muted-foreground mt-1">with tenure data</p>
              </div>
              <div className="p-3 rounded-md bg-surface text-muted-foreground">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="registry-eyebrow">Longest Tenure</p>
                <p className="font-display font-expanded text-3xl font-bold tabular-nums mt-2">
                  {clients.length > 0
                    ? Math.max(...clients.map((c) => c.yearsWithUs)).toFixed(1)
                    : "0"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">years</p>
              </div>
              <div className="p-3 rounded-md bg-surface text-muted-foreground">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenure Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Tenure Distribution
            </CardTitle>
            <CardDescription>Distribution of clients by tenure period</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={tenureChartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="hsl(var(--brand))"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Clients by Tenure Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              Top Clients by Tenure
            </CardTitle>
            <CardDescription>Clients with longest partnership</CardDescription>
          </CardHeader>
          <CardContent>
            {topClients.length > 0 ? (
              <ChartContainer config={tenureChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topClients} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} months`, "Tenure"]}
                    />
                    <Bar
                      dataKey="months"
                      fill="hsl(var(--brand))"
                      radius={[0, 2, 2, 0]}
                      label={{ position: "right", fill: "hsl(var(--foreground))", fontSize: 12 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 h-[300px] text-muted-foreground">
                <p className="registry-eyebrow">No records on file</p>
                <p className="text-sm">No client tenure data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      {clients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Clients by Tenure</CardTitle>
            <CardDescription>Complete list of clients with their tenure information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients
                .sort((a, b) => b.monthsWithUs - a.monthsWithUs)
                .map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 rounded-md border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-md bg-surface text-muted-foreground">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Onboarded: <span className="font-mono text-[13px]">{formatDate(client.onboardingDate)}</span>
                          </p>
                          <Badge variant={client.status === "ACTIVE" ? "success" : "destructive"}>
                            {label.status(client.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-2">
                        <p className="font-display font-expanded text-2xl font-bold tabular-nums">{client.yearsWithUs.toFixed(1)}</p>
                        <p className="text-sm text-muted-foreground">years</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                        {client.monthsWithUs} months
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {client.tenureGroup}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

