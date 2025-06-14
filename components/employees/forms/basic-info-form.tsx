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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { employeeService } from "@/services/employeeService"
import type { UpdateEmployeeDto, Employee } from "@/types/employee"

const basicInfoSchema = z.object({
  title: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  husbandName: z.string().optional(),
  bloodGroup: z.string().min(1, "Blood group is required"),
  employeeOnboardingDate: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  category: z.string().min(1, "Category is required"),
  recruitedBy: z.string().min(1, "Recruiter name is required"),
  age: z.number().optional(),
})

interface BasicInfoFormProps {
  employee: Employee
  onUpdate: (updatedData: Partial<Employee>) => void
}

export function BasicInfoForm({ employee, onUpdate }: BasicInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const form = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: employee.title || "",
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      dateOfBirth: employee.dateOfBirth || "",
      gender: employee.gender || "",
      fatherName: employee.fatherName || "",
      motherName: employee.motherName || "",
      husbandName: employee.husbandName || "",
      bloodGroup: employee.bloodGroup || "",
      employeeOnboardingDate: employee.employeeOnboardingDate || "",
      status: employee.status || "ACTIVE",
      category: employee.category || "",
      recruitedBy: employee.recruitedBy || "",
      age: employee.age || 0,
    },
  })

  const handleSubmit = async (values: z.infer<typeof basicInfoSchema>) => {
    try {
      setIsSubmitting(true)

      // Optimistic update
      onUpdate(values as any)

      const updateData: any = {
        ...values,
        age: values.age || undefined,
      }

      await employeeService.updateEmployee(employee.id, updateData)

      toast.success("Basic information updated successfully!")
      setHasChanges(false)
    } catch (error) {
      console.error("Error updating basic info:", error)
      toast.error("Failed to update basic information")
      // Revert optimistic update on error
      form.reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  const titleOptions = [
    { value: "MR", label: "MR" },
    { value: "MS", label: "MS" },
  ]

  const statusOptions = [
    { value: "ACTIVE", label: "ACTIVE" },
    { value: "INACTIVE", label: "INACTIVE" },
  ]

  const genderOptions = [
    { value: "MALE", label: "MALE" },
    { value: "FEMALE", label: "FEMALE" },
  ]

  const categoryOptions = [
    { value: "SC", label: "SC" },
    { value: "ST", label: "ST" },
    { value: "OBC", label: "OBC" },
    { value: "GENERAL", label: "GENERAL" },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Basic Information</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {titleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter father's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mother's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("gender") === "FEMALE" && (
                <FormField
                  control={form.control}
                  name="husbandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Husband's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter husband's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter blood group" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recruitedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recruited By</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recruiter name" {...field} />
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
