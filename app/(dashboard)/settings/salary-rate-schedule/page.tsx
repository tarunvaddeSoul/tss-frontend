"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { DollarSign, Plus, Trash2, Edit, Filter, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { InlineLoader, ButtonLoader } from "@/components/ui/loader"
import { salaryRateScheduleService } from "@/services/salaryRateScheduleService"
import { SalaryCategory, SalarySubCategory } from "@/types/salary"
import type { SalaryRateSchedule, CreateSalaryRateScheduleDto, UpdateSalaryRateScheduleDto } from "@/types/salary"
import { DatePicker } from "@/components/ui/date-picker"

const rateScheduleSchema = z
  .object({
    category: z.nativeEnum(SalaryCategory, {
      required_error: "Category is required",
      invalid_type_error: "Category must be CENTRAL or STATE",
    }),
    subCategory: z.nativeEnum(SalarySubCategory, {
      required_error: "Subcategory is required",
    }),
    ratePerDay: z.number().min(0.01, { message: "Rate per day must be greater than 0" }),
    effectiveFrom: z.date({
      required_error: "Effective from date is required",
    }),
  })
  .refine(
    (data) => {
      return data.category === SalaryCategory.CENTRAL || data.category === SalaryCategory.STATE
    },
    {
      message: "Rate schedules only apply to CENTRAL or STATE categories",
      path: ["category"],
    },
  )

type RateScheduleFormValues = z.infer<typeof rateScheduleSchema>

