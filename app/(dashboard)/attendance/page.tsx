"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Download } from "lucide-react"

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Track and manage employee attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Select Date
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>View and manage daily attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search employees..." className="pl-8" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-6 p-4 font-medium border-b">
              <div>Employee</div>
              <div>ID</div>
              <div>Check In</div>
              <div>Check Out</div>
              <div>Hours</div>
              <div>Status</div>
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 p-4 border-b last:border-0 hover:bg-muted/50">
                <div>Employee {i + 1}</div>
                <div>EMP-{1000 + i}</div>
                <div>{`0${7 + (i % 3)}:${15 + ((i * 5) % 45)}`}</div>
                <div>{i % 5 === 0 ? "-" : `${16 + (i % 3)}:${10 + ((i * 7) % 50)}`}</div>
                <div>{i % 5 === 0 ? "-" : `${8 + (i % 3)}.${(i * 5) % 6}0`}</div>
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      i % 5 === 0
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        : i % 4 === 0
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    }`}
                  >
                    {i % 5 === 0 ? "Absent" : i % 4 === 0 ? "Late" : "Present"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
