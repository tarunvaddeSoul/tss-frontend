export interface CalculatePayrollDto {
  companyId: string
  payrollMonth: string // format: YYYY-MM
  adminInputs?: Record<string, Record<string, number>>
}

/**
 * Payroll Salary Data Structure - Grouped Structure
 * Updated to match new backend response structure with grouped fields
 */

// Salary Category and Sub-Category Types
export type SalaryCategory = "CENTRAL" | "STATE" | "SPECIALIZED" | null
export type SalarySubCategory = "SKILLED" | "UNSKILLED" | "HIGHSKILLED" | "SEMISKILLED" | null

/**
 * Information fields (employee/company details)
 * Contains fields with purpose: INFORMATION
 */
export interface PayrollSalaryInformation {
  companyName: string
  employeeName: string
  designation: string
  department: string
  monthlyPay: number
  fatherName: string
  uanNumber: string | number
  // Allow for additional information fields from template
  [key: string]: any
}

/**
 * Calculation fields (basic pay, gross salary, net salary, etc.)
 * Contains fields with purpose: CALCULATION
 */
export interface PayrollSalaryCalculations {
  basicDuty: number
  dutyDone: number
  basicPay: number
  grossSalary: number
  netSalary: number
  wagesPerDay: number
  rate: number
  totalDeduction?: number
  // Allow for additional calculation fields from template
  [key: string]: any
}

/**
 * Allowance fields (bonus, etc.)
 * Contains fields with purpose: ALLOWANCE
 */
export interface PayrollSalaryAllowances {
  bonus: number
  // Allow for additional allowance fields from template
  [key: string]: any
}

/**
 * Deduction fields (pf, esic, lwf, advance, etc.)
 * Contains fields with purpose: DEDUCTION
 */
export interface PayrollSalaryDeductions {
  pf: number
  esic: number
  lwf: number
  advanceTaken: number
  totalDeductions: number
  // Allow for additional deduction fields from template
  [key: string]: any
}

/**
 * Payroll Salary Data - Grouped Structure
 * All payroll APIs now return salary data in this grouped structure
 */
export interface PayrollSalaryData {
  // Metadata (top-level, unchanged)
  salaryCategory: SalaryCategory
  salarySubCategory: SalarySubCategory
  monthlySalary: number | null
  salaryPerDay: number | null
  pfEnabled: boolean
  esicEnabled: boolean
  serialNumber: number

  // Grouped fields
  information: PayrollSalaryInformation
  calculations: PayrollSalaryCalculations
  allowances: PayrollSalaryAllowances
  deductions: PayrollSalaryDeductions

  // Allow for backward compatibility with flat structure
  [key: string]: any
}

export interface PayrollRecord {
  employeeId: string
  employeeName: string
  presentDays: number
  salary: PayrollSalaryData
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
  salaryData: PayrollSalaryData
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
  salaryData: PayrollSalaryData
  createdAt: string
  updatedAt: string
}

export interface EmployeePayrollResponse {
  statusCode: number
  message: string
  data: {
    employeeId: string
    companyId: string
    startMonth: string
    endMonth: string
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
  salaryData: PayrollSalaryData;
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

export interface PayrollByMonthSummary {
  totalEmployees: number
  totalGrossSalary: number
  totalDeductions: number
  totalNetSalary: number
}

export interface PayrollByMonthRecord {
  id: string
  employeeId: string
  companyId: string
  month: string
  salaryData: PayrollSalaryData
  createdAt: string
  updatedAt: string
}

export interface PayrollByMonthData {
  companyName: string
  payrollMonth: string
  summary: PayrollByMonthSummary
  createdAt: string
  updatedAt: string
  records: PayrollByMonthRecord[]
}

export interface PayrollByMonthResponse {
  statusCode: number
  message: string
  data: PayrollByMonthData
}