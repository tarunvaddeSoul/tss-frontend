import api, { getErrorMessage } from "./api"
import type {
  CalculatePayrollDto,
  CalculatePayrollResponse,
  FinalizePayrollDto,
  FinalizePayrollResponse,
  PayrollRecord,
  PayrollStatsResponse,
  PastPayrollsResponse,
  PayrollReportResponse,
  PayrollReportRecord,
  PayrollByMonthData,
  PayrollByMonthResponse,
} from "@/types/payroll"

const PAYROLL_ENDPOINT = "/payroll"

export const payrollService = {
  async calculatePayroll(payload: CalculatePayrollDto): Promise<CalculatePayrollResponse> {
    try {
      const response = await api.post<CalculatePayrollResponse>(`${PAYROLL_ENDPOINT}/calculate-payroll`, payload, {
        timeout: 120000,
      })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async finalizePayroll(payload: FinalizePayrollDto): Promise<FinalizePayrollResponse> {
    try {
      const response = await api.post<FinalizePayrollResponse>(`${PAYROLL_ENDPOINT}/finalize`, payload, {
        timeout: 120000,
      })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async getPastPayrolls(clientId: string, page = 1, limit = 10): Promise<PastPayrollsResponse> {
    try {
      const response = await api.get<PastPayrollsResponse>(`${PAYROLL_ENDPOINT}/past`, {
        params: { clientId, page, limit },
      })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async getPayrollByMonth(clientId: string, payrollMonth: string): Promise<PayrollByMonthData | null> {
    try {
      const response = await api.get<PayrollByMonthResponse>(
        `${PAYROLL_ENDPOINT}/by-month/${clientId}/${payrollMonth}`
      )
      return response.data.data
    } catch (error: any) {
      // If 404 or no records found, return null instead of throwing
      if (error?.response?.status === 404) {
        return null
      }
      throw new Error(getErrorMessage(error))
    }
  },

  async getPayrollStats(clientId: string, startMonth?: string, endMonth?: string): Promise<PayrollStatsResponse> {
    try {
      const response = await api.get<PayrollStatsResponse>(`${PAYROLL_ENDPOINT}/stats`, {
        params: { clientId, startMonth, endMonth },
      })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async getEmployeePayrollReport(
    employeeId: string,
    clientId?: string,
    startMonth?: string,
    endMonth?: string,
  ): Promise<PayrollRecord[]> {
    try {
      const response = await api.get<{ data: { records: PayrollRecord[] } }>(
        `${PAYROLL_ENDPOINT}/employee-report/${employeeId}`,
        { params: { clientId, startMonth, endMonth } },
      )
      return response.data.data.records
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  async getPayrollReport(params: {
    clientId?: string
    employeeId?: string
    startMonth?: string
    endMonth?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<Pick<PayrollReportResponse, "data">> {
    try {
      const response = await api.get<{
        data: PayrollReportRecord[]
        meta?: { total?: number; page?: number; limit?: number; hasNextPage?: boolean; hasPrevPage?: boolean }
      }>(`${PAYROLL_ENDPOINT}/report`, {
        params,
        timeout: 120000,
      })
      const records = response.data.data ?? []
      const meta = response.data.meta ?? {}
      return {
        data: {
          records,
          total: meta.total ?? records.length,
          page: meta.page ?? params.page ?? 1,
          limit: meta.limit ?? params.limit ?? records.length,
          hasNextPage: meta.hasNextPage ?? false,
          hasPrevPage: meta.hasPrevPage ?? false,
        },
      }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}