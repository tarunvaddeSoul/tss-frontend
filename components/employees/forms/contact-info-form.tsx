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
import { Checkbox } from "@/components/ui/checkbox"
import { employeeService } from "@/services/employeeService"
import type { UpdateEmployeeContactDetailsDto, Employee } from "@/types/employee"

const contactInfoSchema = z.object({
  mobileNumber: z.string().regex(/^\d{10}$/, "Invalid mobile number"),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Invalid Aadhaar number"),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  presentAddress: z.string().min(1, "Present address is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.number().min(1, "Pincode is required"),
})

interface ContactInfoFormProps {
  employee: Employee
  onUpdate: (updatedData: Partial<Employee>) => void
}

export function ContactInfoForm({ employee, onUpdate }: ContactInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [sameAsPermanent, setSameAsPermanent] = useState(false)

  const contactDetails = employee.contactDetails || {}

  const form = useForm<z.infer<typeof contactInfoSchema>>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      mobileNumber: contactDetails.mobileNumber || employee.mobileNumber || "",
      aadhaarNumber: contactDetails.aadhaarNumber || "",
      permanentAddress: contactDetails.permanentAddress || employee.permanentAddress || "",
      presentAddress: contactDetails.presentAddress || employee.presentAddress || "",
      city: contactDetails.city || employee.city || "",
      district: contactDetails.district || employee.district || "",
      state: contactDetails.state || employee.state || "",
      pincode: contactDetails.pincode ? Number(contactDetails.pincode) : employee.pincode || 0,
    },
  })

  const handleSubmit = async (values: z.infer<typeof contactInfoSchema>) => {
    try {
      setIsSubmitting(true)

      // Optimistic update
      onUpdate({
        contactDetails: values,
        mobileNumber: values.mobileNumber,
        permanentAddress: values.permanentAddress,
        presentAddress: values.presentAddress,
        city: values.city,
        district: values.district,
        state: values.state,
        pincode: values.pincode,
      })

      const updateData: UpdateEmployeeContactDetailsDto = values

      await employeeService.updateEmployeeContactDetails(employee.id, updateData)

      toast.success("Contact information updated successfully!")
      setHasChanges(false)
    } catch (error) {
      console.error("Error updating contact info:", error)
      toast.error("Failed to update contact information")
      // Revert optimistic update on error
      form.reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSameAsPermanentChange = (checked: boolean) => {
    setSameAsPermanent(checked)
    if (checked) {
      form.setValue("presentAddress", form.getValues("permanentAddress"))
      setHasChanges(true)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Contact Information</CardTitle>
        {hasChanges && (
          <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting} size="sm" className="ml-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
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
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aadhaarNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Aadhaar number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="permanentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permanent Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter permanent address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2 mb-4">
              <Checkbox id="sameAsPermanent" checked={sameAsPermanent} onCheckedChange={handleSameAsPermanentChange} />
              <label
                htmlFor="sameAsPermanent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Present address same as permanent address
              </label>
            </div>

            <FormField
              control={form.control}
              name="presentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Present Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter present address" {...field} disabled={sameAsPermanent} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter district" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter state" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter pincode"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
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
