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
import { Combobox } from "@/components/ui/combobox"
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
import api from "@/services/api"
import { employeeService } from "@/services/employeeService"
import { clientService } from "@/services/clientService"
import { designationService } from "@/services/designationService"
import { departmentService } from "@/services/departmentService"
import { useToast } from "@/components/ui/use-toast"
import { humanize } from "@/lib/labels"
import type { Employee, Designation, EmployeeDepartments, CreateEmploymentHistoryDto, IEmployeeEmploymentHistory } from "@/types/employee"
import type { Client } from "@/types/client"
import { Status } from "@/enums/employee.enum"

const assignEmploymentSchema = z.object({
  clientId: z.string().uuid("Please select a valid client"),
  departmentId: z.string().uuid("Please select a valid department"),
  designationId: z.string().uuid("Please select a valid designation"),
  joiningDate: z.date({ required_error: "Joining date is required" }),
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
  const [activeEmployment, setActiveEmployment] = useState<IEmployeeEmploymentHistory | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [departments, setDepartments] = useState<EmployeeDepartments[]>([])

  const form = useForm<z.infer<typeof assignEmploymentSchema>>({
    resolver: zodResolver(assignEmploymentSchema),
    defaultValues: {
      clientId: "",
      departmentId: "",
      designationId: "",
      joiningDate: new Date(),
    },
  })

  // Check for active employment and load dropdown data
  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // A 404 here is the normal "no active employment" case, so the global toast stays quiet
        try {
          const activeEmploymentResponse = await api.get<{ data?: IEmployeeEmploymentHistory | null }>(
            `/employees/active/${employee.id}`,
            { skipErrorToast: true } as Parameters<typeof api.get>[1],
          )
          setActiveEmployment(activeEmploymentResponse.data?.data || null)
        } catch {
          setActiveEmployment(null)
        }

        const [clientsResponse, designationsResponse, departmentsResponse] = await Promise.all([
          clientService.getAllClients(),
          designationService.getDesignations(),
          departmentService.getEmployeeDepartments(),
        ])

        setClients(clientsResponse)
        setDesignations(designationsResponse || [])
        setDepartments(departmentsResponse || [])

        // Reset form
        form.reset({
          clientId: "",
          departmentId: "",
          designationId: "",
          joiningDate: new Date(),
        })
      } catch (error) {
        console.error("Error loading assignment data:", error)
        toast({
          title: "Error",
          description: "Failed to load some data. Please try again.",
          variant: "destructive",
        })
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
        clientId: data.clientId,
        departmentId: data.departmentId,
        designationId: data.designationId,
        joiningDate: format(data.joiningDate, "dd-MM-yyyy"),
        status: Status.ACTIVE, // Always active when assigning new employment
      }

      const response = await employeeService.createEmploymentHistory(employee.id, createData)

      if (response.statusCode === 201) {
        toast({
          title: "Success",
          description: "Employee has been successfully assigned to the new client.",
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

  const clientOptions = clients
    .filter((c) => c.status === "ACTIVE") // Only show active clients
    .map((client) => ({
      value: client.id ?? "",
      label: client.name,
    }))

  const designationOptions = designations.map((designation) => ({
    value: designation.id,
    label: humanize(designation.name),
  }))

  const departmentOptions = departments.map((department) => ({
    value: department.id,
    label: humanize(department.name),
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
            Assign this employee to a new client. Employee can only work in one client at a time.
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
                    This employee is currently assigned to <strong>{activeEmployment.clientName}</strong>.
                    <br />
                    Please terminate the current employment before assigning a new one.
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form noValidate onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <Alert variant="info">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Important:</strong> Employee must not have any active employment. This will create a new active employment record.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Client <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={clientOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select client"
                            searchPlaceholder="Search clients..."
                            emptyText="No clients found."
                            disabled={!!activeEmployment}
                            modal={true}
                          />
                        </FormControl>
                        <FormDescription>Only active clients are shown</FormDescription>
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
                          Job Role <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={designationOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select job role"
                            searchPlaceholder="Search job roles..."
                            emptyText="No job roles found."
                            disabled={!!activeEmployment}
                            modal={true}
                          />
                        </FormControl>
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
                          Department <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={departmentOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select department"
                            searchPlaceholder="Search departments..."
                            emptyText="No departments found."
                            disabled={!!activeEmployment}
                            modal={true}
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
                          Joining Date <span className="text-destructive">*</span>
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

