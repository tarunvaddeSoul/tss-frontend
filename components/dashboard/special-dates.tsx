"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Cake, Award, Building2 } from "lucide-react"
import { formatDate, label } from "@/lib/labels"
import type { DashboardReportData } from "@/types/dashboard"

interface SpecialDatesProps {
  data: DashboardReportData
  daysAhead: number
  onDaysChange: (value: string) => void
}

export function SpecialDates({ data, daysAhead, onDaysChange }: SpecialDatesProps) {
  const { birthdays, employeeAnniversaries, clientAnniversaries } = data.specialDates

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Upcoming Dates</h2>
          <p className="text-sm text-muted-foreground">Birthdays and anniversaries in the next {daysAhead} days</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="days-select" className="text-sm text-muted-foreground whitespace-nowrap">
            Upcoming:
          </Label>
          <Select value={daysAhead.toString()} onValueChange={onDaysChange}>
            <SelectTrigger id="days-select" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Next 7 days</SelectItem>
              <SelectItem value="15">Next 15 days</SelectItem>
              <SelectItem value="30">Next 30 days</SelectItem>
              <SelectItem value="60">Next 60 days</SelectItem>
              <SelectItem value="90">Next 90 days</SelectItem>
              <SelectItem value="180">Next 180 days</SelectItem>
              <SelectItem value="365">Next year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="security-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-pink-500" />
              Upcoming Birthdays
            </CardTitle>
            <CardDescription>Birthdays in the next {daysAhead} days</CardDescription>
          </CardHeader>
          <CardContent>
            {birthdays.length > 0 ? (
              <div className="space-y-4">
                {birthdays.slice(0, 10).map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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

        <Card className="security-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Employee Anniversaries
            </CardTitle>
            <CardDescription>Work anniversaries in the next {daysAhead} days</CardDescription>
          </CardHeader>
          <CardContent>
            {employeeAnniversaries.length > 0 ? (
              <div className="space-y-4">
                {employeeAnniversaries.slice(0, 10).map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm">
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
                {employeeAnniversaries.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{employeeAnniversaries.length - 10} more anniversaries
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No upcoming employee anniversaries</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="security-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-info" />
              Client Anniversaries
            </CardTitle>
            <CardDescription>Client anniversaries in the next {daysAhead} days</CardDescription>
          </CardHeader>
          <CardContent>
            {clientAnniversaries.length > 0 ? (
              <div className="space-y-4">
                {clientAnniversaries.slice(0, 10).map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="p-2 rounded-full bg-info/10">
                      <Building2 className="h-5 w-5 text-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{label.status(client.status)}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatDate(client.clientOnboardingDate)}
                    </Badge>
                  </div>
                ))}
                {clientAnniversaries.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{clientAnniversaries.length - 10} more anniversaries
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No upcoming client anniversaries</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
