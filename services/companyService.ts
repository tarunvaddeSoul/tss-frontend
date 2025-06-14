import api from "./api"
import { handleApiError } from "@/utils"
import type {
  Company,
  CompanyResponse,
  CompaniesResponse,
  CompanySearchParams,
  CompanyEmployeeCountResponse,
  CompanyEmployeesResponse,
} from "@/types/company"

const COMPANY_ENDPOINTS = {
  BASE: "/companies",
  BY_ID: (id: string) => `/companies/${id}`,
  EMPLOYEE_COUNT: "/companies/employee-count",
  COMPANY_EMPLOYEES: (companyId: string) => `/companies/${companyId}/employees`,
}

export const companyService = {
  // Get all companies with pagination and search
  async getCompanies(params?: CompanySearchParams): Promise<CompaniesResponse> {
    try {
      const response = await api.get<CompaniesResponse>(COMPANY_ENDPOINTS.BASE, { params })
      if (!response.data.data) {
        throw new Error("Failed to fetch companies")
      }
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get a single company by ID
  async getCompanyById(id: string): Promise<CompanyResponse> {
    try {
      const response = await api.get<CompanyResponse>(COMPANY_ENDPOINTS.BY_ID(id))
      if (!response.data.data) {
        throw new Error("Company not found")
      }
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Create a new company
  async createCompany(companyData: Company): Promise<CompanyResponse> {
    try {
      const response = await api.post<CompanyResponse>(COMPANY_ENDPOINTS.BASE, companyData)
      if (!response.data) {
        throw new Error("Failed to create company")
      }
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Update an existing company
  async updateCompany(id: string, companyData: Partial<Company>): Promise<CompanyResponse> {
    try {
      const response = await api.put<CompanyResponse>(COMPANY_ENDPOINTS.BY_ID(id), companyData)
      if (!response.data.data) {
        throw new Error("Failed to update company")
      }
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Delete a company
  async deleteCompany(id: string): Promise<void> {
    try {
      await api.delete(COMPANY_ENDPOINTS.BY_ID(id))
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get employee count for companies
  async getCompanyEmployeeCounts(): Promise<any[]> {
    try {
      const response = await api.get<CompanyEmployeeCountResponse>(COMPANY_ENDPOINTS.EMPLOYEE_COUNT)
      return response.data.data || []
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get employees in a company
  async getCompanyEmployees(companyId: string): Promise<CompanyEmployeesResponse> {
    try {
      const response = await api.get<CompanyEmployeesResponse>(COMPANY_ENDPOINTS.COMPANY_EMPLOYEES(companyId))
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
