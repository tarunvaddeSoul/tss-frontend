import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { employeeService } from "@/services/employeeService"
import type { Employee, EmployeeSearchParams, EmployeeFormValues, UpdateEmployeeDto } from "@/types/employee"
import { getErrorMessage } from "@/services/api"

interface UseEmployeeOptions {
  autoFetch?: boolean
}

interface UseEmployeeReturn {
  employee: Employee | null
  employees: Employee[]
  isLoading: boolean
  error: Error | null
  fetchEmployee: (id: string) => Promise<void>
  fetchEmployees: (params?: EmployeeSearchParams) => Promise<void>
  createEmployee: (data: EmployeeFormValues) => Promise<Employee | null>
  updateEmployee: (id: string, data: UpdateEmployeeDto) => Promise<Employee | null>
  deleteEmployee: (id: string) => Promise<boolean>
  deleteMultipleEmployees: (ids: string[]) => Promise<boolean>
  clearError: () => void
  refetchEmployee: (id: string) => Promise<void>
  refetchEmployees: (params?: EmployeeSearchParams) => Promise<void>
}

export function useEmployee(options: UseEmployeeOptions = { autoFetch: false }): UseEmployeeReturn {
  const { toast } = useToast()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(options.autoFetch || false)
  const [error, setError] = useState<Error | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchEmployee = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await employeeService.getEmployeeById(id)
        setEmployee(response.data)
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        const error = new Error(errorMessage)
        setError(error)
        console.error("Error fetching employee:", errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const fetchEmployees = useCallback(
    async (params?: EmployeeSearchParams) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await employeeService.getEmployees(params)
        setEmployees(response.data || [])
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        const error = new Error(errorMessage)
        setError(error)
        console.error("Error fetching employees:", errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const createEmployee = useCallback(
    async (data: EmployeeFormValues) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await employeeService.createEmployee(data)
        setEmployee(response.data)
        toast({
          title: "Success",
          description: "Employee created successfully",
        })
        return response.data
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        const error = new Error(errorMessage)
        setError(error)
        console.error("Error creating employee:", errorMessage)
        toast({
          title: "Error",
          description: errorMessage || "Failed to create employee",
          variant: "destructive",
        })
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [toast]
  )

  const updateEmployee = useCallback(
    async (id: string, data: UpdateEmployeeDto) => {
      try {
        setError(null)
        const response = await employeeService.updateEmployee(id, data)
        if (response.data) {
          setEmployee(response.data)
        }
        toast({
          title: "Success",
          description: "Employee updated successfully",
        })
        return response.data
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        const error = new Error(errorMessage)
        setError(error)
        console.error("Error updating employee:", errorMessage)
        toast({
          title: "Error",
          description: errorMessage || "Failed to update employee",
          variant: "destructive",
        })
        throw error
      }
    },
    [toast]
  )

  const deleteEmployee = useCallback(
    async (id: string) => {
      try {
        setError(null)
        await employeeService.deleteEmployee(id)
        setEmployees((prev) => prev.filter((emp) => emp.id !== id))
        if (employee?.id === id) {
          setEmployee(null)
        }
        toast({
          title: "Success",
          description: "Employee deleted successfully",
        })
        return true
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        const error = new Error(errorMessage)
        setError(error)
        console.error("Error deleting employee:", errorMessage)
        toast({
          title: "Error",
          description: errorMessage || "Failed to delete employee",
          variant: "destructive",
        })
        throw error
      }
    },
    [employee, toast]
  )

  const deleteMultipleEmployees = useCallback(
    async (ids: string[]) => {
      try {
        setError(null)
        await employeeService.deleteMultipleEmployees(ids)
        setEmployees((prev) => prev.filter((emp) => !ids.includes(emp.id)))
        if (employee && ids.includes(employee.id)) {
          setEmployee(null)
        }
        toast({
          title: "Success",
          description: "Employees deleted successfully",
        })
        return true
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        const error = new Error(errorMessage)
        setError(error)
        console.error("Error deleting employees:", errorMessage)
        toast({
          title: "Error",
          description: errorMessage || "Failed to delete employees",
          variant: "destructive",
        })
        throw error
      }
    },
    [employee, toast]
  )

  const refetchEmployee = useCallback(
    async (id: string) => {
      await fetchEmployee(id)
    },
    [fetchEmployee]
  )

  const refetchEmployees = useCallback(
    async (params?: EmployeeSearchParams) => {
      await fetchEmployees(params)
    },
    [fetchEmployees]
  )

  return {
    employee,
    employees,
    isLoading,
    error,
    fetchEmployee,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    deleteMultipleEmployees,
    clearError,
    refetchEmployee,
    refetchEmployees,
  }
}

