import api from "./api"
import type {
  MarkAttendanceDto,
  BulkMarkAttendanceDto,
  UploadAttendanceSheetDto,
  GetAttendanceByClientAndMonthDto,
  DeleteAttendanceDto,
  AttendanceResponse,
  AttendanceListResponse,
  BulkAttendanceResponse,
  UploadAttendanceResponse,
  AttendanceSearchParams,
  ActiveEmployeesResponse,
  AttendanceReportResponse,
  UploadAttendanceExcelDto,
  UploadAttendanceExcelResponse,
  AttendanceExcelListParams,
  AttendanceExcelListResponse,
  ImportAttendanceExcelResult,
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
      formData.append("clientId", data.clientId)
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
   * Get attendance records by client and month
   */
  async getAttendanceByClientAndMonth(params: GetAttendanceByClientAndMonthDto): Promise<AttendanceListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/records-by-client-and-month`, {
        params,
      })
      return response.data
    } catch (error) {
      console.error("Error fetching attendance by client and month:", error)
      throw error
    }
  }

  /**
   * Get attendance records by client ID
   */
  async getAttendanceByClientId(clientId: string): Promise<AttendanceListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/records-by-client/${clientId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching attendance by client:", error)
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
   * Get attendance summary for a client
   */
  async getClientAttendanceSummary(clientId: string, month: string): Promise<AttendanceListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${clientId}`, {
        params: { month },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching client attendance summary:", error)
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
  async getAttendanceStats(clientId?: string, month?: string) {
    try {
      const params: any = {}
      if (clientId) params.clientId = clientId
      if (month) params.month = month

      const response = await api.get(`${this.baseUrl}/stats`, { params })
      return response.data
    } catch (error) {
      console.error("Error fetching attendance stats:", error)
      throw error
    }
  }

  /**
   * Get active employees for a specific client and month
   * NEW: Returns only employees who were active during the specified month
   */
  async getActiveEmployeesForMonth(clientId: string, month: string): Promise<ActiveEmployeesResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/active-employees`, {
        params: { clientId, month },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching active employees:", error)
      throw error
    }
  }

  /**
   * Get attendance report for a client and month (includes totals, stats, and attendance sheet)
   * Uses GET /attendance/reports endpoint
   */
  async getAttendanceReport(clientId: string, month: string): Promise<AttendanceReportResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/reports`, {
        params: { clientId, month },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching attendance report:", error)
      throw error
    }
  }

  /**
   * Upload attendance Excel file (XLSX/XLS) for a client and month
   * Uploads or replaces an attendance Excel file stored in AWS S3
   * Uses POST /attendance/attendance-excel endpoint
   */
  async uploadAttendanceExcel(
    data: UploadAttendanceExcelDto,
    file: File,
  ): Promise<UploadAttendanceExcelResponse> {
    try {
      // Validate file type
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
      ]
      const allowedExtensions = [".xlsx", ".xls"]

      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        throw new Error("Unsupported file type. Only XLSX and XLS files are allowed.")
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error("File too large. Maximum file size is 10MB.")
      }

      const formData = new FormData()
      formData.append("clientId", data.clientId)
      formData.append("month", data.month)
      formData.append("file", file)

      const response = await api.post(`${this.baseUrl}/attendance-excel`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error uploading attendance Excel file:", error)
      throw error
    }
  }

  /**
   * Parse an uploaded attendance Excel and save present days for the client + month
   * Uses POST /attendance/import-excel endpoint
   */
  async importAttendanceExcel(
    data: UploadAttendanceExcelDto,
    file: File,
  ): Promise<ImportAttendanceExcelResult> {
    const formData = new FormData()
    formData.append("clientId", data.clientId)
    formData.append("month", data.month)
    formData.append("file", file)

    const response = await api.post(`${this.baseUrl}/import-excel`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data.data
  }

  /**
   * Get attendance Excel files with optional filters
   * Returns single record if clientId + month provided, or paginated list
   * Only returns records where attendanceExcelUrl is not null
   * Uses GET /attendance/attendance-excel endpoint
   */
  async getAttendanceExcelFiles(
    params?: AttendanceExcelListParams,
  ): Promise<AttendanceExcelListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/attendance-excel`, { params })
      return response.data
    } catch (error) {
      console.error("Error fetching attendance Excel files:", error)
      throw error
    }
  }

  /**
   * Delete attendance Excel file by ID
   * Uses DELETE /attendance/attendance-excel/:id endpoint
   */
  async deleteAttendanceExcel(id: string): Promise<{ data: { id: string } | null }> {
    try {
      const response = await api.delete(`${this.baseUrl}/attendance-excel/${id}`)
      return response.data
    } catch (error) {
      console.error("Error deleting attendance Excel file:", error)
      throw error
    }
  }
}

export const attendanceService = new AttendanceService()
export default attendanceService
