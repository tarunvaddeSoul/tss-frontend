"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Users, Building2, ClipboardCheck, DollarSign, TrendingUp } from "lucide-react"
import { dashboardService } from "@/services/dashboardService"
import type { DashboardData } from "@/services/dashboardService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sample attendance data for chart
  const attendanceData = [
    { name: "Mon", present: 85, absent: 15 },
    { name: "Tue", present: 88, absent: 12 },
    { name: "Wed", present: 90, absent: 10 },
    { name: "Thu", present: 92, absent: 8 },
    { name: "Fri", present: 85, absent: 15 },
    { name: "Sat", present: 78, absent: 22 },
    { name: "Sun", present: 75, absent: 25 },
  ]

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const data = await dashboardService.getDashboardData()
        setDashboardData(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardData?.totalEmployees || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="flex items-center text-green-500">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {dashboardData?.newEmployeesThisMonth || 0}
                  </span>
                  <span className="ml-1">new this month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardData?.totalCompanies || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="flex items-center text-green-500">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {dashboardData?.newCompaniesThisMonth || 0}
                  </span>
                  <span className="ml-1">new this month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">92.5%</div>
                <p className="text-xs text-muted-foreground">+1.2% from last week</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Processed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">₹24.3M</div>
                <p className="text-xs text-muted-foreground">For May 2025</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>Attendance statistics for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="present" stackId="a" fill="#4ade80" name="Present" />
                    <Bar dataKey="absent" stackId="a" fill="#f87171" name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Task {i}</p>
                        <p className="text-sm text-muted-foreground">Description of task {i}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Due in {i} day{i !== 1 ? "s" : ""}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your recent activity across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Activity {i}</p>
                        <p className="text-sm text-muted-foreground">Description of activity {i}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {i} hour{i !== 1 ? "s" : ""} ago
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Distribution</CardTitle>
            <CardDescription>Distribution of employees by location</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Site 1</p>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Site 2</p>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: "30%" }}></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Site 3</p>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Site 4</p>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: "10%" }}></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">10%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
