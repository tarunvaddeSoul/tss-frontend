"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertTriangle, XCircle, Calendar, FileText, Loader2, Users } from "lucide-react"

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
import { companyService } from "@/services/companyService"
import { useToast } from "@/components/ui/use-toast"
import type { Company } from "@/types/company"
import { CompanyStatus } from "@/types/company"

const terminateCompanySchema = z.object({
  terminationDate: z.date({ required_error: "Termination date is required" }),
  reason: z.string().optional(),
})

interface TerminateCompanyDialogProps {
  company: Company
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TerminateCompanyDialog({ company, open, onOpenChange, onSuccess }: TerminateCompanyDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [employeeCount, setEmployeeCount] = useState<number | null>(null)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

  const form = useForm<z.infer<typeof terminateCompanySchema>>({
    resolver: zodResolver(terminateCompanySchema),
    defaultValues: {
      terminationDate: new Date(),
      reason: "",
    },
  })

  // Fetch employee count when dialog opens
  useEffect(() => {
    if (open && company.id) {
      const fetchEmployeeCount = async () => {
        try {
          setIsLoadingEmployees(true)
          const response = await companyService.getCompanyEmployees(company.id!)
          setEmployeeCount(response.data?.length || 0)
        } catch (error) {
          console.error("Error fetching employees:", error)
        } finally {
          setIsLoadingEmployees(false)
        }
      }
      fetchEmployeeCount()
    }
  }, [open, company.id])

  const handleSubmit = async (data: z.infer<typeof terminateCompanySchema>) => {
    setShowConfirmDialog(true)
  }

  const handleConfirmTermination = async () => {
    try {
      setIsSubmitting(true)

      const updateData: Partial<Company> = {
        status: CompanyStatus.INACTIVE,
      }

      const response = await companyService.updateCompany(company.id!, updateData)

      if (response.statusCode === 200 || response.data) {
        toast({
          title: "Company Terminated",
          description: `${company.name} has been terminated from TSS successfully.`,
        })

        onSuccess()
        onOpenChange(false)
        setShowConfirmDialog(false)
        form.reset()
      } else {
        throw new Error(response.message || "Failed to terminate company")
      }
    } catch (error: any) {
      console.error("Error terminating company:", error)

      let errorMessage = "Failed to terminate company. Please try again."
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
              Terminate Company from TSS
            </DialogTitle>
            <DialogDescription>
              Terminate this company from Tulsyan Security Solutions. This will mark the company as INACTIVE in the system.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Critical: Terminating Company from TSS</div>
              <div className="text-sm space-y-1">
                <p>Terminating a company from TSS will:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Mark the company status as <strong>INACTIVE</strong> (not deleted)</li>
                  <li>Prevent new employee assignments to this company</li>
                  <li>Keep all historical records and payroll data intact</li>
                  <li>Existing employee-company relationships remain (they should be terminated separately)</li>
                </ul>
                {employeeCount !== null && employeeCount > 0 && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded border border-destructive/20">
                    <strong>Warning:</strong> This company has <strong>{employeeCount} employee(s)</strong> assigned. 
                    Consider terminating their employment relationships first.
                  </div>
                )}
                <p className="mt-2 font-medium">This is a permanent action. Please verify before confirming.</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg mb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Company Name:</span>
                <span className="text-sm">{company.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Company ID:</span>
                <span className="text-sm">{company.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                <span className="text-sm">{company.status || "ACTIVE"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contact Person:</span>
                <span className="text-sm">{company.contactPersonName || "N/A"}</span>
              </div>
              {isLoadingEmployees ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Employees:
                  </span>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Employees:
                  </span>
                  <span className="text-sm">{employeeCount ?? "N/A"}</span>
                </div>
              )}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="terminationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Termination Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <DatePicker date={field.value} onSelect={field.onChange} />
                    <FormDescription>
                      Select the date this company's relationship with TSS ends.
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
                        placeholder="Enter reason for terminating this company from TSS (optional, for internal records)"
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
              Confirm Company Termination from TSS
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to terminate <strong>{company.name}</strong> from Tulsyan Security Solutions.
              </p>
              <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                <p>
                  <strong>Termination Date:</strong> {form.getValues("terminationDate")?.toLocaleDateString() || "Not set"}
                </p>
                {form.getValues("reason") && (
                  <p>
                    <strong>Reason:</strong> {form.getValues("reason")}
                  </p>
                )}
                {employeeCount !== null && employeeCount > 0 && (
                  <p className="text-destructive font-medium">
                    <strong>Active Employees:</strong> {employeeCount} (may need separate termination)
                  </p>
                )}
              </div>
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  This action will mark the company as <strong>INACTIVE</strong> in the system. The company will no longer appear in active company lists and cannot receive new employee assignments.
                  <br />
                  <br />
                  <strong>All historical data, payroll records, and employee relationships will be preserved.</strong>
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

