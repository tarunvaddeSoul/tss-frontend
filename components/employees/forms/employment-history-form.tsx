"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, isValid, parse } from "date-fns"
import { toast } from "sonner"
import {
  Plus,
  Edit,
  Building,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { employeeService } from "@/services/employeeService"
import { companyService } from "@/services/companyService"
import { designationService } from "@/services/designationService"
import { departmentService } from "@/services/departmentService"
import type {
  Employee,
  IEmployeeEmploymentHistory,
  Designation,
  EmployeeDepartments,
  CreateEmploymentHistoryDto,
  UpdateEmploymentHistoryDto,
} from "@/types/employee"
import type { Company } from "@/types/company"
import { Status } from "@/enums/employee.enum"

// Helper function to safely parse dates
const parseDate = (dateString: string | undefined | null): Date | null => {
  if (!dateString) return null

  try {
    let date: Date | null = null

    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      date = parse(dateString, "dd-MM-yyyy", new Date())
    } else if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      date = new Date(dateString)
    } else {
      date = new Date(dateString)
    }

    return isValid(date) ? date : null
  } catch (error) {
    console.warn("Invalid date format:", dateString, error)
    return null
  }
}

// Employment history schema
const employmentHistorySchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  departmentId: z.string().min(1, "Department is required"),
  designationId: z.string().min(1, "Designation is required"),
  joiningDate: z.date({ required_error: "Joining date is required" }),
  leavingDate: z.date().nullable().optional(),
  salary: z.number().min(0, "Salary must be a positive number"),
  isActive: z.boolean().default(false),
  reason: z.string().optional(),
})

interface EmploymentHistoryFormProps {
  employee: Employee
  onUpdate: (updatedData: Partial<Employee>) => void
}

