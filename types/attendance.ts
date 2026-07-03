// Base attendance interface
export interface Attendance {
  id: string
  employeeId: string
  clientId: string
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
  client?: {
    id: string
    name: string
  }
  employeeID: string
  employeeName: string
  clientName: string
  designationName: string
  departmentName: string
  attendanceSheetUrl: string
}

export interface AttendanceRecord {
  employeeID: string
  employeeName: string
  clientName: string
  designationName: string
  departmentName: string
  presentCount: number
  attendanceSheetUrl: string
}

// DTO interfaces matching your backend DTOs
export interface MarkAttendanceDto {
  employeeId: string
  clientId: string
  month: string // Format: YYYY-MM
  presentCount: number
}

export interface BulkMarkAttendanceDto {
  records: MarkAttendanceDto[]
}

export interface UploadAttendanceSheetDto {
  clientId: string
  month: string // Format: YYYY-MM
  attendanceSheet?: File
}

export interface GetAttendanceDto {
  employeeId: string
  month: string // Format: YYYY-MM
}

export interface GetAttendanceByClientAndMonthDto {
  clientId: string
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
  data: Attendance[]
  meta?: {
    total: number
    page: number
    limit: number
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
  clientId?: string
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

export interface ClientAttendanceSummary {
  clientId: string
  clientName: string
  month: string
  totalEmployees: number
  totalPresent: number
  averageAttendance: number
  attendanceSummaries: AttendanceSummary[]
}

// Form validation schemas (for use with react-hook-form)
export interface AttendanceFormValues {
  employeeId: string
  clientId: string
  month: string
  presentCount: number
}

export interface BulkAttendanceFormValues {
  clientId: string
  month: string
  records: Array<{
    employeeId: string
    presentCount: number
  }>
}

export interface UploadAttendanceFormValues {
  clientId: string
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
    clientId: string
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
  data: {
    clientId: string
    clientName: string
    month: string
    employees: ActiveEmployee[]
    count: number
  } | null
}

// Attendance Report API Response (GET /attendance/reports)
export interface AttendanceReportResponse {
  data: {
    client: {
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
  clientId: string
  month: string // Format: YYYY-MM
}

// Attendance Excel Record (only includes Excel URL)
export interface AttendanceExcelRecord {
  id: string
  clientId: string
  clientName?: string // Included in list responses
  month: string // Format: YYYY-MM
  attendanceExcelUrl: string // URL of prefinalized Excel file
  createdAt?: string
  updatedAt?: string
}

// Attendance Excel Upload Response
export interface UploadAttendanceExcelResponse {
  data: {
    id: string
    clientId: string
    month: string
    attendanceExcelUrl: string
    createdAt: string
  }
}

export interface ImportAttendanceExcelRowError {
  row: number
  employeeId: string
  reason: string
}

export interface ImportAttendanceExcelResult {
  clientId: string
  clientName: string
  month: string
  totalRows: number
  imported: number
  skipped: number
  errors: ImportAttendanceExcelRowError[]
}

// Attendance Excel List Query Parameters
export interface AttendanceExcelListParams {
  clientId?: string
  month?: string // Cannot use with startMonth/endMonth
  startMonth?: string // Format: YYYY-MM
  endMonth?: string // Format: YYYY-MM
  page?: number // Default: 1
  limit?: number // Default: 20, max: 100
  sortBy?: "month" | "clientId" | "createdAt" // Default: "month"
  sortOrder?: "asc" | "desc" // Default: "desc"
}

// Attendance Excel List Response (can be single record or paginated list)
export interface AttendanceExcelListResponse {
  data:
    | AttendanceExcelRecord // Single record when clientId + month provided
    | AttendanceExcelRecord[] // Paginated list items
    | null // When no Excel file found
  meta?: {
    total: number
    page: number
    limit: number
  }
}
