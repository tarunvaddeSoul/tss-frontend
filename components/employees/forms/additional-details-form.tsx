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
import type { UpdateEmployeeAdditionalDetailsDto, Employee } from "@/types/employee"

const additionalDetailsSchema = z.object({
  pfUanNumber: z.string().min(1, "PF UAN number is required"),
  esicNumber: z.string().min(1, "ESIC number is required"),
  policeVerificationNumber: z.string().min(1, "Police verification number is required"),
  policeVerificationDate: z.string().optional(),
  trainingCertificateNumber: z.string().min(1, "Training certificate number is required"),
  trainingCertificateDate: z.string().optional(),
  medicalCertificateNumber: z.string().min(1, "Medical certificate number is required"),
  medicalCertificateDate: z.string().optional(),
})

interface AdditionalDetailsFormProps {
  employee: Employee
  onUpdate: (updatedData: Partial<Employee>) => void
}

export function AdditionalDetailsForm({ employee, onUpdate }: AdditionalDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const additionalDetails = employee.additionalDetails || {}

  const form = useForm<z.infer<typeof additionalDetailsSchema>>({
    resolver: zodResolver(additionalDetailsSchema),
    defaultValues: {
      pfUanNumber: additionalDetails.pfUanNumber || employee.pfUanNumber || "",
      esicNumber: additionalDetails.esicNumber || employee.esicNumber || "",
      policeVerificationNumber: additionalDetails.policeVerificationNumber || employee.policeVerificationNumber || "",
      policeVerificationDate: additionalDetails.policeVerificationDate || employee.policeVerificationDate || "",
      trainingCertificateNumber:
        additionalDetails.trainingCertificateNumber || employee.trainingCertificateNumber || "",
      trainingCertificateDate: additionalDetails.trainingCertificateDate || employee.trainingCertificateDate || "",
      medicalCertificateNumber: additionalDetails.medicalCertificateNumber || employee.medicalCertificateNumber || "",
      medicalCertificateDate: additionalDetails.medicalCertificateDate || employee.medicalCertificateDate || "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof additionalDetailsSchema>) => {
    try {
      setIsSubmitting(true)

      // Optimistic update
      onUpdate({
        additionalDetails: values,
        pfUanNumber: values.pfUanNumber,
        esicNumber: values.esicNumber,
        policeVerificationNumber: values.policeVerificationNumber,
        policeVerificationDate: values.policeVerificationDate,
        trainingCertificateNumber: values.trainingCertificateNumber,
        trainingCertificateDate: values.trainingCertificateDate,
        medicalCertificateNumber: values.medicalCertificateNumber,
        medicalCertificateDate: values.medicalCertificateDate,
      })

      const updateData: UpdateEmployeeAdditionalDetailsDto = values

      await employeeService.updateEmployeeAdditionalDetails(employee.id, updateData)

      toast.success("Additional details updated successfully!")
      setHasChanges(false)
    } catch (error) {
      console.error("Error updating additional details:", error)
      toast.error("Failed to update additional details")
      // Revert optimistic update on error
      form.reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 space-y-0 pb-4">
        <CardTitle className="truncate">Additional Details</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pfUanNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PF UAN Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter PF UAN number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="esicNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ESIC Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ESIC number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="policeVerificationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Police Verification Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter police verification number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="policeVerificationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Police Verification Date</FormLabel>
                    <FormControl>
                      <Input placeholder="DD-MM-YYYY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trainingCertificateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Certificate Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter training certificate number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trainingCertificateDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Certificate Date</FormLabel>
                    <FormControl>
                      <Input placeholder="DD-MM-YYYY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medicalCertificateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Certificate Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter medical certificate number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medicalCertificateDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Certificate Date</FormLabel>
                    <FormControl>
                      <Input placeholder="DD-MM-YYYY" {...field} />
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
