import api from "./api"

export interface AttendanceSheet {
  id: string
  companyId: string
  companyName?: string // Included in list responses
  month: string
  attendanceSheetUrl: string
  createdAt?: string
  updatedAt?: string
}

export interface AttendanceSheetResponse {
  statusCode: number
  message: string
  data: AttendanceSheet | null
}

export interface AttendanceSheetListResponse {
  statusCode: number
  message: string
  data:
    | {
        data: AttendanceSheet[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      } // Paginated list
    | AttendanceSheet // Single record when companyId + month provided
    | null // When no sheet found
}

export interface AttendanceSheetListParams {
  companyId?: string
  month?: string
  startMonth?: string
  endMonth?: string
  page?: number
  limit?: number
  sortBy?: "month" | "companyId" | "createdAt"
  sortOrder?: "asc" | "desc"
}

class AttendanceSheetService {
  private readonly baseUrl = "/attendance/attendance-sheets"

  async upload(companyId: string, month: string, file: File): Promise<AttendanceSheetResponse> {
    const formData = new FormData()
    formData.append("companyId", companyId)
    formData.append("month", month)
    formData.append("file", file)

    const response = await api.post(this.baseUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  }

  // Get single record (backward compatible)
  async get(companyId: string, month: string): Promise<AttendanceSheetResponse> {
    const response = await api.get(this.baseUrl, { params: { companyId, month } })
    return response.data
  }

  // List all attendance sheets with optional filters
  async list(params?: AttendanceSheetListParams): Promise<AttendanceSheetListResponse> {
    const response = await api.get(this.baseUrl, { params })
    return response.data
  }

  async delete(id: string): Promise<AttendanceSheetResponse> {
    const response = await api.delete(`${this.baseUrl}/${id}`)
    return response.data
  }
}

export const attendanceSheetService = new AttendanceSheetService()
export default attendanceSheetService


