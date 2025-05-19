"use client"

import { useState, useEffect } from "react"
import { companyService } from "@/services/companyService"
import type { Company, SalaryTemplates } from "@/types/company"

export function useCompany(companyId?: string) {
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Only fetch if we have a companyId
    if (companyId) {
      fetchCompany(companyId)
    }
  }, [companyId])

  const fetchCompany = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await companyService.getCompany(id)
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

  const saveTemplates = async (templates: SalaryTemplates) => {
    if (!companyId || !company) {
      throw new Error("Company not found")
    }

    try {
      setIsSaving(true)
      setError(null)

      // Create updated company data with new templates
      const updatedCompany: Partial<Company> = {
        salaryTemplates: templates,
      }

      const response = await companyService.updateCompany(companyId, updatedCompany)

      if (response.data) {
        setCompany(response.data)
        return response.data
      } else {
        throw new Error("Failed to update company templates")
      }
    } catch (err) {
      console.error("Error saving templates:", err)
      setError(err instanceof Error ? err : new Error("Failed to save templates"))
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

  return {
    company,
    isLoading,
    isSaving,
    error,
    fetchCompany,
    saveTemplates,
    updateCompany,
  }
}
