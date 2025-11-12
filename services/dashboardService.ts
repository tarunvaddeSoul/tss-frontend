import { DashboardReportData, DashboardReportResponse } from "@/types/dashboard"
import api from "./api"

export const dashboardService = {
  async getDashboardReport(daysAhead = 30): Promise<DashboardReportData> {
    const response = await api.get<DashboardReportResponse>("/dashboard/report", {
      params: { daysAhead }
    })
    return response.data.data
  }
}