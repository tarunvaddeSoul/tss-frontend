import api from "./api"
import { handleApiError } from "@/utils"
import type { Attendance } from "@/types/attendance"

// Define types for request payloads
export interface AttendanceCreateRequest {
  employeeId: string
  date: string
  checkIn: string
  checkOut?: string
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY"
  notes?: string
}

export interface AttendanceUpdateRequest {
  checkIn?: string
  checkOut?: string
  status?: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY"
  notes?: string
}

export interface AttendanceFilterParams {
  employeeId?: string
  date?: string
  startDate?: string
  endDate?: string
  status?: string
  page?: number
  limit?: number
}

// API endpoints
const ATTENDANCE_ENDPOINTS = {
  BASE: "/attendance",
  BY_ID: (id: string) => `/attendance/${id}`,
  CHECK_IN: "/attendance/check-in",
  CHECK_OUT: "/attendance/check-out",
  BULK_UPLOAD: "/attendance/bulk-upload",
  EXPORT: "/attendance/export",
}

export const attendanceService = {
  // Get attendance records with optional filtering
  async getAttendanceRecords(params?: AttendanceFilterParams): Promise<{ data: Attendance[]; total: number }> {
    try {
      const response = await api.get(ATTENDANCE_ENDPOINTS.BASE, { params })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get a single attendance record by ID
  async getAttendanceRecord(id: string): Promise<Attendance> {
    try {
      const response = await api.get(ATTENDANCE_ENDPOINTS.BY_ID(id))
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Create a new attendance record
  async createAttendanceRecord(attendance: AttendanceCreateRequest): Promise<Attendance> {
    try {
      const response = await api.post(ATTENDANCE_ENDPOINTS.BASE, attendance)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Update an existing attendance record
  async updateAttendanceRecord(id: string, attendance: AttendanceUpdateRequest): Promise<Attendance> {
    try {
      const response = await api.put(ATTENDANCE_ENDPOINTS.BY_ID(id), attendance)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Delete an attendance record
  async deleteAttendanceRecord(id: string): Promise<void> {
    try {
      await api.delete(ATTENDANCE_ENDPOINTS.BY_ID(id))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Mark employee check-in
  async checkIn(employeeId: string, location?: { latitude: number; longitude: number }): Promise<Attendance> {
    try {
      const response = await api.post(ATTENDANCE_ENDPOINTS.CHECK_IN, { employeeId, location })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Mark employee check-out
  async checkOut(employeeId: string, location?: { latitude: number; longitude: number }): Promise<Attendance> {
    try {
      const response = await api.post(ATTENDANCE_ENDPOINTS.CHECK_OUT, { employeeId, location })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Bulk upload attendance records
  async bulkUploadAttendance(file: File): Promise<{ success: number; failed: number; errors: any[] }> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await api.post(ATTENDANCE_ENDPOINTS.BULK_UPLOAD, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Export attendance records
  async exportAttendance(params: AttendanceFilterParams): Promise<Blob> {
    try {
      const response = await api.get(ATTENDANCE_ENDPOINTS.EXPORT, {
        params,
        responseType: "blob",
      })

      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
