import { PayrollReports } from "@/components/payroll/payroll-reports"

export default function PayrollReportsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Payroll Reports</h1>
        <p className="text-muted-foreground">
          Generate and download comprehensive payroll reports for companies and employees
        </p>
      </div>
      <PayrollReports />
    </div>
  )
}
