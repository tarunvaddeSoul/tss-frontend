"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Save, Loader2, DollarSign, Info, AlertCircle, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InlineLoader } from "@/components/ui/loader"
import { employeeService } from "@/services/employeeService"
import { salaryRateScheduleService } from "@/services/salaryRateScheduleService"
import type { Employee } from "@/types/employee"
import { SalaryCategory, SalarySubCategory } from "@/types/salary"
import { format } from "date-fns"

const salaryInfoSchema = z
  .object({
    salaryCategory: z.nativeEnum(SalaryCategory).optional().nullable(),
    salarySubCategory: z.nativeEnum(SalarySubCategory).optional().nullable(),
    salaryPerDay: z.number().min(0.01, "Rate per day must be greater than 0").optional().nullable(),
    monthlySalary: z.number().min(0.01, "Monthly salary must be greater than 0").optional().nullable(),
    pfEnabled: z.boolean().default(false),
    esicEnabled: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.salaryCategory === SalaryCategory.CENTRAL || data.salaryCategory === SalaryCategory.STATE) {
        return !!data.salarySubCategory
      }
      return true
    },
    {
      message: "Subcategory is required for CENTRAL and STATE categories",
      path: ["salarySubCategory"],
    },
  )
  .refine(
    (data) => {
      if (data.salaryCategory === SalaryCategory.CENTRAL || data.salaryCategory === SalaryCategory.STATE) {
        return data.salaryPerDay !== null && data.salaryPerDay !== undefined && data.salaryPerDay > 0
      }
      return true
    },
    {
      message: "Rate per day is required for CENTRAL and STATE categories",
      path: ["salaryPerDay"],
    },
  )
  .refine(
    (data) => {
      if (data.salaryCategory === SalaryCategory.SPECIALIZED) {
        return data.monthlySalary !== null && data.monthlySalary !== undefined && data.monthlySalary > 0
      }
      return true
    },
    {
      message: "Monthly salary is required for SPECIALIZED category",
      path: ["monthlySalary"],
    },
  )

// Helper function to parse date strings
const parseDateFromDDMMYYYY = (dateString?: string | Date | null) => {
  if (!dateString) return undefined
  try {
    if (typeof dateString === "string") {
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("-").map(Number)
        return new Date(year, month - 1, day)
      }
      return new Date(dateString)
    }
    return new Date(dateString)
  } catch {
    return undefined
  }
}

// Helper function to format Date to DD-MM-YYYY
const formatDateToDDMMYYYY = (date: Date) => {
  return format(date, "dd-MM-yyyy")
}

interface SalaryInfoFormProps {
  employee: Employee
  onUpdate: (updatedData: Partial<Employee>) => void
}

