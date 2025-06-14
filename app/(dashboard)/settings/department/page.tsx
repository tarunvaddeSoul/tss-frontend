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
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Department Management
      </h1>

      <Tabs defaultValue="users" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="data-[state=active]:bg-primary/20">
            <Users className="h-4 w-4 mr-2" />
            User Departments
          </TabsTrigger>
          <TabsTrigger value="employees" className="data-[state=active]:bg-primary/20">
            <UserPlus className="h-4 w-4 mr-2" />
            Employee Departments
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card className="backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl z-0 opacity-50" />
            <CardHeader className="relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    {activeTab === "users" ? "User Departments" : "Employee Departments"}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Manage {activeTab === "users" ? "user" : "employee"} departments
                  </CardDescription>
                </div>
                <Dialog open={isAddingDepartment} onOpenChange={setIsAddingDepartment}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Department</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleAddDepartment)} className="space-y-4">
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
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>

                <ScrollArea className="h-[400px] rounded-lg border border-white/10">
                  <div className="space-y-2 p-4">
                    {filteredDepartments.map((dept) => (
                      <div
                        key={dept.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{dept.name}</h3>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => handleDeleteDepartment(dept.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
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