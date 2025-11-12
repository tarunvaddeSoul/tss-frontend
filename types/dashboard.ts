// Main Response Interface
export interface DashboardReportResponse {
  statusCode: number
  message: string
  data: DashboardReportData
}

// Main Data Structure
export interface DashboardReportData {
  summary: SummaryStats
  employeeStats: EmployeeStats
  companyStats: CompanyStats
  growthMetrics: GrowthMetrics
  specialDates: SpecialDates
  recentActivity: RecentActivity
}

// Summary Statistics
export interface SummaryStats {
  totalEmployees: number
  newEmployeesThisMonth: number
  totalCompanies: number
  newCompaniesThisMonth: number
  activeEmployees: number
  inactiveEmployees: number
  activeCompanies: number
  inactiveCompanies: number
}

// Employee Statistics
export interface EmployeeStats {
  total: number
  newThisMonth: number
  byDepartment: DepartmentCount[]
  byDesignation: DesignationCount[]
  activeInactive: ActiveInactiveCount
}

export interface DepartmentCount {
  departmentName: string
  _count: {
    departmentName: number
  }
}

export interface DesignationCount {
  designationName: string
  _count: {
    designationName: number
  }
}

export interface ActiveInactiveCount {
  active: number
  inactive: number
}

// Company Statistics
export interface CompanyStats {
  total: number
  newThisMonth: number
  activeInactive: ActiveInactiveCount
  tenure: CompanyTenureInfo
}

export interface CompanyTenureInfo {
  tenureDistribution: TenureDistribution
  averageTenureMonths: number
  averageTenureYears: number
  companies: CompanyTenureDetail[]
}

export interface TenureDistribution {
  '0-6 months': number
  '6-12 months': number
  '1-2 years': number
  '2-5 years': number
  '5+ years': number
}

export interface CompanyTenureDetail {
  id: string
  name: string
  status: string
  monthsWithUs: number
  yearsWithUs: number
  tenureGroup: '0-6 months' | '6-12 months' | '1-2 years' | '2-5 years' | '5+ years'
  onboardingDate: string // Format: DD-MM-YYYY
}

// Growth Metrics (for charts)
export interface GrowthMetrics {
  employees: EmployeeGrowth
  companies: CompanyGrowth
}

export interface EmployeeGrowth {
  monthly: MonthlyGrowthData[]
  yearly: YearlyGrowthData[]
}

export interface CompanyGrowth {
  monthly: MonthlyCompanyGrowthData[]
  yearly: YearlyCompanyGrowthData[]
}

export interface MonthlyGrowthData {
  month: string // Format: YYYY-MM (e.g., "2024-01")
  count: number // Total employees up to this month
  newEmployees: number // New employees added in this month
}

export interface YearlyGrowthData {
  year: number // e.g., 2024
  count: number // Total employees up to this year
  newEmployees: number // New employees added in this year
}

export interface MonthlyCompanyGrowthData {
  month: string // Format: YYYY-MM (e.g., "2024-01")
  count: number // Total companies up to this month
  newCompanies: number // New companies added in this month
}

export interface YearlyCompanyGrowthData {
  year: number // e.g., 2024
  count: number // Total companies up to this year
  newCompanies: number // New companies added in this year
}

// Special Dates
export interface SpecialDates {
  birthdays: BirthdayInfo[]
  employeeAnniversaries: EmployeeAnniversaryInfo[]
  companyAnniversaries: CompanyAnniversaryInfo[]
}

export interface BirthdayInfo {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string // Format: DD-MM-YYYY or YYYY-MM-DD
}

export interface EmployeeAnniversaryInfo {
  id: string
  firstName: string
  lastName: string
  employeeOnboardingDate: string // Format: DD-MM-YYYY or YYYY-MM-DD
}

export interface CompanyAnniversaryInfo {
  id: string
  name: string
  companyOnboardingDate: string // Format: DD-MM-YYYY
  status: string
}

// Recent Activity
export interface RecentActivity {
  recentJoinees: RecentJoinee[]
  recentPayrolls: RecentPayroll[]
}

export interface RecentJoinee {
  id: string
  title: string
  firstName: string
  lastName: string
  employeeOnboardingDate: string
  status: string
  // ... other employee fields
  [key: string]: any
}

export interface RecentPayroll {
  id: string
  employeeId: string
  companyId: string
  month: string // Format: YYYY-MM
  salaryData: any // JSON object with salary details
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  employee: {
    id: string
    firstName: string
    lastName: string
    // ... other employee fields
    [key: string]: any
  }
  company: {
    id: string
    name: string
    // ... other company fields
    [key: string]: any
  }
}

// Legacy types for backward compatibility (deprecated - use DashboardReportData instead)
export interface DepartmentStat {
  departmentName: string
  _count: { departmentName: number }
}

export interface DesignationStat {
  designationName: string
  _count: { designationName: number }
}

export interface ActiveInactiveStat {
  active: number
  inactive: number
}

export interface Employee {
  id: string
  title: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  fatherName: string
  motherName: string
  husbandName: string | null
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

export interface Company {
  id: string
  name: string
  address: string
  contactPersonName: string
  contactPersonNumber: string
  status: string
  companyOnboardingDate: string
  createdAt: string
  updatedAt: string
}

export interface PayrollRecord {
  id: string
  employeeId: string
  companyName: string | null
  companyId: string
  month: string
  salaryData: Record<string, any>
  createdAt: string
  updatedAt: string
  employee: Employee
  company: Company
}

export interface CompanyEmployeeCount {
  name: string
  employeeCount: number
}

// Legacy DashboardReport interface (deprecated - use DashboardReportData instead)
export interface DashboardReport {
  employeeStats: {
    totalEmployees: number
    newEmployeesThisMonth: number
    employeesByDepartment: DepartmentStat[]
    employeesByDesignation: DesignationStat[]
    activeInactive: ActiveInactiveStat
  }
  companyStats: {
    totalCompanies: number
    newCompaniesThisMonth: number
    activeInactive: ActiveInactiveStat
  }
  specialDates: {
    birthdays: Employee[]
    anniversaries: Employee[]
  }
  recentActivity: {
    recentJoinees: Employee[]
    recentPayrolls: PayrollRecord[]
  }
}
