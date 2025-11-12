"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, TrendingUp } from "lucide-react"
import type { DashboardReportData } from "@/types/dashboard"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CompanyTenureProps {
  data: DashboardReportData
}

const tenureChartConfig = {
  "0-6 months": {
    label: "0-6 months",
    color: "hsl(var(--destructive))",
  },
  "6-12 months": {
    label: "6-12 months",
    color: "hsl(var(--warning))",
  },
  "1-2 years": {
    label: "1-2 years",
    color: "hsl(var(--info))",
  },
  "2-5 years": {
    label: "2-5 years",
    color: "hsl(var(--success))",
  },
  "5+ years": {
    label: "5+ years",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const COLORS = [
  "hsl(var(--destructive))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--primary))",
]

export function CompanyTenure({ data }: CompanyTenureProps) {
  const { tenure } = data.companyStats
  const { tenureDistribution, averageTenureMonths, averageTenureYears, companies } = tenure

  // Prepare data for pie chart
  const pieData = Object.entries(tenureDistribution).map(([name, value]) => ({
    name,
    value,
  }))

  // Prepare data for bar chart (top companies by tenure)
  const topCompanies = [...companies]
    .sort((a, b) => b.monthsWithUs - a.monthsWithUs)
    .slice(0, 10)
    .map((company) => ({
      name: company.name.length > 15 ? company.name.substring(0, 15) + "..." : company.name,
      fullName: company.name,
      months: company.monthsWithUs,
      years: company.yearsWithUs,
      group: company.tenureGroup,
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-2 shadow-sm">
          <div className="grid gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">{payload[0].name}</span>
              <span className="font-bold text-muted-foreground">{payload[0].value} companies</span>
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
        <Card className="security-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Tenure</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold">{averageTenureYears.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">years</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {averageTenureMonths.toFixed(1)} months
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                <p className="text-3xl font-bold mt-2">{companies.length}</p>
                <p className="text-xs text-muted-foreground mt-1">with tenure data</p>
              </div>
              <div className="p-3 rounded-full bg-info/10">
                <Building2 className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Longest Tenure</p>
                <p className="text-3xl font-bold mt-2">
                  {companies.length > 0
                    ? Math.max(...companies.map((c) => c.yearsWithUs)).toFixed(1)
                    : "0"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">years</p>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenure Distribution Pie Chart */}
        <Card className="security-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Tenure Distribution
            </CardTitle>
            <CardDescription>Distribution of companies by tenure period</CardDescription>
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
                    fill="#8884d8"
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

        {/* Top Companies by Tenure Bar Chart */}
        <Card className="security-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Top Companies by Tenure
            </CardTitle>
            <CardDescription>Companies with longest partnership</CardDescription>
          </CardHeader>
          <CardContent>
            {topCompanies.length > 0 ? (
              <ChartContainer config={tenureChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCompanies} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
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
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} months`, "Tenure"]}
                    />
                    <Bar
                      dataKey="months"
                      fill="hsl(var(--primary))"
                      radius={[0, 8, 8, 0]}
                      label={{ position: "right", fill: "hsl(var(--foreground))", fontSize: 12 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>No company tenure data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company List */}
      {companies.length > 0 && (
        <Card className="security-card">
          <CardHeader>
            <CardTitle>All Companies by Tenure</CardTitle>
            <CardDescription>Complete list of companies with their tenure information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies
                .sort((a, b) => b.monthsWithUs - a.monthsWithUs)
                .map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Onboarded: {company.onboardingDate}
                          </p>
                          <Badge variant={company.status === "ACTIVE" ? "default" : "secondary"}>
                            {company.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">{company.yearsWithUs.toFixed(1)}</p>
                        <p className="text-sm text-muted-foreground">years</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {company.monthsWithUs} months
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {company.tenureGroup}
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

