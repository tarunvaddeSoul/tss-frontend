import { Suspense } from "react"
import { PayrollReports } from "@/components/payroll/payroll-reports"
import { Skeleton } from "@/components/ui/skeleton"

function PayrollReportsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export default function PayrollReportsPage() {
  return (
    <Suspense fallback={<PayrollReportsSkeleton />}>
      <PayrollReports />
    </Suspense>
  )
}
