export interface Company {
  id?: string
  name: string
  address: string
  contactPersonName: string
  contactPersonNumber: string
  status?: "ACTIVE" | "INACTIVE"
  companyOnboardingDate?: string
  salaryTemplates: SalaryTemplates
}

export interface CompanyFormValues {
  name: string
  address: string
  contactPersonName: string
  contactPersonNumber: string
  status?: "ACTIVE" | "INACTIVE"
  companyOnboardingDate?: string | Date
  salaryTemplates?: SalaryTemplates
}

export interface SalaryTemplates {
  [key: string]: {
    enabled: boolean
    value: string | number
  }
}

export interface SalaryTemplateField {
  id: string
  label: string
  type: "text" | "number" | "select" | "special"
  required?: boolean
  options?: string[]
}

export enum BasicDuty {
  D26 = "26 days",
  D27 = "27 days",
  D28 = "28 days",
  D29 = "29 days",
  D30 = "30 days",
  D31 = "31 days",
}

// Form related interfaces
export interface CompanyFormProps {
  onSubmit: (company: Company) => void
  initialValues?: Partial<Company>
  isLoading?: boolean
}

// Search related interface
export interface CompanySearchParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  searchText?: string
}

// Salary field interface
export interface SalaryField {
  id: string
  label: string
  type: "number" | "text" | "calculated"
  required?: boolean
}

// Response interfaces
export interface CompanyResponse {
  statusCode: number
  message: string
  data?: Company
}

export interface CompaniesResponse {
  statusCode: number
  message: string
  data?: {
    companies: Company[]
    total: number
  }
}

export interface CompanyEmployeeCountResponse {
  statusCode: number
  message: string
  data: any[]
}

export interface CompanyEmployee {
  id: string
  title: string
  firstName: string
  lastName: string
  designation: string
  department: string
  salary: number
  joiningDate: string
  leavingDate: string | null
}

export interface CompanyEmployeesResponse {
  statusCode: number
  message: string
  data: CompanyEmployee[]
}
