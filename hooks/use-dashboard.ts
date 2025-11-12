"use client"

import { useState, useEffect } from "react"
import { dashboardService } from "@/services/dashboardService"
import { companyService } from "@/services/companyService"
import type { DashboardReportData, CompanyEmployeeCount } from "@/types/dashboard"

interface UseDashboardReturn {
  data: DashboardReportData | null
  companyEmployeeCounts: CompanyEmployeeCount[]
  loading: boolean
  error: string | null
  refetch: (daysAhead?: number) => Promise<void>
}

export function useDashboard(daysAhead = 30): UseDashboardReturn {
  const [data, setData] = useState<DashboardReportData | null>(null)
  const [companyEmployeeCounts, setCompanyEmployeeCounts] = useState<CompanyEmployeeCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async (days: number = daysAhead) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch both dashboard data and company employee counts in parallel
      const [dashboardResponse, companyCountsResponse] = await Promise.all([
        dashboardService.getDashboardReport(days),
        companyService.getCompanyEmployeeCounts(),
      ])

      setData(dashboardResponse)
      setCompanyEmployeeCounts(companyCountsResponse)
    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard data")
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [daysAhead])

  const refetch = async (days?: number) => {
    await fetchDashboard(days)
  }

  return {
    data,
    companyEmployeeCounts,
    loading,
    error,
    refetch,
  }
}
