import api from "./api"

export interface AttendanceSheet {
  id: string
  clientId: string
  clientName?: string // Included in list responses
  month: string
  attendanceSheetUrl: string
  createdAt?: string
  updatedAt?: string
}

export interface AttendanceSheetResponse {
  data: AttendanceSheet | null
}

export interface AttendanceSheetListResponse {
  data:
    | AttendanceSheet[] // Paginated list items
    | AttendanceSheet // Single record when clientId + month provided
    | null // When no sheet found
  meta?: {
    total: number
    page: number
    limit: number
  }
}

export interface AttendanceSheetListParams {
  clientId?: string
  month?: string
  startMonth?: string
  endMonth?: string
  page?: number
  limit?: number
  sortBy?: "month" | "clientId" | "createdAt"
  sortOrder?: "asc" | "desc"
}

class AttendanceSheetService {
  private readonly baseUrl = "/attendance/attendance-sheets"

  async upload(clientId: string, month: string, file: File): Promise<AttendanceSheetResponse> {
    const formData = new FormData()
    formData.append("clientId", clientId)
    formData.append("month", month)
    formData.append("file", file)

    const response = await api.post(this.baseUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  }

  // Get single record (backward compatible)
  async get(clientId: string, month: string): Promise<AttendanceSheetResponse> {
    const response = await api.get(this.baseUrl, { params: { clientId, month } })
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


