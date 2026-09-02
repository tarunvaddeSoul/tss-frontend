"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { format, isValid, parse } from "date-fns"
import { Save, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { employeeService } from "@/services/employeeService"
import type { UpdateEmployeeAdditionalDetailsDto, Employee } from "@/types/employee"

const additionalDetailsSchema = z.object({
  pfUanNumber: z.string().min(1, "PF UAN number is required"),
  esicNumber: z.string().min(1, "ESIC number is required"),
  policeVerificationNumber: z.string().min(1, "Police verification number is required"),
  policeVerificationDate: z.date().nullable(),
  trainingCertificateNumber: z.string().min(1, "Training certificate number is required"),
  trainingCertificateDate: z.date().nullable(),
  medicalCertificateNumber: z.string().min(1, "Medical certificate number is required"),
  medicalCertificateDate: z.date().nullable(),
})

type AdditionalDetailsValues = z.infer<typeof additionalDetailsSchema>
type DateFieldName = "policeVerificationDate" | "trainingCertificateDate" | "medicalCertificateDate"

function parseStoredDate(value?: string | null): Date | null {
  if (!value) return null
  const date = /^\d{2}-\d{2}-\d{4}$/.test(value) ? parse(value, "dd-MM-yyyy", new Date()) : new Date(value)
  return isValid(date) ? date : null
}

function toApiDate(date: Date | null): string | undefined {
  return date ? format(date, "dd-MM-yyyy") : undefined
}

interface AdditionalDetailsFormProps {
  employee: Employee
  onUpdate: (updatedData: Partial<Employee>) => void
}

export function AdditionalDetailsForm({ employee, onUpdate }: AdditionalDetailsFormProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const additionalDetails = employee.additionalDetails || {}

  const form = useForm<AdditionalDetailsValues>({
    resolver: zodResolver(additionalDetailsSchema),
    defaultValues: {
      pfUanNumber: additionalDetails.pfUanNumber || employee.pfUanNumber || "",
      esicNumber: additionalDetails.esicNumber || employee.esicNumber || "",
      policeVerificationNumber: additionalDetails.policeVerificationNumber || employee.policeVerificationNumber || "",
      policeVerificationDate: parseStoredDate(additionalDetails.policeVerificationDate || employee.policeVerificationDate),
      trainingCertificateNumber:
        additionalDetails.trainingCertificateNumber || employee.trainingCertificateNumber || "",
      trainingCertificateDate: parseStoredDate(additionalDetails.trainingCertificateDate || employee.trainingCertificateDate),
      medicalCertificateNumber: additionalDetails.medicalCertificateNumber || employee.medicalCertificateNumber || "",
      medicalCertificateDate: parseStoredDate(additionalDetails.medicalCertificateDate || employee.medicalCertificateDate),
    },
  })

  const handleSubmit = async (values: AdditionalDetailsValues): Promise<void> => {
    const updateData: UpdateEmployeeAdditionalDetailsDto = {
      pfUanNumber: values.pfUanNumber,
      esicNumber: values.esicNumber,
      policeVerificationNumber: values.policeVerificationNumber,
      trainingCertificateNumber: values.trainingCertificateNumber,
      medicalCertificateNumber: values.medicalCertificateNumber,
    }
    const policeVerificationDate = toApiDate(values.policeVerificationDate)
    const trainingCertificateDate = toApiDate(values.trainingCertificateDate)
    const medicalCertificateDate = toApiDate(values.medicalCertificateDate)
    if (policeVerificationDate) updateData.policeVerificationDate = policeVerificationDate
    if (trainingCertificateDate) updateData.trainingCertificateDate = trainingCertificateDate
    if (medicalCertificateDate) updateData.medicalCertificateDate = medicalCertificateDate

    try {
      setIsSubmitting(true)
      await employeeService.updateEmployeeAdditionalDetails(employee.id, updateData)

      const stored = {
        ...updateData,
        policeVerificationDate: values.policeVerificationDate?.toISOString(),
        trainingCertificateDate: values.trainingCertificateDate?.toISOString(),
        medicalCertificateDate: values.medicalCertificateDate?.toISOString(),
      }
      onUpdate({ additionalDetails: stored, ...stored })

      toast.success("Additional details updated successfully!")
      setHasChanges(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update additional details")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderDateField = (name: DateFieldName, fieldLabel: string): JSX.Element => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{fieldLabel}</FormLabel>
          <DatePicker
            date={field.value}
            onSelect={(date) => {
              field.onChange(date)
              setHasChanges(true)
            }}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  )

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
          <form noValidate onSubmit={form.handleSubmit(handleSubmit)} onChange={() => setHasChanges(true)} className="space-y-6">
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

              {renderDateField("policeVerificationDate", "Police Verification Date")}

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

              {renderDateField("trainingCertificateDate", "Training Certificate Date")}

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

              {renderDateField("medicalCertificateDate", "Medical Certificate Date")}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
