import api from "./api"
import { handleApiError } from "@/utils"
import type { Payroll } from "@/types/payroll"

// Define types for request payloads
export interface PayrollCreateRequest {
  employeeId: string
  month: number
  year: number
  basicSalary: number
  overtime?: number
  deductions?: number
  bonus?: number
  netSalary: number
  status: "PENDING" | "PAID" | "CANCELLED"
  paymentDate?: string
  paymentMethod?: string
  notes?: string
}

export interface PayrollUpdateRequest {
  basicSalary?: number
  overtime?: number
  deductions?: number
  bonus?: number
  netSalary?: number
  status?: "PENDING" | "PAID" | "CANCELLED"
  paymentDate?: string
  paymentMethod?: string
  notes?: string
}

export interface PayrollFilterParams {
  employeeId?: string
  month?: number
  year?: number
  status?: string
  page?: number
  limit?: number
}

// API endpoints
const PAYROLL_ENDPOINTS = {
  BASE: "/payroll",
  BY_ID: (id: string) => `/payroll/${id}`,
  GENERATE: "/payroll/generate",
  PROCESS: "/payroll/process",
  EXPORT: "/payroll/export",
}

export const payrollService = {
  // Get payroll records with optional filtering
  async getPayrollRecords(params?: PayrollFilterParams): Promise<{ data: Payroll[]; total: number }> {
    try {
      const response = await api.get(PAYROLL_ENDPOINTS.BASE, { params })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get a single payroll record by ID
  async getPayrollRecord(id: string): Promise<Payroll> {
    try {
      const response = await api.get(PAYROLL_ENDPOINTS.BY_ID(id))
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Create a new payroll record
  async createPayrollRecord(payroll: PayrollCreateRequest): Promise<Payroll> {
    try {
      const response = await api.post(PAYROLL_ENDPOINTS.BASE, payroll)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Update an existing payroll record
  async updatePayrollRecord(id: string, payroll: PayrollUpdateRequest): Promise<Payroll> {
    try {
      const response = await api.put(PAYROLL_ENDPOINTS.BY_ID(id), payroll)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Delete a payroll record
  async deletePayrollRecord(id: string): Promise<void> {
    try {
      await api.delete(PAYROLL_ENDPOINTS.BY_ID(id))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Generate payroll for a specific period
  async generatePayroll(data: { month: number; year: number }): Promise<Payroll[]> {
    try {
      const response = await api.post(PAYROLL_ENDPOINTS.GENERATE, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Process payroll (mark as paid)
  async processPayroll(
    ids: string[],
    paymentDetails?: {
      paymentDate: string
      paymentMethod: string
    },
  ): Promise<void> {
    try {
      await api.post(PAYROLL_ENDPOINTS.PROCESS, { ids, ...paymentDetails })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Export payroll records
  async exportPayroll(params: PayrollFilterParams): Promise<Blob> {
    try {
      const response = await api.get(PAYROLL_ENDPOINTS.EXPORT, {
        params,
        responseType: "blob",
      })

      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
