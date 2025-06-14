"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Calendar } from "lucide-react"
import { useDashboard } from "@/hooks/use-dashboard"
import { StatCards } from "@/components/dashboard/stat-cards"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { SpecialDates } from "@/components/dashboard/special-dates"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function DashboardPage() {
  const { data, companyEmployeeCounts, loading, error, refetch } = useDashboard(30)

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

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>

        {/* Activity Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-tss-primary to-purple-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your organization today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last 30 days</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatCards data={data} companyEmployeeCounts={companyEmployeeCounts} />

      {/* Charts */}
      <DashboardCharts data={data} companyEmployeeCounts={companyEmployeeCounts} />

      {/* Special Dates */}
      <SpecialDates data={data} />

      {/* Recent Activity */}
      <RecentActivity data={data} />
    </div>
  )
}
