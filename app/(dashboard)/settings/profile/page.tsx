"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Phone, Mail, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Role } from "@/types/auth"
import { departmentService } from "@/services/departmentService"

interface Department {
  id: string
  name: string
}

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  mobileNumber: z.string().length(10, { message: "Mobile number must be 10 digits" }),
  role: z.nativeEnum(Role, { message: "Please select a role" }),
  departmentId: z.string({ required_error: "Please select a department" }),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfileSettingsPage() {
  const { user, updateUser, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      mobileNumber: user?.mobileNumber || "",
      role: user?.role || Role.USER,
      departmentId: user?.departmentId || "",
    },
  })

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        departmentId: user.departmentId,
      })
    }
  }, [user, form])

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getUserDepartments()
        setDepartments(response)
      } catch (err) {
        console.error("Failed to fetch departments:", err)
      } finally {
        setIsLoadingDepartments(false)
      }
    }

    fetchDepartments()
  }, [])

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateUser(data)
      await refreshUser() // Refresh user data after update
      setSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      if (err.response) {
        const statusCode = err.response.status
        const responseData = err.response.data

        if (statusCode === 400) {
          setError(responseData.message || "Invalid data. Please check your information.")
        } else if (statusCode === 409) {
          setError("Email already in use by another account.")
        } else if (responseData && responseData.message) {
          setError(responseData.message)
        } else {
          setError("An error occurred. Please try again.")
        }
      } else if (err.request) {
        setError("No response from server. Please check your internet connection.")
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.")
      }

      console.error("Update profile error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Profile Settings
      </h1>

      <Card className="backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl z-0 opacity-50" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Update your personal information and account settings</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
                  <AlertDescription>Profile updated successfully!</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tss-text/40 h-4 w-4" />
                        <Input
                          placeholder="John Doe"
                          {...field}
                          className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tss-text/40 h-4 w-4" />
                          <Input
                            placeholder="your.email@example.com"
                            {...field}
                            className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white">Mobile Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tss-text/40 h-4 w-4" />
                          <Input
                            placeholder="9876543210"
                            {...field}
                            className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white">Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-tss-card border-white/10">
                          {Object.values(Role).map((role) => (
                            <SelectItem key={role} value={role} className="text-tss-text hover:bg-white/5">
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white">Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400">
                            <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select a department"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-tss-card border-white/10">
                          {isLoadingDepartments ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin text-tss-text/40" />
                            </div>
                          ) : (
                            departments.map((department) => (
                              <SelectItem
                                key={department.id}
                                value={department.id}
                                className="text-tss-text hover:bg-white/5"
                              >
                                {department.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
