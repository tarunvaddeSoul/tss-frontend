// Salary System Type Definitions

/**
 * Salary Category Enum
 * Determines how salary is calculated and stored
 */
export enum SalaryCategory {
  CENTRAL = "CENTRAL",
  STATE = "STATE",
  SPECIALIZED = "SPECIALIZED",
}

/**
 * Salary Subcategory Enum
 * Used for CENTRAL and STATE categories to determine per-day rates
 */
export enum SalarySubCategory {
  SKILLED = "SKILLED",
  UNSKILLED = "UNSKILLED",
  HIGHSKILLED = "HIGHSKILLED",
  SEMISKILLED = "SEMISKILLED",
}

/**
 * Salary Type Enum
 * Indicates how salary was stored in employment history snapshot
 */
export enum SalaryType {
  PER_DAY = "PER_DAY",
  PER_MONTH = "PER_MONTH",
}

/**
 * Salary Rate Schedule Response
 * Represents a rate schedule entry for CENTRAL/STATE categories
 */
export interface SalaryRateSchedule {
  id: string
  category: SalaryCategory
  subCategory: SalarySubCategory
  ratePerDay: number
  effectiveFrom: Date | string
  effectiveTo: Date | string | null
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

/**
 * Create Salary Rate Schedule DTO
 */
export interface CreateSalaryRateScheduleDto {
  category: SalaryCategory // CENTRAL or STATE only
  subCategory: SalarySubCategory
  ratePerDay: number // Must be > 0
  effectiveFrom: string // ISO date string (YYYY-MM-DD)
  effectiveTo?: string | null // ISO date string (optional, null = ongoing)
  isActive?: boolean // Default: true
}

/**
 * Update Salary Rate Schedule DTO
 */
export interface UpdateSalaryRateScheduleDto {
  ratePerDay?: number
  effectiveFrom?: string
  effectiveTo?: string | null
  isActive?: boolean
  // Note: category and subCategory are immutable
}

/**
 * Get Salary Rate Schedule Query Parameters
 */
export interface GetSalaryRateScheduleQuery {
  category?: SalaryCategory
  subCategory?: SalarySubCategory
  isActive?: boolean
  page?: number // Default: 1
  limit?: number // Default: 10
}

/**
 * Get Active Rate Query Parameters
 */
export interface GetActiveRateQuery {
  category: SalaryCategory
  subCategory: SalarySubCategory
  date?: string // ISO date string (optional, defaults to today)
}

/**
 * Salary Rate Schedule API Response
 */
export interface SalaryRateScheduleResponse {
  statusCode: number
  message: string
  data: SalaryRateSchedule
}

/**
 * Salary Rate Schedule List Response
 * Note: Backend returns records in data.data (nested) and hasNextPage/hasPrevPage instead of totalPages
 */
export interface SalaryRateScheduleListResponse {
  statusCode: number
  message: string
  data: {
    data: SalaryRateSchedule[] // Records are nested in data.data
    total: number
    page: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

/**
 * Active Rate Response
 */
export interface ActiveRateResponse {
  statusCode: number
  message: string
  data: SalaryRateSchedule | null
}

