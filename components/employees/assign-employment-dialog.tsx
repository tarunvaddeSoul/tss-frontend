"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { AlertCircle, Building2, Briefcase, Users, Calendar, DollarSign, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { employeeService } from "@/services/employeeService"
import { companyService } from "@/services/companyService"
import { designationService } from "@/services/designationService"
import { departmentService } from "@/services/departmentService"
import { useToast } from "@/components/ui/use-toast"
import type { Employee, Designation, EmployeeDepartments, CreateEmploymentHistoryDto } from "@/types/employee"
import type { Company } from "@/types/company"
import { Status } from "@/enums/employee.enum"

const assignEmploymentSchema = z.object({
  companyId: z.string().uuid("Please select a valid company"),
  departmentId: z.string().uuid("Please select a valid department"),
  designationId: z.string().uuid("Please select a valid designation"),
  joiningDate: z.date({ required_error: "Joining date is required" }),
  salary: z.number().min(0, "Salary must be a positive number"),
})

interface AssignEmploymentDialogProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AssignEmploymentDialog({ employee, open, onOpenChange, onSuccess }: AssignEmploymentDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeEmployment, setActiveEmployment] = useState<any>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [departments, setDepartments] = useState<EmployeeDepartments[]>([])

  const form = useForm<z.infer<typeof assignEmploymentSchema>>({
    resolver: zodResolver(assignEmploymentSchema),
    defaultValues: {
      companyId: "",
      departmentId: "",
      designationId: "",
      joiningDate: new Date(),
      salary: 0,
    },
  })

  // Check for active employment and load dropdown data
  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Check for active employment first
        const activeEmploymentResponse = await employeeService.getActiveEmployment(employee.id)
        setActiveEmployment(activeEmploymentResponse.data || null)

        // Load dropdown options
        const [companiesResponse, designationsResponse, departmentsResponse] = await Promise.all([
          companyService.getCompanies({ page: 1, limit: 100 }),
          designationService.getDesignations(),
          departmentService.getEmployeeDepartments(),
        ])

        setCompanies(companiesResponse.data?.companies || [])
        setDesignations(designationsResponse || [])
        setDepartments(departmentsResponse || [])

        // Reset form
        form.reset({
          companyId: "",
          departmentId: "",
          designationId: "",
          joiningDate: new Date(),
          salary: 0,
        })
      } catch (error) {
        // console.error("Error loading assignment data:", error)
        // toast({
        //   title: "Error",
        //   description: "Failed to load data. Please try again.",
        //   variant: "destructive",
        // })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [open, employee.id])

  const handleSubmit = async (data: z.infer<typeof assignEmploymentSchema>) => {
    // Double-check active employment before submitting
    if (activeEmployment) {
      toast({
        title: "Cannot Assign New Employment",
        description: "Employee already has an active employment. Please terminate the current employment first.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const createData: CreateEmploymentHistoryDto = {
        companyId: data.companyId,
        departmentId: data.departmentId,
        designationId: data.designationId,
        salary: data.salary,
        joiningDate: format(data.joiningDate, "dd-MM-yyyy"),
        status: Status.ACTIVE, // Always active when assigning new employment
      }

      const response = await employeeService.createEmploymentHistory(employee.id, createData)

      if (response.statusCode === 201) {
        toast({
          title: "Success",
          description: "Employee has been successfully assigned to the new company.",
        })
        onSuccess()
        onOpenChange(false)
        form.reset()
      } else {
        throw new Error(response.message || "Failed to assign employment")
      }
    } catch (error: any) {
      console.error("Error assigning employment:", error)
      
      let errorMessage = "Failed to assign employment. Please try again."
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      // Check if error is about active employment
      if (errorMessage.toLowerCase().includes("active") || errorMessage.toLowerCase().includes("already")) {
        toast({
          title: "Cannot Assign",
          description: "This employee already has an active employment. Please terminate it first.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const companyOptions = companies
    .filter((c) => c.status === "ACTIVE") // Only show active companies
    .map((company) => ({
      value: company.id,
      label: company.name,
    }))

  const designationOptions = designations.map((designation) => ({
    value: designation.id,
    label: designation.name,
  }))

  const departmentOptions = departments.map((department) => ({
    value: department.id,
    label: department.name,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Assign New Employment
          </DialogTitle>
          <DialogDescription>
            Assign this employee to a new company. Employee can only work in one company at a time.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Warning if active employment exists */}
            {activeEmployment && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Active Employment Detected</div>
                  <div className="text-sm">
                    This employee is currently assigned to <strong>{activeEmployment.companyName}</strong>.
                    <br />
                    Please terminate the current employment before assigning a new one.
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Important:</strong> Employee must not have any active employment. This will create a new active employment record.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Company <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!!activeEmployment}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companyOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value as string}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Only active companies are shown</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="designationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Job Role <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!!activeEmployment}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {designationOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value as string}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Department <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!!activeEmployment}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departmentOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Monthly Salary <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter monthly salary"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                            disabled={!!activeEmployment}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="joiningDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Joining Date <span className="text-red-500">*</span>
                        </FormLabel>
                        <DatePicker
                          date={field.value}
                          onSelect={field.onChange}
                        //   disabled={!!activeEmployment}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !!activeEmployment}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      "Assign Employment"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

