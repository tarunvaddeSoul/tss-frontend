"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useDashboard } from "@/hooks/use-dashboard"
import { StatCards } from "@/components/dashboard/stat-cards"
import { MonthPulse } from "@/components/dashboard/month-pulse"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Deployment } from "@/components/dashboard/deployment"
import { GrowthCharts } from "@/components/dashboard/growth-charts"
import { ClientTenure } from "@/components/dashboard/client-tenure"
import { EmployeeDistribution } from "@/components/dashboard/employee-distribution"
import { SpecialDates } from "@/components/dashboard/special-dates"

export default function DashboardPage() {
  const [daysAhead, setDaysAhead] = useState<number>(30)
  const { data, clientEmployeeCounts, monthPayroll, currentMonth, loading, error, refetch } = useDashboard(daysAhead)

  const handleDaysChange = (value: string) => {
    setDaysAhead(parseInt(value, 10))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <Skeleton className="h-40" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>

        <Skeleton className="h-96" />

        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-6">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-6">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>Unable to load dashboard data. Please try refreshing the page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        no="01"
        eyebrow="Dashboard register"
        title="Dashboard Overview"
        description="Money, coverage and changes at a glance."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch(daysAhead)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <MonthPulse
        records={monthPayroll}
        monthLabel={new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        activeClients={data.summary.activeClients}
      />

      <StatCards data={data} clientEmployeeCounts={clientEmployeeCounts} />

      <RecentActivity data={data} />

      <Deployment clientEmployeeCounts={clientEmployeeCounts} summary={data.summary} />

      <GrowthCharts data={data} />

      <EmployeeDistribution data={data} />

      <ClientTenure data={data} />

      <SpecialDates data={data} daysAhead={daysAhead} onDaysChange={handleDaysChange} />
    </div>
  )
}
