"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { AlertTriangle, XCircle, Calendar, FileText, Loader2 } from "lucide-react"

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
import type { Employee, IEmployeeEmploymentHistory, LeavingDateDto } from "@/types/employee"
import { Status } from "@/enums/employee.enum"

const terminateEmploymentSchema = z.object({
  leavingDate: z.date({ required_error: "Termination date is required" }),
  reason: z.string().optional(),
})

interface TerminateEmploymentDialogProps {
  employee: Employee
  employment: IEmployeeEmploymentHistory
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TerminateEmploymentDialog({
  employee,
  employment,
  open,
  onOpenChange,
  onSuccess,
}: TerminateEmploymentDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const form = useForm<z.infer<typeof terminateEmploymentSchema>>({
    resolver: zodResolver(terminateEmploymentSchema),
    defaultValues: {
      leavingDate: new Date(),
      reason: "",
    },
  })

  useEffect(() => {
    if (open && employment) {
      form.reset({
        leavingDate: new Date(),
        reason: "",
      })
    }
  }, [open, employment])

  const handleSubmit = async (data: z.infer<typeof terminateEmploymentSchema>) => {
    // Validate leaving date is not before joining date
    const joiningDate = employment.joiningDate ? new Date(employment.joiningDate) : null
    if (joiningDate && data.leavingDate < joiningDate) {
      toast({
        title: "Invalid Date",
        description: "Termination date cannot be before the joining date.",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const handleConfirmTermination = async () => {
    try {
      setIsSubmitting(true)

      const terminationData: LeavingDateDto = {
        leavingDate: format(form.getValues("leavingDate"), "dd-MM-yyyy"),
      }

      const response = await employeeService.closeEmployment(employee.id, terminationData)

      if (response.statusCode === 200) {
        toast({
          title: "Employment Terminated",
          description: `Employment at ${employment.companyName} has been terminated successfully.`,
        })
        
        // If reason was provided, you might want to log it or store it separately
        // This depends on your backend API support

        onSuccess()
        onOpenChange(false)
        setShowConfirmDialog(false)
        form.reset()
      } else {
        throw new Error(response.message || "Failed to terminate employment")
      }
    } catch (error: any) {
      console.error("Error terminating employment:", error)
      
      let errorMessage = "Failed to terminate employment. Please try again."
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Terminate Employment
            </DialogTitle>
            <DialogDescription>
              Terminate this employee's current employment. This action will mark the employment as inactive.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Important: This is a Termination Action</div>
              <div className="text-sm space-y-1">
                <p>Terminating employment will:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Mark this employment as <strong>INACTIVE</strong> (not deleted)</li>
                  <li>Set the termination date</li>
                  <li>Prevent the employee from being assigned to payroll for this company</li>
                  <li>Allow assignment to a new company after termination</li>
                </ul>
                <p className="mt-2 font-medium">This cannot be undone easily. Please verify before confirming.</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg mb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Employee:</span>
                <span className="text-sm">
                  {employee.firstName} {employee.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Company:</span>
                <span className="text-sm">{employment.companyName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Designation:</span>
                <span className="text-sm">{employment.designationName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Department:</span>
                <span className="text-sm">{employment.departmentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Joining Date:</span>
                <span className="text-sm">{employment.joiningDate}</span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="leavingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Termination Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                    <FormDescription>
                      Select the last working day. Must be on or after the joining date.
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
                        placeholder="Enter reason for termination (optional, for internal records)"
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
                      <XCircle className="h-4 w-4 mr-2" />
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
              Confirm Employment Termination
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to terminate the employment of{" "}
                <strong>
                  {employee.firstName} {employee.lastName}
                </strong>{" "}
                at <strong>{employment.companyName}</strong>.
              </p>
              <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                <p>
                  <strong>Termination Date:</strong> {form.getValues("leavingDate") ? format(form.getValues("leavingDate"), "dd MMM yyyy") : "Not set"}
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
                  This action will mark the employment as INACTIVE. The employee will no longer be associated with this
                  company for payroll and attendance purposes.
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
                "Confirm Termination"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

