"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, isValid, parse } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { AxiosError } from "axios"

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
import { AssignEmploymentDialog } from "@/components/employees/assign-employment-dialog"
import { TerminateEmploymentDialog } from "@/components/employees/terminate-employment-dialog"

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
  companyId: z.string().uuid("Invalid company ID"),
  departmentId: z.string().uuid("Invalid department ID"),
  designationId: z.string().uuid("Invalid designation ID"),
  joiningDate: z.date({ required_error: "Joining date is required" }),
  leavingDate: z.date().optional(),
  salary: z.number().min(0, "Salary must be a positive number"),
  isActive: z.boolean().default(false),
}).superRefine((data, ctx) => {
  // If not active, must have leaving date
  if (!data.isActive && !data.leavingDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select an end date for this employment",
      path: ["leavingDate"]
    });
  }
  // If has leaving date, must be after joining date
  if (data.leavingDate && data.leavingDate < data.joiningDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after the start date",
      path: ["leavingDate"]
    });
  }
});

// Add helper text constants
const EMPLOYMENT_GUIDANCE = {
  add: "Add a new employment record when an employee starts working at a new company or changes their role.",
  edit: "Update employment details if there are changes in the employee's role, salary, or department.",
  close: "Close the current employment when the employee leaves or changes companies.",
  active: "Mark as current employment if this is the employee's active role. Only one employment can be active at a time.",
}

// Add validation messages
const EMPLOYMENT_MESSAGES = {
  ACTIVE_EXISTS: "There is already an active employment. Please end the current employment first.",
  INVALID_TRANSITION: "Cannot change status. Please end the current employment first.",
  UPDATE_SUCCESS: "Employment history updated successfully!",
  UPDATE_ERROR: "Failed to update employment history. Please try again.",
  CLOSE_SUCCESS: "Employment closed successfully!",
  CLOSE_ERROR: "Failed to close employment. Please try again.",
  INVALID_DATES: "Leaving date cannot be before joining date",
  REQUIRED_LEAVING_DATE: "Leaving date is required when ending employment",
}

interface EmploymentHistoryFormProps {
  employee: Employee
  onUpdate: (updatedData: Partial<Employee>) => void
}

