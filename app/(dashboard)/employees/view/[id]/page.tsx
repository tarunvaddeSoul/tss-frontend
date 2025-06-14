import { Suspense } from "react"
import EmployeeViewPage from "@/components/employees/employee-view-page"
import { Skeleton } from "@/components/ui/skeleton"

export default function EmployeeViewPageRoute() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<EmployeeViewPageSkeleton />}>
        <EmployeeViewPage />
      </Suspense>
    </div>
  )
}

function EmployeeViewPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <div className="flex space-x-8 px-6 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
