import api from "./api"
import type {
  MarkAttendanceDto,
  BulkMarkAttendanceDto,
  UploadAttendanceSheetDto,
  GetAttendanceByCompanyAndMonthDto,
  DeleteAttendanceDto,
  AttendanceResponse,
  AttendanceListResponse,
  BulkAttendanceResponse,
  UploadAttendanceResponse,
  AttendanceSearchParams,
  ActiveEmployeesResponse,
  AttendanceReportResponse,
} from "@/types/attendance"

class AttendanceService {
  private readonly baseUrl = "/attendance"

  /**
   * Mark attendance for a single employee
   */
  async markAttendance(data: MarkAttendanceDto): Promise<AttendanceResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/mark`, data)
      return response.data
    } catch (error) {
      console.error("Error marking attendance:", error)
      throw error
    }
  }

  /**
   * Bulk mark attendance for multiple employees
   */
  async bulkMarkAttendance(data: BulkMarkAttendanceDto): Promise<BulkAttendanceResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/bulk`, data)
      return response.data
    } catch (error) {
      console.error("Error bulk marking attendance:", error)
      throw error
    }
  }

  /**
   * Upload attendance sheet (Excel/CSV file)
   */
  async uploadAttendanceSheet(data: UploadAttendanceSheetDto, file: File): Promise<UploadAttendanceResponse> {
    try {
      const formData = new FormData()
      formData.append("companyId", data.companyId)
      formData.append("month", data.month)
      formData.append("attendanceSheet", file)

      const response = await api.post(`${this.baseUrl}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error uploading attendance sheet:", error)
      throw error
    }
  }

  /**
   * Get attendance records by company and month
   */
  async getAttendanceByCompanyAndMonth(params: GetAttendanceByCompanyAndMonthDto): Promise<AttendanceListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/records-by-company-and-month`, {
        params,
      })
      return response.data
    } catch (error) {
      console.error("Error fetching attendance by company and month:", error)
      throw error
    }
  }

  /**
   * Get attendance records by company ID
   */
  async getAttendanceByCompanyId(companyId: string): Promise<AttendanceListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/records-by-company/${companyId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching attendance by company:", error)
      throw error
    }
  }

  /**
   * Get attendance records by employee ID
   */
  async getAttendanceByEmployeeId(employeeId: string): Promise<AttendanceListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/employee/${employeeId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching attendance by employee:", error)
      throw error
    }
  }

  /**
   * Get all attendance records
   */
  async getAllAttendance(params?: AttendanceSearchParams): Promise<AttendanceListResponse> {
    try {
      const response = await api.get(this.baseUrl, { params })
      return response.data
    } catch (error) {
      console.error("Error fetching all attendance:", error)
      throw error
    }
  }

  /**
   * Delete attendance record by ID
   */
  async deleteAttendanceById(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error("Error deleting attendance:", error)
      throw error
    }
  }

  /**
   * Delete multiple attendance records
   */
  async deleteMultipleAttendances(data: DeleteAttendanceDto): Promise<void> {
    try {
      await api.delete(this.baseUrl, { data })
    } catch (error) {
      console.error("Error deleting multiple attendances:", error)
      throw error
    }
  }

  /**
   * Get attendance summary for an employee
   */
  async getEmployeeAttendanceSummary(
    employeeId: string,
    startMonth: string,
    endMonth: string,
  ): Promise<AttendanceListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/employee/${employeeId}`, {
        params: { startMonth, endMonth },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching employee attendance summary:", error)
      throw error
    }
  }

  /**
   * Get attendance summary for a company
   */
  async getCompanyAttendanceSummary(companyId: string, month: string): Promise<AttendanceListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${companyId}`, {
        params: { month },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching company attendance summary:", error)
      throw error
    }
  }

  /**
   * Check if attendance exists for employee in a month
   */
  async checkAttendanceExists(employeeId: string, month: string): Promise<boolean> {
    try {
      const response = await this.getAttendanceByEmployeeId(employeeId)
      const attendanceRecords = response.data || []
      return attendanceRecords.some((record) => record.month === month)
    } catch (error) {
      console.error("Error checking attendance existence:", error)
      return false
    }
  }

  /**
   * Get attendance statistics for dashboard
   */
  async getAttendanceStats(companyId?: string, month?: string) {
    try {
      const params: any = {}
      if (companyId) params.companyId = companyId
      if (month) params.month = month

      const response = await api.get(`${this.baseUrl}/stats`, { params })
      return response.data
    } catch (error) {
      console.error("Error fetching attendance stats:", error)
      throw error
    }
  }

  /**
   * Get active employees for a specific company and month
   * NEW: Returns only employees who were active during the specified month
   */
  async getActiveEmployeesForMonth(companyId: string, month: string): Promise<ActiveEmployeesResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/active-employees`, {
        params: { companyId, month },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching active employees:", error)
      throw error
    }
  }

  /**
   * Get attendance report for a company and month (includes totals, stats, and attendance sheet)
   * Uses GET /attendance/reports endpoint
   */
  async getAttendanceReport(companyId: string, month: string): Promise<AttendanceReportResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/reports`, {
        params: { companyId, month },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching attendance report:", error)
      throw error
    }
  }
}

export const attendanceService = new AttendanceService()
export default attendanceService
