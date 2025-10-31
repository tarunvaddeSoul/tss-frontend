import api from "./api"

export interface AttendanceSheet {
  id: string
  companyId: string
  month: string
  attendanceSheetUrl: string
}

export interface AttendanceSheetResponse {
  statusCode: number
  message: string
  data: AttendanceSheet | null
}

export interface AttendanceSheetListResponse {
  statusCode: number
  message: string
  data: AttendanceSheet | null
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

  async get(companyId: string, month: string): Promise<AttendanceSheetResponse> {
    const response = await api.get(this.baseUrl, { params: { companyId, month } })
    return response.data
  }

  async delete(id: string): Promise<AttendanceSheetResponse> {
    const response = await api.delete(`${this.baseUrl}/${id}`)
    return response.data
  }
}

export const attendanceSheetService = new AttendanceSheetService()
export default attendanceSheetService


