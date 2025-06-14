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

export interface DashboardReportResponse {
  statusCode: number
  message: string
  data: DashboardReport
}