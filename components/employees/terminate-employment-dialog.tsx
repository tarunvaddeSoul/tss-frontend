"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { AlertTriangle, XCircle, Calendar, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
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
import { employeeName, formatDate, humanize } from "@/lib/labels"
import type { Employee, IEmployeeEmploymentHistory, LeavingDateDto } from "@/types/employee"

const terminateEmploymentSchema = z.object({
  leavingDate: z.date({ required_error: "Last working day is required" }),
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
    },
  })

  useEffect(() => {
    if (open && employment) {
      form.reset({ leavingDate: new Date() })
    }
  }, [open, employment])

  const handleSubmit = async (data: z.infer<typeof terminateEmploymentSchema>) => {
    // Validate leaving date is not before joining date
    const joiningDate = employment.joiningDate ? new Date(employment.joiningDate) : null
    if (joiningDate && data.leavingDate < joiningDate) {
      toast({
        title: "Invalid Date",
        description: "Last working day cannot be before the joining date.",
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
          title: "Assignment Ended",
          description: `Assignment at ${employment.clientName} has ended.`,
        })

        onSuccess()
        onOpenChange(false)
        setShowConfirmDialog(false)
        form.reset()
      } else {
        throw new Error(response.message || "Failed to end assignment")
      }
    } catch (error: any) {
      let errorMessage = "Failed to end assignment. Please try again."
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
              End Assignment
            </DialogTitle>
            <DialogDescription>
              End this employee's current assignment. It stays in the history, and the employee can be assigned to another client.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">What ending an assignment does</div>
              <div className="text-sm space-y-1">
                <p>Ending this assignment will:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Mark this employment as <strong>INACTIVE</strong> (not deleted)</li>
                  <li>Record the last working day</li>
                  <li>Prevent the employee from being assigned to payroll for this client</li>
                  <li>Allow assignment to a new client afterwards</li>
                </ul>
                <p className="mt-2 font-medium">Check the date before confirming.</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg mb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Employee:</span>
                <span className="text-sm">{employeeName(employee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Client:</span>
                <span className="text-sm">{employment.clientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Designation:</span>
                <span className="text-sm">{humanize(employment.designationName)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Department:</span>
                <span className="text-sm">{humanize(employment.departmentName)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Joining Date:</span>
                <span className="font-mono text-[13px]">{formatDate(employment.joiningDate)}</span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="leavingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Last Working Day <span className="text-destructive">*</span>
                    </FormLabel>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                    <FormDescription>
                      Select the last working day. Must be on or after the joining date.
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
              End this assignment?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to end the assignment of <strong>{employeeName(employee)}</strong> at{" "}
                <strong>{employment.clientName}</strong>.
              </p>
              <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                <p>
                  <strong>Last Working Day:</strong> {form.getValues("leavingDate") ? format(form.getValues("leavingDate"), "dd MMM yyyy") : "Not set"}
                </p>
              </div>
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  This action will mark the employment as INACTIVE. The employee will no longer be associated with this
                  client for payroll and attendance purposes.
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
                  Saving...
                </>
              ) : (
                "End Assignment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

