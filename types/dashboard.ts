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
  clientStats: ClientStats
  growthMetrics: GrowthMetrics
  specialDates: SpecialDates
  recentActivity: RecentActivity
}

// Summary Statistics
export interface SummaryStats {
  totalEmployees: number
  newEmployeesThisMonth: number
  totalClients: number
  newClientsThisMonth: number
  activeEmployees: number
  inactiveEmployees: number
  activeClients: number
  inactiveClients: number
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

// Client Statistics
export interface ClientStats {
  total: number
  newThisMonth: number
  activeInactive: ActiveInactiveCount
  tenure: ClientTenureInfo
}

export interface ClientTenureInfo {
  tenureDistribution: TenureDistribution
  averageTenureMonths: number
  averageTenureYears: number
  clients: ClientTenureDetail[]
}

export interface TenureDistribution {
  '0-6 months': number
  '6-12 months': number
  '1-2 years': number
  '2-5 years': number
  '5+ years': number
}

export interface ClientTenureDetail {
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
  clients: ClientGrowth
}

export interface EmployeeGrowth {
  monthly: MonthlyGrowthData[]
  yearly: YearlyGrowthData[]
}

export interface ClientGrowth {
  monthly: MonthlyClientGrowthData[]
  yearly: YearlyClientGrowthData[]
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

export interface MonthlyClientGrowthData {
  month: string // Format: YYYY-MM (e.g., "2024-01")
  count: number // Total clients up to this month
  newClients: number // New clients added in this month
}

export interface YearlyClientGrowthData {
  year: number // e.g., 2024
  count: number // Total clients up to this year
  newClients: number // New clients added in this year
}

// Special Dates
export interface SpecialDates {
  birthdays: BirthdayInfo[]
  employeeAnniversaries: EmployeeAnniversaryInfo[]
  clientAnniversaries: ClientAnniversaryInfo[]
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

export interface ClientAnniversaryInfo {
  id: string
  name: string
  clientOnboardingDate: string // Format: DD-MM-YYYY
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
  clientId: string
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
  client: {
    id: string
    name: string
    // ... other client fields
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

export interface Client {
  id: string
  name: string
  address: string
  contactPersonName: string
  contactPersonNumber: string
  status: string
  clientOnboardingDate: string
  createdAt: string
  updatedAt: string
}

export interface PayrollRecord {
  id: string
  employeeId: string
  clientName: string | null
  clientId: string
  month: string
  salaryData: Record<string, any>
  createdAt: string
  updatedAt: string
  employee: Employee
  client: Client
}

export interface ClientEmployeeCount {
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
  clientStats: {
    totalClients: number
    newClientsThisMonth: number
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
