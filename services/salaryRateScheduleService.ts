import api, { getErrorMessage } from "./api"
import type {
  CreateSalaryRateScheduleDto,
  UpdateSalaryRateScheduleDto,
  GetSalaryRateScheduleQuery,
  GetActiveRateQuery,
  SalaryRateScheduleResponse,
  SalaryRateScheduleListResponse,
  ActiveRateResponse,
} from "@/types/salary"

class SalaryRateScheduleService {
  private baseUrl = "/salary-rate-schedule"

  /**
   * Create a new salary rate schedule
   */
  async create(data: CreateSalaryRateScheduleDto): Promise<SalaryRateScheduleResponse> {
    try {
      const response = await api.post(this.baseUrl, data)
      return response.data
    } catch (error) {
      console.error("Error creating salary rate schedule:", error)
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get all salary rate schedules with optional filters
   */
  async getAll(params?: GetSalaryRateScheduleQuery): Promise<SalaryRateScheduleListResponse> {
    try {
      const response = await api.get(this.baseUrl, { params })
      // API returns { statusCode, message, data } structure
      return response.data
    } catch (error) {
      console.error("Error fetching salary rate schedules:", error)
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get a single salary rate schedule by ID
   */
  async getById(id: string): Promise<SalaryRateScheduleResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching salary rate schedule with ID ${id}:`, error)
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Update a salary rate schedule
   */
  async update(id: string, data: UpdateSalaryRateScheduleDto): Promise<SalaryRateScheduleResponse> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating salary rate schedule with ID ${id}:`, error)
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Delete a salary rate schedule
   */
  async delete(id: string): Promise<{ statusCode: number; message: string }> {
    try {
      const response = await api.delete(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting salary rate schedule with ID ${id}:`, error)
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Get active rate for a category and subcategory
   * Optionally specify a date to check what rate was effective on that date
   */
  async getActiveRate(params: GetActiveRateQuery): Promise<ActiveRateResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/active`, { params })
      return response.data
    } catch (error) {
      console.error("Error fetching active rate:", error)
      throw new Error(getErrorMessage(error))
    }
  }
}

export const salaryRateScheduleService = new SalaryRateScheduleService()

