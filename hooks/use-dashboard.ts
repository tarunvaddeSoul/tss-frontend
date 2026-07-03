"use client"

import { useState, useEffect } from "react"
import { dashboardService } from "@/services/dashboardService"
import { clientService } from "@/services/clientService"
import { payrollService } from "@/services/payrollService"
import { getErrorMessage } from "@/services/api"
import type { DashboardReportData, ClientEmployeeCount } from "@/types/dashboard"
import type { PayrollReportRecord } from "@/utils/payroll-export"

interface UseDashboardReturn {
  data: DashboardReportData | null
  clientEmployeeCounts: ClientEmployeeCount[]
  monthPayroll: PayrollReportRecord[] | null
  currentMonth: string
  loading: boolean
  error: string | null
  refetch: (daysAhead?: number) => Promise<void>
}

const getCurrentMonth = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function useDashboard(daysAhead = 30): UseDashboardReturn {
  const [data, setData] = useState<DashboardReportData | null>(null)
  const [clientEmployeeCounts, setClientEmployeeCounts] = useState<ClientEmployeeCount[]>([])
  const [monthPayroll, setMonthPayroll] = useState<PayrollReportRecord[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentMonth = getCurrentMonth()

  const fetchDashboard = async (days: number = daysAhead) => {
    try {
      setLoading(true)
      setError(null)

      // Current-month payroll is additive: its failure must not break the page
      const monthPayrollPromise = payrollService
        .getPayrollReport({ startMonth: currentMonth, endMonth: currentMonth, page: 1, limit: 5000 })
        .then((response) => response.data.records)
        .catch(() => null)

      const [dashboardResponse, clientCountsResponse, monthPayrollRecords] = await Promise.all([
        dashboardService.getDashboardReport(days),
        clientService.getClientEmployeeCounts(),
        monthPayrollPromise,
      ])

      setData(dashboardResponse)
      setClientEmployeeCounts(clientCountsResponse)
      setMonthPayroll(monthPayrollRecords)
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
    monthPayroll,
    currentMonth,
    loading,
    error,
    refetch,
  }
}
