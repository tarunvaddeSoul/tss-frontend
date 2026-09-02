"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, Loader2, Users, UserPlus, Search, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { departmentService } from "@/services/departmentService"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"

const departmentSchema = z.object({
  name: z.string().min(2, { message: "Department name must be at least 2 characters" }),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

export default function DepartmentSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("users")
  const [userDepartments, setUserDepartments] = useState<any[]>([])
  const [employeeDepartments, setEmployeeDepartments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingDepartment, setIsAddingDepartment] = useState(false)

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
    },
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const [userDepts, employeeDepts] = await Promise.all([
        departmentService.getUserDepartments(),
        departmentService.getEmployeeDepartments()
      ])
      setUserDepartments(userDepts)
      setEmployeeDepartments(employeeDepts)
    } catch (err) {
      console.error("Failed to fetch departments:", err)
      toast.error("Failed to fetch departments")
    }
  }

  const handleAddDepartment = async (data: DepartmentFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      if (activeTab === "users") {
        await departmentService.addUserDepartment(data.name)
        toast.success("User department added successfully")
      } else {
        await departmentService.addEmployeeDepartment(data.name)
        toast.success("Employee department added successfully")
      }
      form.reset()
      setIsAddingDepartment(false)
      fetchDepartments()
    } catch (err: any) {
      setError(err.message || "Failed to add department")
      toast.error("Failed to add department")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDepartment = async (name: string) => {
    try {
      if (activeTab === "users") {
        await departmentService.deleteUserDepartment(name)
        toast.success("User department deleted successfully")
      } else {
        await departmentService.deleteEmployeeDepartment(name)
        toast.success("Employee department deleted successfully")
      }
      fetchDepartments()
    } catch (err: any) {
      toast.error("Failed to delete department")
    }
  }

  const filteredDepartments = (activeTab === "users" ? userDepartments : employeeDepartments)
    .filter(dept => dept.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div>
      <PageHeader
        no="06"
        eyebrow="Settings register"
        title="Department Management"
        description="Manage user and employee departments."
      />

      <Tabs defaultValue="users" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Departments
          </TabsTrigger>
          <TabsTrigger value="employees">
            <UserPlus className="h-4 w-4 mr-2" />
            Employee Departments
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {activeTab === "users" ? "User Departments" : "Employee Departments"}
                  </CardTitle>
                  <CardDescription>
                    Manage {activeTab === "users" ? "user" : "employee"} departments
                  </CardDescription>
                </div>
                <Dialog open={isAddingDepartment} onOpenChange={setIsAddingDepartment}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Department</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form noValidate onSubmit={form.handleSubmit(handleAddDepartment)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter department name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full">
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Department"
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="space-y-2 p-4">
                    {filteredDepartments.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          No records on file
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          No {activeTab === "users" ? "user" : "employee"} departments match this list yet.
                        </p>
                      </div>
                    ) : (
                      filteredDepartments.map((dept) => (
                        <div
                          key={dept.id}
                          className="flex items-center justify-between p-4 rounded-md border bg-card hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-md bg-surface flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">{dept.name}</h3>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteDepartment(dept.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 