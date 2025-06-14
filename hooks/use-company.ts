"use client"

import { useState, useEffect } from "react"
import { companyService } from "@/services/companyService"
import type { Company, SalaryTemplateConfig } from "@/types/company"

export function useCompany(companyId?: string) {
  const [company, setCompany] = useState<Company | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [data, setData] = useState<{ companies: Company[] } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Only fetch if we have a companyId
    if (companyId) {
      fetchCompany(companyId)
    }
    if (!companyId) {
      fetchCompanies()
    }
  }, [companyId])

  const fetchCompany = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await companyService.getCompanyById(id)
      if (response.data) {
        setCompany(response.data)
      } else {
        throw new Error("Company not found")
      }
    } catch (err) {
      console.error("Error fetching company:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch company"))
    } finally {
      setIsLoading(false)
    }
  }

  const saveSalaryTemplateConfig = async (templateConfig: SalaryTemplateConfig) => {
    if (!companyId || !company) {
      throw new Error("Company not found")
    }

    try {
      setIsSaving(true)
      setError(null)

      // Create updated company data with new salary template config
      const updatedCompany: Partial<Company> = {
        salaryTemplates: templateConfig,
      }

      const response = await companyService.updateCompany(companyId, updatedCompany)

      if (response.data) {
        setCompany(response.data)
        return response.data
      } else {
        throw new Error("Failed to update company salary template configuration")
      }
    } catch (err: any) {
      console.error("Error saving salary template config:", err)

      // Handle validation errors
      if (err.response?.status === 400) {
        const errorData = err.response.data

        if (errorData.message && Array.isArray(errorData.message)) {
          setError(new Error(errorData.message.join(", ")))
        } else {
          setError(new Error(errorData.message || "Validation failed"))
        }
      } else {
        setError(err instanceof Error ? err : new Error("Failed to save salary template configuration"))
      }

      throw err
    } finally {
      setIsSaving(false)
    }
  }

  const updateCompany = async (data: Partial<Company>) => {
    if (!companyId) {
      throw new Error("Company ID is required")
    }

    try {
      setIsSaving(true)
      setError(null)

      const response = await companyService.updateCompany(companyId, data)

      if (response.data) {
        setCompany(response.data)
        return response.data
      } else {
        throw new Error("Failed to update company")
      }
    } catch (err) {
      console.error("Error updating company:", err)
      setError(err instanceof Error ? err : new Error("Failed to update company"))
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  const refreshCompany = async () => {
    if (companyId) {
      await fetchCompany(companyId)
    }
  }

  const clearError = () => {
    setError(null)
  }

  // Helper function to get enabled salary template fields count
  const getEnabledFieldsCount = () => {
    if (!company?.salaryTemplates) return 0

    const { mandatoryFields = [], optionalFields = [], customFields = [] } = company.salaryTemplates

    return [...mandatoryFields, ...optionalFields, ...customFields].filter((field) => field.enabled).length
  }

  // Helper function to check if salary template is configured
  const isSalaryTemplateConfigured = () => {
    if (!company?.salaryTemplates) return false

    const { mandatoryFields = [], optionalFields = [], customFields = [] } = company.salaryTemplates

    return [...mandatoryFields, ...optionalFields, ...customFields].length > 0
  }

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await companyService.getCompanies()

      setData(response.data ? { companies: response.data.companies } : null)
      setCompanies(response.data ? response.data.companies : [])
    } catch (err) {
      console.error("Error fetching companies:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch companies"))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    company,
    companies,
    data,
    isLoading,
    isSaving,
    error,
    fetchCompany,
    fetchCompanies,
    saveSalaryTemplateConfig,
    updateCompany,
    refreshCompany,
    clearError,
    getEnabledFieldsCount,
    isSalaryTemplateConfigured,
    // Deprecated - keeping for backward compatibility but marked as deprecated
    /** @deprecated Use saveSalaryTemplateConfig instead */
    saveTemplates: saveSalaryTemplateConfig,
  }
}
