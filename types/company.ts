export enum PresentDaysCount {
  D26 = "D26",
  D27 = "D27",
  D28 = "D28",
  D29 = "D29",
  D30 = "D30",
  D31 = "D31",
}

export enum PFOptions {
  TWELVE_PERCENT = "12%",
  NO = "NO",
}

export enum ESICOptions {
  ZERO_POINT_SEVEN_FIVE_PERCENT = "0.75%",
  NO = "NO",
}

export enum BONUSOptions {
  EIGHT_POINT_THREE_THREE_PERCENT = "8.33%",
  NO = "NO",
}

export enum LWFOptions {
  TEN_RUPEES = "10 RUPEES",
  NO = "NO",
}

export enum CompanyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum SalaryFieldCategory {
  MANDATORY_NO_RULES = "MANDATORY_NO_RULES",
  MANDATORY_WITH_RULES = "MANDATORY_WITH_RULES",
  OPTIONAL_NO_RULES = "OPTIONAL_NO_RULES",
  OPTIONAL_WITH_RULES = "OPTIONAL_WITH_RULES",
  CUSTOM = "CUSTOM",
}

export enum SalaryFieldType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  DATE = "DATE",
  BOOLEAN = "BOOLEAN",
  SELECT = "SELECT",
}

export enum SalaryFieldPurpose {
  ALLOWANCE = "ALLOWANCE",
  DEDUCTION = "DEDUCTION",
  INFORMATION = "INFORMATION",
  CALCULATION = "CALCULATION",
}

export enum SalaryPaidStatus {
  PAID = "PAID",
  PENDING = "PENDING",
  HOLD = "HOLD",
}

// Salary field rule interface
export interface SalaryFieldRule {
  minValue?: number
  maxValue?: number
  defaultValue?: number | string
  allowedValues?: string[] | SalaryPaidStatus[]
  requireRemarks?: boolean
}

// Base salary template field interface
export interface SalaryTemplateField {
  key: string
  label: string
  type: SalaryFieldType
  category: SalaryFieldCategory
  purpose: SalaryFieldPurpose
  enabled: boolean
  rules?: SalaryFieldRule
  defaultValue?: string
  description?: string
  options?: string[]
  requiresAdminInput?: boolean
}

// Custom salary field interface
export interface CustomSalaryField extends SalaryTemplateField {}

// Salary template configuration
export interface SalaryTemplateConfig {
  mandatoryFields: SalaryTemplateField[]
  optionalFields: SalaryTemplateField[]
  customFields?: CustomSalaryField[]
}

export interface CompanyFormValues {
  name: string
  address: string
  contactPersonName: string
  contactPersonNumber: string
  status: CompanyStatus
  companyOnboardingDate: string | Date
  salaryTemplateConfig: SalaryTemplateConfig
}

export interface Company {
  id?: string
  name: string
  address: string
  contactPersonName: string
  contactPersonNumber: string
  status: CompanyStatus
  companyOnboardingDate: string
  salaryTemplates?: SalaryTemplateConfig
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
  status?: string
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
  employeeId: string
  title: string
  status: string
  firstName: string
  lastName: string
  designation: string
  department: string
  salary: number
  joiningDate: string
  leavingDate: string | null
  // Salary fields from employment history
  salaryPerDay?: number // Included in response for PER_DAY type
  salaryType?: string // "PER_DAY" or "PER_MONTH" - included in response
  // Optional fields (may not be in response)
  salaryCategory?: string
  salarySubCategory?: string
  monthlySalary?: number
}

export interface CompanyEmployeesResponse {
  statusCode: number
  message: string
  data: CompanyEmployee[]
}

// Generate options for basic duty (26 to 31 days)
export const getBasicDutyOptions = (): string[] => {
  return Array.from({ length: 6 }, (_, i) => `${i + 26}`)
}

// Helper function to convert API response salaryTemplates array to salaryTemplateConfig object
export const convertSalaryTemplatesToConfig = (salaryTemplates: any[]): SalaryTemplateConfig | null => {
  if (!Array.isArray(salaryTemplates) || salaryTemplates.length === 0) {
    return null
  }

  // Take the first (and presumably only) salary template
  const template = salaryTemplates[0]

  return {
    mandatoryFields: template.mandatoryFields || [],
    optionalFields: template.optionalFields || [],
    customFields: template.customFields || [],
  }
}

