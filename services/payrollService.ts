import api from "./api"
import { handleApiError } from "@/utils"
import type {
  CalculatePayrollDto,
  CalculatePayrollResponse,
  FinalizePayrollDto,
  FinalizePayrollResponse,
  PayrollRecord,
  PayrollStatsResponse,
  PastPayrollsResponse,
  PayrollReportResponse,
  PayrollByMonthData,
  PayrollByMonthResponse,
} from "@/types/payroll"

const PAYROLL_ENDPOINT = "/payroll"

export const payrollService = {
  async calculatePayroll(payload: CalculatePayrollDto): Promise<CalculatePayrollResponse> {
    try {
      const response = await api.post<CalculatePayrollResponse>(`${PAYROLL_ENDPOINT}/calculate-payroll`, payload)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async finalizePayroll(payload: FinalizePayrollDto): Promise<FinalizePayrollResponse> {
    try {
      const response = await api.post<FinalizePayrollResponse>(`${PAYROLL_ENDPOINT}/finalize`, payload)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async getPastPayrolls(companyId: string, page = 1, limit = 10): Promise<PastPayrollsResponse> {
    try {
      const response = await api.get<PastPayrollsResponse>(`${PAYROLL_ENDPOINT}/past`, {
        params: { companyId, page, limit },
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async getPayrollByMonth(companyId: string, payrollMonth: string): Promise<PayrollByMonthData | null> {
    try {
      const response = await api.get<PayrollByMonthResponse>(
        `${PAYROLL_ENDPOINT}/by-month/${companyId}/${payrollMonth}`
      )
      return response.data.data
    } catch (error: any) {
      // If 404 or no records found, return null instead of throwing
      if (error?.response?.status === 404) {
        return null
      }
      throw new Error(handleApiError(error))
    }
  },

  async getPayrollStats(companyId: string, startMonth?: string, endMonth?: string): Promise<PayrollStatsResponse> {
    try {
      const response = await api.get<PayrollStatsResponse>(`${PAYROLL_ENDPOINT}/stats`, {
        params: { companyId, startMonth, endMonth },
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async getEmployeePayrollReport(
    employeeId: string,
    companyId?: string,
    startMonth?: string,
    endMonth?: string,
  ): Promise<PayrollRecord[]> {
    try {
      const response = await api.get<{ statusCode: number; message: string; data: { records: PayrollRecord[] } }>(
        `${PAYROLL_ENDPOINT}/employee-report/${employeeId}`,
        { params: { companyId, startMonth, endMonth } },
      )
      return response.data.data.records
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  async getPayrollReport(params: {
    companyId?: string
    employeeId?: string
    startMonth?: string
    endMonth?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<PayrollReportResponse> {
    try {
      const response = await api.get<PayrollReportResponse>(`${PAYROLL_ENDPOINT}/report`, {
        params,
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}