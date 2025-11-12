"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Cake } from "lucide-react"
import type { DashboardReportData } from "@/types/dashboard"

interface SpecialDatesProps {
  data: DashboardReportData
}

export function SpecialDates({ data }: SpecialDatesProps) {
  const { birthdays } = data.specialDates

  const formatDate = (dateString: string) => {
    // Handle both DD-MM-YYYY and YYYY-MM-DD formats
    let date: Date
    if (dateString.includes("-")) {
      const parts = dateString.split("-")
      if (parts[0].length === 4) {
        // YYYY-MM-DD format
        date = new Date(dateString)
      } else {
        // DD-MM-YYYY format
        date = new Date(parts[2] + "-" + parts[1] + "-" + parts[0])
      }
    } else {
      date = new Date(dateString)
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
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
            {birthdays.slice(0, 10).map((employee) => (
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
            {birthdays.length > 10 && (
              <p className="text-xs text-muted-foreground text-center">+{birthdays.length - 10} more birthdays</p>
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
  )
}