// Helper function to get default config if none exists
export const getDefaultSalaryTemplateConfig = (): SalaryTemplateConfig => {
  return {
    mandatoryFields: [
      {
        key: "serialNumber",
        label: "S.No",
        type: SalaryFieldType.NUMBER,
        category: SalaryFieldCategory.MANDATORY_NO_RULES,
        purpose: SalaryFieldPurpose.INFORMATION,
        enabled: true,
      },
      {
        key: "companyName",
        label: "Company Name",
        type: SalaryFieldType.TEXT,
        category: SalaryFieldCategory.MANDATORY_NO_RULES,
        purpose: SalaryFieldPurpose.INFORMATION,
        enabled: true,
      },
      {
        key: "employeeName",
        label: "Employee Name",
        type: SalaryFieldType.TEXT,
        category: SalaryFieldCategory.MANDATORY_NO_RULES,
        purpose: SalaryFieldPurpose.INFORMATION,
        enabled: true,
      },
      {
        key: "designation",
        label: "Designation",
        type: SalaryFieldType.TEXT,
        category: SalaryFieldCategory.MANDATORY_NO_RULES,
        purpose: SalaryFieldPurpose.INFORMATION,
        enabled: true,
      },
      {
        key: "monthlyPay",
        label: "Monthly Pay",
        type: SalaryFieldType.NUMBER,
        category: SalaryFieldCategory.MANDATORY_NO_RULES,
        purpose: SalaryFieldPurpose.CALCULATION,
        enabled: true,
      },
      {
        key: "basicDuty",
        label: "Basic Duty",
        type: SalaryFieldType.SELECT,
        category: SalaryFieldCategory.MANDATORY_WITH_RULES,
        purpose: SalaryFieldPurpose.CALCULATION,
        enabled: true,
        defaultValue: "30",
        rules: {
          defaultValue: 30,
        },
      },
      {
        key: "grossSalary",
        label: "Gross Salary",
        type: SalaryFieldType.NUMBER,
        category: SalaryFieldCategory.MANDATORY_NO_RULES,
        purpose: SalaryFieldPurpose.CALCULATION,
        enabled: true,
      },
      {
        key: "totalDeduction",
        label: "Total Deduction",
        type: SalaryFieldType.NUMBER,
        category: SalaryFieldCategory.MANDATORY_NO_RULES,
        purpose: SalaryFieldPurpose.CALCULATION,
        enabled: true,
      },
      {
        key: "netSalary",
        label: "Net Salary",
        type: SalaryFieldType.NUMBER,
        category: SalaryFieldCategory.MANDATORY_NO_RULES,
        purpose: SalaryFieldPurpose.CALCULATION,
        enabled: true,
      },
    ],
    optionalFields: [
      {
        key: "pf",
        label: "PF (12%)",
        type: SalaryFieldType.NUMBER,
        category: SalaryFieldCategory.OPTIONAL_NO_RULES,
        purpose: SalaryFieldPurpose.DEDUCTION,
        enabled: true,
      },
      {
        key: "esic",
        label: "ESIC (0.75%)",
        type: SalaryFieldType.NUMBER,
        category: SalaryFieldCategory.OPTIONAL_NO_RULES,
        purpose: SalaryFieldPurpose.DEDUCTION,
        enabled: true,
      },
      {
        key: "fatherName",
        label: "Father Name",
        type: SalaryFieldType.TEXT,
        category: SalaryFieldCategory.OPTIONAL_NO_RULES,
        purpose: SalaryFieldPurpose.INFORMATION,
        enabled: true,
      },
      {
        key: "uanNumber",
        label: "UAN No.",
        type: SalaryFieldType.TEXT,
        category: SalaryFieldCategory.OPTIONAL_NO_RULES,
        purpose: SalaryFieldPurpose.INFORMATION,
        enabled: true,
      },
      {
        key: "wagesPerDay",
        label: "Wages Per Day",
        type: SalaryFieldType.NUMBER,
        category: SalaryFieldCategory.OPTIONAL_NO_RULES,
        purpose: SalaryFieldPurpose.CALCULATION,
        enabled: true,
      },
      {
        key: "lwf",
        label: "LWF",
        type: SalaryFieldType.NUMBER,
        category: SalaryFieldCategory.OPTIONAL_WITH_RULES,
        purpose: SalaryFieldPurpose.DEDUCTION,
        enabled: true,
        rules: {
          defaultValue: 10,
        },
      },
    ],
    customFields: [
      {
        key: "bonus",
        label: "Bonus",
        type: SalaryFieldType.NUMBER,
        category: SalaryFieldCategory.CUSTOM,
        purpose: SalaryFieldPurpose.ALLOWANCE,
        enabled: true,
        requiresAdminInput: true,
        description:
          "Monthly bonus amount that varies based on performance, attendance, or company policy. Admin must specify the amount for each employee every month.",
        defaultValue: "0",
      },
      {
        key: "advanceTaken",
        label: "Advance Taken",
        type: SalaryFieldType.NUMBER,
        category: SalaryFieldCategory.CUSTOM,
        purpose: SalaryFieldPurpose.DEDUCTION,
        enabled: true,
        requiresAdminInput: true,
        description:
          "Amount of salary advance taken by the employee that needs to be deducted from their monthly salary. Admin must enter the advance amount for each employee.",
        defaultValue: "0",
      },
    ],
  }
}