export function SalaryInfoForm({ employee, onUpdate }: SalaryInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [loadingActiveRate, setLoadingActiveRate] = useState(false)
  const [activeRate, setActiveRate] = useState<number | null>(null)
  const [rateError, setRateError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof salaryInfoSchema>>({
    resolver: zodResolver(salaryInfoSchema),
    defaultValues: {
      salaryCategory: employee.salaryCategory || null,
      salarySubCategory: employee.salarySubCategory || null,
      salaryPerDay: employee.salaryPerDay || null,
      monthlySalary: employee.monthlySalary || null,
      pfEnabled: employee.pfEnabled ?? false,
      esicEnabled: employee.esicEnabled ?? false,
    },
  })

  // Watch for changes
  const salaryCategory = form.watch("salaryCategory")
  const salarySubCategory = form.watch("salarySubCategory")
  
  // Memoize the onboarding date string to prevent infinite loops
  const employeeOnboardingDateString = useMemo(() => {
    if (!employee.employeeOnboardingDate) return null
    const date = parseDateFromDDMMYYYY(employee.employeeOnboardingDate)
    return date ? format(date, "yyyy-MM-dd") : null
  }, [employee.employeeOnboardingDate])

  // Track previous values to prevent unnecessary API calls
  const prevValuesRef = useRef<{ category: SalaryCategory | null; subCategory: SalarySubCategory | null; dateString: string | null } | null>(null)

  // Fetch active rate when category/subcategory changes
  useEffect(() => {
    const fetchActiveRate = async () => {
      if (
        (salaryCategory === SalaryCategory.CENTRAL || salaryCategory === SalaryCategory.STATE) &&
        salarySubCategory &&
        employeeOnboardingDateString
      ) {
        // Check if values actually changed to prevent infinite loops
        const currentValues = {
          category: salaryCategory,
          subCategory: salarySubCategory,
          dateString: employeeOnboardingDateString,
        }

        if (
          prevValuesRef.current &&
          prevValuesRef.current.category === currentValues.category &&
          prevValuesRef.current.subCategory === currentValues.subCategory &&
          prevValuesRef.current.dateString === currentValues.dateString
        ) {
          return // Skip if values haven't changed
        }

        // Update ref with current values
        prevValuesRef.current = currentValues

        setLoadingActiveRate(true)
        setRateError(null)
        try {
          const response = await salaryRateScheduleService.getActiveRate({
            category: salaryCategory,
            subCategory: salarySubCategory,
            date: employeeOnboardingDateString,
          })

          // API returns an array of active rate schedules
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            // Get the first active rate (or find the one with effectiveTo === null for current active)
            const activeRateSchedule = response.data.find((rate) => rate.effectiveTo === null) || response.data[0]
            setActiveRate(activeRateSchedule.ratePerDay)
            // Auto-populate salaryPerDay if not manually set
            const currentSalaryPerDay = form.getValues("salaryPerDay")
            if (!currentSalaryPerDay || currentSalaryPerDay === 0) {
              form.setValue("salaryPerDay", activeRateSchedule.ratePerDay)
            }
          } else {
            setActiveRate(null)
            setRateError("No active rate schedule found for this category and date")
          }
        } catch (error: any) {
          setActiveRate(null)
          setRateError(error.message || "Failed to fetch active rate")
        } finally {
          setLoadingActiveRate(false)
        }
      } else {
        setActiveRate(null)
        setRateError(null)
        // Reset ref when conditions aren't met
        prevValuesRef.current = null
      }
    }

    fetchActiveRate()
  }, [salaryCategory, salarySubCategory, employeeOnboardingDateString])

  const handleSubmit = async (values: z.infer<typeof salaryInfoSchema>) => {
    try {
      setIsSubmitting(true)

      // Optimistic update
      onUpdate(values as any)

      // Format dates to DD-MM-YYYY format for backend
      const updateData: any = {
        salaryCategory: values.salaryCategory,
        salarySubCategory: values.salarySubCategory,
        salaryPerDay: values.salaryPerDay,
        monthlySalary: values.monthlySalary,
        pfEnabled: values.pfEnabled,
        esicEnabled: values.esicEnabled,
      }

      await employeeService.updateEmployee(employee.id, updateData)

      toast.success("Salary information updated successfully!")
      setHasChanges(false)
    } catch (error: any) {
      console.error("Error updating salary info:", error)
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to update salary information"
      toast.error(errorMessage)
      // Revert optimistic update on error
      form.reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-2 min-w-0">
          <DollarSign className="h-5 w-5 text-primary shrink-0" />
          <CardTitle className="truncate">Salary Information</CardTitle>
        </div>
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
            <FormField
              control={form.control}
              name="salaryCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Category</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value === "" ? null : value)
                      // Clear dependent fields when category changes
                      if (value === SalaryCategory.SPECIALIZED) {
                        form.setValue("salarySubCategory", null)
                        form.setValue("salaryPerDay", null)
                      } else {
                        form.setValue("monthlySalary", null)
                      }
                      setHasChanges(true)
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select salary category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value={SalaryCategory.CENTRAL}>CENTRAL</SelectItem>
                      <SelectItem value={SalaryCategory.STATE}>STATE</SelectItem>
                      <SelectItem value={SalaryCategory.SPECIALIZED}>SPECIALIZED</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(salaryCategory === SalaryCategory.CENTRAL || salaryCategory === SalaryCategory.STATE) && (
              <>
                <FormField
                  control={form.control}
                  name="salarySubCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory *</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value === "" ? null : value)
                          // Clear salaryPerDay when subcategory changes to trigger rate fetch
                          form.setValue("salaryPerDay", null)
                          setHasChanges(true)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={SalarySubCategory.SKILLED}>SKILLED</SelectItem>
                          <SelectItem value={SalarySubCategory.UNSKILLED}>UNSKILLED</SelectItem>
                          <SelectItem value={SalarySubCategory.HIGHSKILLED}>HIGHSKILLED</SelectItem>
                          <SelectItem value={SalarySubCategory.SEMISKILLED}>SEMISKILLED</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {loadingActiveRate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <InlineLoader size="sm" />
                    <span>Fetching active rate...</span>
                  </div>
                )}

                {activeRate && !loadingActiveRate && (
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      Active rate for {salaryCategory} - {salarySubCategory}: ₹{activeRate.toLocaleString()}/day
                      {form.getValues("salaryPerDay") !== activeRate && (
                        <span className="ml-2 text-xs">(You can override this value manually)</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {rateError && !loadingActiveRate && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{rateError}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="salaryPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Per Day (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Enter rate per day"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            setHasChanges(true)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {activeRate && !loadingActiveRate && (
                        <p className="text-xs text-muted-foreground">
                          Leave empty to use active rate: ₹{activeRate.toLocaleString()}/day
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </>
            )}

            {salaryCategory === SalaryCategory.SPECIALIZED && (
              <FormField
                control={form.control}
                name="monthlySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Salary (₹) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter monthly salary"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                          setHasChanges(true)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pfEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">PF Enabled</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable Provident Fund deduction
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          setHasChanges(true)
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="esicEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">ESIC Enabled</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable ESIC deduction
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          setHasChanges(true)
                        }}
                      />
                    </FormControl>
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

