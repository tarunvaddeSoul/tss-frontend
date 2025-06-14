export interface CalculatePayrollDto {
  companyId: string
  payrollMonth: string // format: YYYY-MM
  adminInputs?: Record<string, Record<string, number>>
}

export interface PayrollRecord {
  employeeId: string
  employeeName: string
  presentDays: number
  salary: Record<string, any>
  error?: string
}

export interface CalculatePayrollResponse {
  statusCode: number
  message: string
  data: {
    companyName: string
    payrollMonth: string
    totalEmployees: number
    payrollResults: PayrollRecord[]
  }
}

export interface FinalizePayrollDto {
  companyId: string
  payrollMonth: string
  payrollRecords: {
    employeeId: string
    salary: Record<string, any>
  }[]
}

export interface FinalizePayrollResponse {
  statusCode: number
  message: string
  data: {
    companyId: string
    payrollMonth: string
    totalRecords: number
  }
}

// Company Reports Types
export interface CompanyPayrollRecord {
  id: string
  employeeId: string
  companyId: string
  month: string
  salaryData: Record<string, any>
  createdAt: string
  updatedAt: string
  employee: {
    id: string
    title: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    fatherName: string
    motherName: string
    husbandName: string
    bloodGroup: string
    highestEducationQualification: string
    employeeOnboardingDate: string
    employeeRelievingDate: string | null
    status: string
    category: string
    recruitedBy: string
    age: number
    createdAt: string
    updatedAt: string
  }
}

export interface CompanyPayrollMonth {
  month: string
  employeeCount: number
  totalNetSalary: number
  records: CompanyPayrollRecord[]
}

export interface PastPayrollsResponse {
  statusCode: number
  message: string
  data: {
    companyName: string
    records: CompanyPayrollMonth[]
    totalPages: number
    currentPage: number
  }
}

// Employee Reports Types
export interface EmployeePayrollRecord {
  id: string
  employeeId: string
  companyId: string
  month: string
  salaryData: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface EmployeePayrollResponse {
  statusCode: number
  message: string
  data: {
    employeeId: string
    records: EmployeePayrollRecord[]
  }
}

export interface PayrollStatsResponse {
  statusCode: number
  message: string
  data: any // Define as per your backend stats structure
}

export interface PayrollStep {
  id: number
  title: string
  description: string
  completed: boolean
  current: boolean
}

export interface AdminInputField {
  key: string
  label: string
  type: string
  purpose: string
  description?: string
  defaultValue?: string
  requiresAdminInput: boolean
}


export interface PayrollReportRecord {
  id: string;
  employeeId: string;
  companyId: string;
  companyName: string;
  month: string;
  salaryData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollReportResponse {
  statusCode: number;
  message: string;
  data: PayrollReportResponseData
}

export interface PayrollReportResponseData {
  records: PayrollReportRecord[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type ReportType = "company" | "employee"

export interface ReportFilters {
  companyId?: string
  employeeId?: string
  startMonth?: string
  endMonth?: string
  page: number
  limit: number
}