export function EmploymentHistoryForm({ employee, onUpdate }: EmploymentHistoryFormProps) {
  const { toast } = useToast()
  const [employmentHistories, setEmploymentHistories] = useState<IEmployeeEmploymentHistory[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [departments, setDepartments] = useState<EmployeeDepartments[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)
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
      leavingDate: undefined,
      salary: 0,
      isActive: false,
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
        toast({
          title: "Error",
          description: "Failed to load employment history",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [employee.id])

  // Handle refresh after assignment/termination
  const handleEmploymentChange = async () => {
    try {
      const updatedHistories = await employeeService.getEmployeeEmploymentHistory(employee.id);
      setEmploymentHistories(updatedHistories.data || []);
    } catch (error) {
      console.error("Error refreshing employment history:", error);
    }
  };

  // Handle updating employment history
  const handleUpdateEmploymentHistory = async (data: z.infer<typeof employmentHistorySchema>) => {
    if (!selectedHistory?.id) return;

    try {
      setIsSubmitting(true);

      // Validate dates if making inactive
      if (!data.isActive && !data.leavingDate) {
        toast({
          title: "Error",
          description: EMPLOYMENT_MESSAGES.REQUIRED_LEAVING_DATE,
          variant: "destructive"
        });
        return;
      }

      if (data.leavingDate && data.leavingDate < data.joiningDate) {
        toast({
          title: "Error",
          description: EMPLOYMENT_MESSAGES.INVALID_DATES,
          variant: "destructive"
        });
        return;
      }

      const updateData: UpdateEmploymentHistoryDto = {
        companyId: data.companyId,
        departmentId: data.departmentId,
        designationId: data.designationId,
        salary: data.salary,
        status: data.isActive ? Status.ACTIVE : Status.INACTIVE,
        leavingDate: data.leavingDate ? format(data.leavingDate, "dd-MM-yyyy") : undefined,
      };

      const response = await employeeService.updateEmploymentHistory(selectedHistory.id, updateData);

      if (response.statusCode === 200) {
        toast({
          title: "Success",
          description: EMPLOYMENT_MESSAGES.UPDATE_SUCCESS
        });
        const updatedHistories = await employeeService.getEmployeeEmploymentHistory(employee.id);
        setEmploymentHistories(updatedHistories.data || []);
        setShowEditDialog(false);
        setSelectedHistory(null);
      } else {
        throw new Error(response.message || EMPLOYMENT_MESSAGES.UPDATE_ERROR);
      }
    } catch (error) {
      console.error("Error updating employment history:", error);
      if (error instanceof Error) {
        if (error.message.includes("already an active employment")) {
          toast({
            title: "Error",
            description: EMPLOYMENT_MESSAGES.ACTIVE_EXISTS,
            variant: "destructive"
          });
        } else if (error.message.includes("not found")) {
          toast({
            title: "Error",
            description: "Employment record not found. It may have been deleted.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.message || EMPLOYMENT_MESSAGES.UPDATE_ERROR,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Error",
          description: EMPLOYMENT_MESSAGES.UPDATE_ERROR,
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening terminate dialog
  const handleOpenTerminate = (history: IEmployeeEmploymentHistory) => {
    if (history.status !== Status.ACTIVE) {
      toast({
        title: "Cannot Terminate",
        description: "Only active employment can be terminated.",
        variant: "destructive"
      });
      return;
    }
    setSelectedHistory(history);
    setShowTerminateDialog(true);
  };

  // Handle edit button click
  const handleEditClick = (history: IEmployeeEmploymentHistory) => {
    setSelectedHistory(history);
    form.reset({
      companyId: history.companyId || "",
      departmentId: history.departmentId || "",
      designationId: history.designationId || "",
      joiningDate: parseDate(history.joiningDate) || new Date(),
      leavingDate: history.leavingDate ? parseDate(history.leavingDate) || undefined : undefined,
      salary: history.salary || 0,
      isActive: history.status === Status.ACTIVE,
    });
    setShowEditDialog(true);
  };

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

  // Add a function to check if an employment can be made active
  const canMakeActive = (history: IEmployeeEmploymentHistory) => {
    if (!history?.id) return false;
    
    const hasActiveEmployment = employmentHistories.some(
      h => h.id && h.id !== history.id && h.status === Status.ACTIVE
    );
    return !hasActiveEmployment;
  };

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
        <Button
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setShowAssignDialog(true)}
        >
          <Plus className="h-4 w-4" />
          Assign New Employment
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {employmentHistories.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Employment History</h3>
            <p className="text-muted-foreground mb-4">This employee has no employment history records yet.</p>
            <Button onClick={() => setShowAssignDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign First Employment
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
                      Job Role
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
                      Start Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Monthly Salary
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
                    <TableCell>₹{history.salary?.toLocaleString() || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={history.status === Status.ACTIVE ? "default" : "secondary"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {history.status === Status.ACTIVE ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {history.status === Status.ACTIVE ? "Current" : "Previous"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(history)}
                          title="Edit employment details"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {history.status === Status.ACTIVE && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Terminate employment"
                            onClick={() => handleOpenTerminate(history)}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
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

      {/* Assign New Employment Dialog */}
      <AssignEmploymentDialog
        employee={employee}
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        onSuccess={handleEmploymentChange}
      />

      {/* Terminate Employment Dialog */}
      {selectedHistory && (
        <TerminateEmploymentDialog
          employee={employee}
          employment={selectedHistory}
          open={showTerminateDialog}
          onOpenChange={setShowTerminateDialog}
          onSuccess={() => {
            handleEmploymentChange()
            setSelectedHistory(null)
          }}
        />
      )}

      {/* Edit Employment History Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employment History</DialogTitle>
            <DialogDescription>
              {selectedHistory?.status === Status.ACTIVE
                ? "Update current employment details. Note: Making this inactive will end the current employment."
                : "Update previous employment details."}
            </DialogDescription>
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
                      <FormLabel>Start Date <span className="text-red-500">*</span></FormLabel>
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
                      <FormLabel>End Date {!form.watch("isActive") && <span className="text-red-500">*</span>}</FormLabel>
                      {form.watch("isActive") ? (
                        <div className="text-sm text-muted-foreground">Not applicable for current employment</div>
                      ) : (
                        <DatePicker 
                          date={field.value} 
                          onSelect={(date) => {
                            field.onChange(date);
                            form.trigger("leavingDate");
                          }}
                        />
                      )}
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
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            // When making inactive, set leaving date to today if not set
                            const leavingDate = form.getValues("leavingDate") || new Date();
                            form.setValue("leavingDate", leavingDate);
                          }
                        }}
                        disabled={!canMakeActive(selectedHistory!)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Current Employment</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {!canMakeActive(selectedHistory!)
                          ? "Cannot make this employment active while another employment is active."
                          : "Check if this is the current active employment. Only one employment can be active at a time."}
                      </p>
                    </div>
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
