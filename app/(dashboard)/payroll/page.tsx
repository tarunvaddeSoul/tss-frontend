import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, FileText } from "lucide-react"

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
        <p className="text-muted-foreground">Calculate monthly salaries and view past payroll reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/payroll/calculate" className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculate Payroll
              </CardTitle>
              <CardDescription>
                Run monthly payroll for a client, review the figures, and finalize.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Select a client and month to begin.
            </CardContent>
          </Card>
        </Link>

        <Link href="/payroll/reports" className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Payroll Reports
              </CardTitle>
              <CardDescription>
                View and export finalized payroll by client or employee.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Download reports as Excel or PDF.
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
