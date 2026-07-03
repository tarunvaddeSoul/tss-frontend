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
import { label } from "@/lib/labels"
import { SalaryCategory, SalarySubCategory } from "@/types/salary"
import type { SalaryRateSchedule, CreateSalaryRateScheduleDto, UpdateSalaryRateScheduleDto } from "@/types/salary"
import { DatePicker } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/layout/page-header"

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
      const records = Array.isArray(response?.data) ? response.data : []
      setRateSchedules(records)

      const limit = response?.meta?.limit || 10
      const total = response?.meta?.total || 0
      setTotalPages(Math.ceil(total / limit))
      setTotal(total)
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
      const errorMessage = err.message || "Failed to add rate schedule"
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
      const errorMessage = err.message || "Failed to update rate schedule"
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
      if (rateScheduleToDelete.isActive) {
        await salaryRateScheduleService.update(rateScheduleToDelete.id, { isActive: false })
        toast.success("Rate schedule deactivated successfully")
      } else {
        await salaryRateScheduleService.delete(rateScheduleToDelete.id)
        toast.success("Rate schedule deleted successfully")
      }
      setRateScheduleToDelete(null)
      fetchRateSchedules()
    } catch (err: any) {
      toast.error(rateScheduleToDelete.isActive ? "Failed to deactivate rate schedule" : "Failed to delete rate schedule")
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
    <div>
      <PageHeader
        no="06"
        eyebrow="Settings register"
        title="Salary Rate Schedule Management"
        description="Manage per-day salary rates for Central and State categories."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>
                Rate Schedules
              </CardTitle>
              <CardDescription>
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
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Rate Schedule</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form noValidate onSubmit={form.handleSubmit(handleAddRateSchedule)} className="space-y-4">
                    {dialogError && (
                      <Alert variant="destructive">
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
                              <SelectItem value={SalaryCategory.CENTRAL}>{label.salaryCategory(SalaryCategory.CENTRAL)}</SelectItem>
                              <SelectItem value={SalaryCategory.STATE}>{label.salaryCategory(SalaryCategory.STATE)}</SelectItem>
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
                              <SelectItem value={SalarySubCategory.SKILLED}>{label.salarySubCategory(SalarySubCategory.SKILLED)}</SelectItem>
                              <SelectItem value={SalarySubCategory.UNSKILLED}>{label.salarySubCategory(SalarySubCategory.UNSKILLED)}</SelectItem>
                              <SelectItem value={SalarySubCategory.HIGHSKILLED}>{label.salarySubCategory(SalarySubCategory.HIGHSKILLED)}</SelectItem>
                              <SelectItem value={SalarySubCategory.SEMISKILLED}>{label.salarySubCategory(SalarySubCategory.SEMISKILLED)}</SelectItem>
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
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filter-category">Category</Label>
                <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as any)}>
                  <SelectTrigger id="filter-category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value={SalaryCategory.CENTRAL}>{label.salaryCategory(SalaryCategory.CENTRAL)}</SelectItem>
                    <SelectItem value={SalaryCategory.STATE}>{label.salaryCategory(SalaryCategory.STATE)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-subcategory">Subcategory</Label>
                <Select value={filterSubCategory} onValueChange={(value) => setFilterSubCategory(value as any)}>
                  <SelectTrigger id="filter-subcategory">
                    <SelectValue placeholder="All subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subcategories</SelectItem>
                    <SelectItem value={SalarySubCategory.SKILLED}>{label.salarySubCategory(SalarySubCategory.SKILLED)}</SelectItem>
                    <SelectItem value={SalarySubCategory.UNSKILLED}>{label.salarySubCategory(SalarySubCategory.UNSKILLED)}</SelectItem>
                    <SelectItem value={SalarySubCategory.HIGHSKILLED}>{label.salarySubCategory(SalarySubCategory.HIGHSKILLED)}</SelectItem>
                    <SelectItem value={SalarySubCategory.SEMISKILLED}>{label.salarySubCategory(SalarySubCategory.SEMISKILLED)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-active">Status</Label>
                <Select
                  value={filterIsActive === "all" ? "all" : filterIsActive ? "true" : "false"}
                  onValueChange={(value) => setFilterIsActive(value === "all" ? "all" : value === "true")}
                >
                  <SelectTrigger id="filter-active">
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
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Clear Filters</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <ScrollArea className="h-[400px] sm:h-[500px] rounded-md border">
              <div className="space-y-2 p-4">
                {isLoading && rateSchedules.length === 0 ? (
                  <InlineLoader />
                ) : rateSchedules.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      No records on file
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      No rate schedules match the current filters.
                    </p>
                  </div>
                ) : (
                  rateSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-md border bg-card hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-md bg-surface flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 min-w-0">
                          <div className="min-w-0">
                            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Category</p>
                            <p className="font-medium text-sm sm:text-base truncate">{label.salaryCategory(schedule.category)}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Subcategory</p>
                            <p className="font-medium text-sm sm:text-base truncate">{label.salarySubCategory(schedule.subCategory)}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Rate Per Day</p>
                            <p className="font-mono text-[13px] font-semibold tabular-nums">₹{schedule.ratePerDay.toLocaleString()}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Effective Period</p>
                            <p className="font-mono text-[13px] tabular-nums">
                              {format(new Date(schedule.effectiveFrom), "MMM dd, yyyy")}
                              {schedule.effectiveTo
                                ? ` - ${format(new Date(schedule.effectiveTo), "MMM dd, yyyy")}`
                                : " - Ongoing"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={schedule.isActive ? "success" : "destructive"}>
                              {schedule.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 sm:self-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-info hover:text-info hover:bg-info/10"
                          onClick={() => handleEditClick(schedule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Showing {rateSchedules.length} of {total} rate schedules
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="flex-1 sm:flex-initial"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className="flex-1 sm:flex-initial"
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
            <form noValidate onSubmit={form.handleSubmit(handleUpdateRateSchedule)} className="space-y-4">
              {dialogError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{dialogError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={label.salaryCategory(rateScheduleToEdit?.category)} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Category cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Input value={label.salarySubCategory(rateScheduleToEdit?.subCategory)} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Subcategory cannot be changed</p>
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
              {rateScheduleToDelete?.isActive ? (
                <>
                  This will deactivate the rate schedule for {label.salaryCategory(rateScheduleToDelete?.category)},{" "}
                  {label.salarySubCategory(rateScheduleToDelete?.subCategory)} (₹
                  {rateScheduleToDelete?.ratePerDay.toLocaleString()}/day). It stays on record for past payroll but stops
                  applying to new payroll.
                  <div className="mt-2 p-2 bg-warning/[0.06] border border-warning/30 rounded-md">
                    <p className="text-warning text-sm">
                      This rate schedule is currently active. Deactivating it may affect employees using this rate.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  This will permanently delete the rate schedule for {label.salaryCategory(rateScheduleToDelete?.category)},{" "}
                  {label.salarySubCategory(rateScheduleToDelete?.subCategory)} (₹
                  {rateScheduleToDelete?.ratePerDay.toLocaleString()}/day). This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRateSchedule} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {rateScheduleToDelete?.isActive ? "Deactivate" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

