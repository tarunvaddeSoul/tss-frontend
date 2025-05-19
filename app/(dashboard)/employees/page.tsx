"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function EmployeesPage() {
  const router = useRouter()

  // Redirect to the list page by default
  useEffect(() => {
    router.push("/employees/list")
  }, [router])

  return (
    <div className="flex items-center justify-center h-[50vh]">
      <p className="text-muted-foreground">Redirecting to employee list...</p>
    </div>
  )
}
