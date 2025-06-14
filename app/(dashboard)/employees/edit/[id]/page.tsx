import { EditEmployeeContent } from "@/components/employees/edit-employee-content"
import { Suspense } from "react"

interface EditEmployeePageProps {
  params: {
    id: string
  }
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Suspense fallback={<EditEmployeePageSkeleton />}>
        <EditEmployeeContent employeeId={params.id} />
      </Suspense>
    </div>
  )
}

function EditEmployeePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
