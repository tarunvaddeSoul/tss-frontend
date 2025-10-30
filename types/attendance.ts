// Base attendance interface
export interface Attendance {
  id: string
  employeeId: string
  companyId: string
  month: string // Format: YYYY-MM
  presentCount: number
  createdAt?: string
  updatedAt?: string
  // Additional fields that might be returned from backend
  employee?: {
    id: string
    firstName: string
    lastName: string
    employeeId?: string
  }
  company?: {
    id: string
    name: string
  }
  employeeID: string
  employeeName: string
  companyName: string
  designationName: string
  departmentName: string
  attendanceSheetUrl: string
}

export interface AttendanceRecord {
  employeeID: string
  employeeName: string
  companyName: string
  designationName: string
  departmentName: string
  presentCount: number
  attendanceSheetUrl: string
}

// DTO interfaces matching your backend DTOs
export interface MarkAttendanceDto {
  employeeId: string
  companyId: string
  month: string // Format: YYYY-MM
  presentCount: number
}

export interface BulkMarkAttendanceDto {
  records: MarkAttendanceDto[]
}

export interface UploadAttendanceSheetDto {
  companyId: string
  month: string // Format: YYYY-MM
  attendanceSheet?: File
}

export interface GetAttendanceDto {
  employeeId: string
  month: string // Format: YYYY-MM
}

export interface GetAttendanceByCompanyAndMonthDto {
  companyId: string
  month: string // Format: YYYY-MM
}

export interface DeleteAttendanceDto {
  ids: string[]
}

// Response interfaces
export interface AttendanceResponse {
  statusCode: number
  message: string
  data: Attendance | null
}

export interface AttendanceListResponse {
  success: boolean
  message: string
  data: Attendance[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface BulkAttendanceResponse {
  statusCode: number
  message: string
  data: {
    created: number
    failed: number
    errors?: string[]
  } | null
}

export interface UploadAttendanceResponse {
  success: boolean
  message: string
  data: {
    processed: number
    created: number
    updated: number
    failed: number
    errors?: string[]
  }
}

// Search and filter interfaces
export interface AttendanceSearchParams {
  companyId?: string
  employeeId?: string
  month?: string
  startMonth?: string
  endMonth?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Attendance summary interfaces
export interface AttendanceSummary {
  employeeId: string
  employeeName: string
  totalPresent: number
  totalWorkingDays: number
  attendancePercentage: number
  month: string
}

export interface CompanyAttendanceSummary {
  companyId: string
  companyName: string
  month: string
  totalEmployees: number
  totalPresent: number
  averageAttendance: number
  attendanceSummaries: AttendanceSummary[]
}

// Form validation schemas (for use with react-hook-form)
export interface AttendanceFormValues {
  employeeId: string
  companyId: string
  month: string
  presentCount: number
}

export interface BulkAttendanceFormValues {
  companyId: string
  month: string
  records: Array<{
    employeeId: string
    presentCount: number
  }>
}

export interface UploadAttendanceFormValues {
  companyId: string
  month: string
  attendanceSheet: File | null
}

// Active Employees for Month API Response
export interface ActiveEmployee {
  id: string
  firstName: string
  lastName: string
  status: string
  contactDetails?: {
    mobileNumber?: string
  }
  employmentHistories?: Array<{
    id: string
    companyId: string
    joiningDate: string
    leavingDate: string | null
    status: string
    designation?: {
      name: string
    }
    department?: {
      name: string
    }
  }>
}

export interface ActiveEmployeesResponse {
  statusCode: number
  message: string
  data: {
    companyId: string
    companyName: string
    month: string
    employees: ActiveEmployee[]
    count: number
  } | null
}
