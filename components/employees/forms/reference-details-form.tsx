"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { employeeService } from "@/services/employeeService"
import type { UpdateEmployeeReferenceDetailsDto, Employee } from "@/types/employee"

const referenceDetailsSchema = z.object({
  referenceName: z.string().min(1, "Reference name is required"),
  referenceAddress: z.string().min(1, "Reference address is required"),
  referenceNumber: z.string().min(1, "Reference number is required"),
})

interface ReferenceDetailsFormProps {
  employee: Employee
  onUpdate: (updatedData: Partial<Employee>) => void
}

export function ReferenceDetailsForm({ employee, onUpdate }: ReferenceDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const referenceDetails = employee.referenceDetails || {}

  const form = useForm<z.infer<typeof referenceDetailsSchema>>({
    resolver: zodResolver(referenceDetailsSchema),
    defaultValues: {
      referenceName: referenceDetails.referenceName || employee.referenceName || "",
      referenceAddress: referenceDetails.referenceAddress || employee.referenceAddress || "",
      referenceNumber: referenceDetails.referenceNumber || employee.referenceNumber || "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof referenceDetailsSchema>) => {
    try {
      setIsSubmitting(true)

      // Optimistic update
      onUpdate({
        referenceDetails: values,
        referenceName: values.referenceName,
        referenceAddress: values.referenceAddress,
        referenceNumber: values.referenceNumber,
      })

      const updateData: UpdateEmployeeReferenceDetailsDto = values

      await employeeService.updateEmployeeReferenceDetails(employee.id, updateData)

      toast.success("Reference details updated successfully!")
      setHasChanges(false)
    } catch (error) {
      console.error("Error updating reference details:", error)
      toast.error("Failed to update reference details")
      // Revert optimistic update on error
      form.reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 space-y-0 pb-4">
        <CardTitle className="truncate">Reference Details</CardTitle>
        {hasChanges && (
          <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting} size="sm" className="w-full sm:w-auto shrink-0 sm:ml-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin shrink-0" />
                <span className="truncate">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">Save Changes</span>
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} onChange={() => setHasChanges(true)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="referenceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
