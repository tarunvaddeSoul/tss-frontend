import { humanize } from "@/lib/labels"
import type { ActiveEmployee } from "@/types/attendance"

export interface AttendanceEntry {
  employeeId: string
  selected: boolean
  presentCount: number
}

export interface ExistingAttendanceRecord {
  employeeId: string
  employeeName: string
  presentCount: number
  designation?: string
  department?: string
}

export interface EmployeeDisplayInfo {
  designation: string
  department: string
}

// The API now returns designationName/departmentName, older payloads nested them under designation/department.
interface EmploymentHistoryLike {
  clientId: string
  designationName?: string | null
  departmentName?: string | null
  designation?: { name?: string } | null
  department?: { name?: string } | null
}

export function getEmployeeDisplayInfo(employee: ActiveEmployee, clientId?: string): EmployeeDisplayInfo {
  const histories = (employee.employmentHistories ?? []) as EmploymentHistoryLike[]
  const history = histories.find((h) => h.clientId === clientId) ?? histories[0]
  if (!history) return { designation: "-", department: "-" }
  return {
    designation: humanize(history.designationName ?? history.designation?.name ?? null),
    department: humanize(history.departmentName ?? history.department?.name ?? null),
  }
}