export function EmploymentHistoryForm({ employee, onUpdate }: EmploymentHistoryFormProps) {
  const [employmentHistories, setEmploymentHistories] = useState<IEmployeeEmploymentHistory[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [departments, setDepartments] = useState<EmployeeDepartments[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<IEmployeeEmploymentHistory | null>(null)

  // Form for adding/editing employment history
  const form = useForm<z.infer<typeof employmentHistorySchema>>({
    resolver: zodResolver(employmentHistorySchema),
    defaultValues: {
      companyId: "",
      departmentId: "",
      designationId: "",
      joiningDate: new Date(),
      leavingDate: null,
      salary: 0,
      isActive: false,
      reason: "",
    },
  })

  // Load employment history and related data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        const [historiesResponse, companiesResponse, designationsResponse, departmentsResponse] = await Promise.all([
          employeeService.getEmployeeEmploymentHistory(employee.id),
          companyService.getCompanies({ page: 1, limit: 100 }),
          designationService.getDesignations(),
          departmentService.getEmployeeDepartments(),
        ])

        setEmploymentHistories(historiesResponse.data || [])
        setCompanies(companiesResponse.data?.companies || [])
        setDesignations(designationsResponse || [])
        setDepartments(departmentsResponse || [])
      } catch (error) {
        console.error("Error loading employment history data:", error)
        toast.error("Failed to load employment history")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [employee.id])

  // Handle adding new employment history
  const handleAddEmploymentHistory = async (data: z.infer<typeof employmentHistorySchema>) => {
    try {
      setIsSubmitting(true)

      const createData: CreateEmploymentHistoryDto = {
        companyId: data.companyId,
        departmentId: data.departmentId,
        designationId: data.designationId,
        salary: data.salary,
        joiningDate: format(data.joiningDate, "dd-MM-yyyy"), // Add the formatted joiningDate
        status: data.isActive ? Status.ACTIVE : Status.INACTIVE,
      }

      await employeeService.createEmploymentHistory(employee.id, createData)

      toast.success("Employment history added successfully!")

      // Refresh employment histories
      const updatedHistories = await employeeService.getEmployeeEmploymentHistory(employee.id)
      setEmploymentHistories(updatedHistories.data || [])

      // Close dialog and reset form
      setShowAddDialog(false)
      form.reset({
        companyId: "",
        departmentId: "",
        designationId: "",
        joiningDate: new Date(),
        leavingDate: null,
        salary: 0,
        isActive: false,
        reason: "",
      })
    } catch (error) {
      console.error("Error adding employment history:", error)
      toast.error("Failed to add employment history")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle updating employment history
  const handleUpdateEmploymentHistory = async (data: z.infer<typeof employmentHistorySchema>) => {
    if (!selectedHistory?.id) return

    try {
      setIsSubmitting(true)

      const updateData: UpdateEmploymentHistoryDto = {
        companyId: data.companyId,
        departmentId: data.departmentId,
        designationId: data.designationId,
        salary: data.salary,
        leavingDate: data.leavingDate ? format(data.leavingDate, "dd-MM-yyyy") : undefined,
        status: data.isActive ? Status.ACTIVE : Status.INACTIVE,
      }

      await employeeService.updateEmploymentHistory(selectedHistory.id, updateData)

      toast.success("Employment history updated successfully!")

      // Refresh employment histories
      const updatedHistories = await employeeService.getEmployeeEmploymentHistory(employee.id)
      setEmploymentHistories(updatedHistories.data || [])

      // Close dialog and reset
      setShowEditDialog(false)
      setSelectedHistory(null)
    } catch (error) {
      console.error("Error updating employment history:", error)
      toast.error("Failed to update employment history")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle closing current employment
  const handleCloseEmployment = async (historyId: string) => {
    try {
      setIsSubmitting(true)

      await employeeService.closeEmployment(employee.id, {
        leavingDate: format(new Date(), "dd-MM-yyyy"),
      })

      toast.success("Employment closed successfully!")

      // Refresh employment histories
      const updatedHistories = await employeeService.getEmployeeEmploymentHistory(employee.id)
      setEmploymentHistories(updatedHistories.data || [])
    } catch (error) {
      console.error("Error closing employment:", error)
      toast.error("Failed to close employment")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit button click
  const handleEditClick = (history: IEmployeeEmploymentHistory) => {
    setSelectedHistory(history)
    form.reset({
      companyId: history.companyId || "",
      departmentId: history.departmentId || "",
      designationId: history.designationId || "",
      joiningDate: parseDate(history.joiningDate) || new Date(),
      leavingDate: parseDate(history.leavingDate),
      salary: history.salary || 0,
      isActive: history.status === "ACTIVE",
      reason: history.reason || "",
    })
    setShowEditDialog(true)
  }

  // Prepare options for selects
  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: company.name,
  }))

  const designationOptions = designations.map((designation) => ({
    value: designation.id,
    label: designation.name,
  }))

  const departmentOptions = departments.map((department) => ({
    value: department.id,
    label: department.name,
  }))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Employment History
        </CardTitle>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Employment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Employment History</DialogTitle>
              <DialogDescription>Add a new employment record for this employee.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddEmploymentHistory)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companyOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value ?? ""}>
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
                    name="designationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {designationOptions.map((option) => (
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
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departmentOptions.map((option) => (
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
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter salary"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="joiningDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Joining Date</FormLabel>
                        <DatePicker date={field.value} onSelect={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leavingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Leaving Date (Optional)</FormLabel>
                        <DatePicker date={field.value ?? null} onSelect={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Current Employment</FormLabel>
                        <p className="text-sm text-muted-foreground">Check if this is the current active employment</p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Leaving (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter reason for leaving" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Employment"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-0">
        {employmentHistories.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Employment History</h3>
            <p className="text-muted-foreground mb-4">This employee has no employment history records yet.</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Employment
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Company
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Designation
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Department
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joining Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Leaving Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Salary
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employmentHistories.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell className="font-medium">{history.companyName}</TableCell>
                    <TableCell>{history.designationName}</TableCell>
                    <TableCell>{history.departmentName}</TableCell>
                    <TableCell>{history.joiningDate}</TableCell>
                    <TableCell>{history.leavingDate || "-"}</TableCell>
                    <TableCell>₹{history.salary?.toLocaleString() || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={history.status === "ACTIVE" ? "default" : "secondary"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {history.status === "ACTIVE" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {history.status === "ACTIVE" ? "Current" : "Previous"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(history)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {history.status === "ACTIVE" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Close Employment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to close this employment? This will set the leaving date to
                                  today and mark it as inactive.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCloseEmployment(history.id || "")}>
                                  Close Employment
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>

      {/* Edit Employment History Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employment History</DialogTitle>
            <DialogDescription>Update employment record for this employee.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateEmploymentHistory)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value ?? ""}>
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
                  name="designationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {designationOptions.map((option) => (
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
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departmentOptions.map((option) => (
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
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter salary"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="joiningDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Joining Date</FormLabel>
                      <DatePicker date={field.value} onSelect={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leavingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Leaving Date (Optional)</FormLabel>
                      <DatePicker date={field.value ?? null} onSelect={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Current Employment</FormLabel>
                      <p className="text-sm text-muted-foreground">Check if this is the current active employment</p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Leaving (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reason for leaving" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Employment"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
