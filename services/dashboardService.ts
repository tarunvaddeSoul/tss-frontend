import api from "./api"
import { handleApiError } from "@/utils"

// Define types for dashboard data
export interface DashboardData {
    totalEmployees: number
    newEmployeesThisMonth: number
    totalCompanies: number
    newCompaniesThisMonth: number
}

export interface DashboardResponse {
    statusCode: number
    message: string
    data: DashboardData
}

// API endpoints
const DASHBOARD_ENDPOINTS = {
    BASE: "/dashboard",
    ATTENDANCE_STATS: "/dashboard/attendance",
    PAYROLL_STATS: "/dashboard/payroll",
}

export const dashboardService = {
    // Get dashboard overview data
    async getDashboardData(): Promise<DashboardData> {
        try {
            const response = await api.get<DashboardResponse>(DASHBOARD_ENDPOINTS.BASE)
            return response.data.data
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    // Get attendance statistics
    async getAttendanceStats(params?: { startDate?: string; endDate?: string }): Promise<any> {
        try {
            const response = await api.get(DASHBOARD_ENDPOINTS.ATTENDANCE_STATS, { params })
            return response.data.data
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },

    // Get payroll statistics
    async getPayrollStats(params?: { year?: number; month?: number }): Promise<any> {
        try {
            const response = await api.get(DASHBOARD_ENDPOINTS.PAYROLL_STATS, { params })
            return response.data.data
        } catch (error) {
            throw new Error(handleApiError(error))
        }
    },
}
