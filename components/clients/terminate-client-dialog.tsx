"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, XCircle, Loader2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { clientService } from "@/services/clientService"
import { getErrorMessage } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { label } from "@/lib/labels"
import type { Client } from "@/types/client"
import { ClientStatus } from "@/types/client"

interface TerminateClientDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TerminateClientDialog({ client, open, onOpenChange, onSuccess }: TerminateClientDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [employeeCount, setEmployeeCount] = useState<number | null>(null)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

  // Fetch employee count when dialog opens
  useEffect(() => {
    if (open && client.id) {
      const fetchEmployeeCount = async () => {
        try {
          setIsLoadingEmployees(true)
          const response = await clientService.getClientEmployees(client.id!)
          setEmployeeCount(response.data?.length || 0)
        } catch (error) {
          console.error("Error fetching employees:", error)
        } finally {
          setIsLoadingEmployees(false)
        }
      }
      fetchEmployeeCount()
    }
  }, [open, client.id])

  const handleConfirmTermination = async () => {
    try {
      setIsSubmitting(true)

      const updateData: Partial<Client> = {
        status: ClientStatus.INACTIVE,
      }

      await clientService.updateClient(client.id!, updateData)

      toast({
        title: "Client Terminated",
        description: `${client.name} has been terminated from TSS successfully.`,
      })

      onSuccess()
      onOpenChange(false)
      setShowConfirmDialog(false)
    } catch (error: any) {
      console.error("Error terminating client:", error)

      toast({
        title: "Error",
        description: getErrorMessage(error),
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
              Terminate Client from TSS
            </DialogTitle>
            <DialogDescription>
              Terminate this client from Tulsyan Security Services. This will mark the client as INACTIVE in the system.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Critical: Terminating Client from TSS</div>
              <div className="text-sm space-y-1">
                <p>Terminating a client from TSS will:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Mark the client status as <strong>INACTIVE</strong> (not deleted)</li>
                  <li>Prevent new employee assignments to this client</li>
                  <li>Keep all historical records and payroll data intact</li>
                  <li>Existing employee-client relationships remain (they should be terminated separately)</li>
                </ul>
                {employeeCount !== null && employeeCount > 0 && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded border border-destructive/20">
                    <strong>Warning:</strong> This client has <strong>{employeeCount} employee(s)</strong> assigned. 
                    Consider terminating their employment relationships first.
                  </div>
                )}
                <p className="mt-2 font-medium">Please verify before confirming.</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="rounded-md border bg-surface p-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Client Name</span>
                <span className="text-sm font-medium">{client.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Client ID</span>
                <span className="font-mono text-[13px]">{client.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Current Status</span>
                <span className="text-sm">{label.status(client.status)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Contact Person</span>
                <span className="text-sm">{client.contactPersonName || "N/A"}</span>
              </div>
              {isLoadingEmployees ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Employees
                  </span>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Employees
                  </span>
                  <span className="font-mono text-[13px]">{employeeCount ?? "N/A"}</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting}
              onClick={() => setShowConfirmDialog(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Continue to Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Client Termination from TSS
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to terminate <strong>{client.name}</strong> from Tulsyan Security Services.
              </p>
              <div className="rounded-md border bg-surface p-3 space-y-1 text-sm">
                <p>
                  <strong>Client ID:</strong> {client.id}
                </p>
                {employeeCount !== null && employeeCount > 0 && (
                  <p className="text-destructive font-medium">
                    <strong>Active Employees:</strong> {employeeCount} (may need separate termination)
                  </p>
                )}
              </div>
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  This action will mark the client as <strong>INACTIVE</strong> in the system. The client will no longer appear in active client lists and cannot receive new employee assignments.
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

