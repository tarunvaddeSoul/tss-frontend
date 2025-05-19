"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Calendar } from "lucide-react"

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground">Manage employee salaries and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Select Month
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>Process Payroll</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>View and manage monthly payroll records</CardDescription>
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
            <div className="grid grid-cols-7 p-4 font-medium border-b">
              <div>Employee</div>
              <div>ID</div>
              <div>Basic Salary</div>
              <div>Overtime</div>
              <div>Deductions</div>
              <div>Net Salary</div>
              <div>Status</div>
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 p-4 border-b last:border-0 hover:bg-muted/50">
                <div>Employee {i + 1}</div>
                <div>EMP-{1000 + i}</div>
                <div>₹{15000 + i * 1000}</div>
                <div>₹{i % 3 === 0 ? 0 : 500 + i * 100}</div>
                <div>₹{1000 + i * 50}</div>
                <div>₹{14000 + i * 1000 + (i % 3 === 0 ? 0 : 500 + i * 100) - (1000 + i * 50)}</div>
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      i % 4 === 0
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    }`}
                  >
                    {i % 4 === 0 ? "Pending" : "Paid"}
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
