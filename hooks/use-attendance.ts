"use client"

import { useState, useEffect } from "react"
import { attendanceService } from "@/services/attendanceService"
import type { Attendance, AttendanceSearchParams, MarkAttendanceDto, BulkMarkAttendanceDto } from "@/types/attendance"
import { toast } from "sonner"

export function useAttendance(initialParams?: AttendanceSearchParams) {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  const fetchAttendances = async (params?: AttendanceSearchParams) => {
    try {
      setLoading(true)
      setError(null)

      const response = await attendanceService.getAllAttendance(params || initialParams)

      setAttendances(response.data || [])
      if (response.pagination) {
        setPagination(response.pagination)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch attendances"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = async (data: MarkAttendanceDto) => {
    try {
      setLoading(true)
      await attendanceService.markAttendance(data)
      toast.success("Attendance marked successfully!")
      await fetchAttendances()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to mark attendance"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const bulkMarkAttendance = async (data: BulkMarkAttendanceDto) => {
    try {
      setLoading(true)
      const response = await attendanceService.bulkMarkAttendance(data)
      toast.success(`Bulk attendance marked! Created: ${response.data.created}, Failed: ${response.data.failed}`)
      await fetchAttendances()
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to bulk mark attendance"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteAttendance = async (id: string) => {
    try {
      setLoading(true)
      await attendanceService.deleteAttendanceById(id)
      toast.success("Attendance deleted successfully!")
      await fetchAttendances()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete attendance"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteMultipleAttendances = async (ids: string[]) => {
    try {
      setLoading(true)
      await attendanceService.deleteMultipleAttendances({ ids })
      toast.success(`${ids.length} attendance records deleted successfully!`)
      await fetchAttendances()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete attendances"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const uploadAttendance = async (data: { companyId: string; month: string; file: File }) => {
    try {
      setLoading(true)
      const response = await attendanceService.uploadAttendanceSheet(data, data.file)
      toast.success(`Attendance uploaded successfully! Processed: ${response.data?.processed || 0} records`)
      await fetchAttendances()
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload attendance"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendances()
  }, [])

  return {
    attendances,
    loading,
    error,
    pagination,
    fetchAttendances,
    markAttendance,
    bulkMarkAttendance,
    uploadAttendance,
    deleteAttendance,
    deleteMultipleAttendances,
    refetch: fetchAttendances,
  }
}

export function useEmployeeAttendance(employeeId: string) {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployeeAttendance = async () => {
    if (!employeeId) return

    try {
      setLoading(true)
      setError(null)

      const response = await attendanceService.getAttendanceByEmployeeId(employeeId)
      setAttendances(response.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch employee attendance"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployeeAttendance()
  }, [employeeId])

  return {
    attendances,
    loading,
    error,
    refetch: fetchEmployeeAttendance,
  }
}

export function useCompanyAttendance(companyId: string) {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanyAttendance = async () => {
    if (!companyId) return

    try {
      setLoading(true)
      setError(null)

      const response = await attendanceService.getAttendanceByCompanyId(companyId)
      setAttendances(response.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch company attendance"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanyAttendance()
  }, [companyId])

  return {
    attendances,
    loading,
    error,
    refetch: fetchCompanyAttendance,
  }
}
