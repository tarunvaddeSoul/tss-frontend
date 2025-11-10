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

// Attendance Report API Response (GET /attendance/reports)
export interface AttendanceReportResponse {
  statusCode: number
  message: string
  data: {
    company: {
      id: string
      name: string
      address?: string
    }
    month: string // Format: YYYY-MM
    totals: {
      totalEmployees: number
      totalPresent: number
      averageAttendance: number
      minPresent: number
      maxPresent: number
    }
    records: Array<{
      employeeId: string
      employeeName: string
      employeeID: string
      departmentName: string
      designationName: string
      presentCount: number
    }>
    attendanceSheet: {
      id: string
      attendanceSheetUrl: string
    } | null
  } | null
}

// Attendance Excel Upload DTO
export interface UploadAttendanceExcelDto {
  companyId: string
  month: string // Format: YYYY-MM
}

// Attendance Excel Record (only includes Excel URL)
export interface AttendanceExcelRecord {
  id: string
  companyId: string
  companyName?: string // Included in list responses
  month: string // Format: YYYY-MM
  attendanceExcelUrl: string // URL of prefinalized Excel file
  createdAt?: string
  updatedAt?: string
}

// Attendance Excel Upload Response
export interface UploadAttendanceExcelResponse {
  statusCode: number
  message: string
  data: {
    id: string
    companyId: string
    month: string
    attendanceExcelUrl: string
    createdAt: string
  }
}

// Attendance Excel List Query Parameters
export interface AttendanceExcelListParams {
  companyId?: string
  month?: string // Cannot use with startMonth/endMonth
  startMonth?: string // Format: YYYY-MM
  endMonth?: string // Format: YYYY-MM
  page?: number // Default: 1
  limit?: number // Default: 20, max: 100
  sortBy?: "month" | "companyId" | "createdAt" // Default: "month"
  sortOrder?: "asc" | "desc" // Default: "desc"
}

// Attendance Excel List Response (can be single record or paginated list)
export interface AttendanceExcelListResponse {
  statusCode: number
  message: string
  data:
    | AttendanceExcelRecord // Single record when companyId + month provided
    | {
        data: AttendanceExcelRecord[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      } // Paginated list
    | null // When no Excel file found
}
