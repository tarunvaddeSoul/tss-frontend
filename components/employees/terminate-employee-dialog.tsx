"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertTriangle, UserX, Calendar, FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { employeeService } from "@/services/employeeService"
import { useToast } from "@/components/ui/use-toast"
import { convertToCustomDateFormat } from "@/lib/utils"
import type { Employee, UpdateEmployeeDto } from "@/types/employee"
import { Status } from "@/enums/employee.enum"

const terminateEmployeeSchema = z.object({
  employeeRelievingDate: z.date({ required_error: "Termination date is required" }),
  reason: z.string().optional(),
})

interface TerminateEmployeeDialogProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TerminateEmployeeDialog({ employee, open, onOpenChange, onSuccess }: TerminateEmployeeDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const form = useForm<z.infer<typeof terminateEmployeeSchema>>({
    resolver: zodResolver(terminateEmployeeSchema),
    defaultValues: {
      employeeRelievingDate: new Date(),
      reason: "",
    },
  })

  const handleSubmit = async (data: z.infer<typeof terminateEmployeeSchema>) => {
    setShowConfirmDialog(true)
  }

  const handleConfirmTermination = async () => {
    try {
      setIsSubmitting(true)

      const formData = form.getValues()
      const updateData: UpdateEmployeeDto = {
        status: Status.INACTIVE,
        employeeRelievingDate: convertToCustomDateFormat(formData.employeeRelievingDate),
      }

      const response = await employeeService.updateEmployee(employee.id, updateData)

      if (response.statusCode === 200 || response.data) {
        toast({
          title: "Employee Terminated",
          description: `${employee.firstName} ${employee.lastName} has been terminated from TSS successfully.`,
        })

        onSuccess()
        onOpenChange(false)
        setShowConfirmDialog(false)
        form.reset()
      } else {
        throw new Error(response.message || "Failed to terminate employee")
      }
    } catch (error: any) {
      console.error("Error terminating employee:", error)

      let errorMessage = "Failed to terminate employee. Please try again."
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if employee has active employment
  const hasActiveEmployment = employee.employmentHistories?.some(
    (h: any) => h.status === Status.ACTIVE || h.status === "ACTIVE"
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <UserX className="h-5 w-5" />
              Terminate Employee from TSS
            </DialogTitle>
            <DialogDescription>
              Terminate this employee from Tulsyan Security Solutions. This will mark the employee as INACTIVE in the system.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Critical: Terminating Employee from TSS</div>
              <div className="text-sm space-y-1">
                <p>Terminating an employee from TSS will:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Mark the employee status as <strong>INACTIVE</strong> (not deleted)</li>
                  <li>Remove employee from active payroll processing</li>
                  <li>Keep all historical records intact</li>
                  <li>Prevent new employment assignments</li>
                </ul>
                {hasActiveEmployment && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded border border-destructive/20">
                    <strong>Warning:</strong> This employee has active employment(s). Consider terminating those first.
                  </div>
                )}
                <p className="mt-2 font-medium">This is a permanent action. Please verify before confirming.</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg mb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Employee Name:</span>
                <span className="text-sm">
                  {employee.firstName} {employee.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Employee ID:</span>
                <span className="text-sm">{employee.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                <span className="text-sm">{employee.status || "ACTIVE"}</span>
              </div>
              {employee.companyName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Company:</span>
                  <span className="text-sm">{employee.companyName}</span>
                </div>
              )}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employeeRelievingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Termination Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                    <FormDescription>
                      Select the last working day with Tulsyan Security Solutions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Termination Reason (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter reason for terminating this employee from TSS (optional, for internal records)"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Record the reason for termination for internal documentation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Continue to Confirm
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Employee Termination from TSS
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to terminate <strong>{employee.firstName} {employee.lastName}</strong> from Tulsyan Security Solutions.
              </p>
              <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                <p>
                  <strong>Termination Date:</strong> {form.getValues("employeeRelievingDate")?.toLocaleDateString() || "Not set"}
                </p>
                {form.getValues("reason") && (
                  <p>
                    <strong>Reason:</strong> {form.getValues("reason")}
                  </p>
                )}
              </div>
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  This action will mark the employee as <strong>INACTIVE</strong> in the system. The employee will no longer appear in active employee lists and cannot be assigned to new companies.
                  <br />
                  <br />
                  <strong>All historical data will be preserved.</strong>
                </AlertDescription>
              </Alert>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmTermination}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Terminating...
                </>
              ) : (
                "Confirm Termination from TSS"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