export default function SalaryRateSchedulePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [rateSchedules, setRateSchedules] = useState<SalaryRateSchedule[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isAddingRateSchedule, setIsAddingRateSchedule] = useState(false)
  const [rateScheduleToDelete, setRateScheduleToDelete] = useState<SalaryRateSchedule | null>(null)
  const [rateScheduleToEdit, setRateScheduleToEdit] = useState<SalaryRateSchedule | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Filters
  const [filterCategory, setFilterCategory] = useState<SalaryCategory | "all">("all")
  const [filterSubCategory, setFilterSubCategory] = useState<SalarySubCategory | "all">("all")
  const [filterIsActive, setFilterIsActive] = useState<boolean | "all">("all")

  const form = useForm<RateScheduleFormValues>({
    resolver: zodResolver(rateScheduleSchema),
    defaultValues: {
      category: SalaryCategory.CENTRAL,
      subCategory: SalarySubCategory.SKILLED,
      ratePerDay: 0,
      effectiveFrom: new Date(),
    },
  })

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1)
  }, [filterCategory, filterSubCategory, filterIsActive])

  useEffect(() => {
    fetchRateSchedules()
  }, [currentPage, filterCategory, filterSubCategory, filterIsActive])

  const fetchRateSchedules = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
      }
      if (filterCategory !== "all") {
        params.category = filterCategory
      }
      if (filterSubCategory !== "all") {
        params.subCategory = filterSubCategory
      }
      if (filterIsActive !== "all") {
        params.isActive = filterIsActive
      }

      const response = await salaryRateScheduleService.getAll(params)
      // Response structure: { statusCode, message, data: { data: [...], total, page, limit, hasNextPage, hasPrevPage } }
      if (response && response.data) {
        const responseData = response.data
        // Backend returns records in data.data (nested) instead of data.records
        const records = Array.isArray(responseData?.data) ? responseData?.data : []
        setRateSchedules(records)
        
        // Calculate totalPages from limit and total
        const limit = responseData?.limit || 10
        const total = responseData?.total || 0
        setTotalPages(Math.ceil(total / limit))
        setTotal(total)
      } else {
        // Handle empty or unexpected response
        setRateSchedules([])
        setTotalPages(0)
        setTotal(0)
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch rate schedules")
      toast.error("Failed to fetch rate schedules")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRateSchedule = async (data: RateScheduleFormValues) => {
    setIsLoading(true)
    setDialogError(null)
    try {
      const payload: CreateSalaryRateScheduleDto = {
        category: data.category,
        subCategory: data.subCategory,
        ratePerDay: data.ratePerDay,
        effectiveFrom: format(data.effectiveFrom, "yyyy-MM-dd"),
      }

      await salaryRateScheduleService.create(payload)
      toast.success("Rate schedule added successfully")
      form.reset()
      setDialogError(null)
      setIsAddingRateSchedule(false)
      fetchRateSchedules()
    } catch (err: any) {
      // Extract error message from response
      let errorMessage = "Failed to add rate schedule"
      
      if (err.response?.data) {
        // Handle API error response
        const responseData = err.response.data
        if (responseData.message) {
          errorMessage = responseData.message
        } else if (responseData.error) {
          errorMessage = responseData.error
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setDialogError(errorMessage)
      toast.error(errorMessage, {
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRateSchedule = async (data: RateScheduleFormValues) => {
    if (!rateScheduleToEdit) return

    setIsLoading(true)
    setDialogError(null)
    try {
      const payload: UpdateSalaryRateScheduleDto = {
        ratePerDay: data.ratePerDay,
        effectiveFrom: format(data.effectiveFrom, "yyyy-MM-dd"),
      }

      await salaryRateScheduleService.update(rateScheduleToEdit.id, payload)
      toast.success("Rate schedule updated successfully")
      form.reset()
      setDialogError(null)
      setIsEditing(false)
      setRateScheduleToEdit(null)
      fetchRateSchedules()
    } catch (err: any) {
      // Extract error message from response
      let errorMessage = "Failed to update rate schedule"
      
      if (err.response?.data) {
        // Handle API error response
        const responseData = err.response.data
        if (responseData.message) {
          errorMessage = responseData.message
        } else if (responseData.error) {
          errorMessage = responseData.error
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setDialogError(errorMessage)
      toast.error(errorMessage, {
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRateSchedule = async () => {
    if (!rateScheduleToDelete) return

    try {
      await salaryRateScheduleService.delete(rateScheduleToDelete.id)
      toast.success("Rate schedule deleted successfully")
      setRateScheduleToDelete(null)
      fetchRateSchedules()
    } catch (err: any) {
      toast.error("Failed to delete rate schedule")
    }
  }

  const handleEditClick = (rateSchedule: SalaryRateSchedule) => {
    setRateScheduleToEdit(rateSchedule)
    setIsEditing(true)
    form.reset({
      category: rateSchedule.category,
      subCategory: rateSchedule.subCategory,
      ratePerDay: rateSchedule.ratePerDay,
      effectiveFrom: new Date(rateSchedule.effectiveFrom),
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setRateScheduleToEdit(null)
    form.reset()
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Salary Rate Schedule Management
      </h1>

      <Card className="backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl z-0 opacity-50" />
        <CardHeader className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Rate Schedules
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Manage per-day salary rates for CENTRAL and STATE categories
              </CardDescription>
            </div>
            <Dialog open={isAddingRateSchedule} onOpenChange={(open) => {
              setIsAddingRateSchedule(open)
              if (!open) {
                setDialogError(null)
                form.reset()
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Rate Schedule</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddRateSchedule)} className="space-y-4">
                    {dialogError && (
                      <Alert variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{dialogError}</AlertDescription>
                      </Alert>
                    )}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => field.onChange(value as SalaryCategory)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={SalaryCategory.CENTRAL}>CENTRAL</SelectItem>
                              <SelectItem value={SalaryCategory.STATE}>STATE</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => field.onChange(value as SalarySubCategory)}
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

                    <FormField
                      control={form.control}
                      name="ratePerDay"
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
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="effectiveFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Effective From *</FormLabel>
                          <FormControl>
                            <DatePicker date={field.value} onSelect={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <>
                          <ButtonLoader className="mr-2" />
                          Adding...
                        </>
                      ) : (
                        "Add Rate Schedule"
                      )}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filter-category">Category</Label>
                <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as any)}>
                  <SelectTrigger id="filter-category" className="bg-white/5 border-white/10">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value={SalaryCategory.CENTRAL}>CENTRAL</SelectItem>
                    <SelectItem value={SalaryCategory.STATE}>STATE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-subcategory">Subcategory</Label>
                <Select value={filterSubCategory} onValueChange={(value) => setFilterSubCategory(value as any)}>
                  <SelectTrigger id="filter-subcategory" className="bg-white/5 border-white/10">
                    <SelectValue placeholder="All subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subcategories</SelectItem>
                    <SelectItem value={SalarySubCategory.SKILLED}>SKILLED</SelectItem>
                    <SelectItem value={SalarySubCategory.UNSKILLED}>UNSKILLED</SelectItem>
                    <SelectItem value={SalarySubCategory.HIGHSKILLED}>HIGHSKILLED</SelectItem>
                    <SelectItem value={SalarySubCategory.SEMISKILLED}>SEMISKILLED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-active">Status</Label>
                <Select
                  value={filterIsActive === "all" ? "all" : filterIsActive ? "true" : "false"}
                  onValueChange={(value) => setFilterIsActive(value === "all" ? "all" : value === "true")}
                >
                  <SelectTrigger id="filter-active" className="bg-white/5 border-white/10">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterCategory("all")
                    setFilterSubCategory("all")
                    setFilterIsActive("all")
                  }}
                  className="w-full bg-white/5 border-white/10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Clear Filters</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <ScrollArea className="h-[400px] sm:h-[500px] rounded-lg border border-white/10">
              <div className="space-y-2 p-4">
                {isLoading && rateSchedules.length === 0 ? (
                  <InlineLoader />
                ) : rateSchedules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No rate schedules found
                  </div>
                ) : (
                  rateSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 min-w-0">
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Category</p>
                            <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{schedule.category}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Subcategory</p>
                            <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{schedule.subCategory}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Rate Per Day</p>
                            <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">₹{schedule.ratePerDay.toLocaleString()}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Effective Period</p>
                            <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">
                              {format(new Date(schedule.effectiveFrom), "MMM dd, yyyy")}
                              {schedule.effectiveTo
                                ? ` - ${format(new Date(schedule.effectiveTo), "MMM dd, yyyy")}`
                                : " - Ongoing"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={schedule.isActive ? "default" : "secondary"} className="text-xs">
                              {schedule.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 sm:self-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-400 hover:text-blue-600 hover:bg-blue-500/10"
                          onClick={() => handleEditClick(schedule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => setRateScheduleToDelete(schedule)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                  Showing {rateSchedules.length} of {total} rate schedules
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="bg-white/5 border-white/10 flex-1 sm:flex-initial"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className="bg-white/5 border-white/10 flex-1 sm:flex-initial"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => {
        if (!open) {
          handleCancelEdit()
          setDialogError(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Rate Schedule</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateRateSchedule)} className="space-y-4">
              {dialogError && (
                <Alert variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{dialogError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={rateScheduleToEdit?.category} disabled className="bg-gray-100" />
                <p className="text-xs text-gray-500">Category cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Input value={rateScheduleToEdit?.subCategory} disabled className="bg-gray-100" />
                <p className="text-xs text-gray-500">Subcategory cannot be changed</p>
              </div>

              <FormField
                control={form.control}
                name="ratePerDay"
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
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effectiveFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective From *</FormLabel>
                    <FormControl>
                      <DatePicker date={field.value} onSelect={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <ButtonLoader className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Rate Schedule"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!rateScheduleToDelete} onOpenChange={() => setRateScheduleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the rate schedule for {rateScheduleToDelete?.category} -{" "}
              {rateScheduleToDelete?.subCategory} (₹{rateScheduleToDelete?.ratePerDay.toLocaleString()}/day). This
              action cannot be undone.
              {rateScheduleToDelete?.isActive && (
                <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                    ⚠️ This rate schedule is currently active. Deleting it may affect employees using this rate.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRateSchedule} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

