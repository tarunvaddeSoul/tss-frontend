"use client"

import { useState, useEffect } from "react"
import { dashboardService } from "@/services/dashboardService"
import { clientService } from "@/services/clientService"
import { getErrorMessage } from "@/services/api"
import type { DashboardReportData, ClientEmployeeCount } from "@/types/dashboard"

interface UseDashboardReturn {
  data: DashboardReportData | null
  clientEmployeeCounts: ClientEmployeeCount[]
  loading: boolean
  error: string | null
  refetch: (daysAhead?: number) => Promise<void>
}

export function useDashboard(daysAhead = 30): UseDashboardReturn {
  const [data, setData] = useState<DashboardReportData | null>(null)
  const [clientEmployeeCounts, setClientEmployeeCounts] = useState<ClientEmployeeCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async (days: number = daysAhead) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch both dashboard data and client employee counts in parallel
      const [dashboardResponse, clientCountsResponse] = await Promise.all([
        dashboardService.getDashboardReport(days),
        clientService.getClientEmployeeCounts(),
      ])

      setData(dashboardResponse)
      setClientEmployeeCounts(clientCountsResponse)
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to fetch dashboard data")
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
    clientEmployeeCounts,
    loading,
    error,
    refetch,
  }
}
