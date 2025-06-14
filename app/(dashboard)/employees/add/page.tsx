"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { EmployeeForm } from "@/components/employees/employee-form"
import { employeeService } from "@/services/employeeService"
import { designationService } from "@/services/designationService"
import { departmentService } from "@/services/departmentService"
import { companyService } from "@/services/companyService"
import type { EmployeeFormValues } from "@/types/employee"
import { useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AddEmployeePage() {
    const [designations, setDesignations] = useState<{ value: string; label: string }[]>([])
    const [departments, setDepartments] = useState<{ value: string; label: string }[]>([])
    const [companies, setCompanies] = useState<{ value: string; label: string }[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isDataLoading, setIsDataLoading] = useState(true)

    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsDataLoading(true)

                // Fetch designations
                const designationsData = await designationService.getDesignations()
                console.log("Designations data:", designationsData)
                setDesignations(
                    designationsData.map((designation) => ({
                        value: designation.id,
                        label: designation.name,
                    })),
                )

                // Fetch departments
                const departmentsData = await departmentService.getEmployeeDepartments()
                setDepartments(
                    departmentsData.map((department) => ({
                        value: department.id,
                        label: department.name,
                    })),
                )

                // Fetch companies
                const companiesData = await companyService.getCompanies()
                setCompanies(
                    companiesData.data?.companies?.map((company) => ({
                        value: company.id ?? "",
                        label: company.name,
                    })) ?? []
                )
            } catch (error) {
                console.error("Error fetching form data:", error)
                toast({
                    title: "Error",
                    description: "Failed to load form data. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsDataLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleSubmit = async (values: EmployeeFormValues) => {
        setIsLoading(true)
        try {
            const createEmployeeResponse = await employeeService.createEmployee(values)
            console.log("(handleSubmit) Employee created successfully:", JSON.stringify(createEmployeeResponse, null, 2))
            toast({
                title: "Success",
                description: "Employee created successfully",
            })

            // Redirect to employee list
            router.push("/employees/list")
        } catch (error) {
            console.error("Error creating employee:", error)
            toast({
                title: "Error",
                description: "Failed to create employee. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Add New Employee</h1>
                <p className="text-muted-foreground">Create a new employee record</p>
            </div>

            {isDataLoading ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center h-[200px]">
                            <p className="text-muted-foreground">Loading form data...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <ScrollArea className="flex-1">
                    <EmployeeForm
                        onSubmit={handleSubmit}
                        designations={designations}
                        employeeDepartments={departments}
                        companies={companies}
                        isLoading={isLoading}
                    />
                </ScrollArea>
            )}
        </div>
    )
}
