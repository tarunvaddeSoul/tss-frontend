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
import type { UpdateEmployeeBankDetailsDto, Employee } from "@/types/employee"

const bankInfoSchema = z.object({
  bankAccountNumber: z.string().min(1, "Bank account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  bankName: z.string().min(1, "Bank name is required"),
  bankCity: z.string().min(1, "Bank city is required"),
})

interface BankInfoFormProps {
  employee: Employee
  onUpdate: (updatedData: Partial<Employee>) => void
}

export function BankInfoForm({ employee, onUpdate }: BankInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const bankDetails = employee.bankDetails || {}

  const form = useForm<z.infer<typeof bankInfoSchema>>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: {
      bankAccountNumber: bankDetails.bankAccountNumber || employee.bankAccountNumber || "",
      ifscCode: bankDetails.ifscCode || employee.ifscCode || "",
      bankName: bankDetails.bankName || employee.bankName || "",
      bankCity: bankDetails.bankCity || employee.bankCity || "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof bankInfoSchema>) => {
    try {
      setIsSubmitting(true)

      // Optimistic update
      onUpdate({
        bankDetails: values,
        bankAccountNumber: values.bankAccountNumber,
        ifscCode: values.ifscCode,
        bankName: values.bankName,
        bankCity: values.bankCity,
      })

      const updateData: UpdateEmployeeBankDetailsDto = values

      await employeeService.updateEmployeeBankingInformation(employee.id, updateData)

      toast.success("Bank information updated successfully!")
      setHasChanges(false)
    } catch (error) {
      console.error("Error updating bank info:", error)
      toast.error("Failed to update bank information")
      // Revert optimistic update on error
      form.reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 space-y-0 pb-4">
        <CardTitle className="truncate">Bank Information</CardTitle>
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
                name="bankAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter IFSC code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank city" {...field} />
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
