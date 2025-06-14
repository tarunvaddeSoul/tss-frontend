"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Gift, Cake } from "lucide-react"
import type { DashboardReport } from "@/types/dashboard"

interface SpecialDatesProps {
  data: DashboardReport
}

export function SpecialDates({ data }: SpecialDatesProps) {
  const { birthdays, anniversaries } = data.specialDates

  const formatDate = (dateString: string) => {
    const date = new Date(dateString.split("-").reverse().join("-"))
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upcoming Birthdays */}
      <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-pink-500" />
            Upcoming Birthdays
          </CardTitle>
          <CardDescription>Birthdays in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {birthdays.length > 0 ? (
            <div className="space-y-4">
              {birthdays.slice(0, 5).map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-sm">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{employee.id}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatDate(employee.dateOfBirth)}
                  </Badge>
                </div>
              ))}
              {birthdays.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">+{birthdays.length - 5} more birthdays</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Cake className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No upcoming birthdays</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Anniversaries */}
      <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-500" />
            Work Anniversaries
          </CardTitle>
          <CardDescription>Work anniversaries in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {anniversaries.length > 0 ? (
            <div className="space-y-4">
              {anniversaries.slice(0, 5).map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-sm">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{employee.id}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatDate(employee.employeeOnboardingDate)}
                  </Badge>
                </div>
              ))}
              {anniversaries.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{anniversaries.length - 5} more anniversaries
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No upcoming anniversaries</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
