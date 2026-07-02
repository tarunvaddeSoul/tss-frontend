"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useDashboard } from "@/hooks/use-dashboard"
import { StatCards } from "@/components/dashboard/stat-cards"
import { GrowthCharts } from "@/components/dashboard/growth-charts"
import { ClientTenure } from "@/components/dashboard/client-tenure"
import { EmployeeDistribution } from "@/components/dashboard/employee-distribution"
import { SpecialDates } from "@/components/dashboard/special-dates"

export default function DashboardPage() {
  const [daysAhead, setDaysAhead] = useState<number>(30)
  const { data, clientEmployeeCounts, loading, error, refetch } = useDashboard(daysAhead)

  const handleDaysChange = (value: string) => {
    setDaysAhead(parseInt(value, 10))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        {/* Growth Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>

        {/* Distribution Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>

        {/* Client Tenure Skeleton */}
        <Skeleton className="h-96" />

        {/* Special Dates Skeleton */}
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
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
      <div className="container mx-auto py-6">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>Unable to load dashboard data. Please try refreshing the page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your organization today.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch(daysAhead)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <StatCards data={data} clientEmployeeCounts={clientEmployeeCounts} />

      {/* Growth Charts */}
      <GrowthCharts data={data} />

      {/* Employee Distribution */}
      <EmployeeDistribution data={data} />

      {/* Client Tenure */}
      <ClientTenure data={data} />

      {/* Special Dates */}
      <SpecialDates data={data} daysAhead={daysAhead} onDaysChange={handleDaysChange} />
    </div>
  )
}
