"use client"

import { useState, useCallback } from "react"
import { payrollService } from "@/services/payrollService"
import { companyService } from "@/services/companyService"
import type {
    CalculatePayrollDto,
    CalculatePayrollResponse,
    FinalizePayrollDto,
    AdminInputField,
} from "@/types/payroll"
import type { Company, SalaryTemplateField } from "@/types/company"
import { useToast } from "@/components/ui/use-toast"

export function usePayroll() {
    const [isCalculating, setIsCalculating] = useState(false)
    const [isFinalizing, setIsFinalizing] = useState(false)
    const [calculationResult, setCalculationResult] = useState<CalculatePayrollResponse | null>(null)
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
    const [adminInputFields, setAdminInputFields] = useState<AdminInputField[]>([])
    const { toast } = useToast()

    const fetchCompanyDetails = useCallback(
        async (companyId: string) => {
            try {
                const company = await companyService.getCompanyById(companyId)
                setSelectedCompany(company.data ?? null)

                // Extract admin input fields from salary template
                const salaryTemplates = company.data?.salaryTemplates
                const salaryTemplate = Array.isArray(salaryTemplates) ? salaryTemplates[0] : salaryTemplates

                if (salaryTemplate) {
                    const adminFields: AdminInputField[] = []

                    salaryTemplate.mandatoryFields?.forEach((field: SalaryTemplateField) => {
                        if (field.requiresAdminInput) {
                            adminFields.push({
                                key: field.key,
                                label: field.label,
                                type: field.type,
                                purpose: field.purpose,
                                requiresAdminInput: field.requiresAdminInput,
                                defaultValue: field.defaultValue,
                                description: field.description,
                            })
                        }
                    })

                    salaryTemplate.optionalFields?.forEach((field: SalaryTemplateField) => {
                        if (field.requiresAdminInput) {
                            adminFields.push({
                                key: field.key,
                                label: field.label,
                                type: field.type,
                                purpose: field.purpose,
                                requiresAdminInput: field.requiresAdminInput,
                                defaultValue: field.defaultValue,
                                description: field.description,
                            })
                        }
                    })

                    salaryTemplate.customFields?.forEach((field: SalaryTemplateField) => {
                        if (field.requiresAdminInput) {
                            adminFields.push({
                                key: field.key,
                                label: field.label,
                                type: field.type,
                                purpose: field.purpose,
                                description: field.description,
                                requiresAdminInput: field.requiresAdminInput,
                                defaultValue: field.defaultValue,
                            })
                        }
                    })

                    setAdminInputFields(adminFields)
                }

        return company
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch company details",
                variant: "destructive",
            })
            throw error
        }
},
[toast],
  )

const calculatePayroll = useCallback(
    async (request: CalculatePayrollDto) => {
        setIsCalculating(true)
        try {
            console.log("Calculating payroll with request:", request)
            const result = await payrollService.calculatePayroll(request)
            setCalculationResult(result)
            toast({
                title: "Payroll Calculated",
                description: `Successfully calculated payroll for ${result.data.totalEmployees} employees.`,
            })
            return result
        } catch (error: any) {
            toast({
                title: "Calculation Failed",
                description: error.message || "Failed to calculate payroll. Please try again.",
                variant: "destructive",
            })
            throw error
        } finally {
            setIsCalculating(false)
        }
    },
    [toast],
)

const finalizePayroll = useCallback(
    async (request: FinalizePayrollDto) => {
        setIsFinalizing(true)
        try {
            const result = await payrollService.finalizePayroll(request)
            toast({
                title: "Payroll Finalized",
                description: `Successfully finalized payroll for ${result.data.totalRecords} employees.`,
            })
            return result
        } catch (error: any) {
            toast({
                title: "Finalization Failed",
                description: error.message || "Failed to finalize payroll. Please try again.",
                variant: "destructive",
            })
            throw error
        } finally {
            setIsFinalizing(false)
        }
    },
    [toast],
)

const resetCalculation = useCallback(() => {
    setCalculationResult(null)
    setSelectedCompany(null)
    setAdminInputFields([])
}, [])

return {
    isCalculating,
    isFinalizing,
    calculationResult,
    selectedCompany,
    adminInputFields,
    fetchCompanyDetails,
    calculatePayroll,
    finalizePayroll,
    resetCalculation,
}
}

export function usePayrollAdminInputs() {
    const [adminInputs, setAdminInputs] = useState<Record<string, Record<string, number>>>({})

    const updateAdminInput = useCallback((employeeId: string, fieldKey: string, value: number) => {
        setAdminInputs((prev) => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [fieldKey]: value,
            },
        }))
    }, [])

    const validateAdminInputs = useCallback(
        (employeeIds: string[], requiredFields: AdminInputField[]) => {
            const errors: string[] = []

            employeeIds.forEach((employeeId) => {
                const employeeInputs = adminInputs[employeeId] || {}

                requiredFields.forEach((field) => {
                    if (field.requiresAdminInput) {
                        const value = employeeInputs[field.key]
                        if (value !== undefined && value < 0) {
                            errors.push(`Employee ${employeeId}: ${field.label} cannot be negative`)
                        }
                    }
                })
            })

            return errors
        },
        [adminInputs],
    )

    const resetInputs = useCallback(() => {
        setAdminInputs({})
    }, [])

    return {
        adminInputs,
        updateAdminInput,
        validateAdminInputs,
        resetInputs,
    }
}
