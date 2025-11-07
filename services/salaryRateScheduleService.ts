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
   * Get active rates for a category and subcategory
   * API endpoint: GET /salary-rate-schedule/active/:category/:subCategory
   * Returns an array of active rate schedules
   */
  async getActiveRate(params: GetActiveRateQuery): Promise<ActiveRateResponse> {
    try {
      const { category, subCategory, date } = params
      // Build URL with path parameters
      let url = `${this.baseUrl}/active/${category}/${subCategory}`
      // Add date as query parameter if provided
      if (date) {
        url += `?date=${date}`
      }
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error("Error fetching active rate:", error)
      throw new Error(getErrorMessage(error))
    }
  }
}

export const salaryRateScheduleService = new SalaryRateScheduleService()

