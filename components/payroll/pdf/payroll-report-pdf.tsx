import { Document, Text, View } from "@react-pdf/renderer"
import type { PayrollReportRecord } from "@/utils/payroll-export"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"
import { SalarySlipPDFPage, type SalarySlipData } from "@/components/pdf/salary-slip-pdf"

interface PayrollReportPDFProps {
  data: PayrollReportRecord[]
  title: string
  totalRecords: number
  startMonth?: string
  endMonth?: string
  employeeName?: string // Optional employee name for single employee reports
}

// Helper function to convert PayrollReportRecord to SalarySlipData
const convertToSalarySlipData = (record: PayrollReportRecord, employeeName?: string): SalarySlipData => {
  const salaryData = record.salaryData as any
  console.log("salaryData", salaryData)
  
  // Access grouped salary data with fallbacks for backward compatibility
  const calculations = salaryData?.calculations || {}
  const deductions = salaryData?.deductions || {}
  const allowances = salaryData?.allowances || {}
  const information = salaryData?.information || {}
  
  // Format month (e.g., "2025-07" to "Jul-25")
  const formatMonth = (monthStr: string) => {
    const [year, monthNum] = monthStr.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[parseInt(monthNum) - 1]}-${year.slice(-2)}`
  }

  // Get pay period (first and last day of month)
  const getPayPeriod = (monthStr: string) => {
    const [year, monthNum] = monthStr.split("-")
    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate()
    const monthNumPadded = monthNum.padStart(2, "0")
    return `01-${monthNumPadded}-${year} to ${String(lastDay).padStart(2, "0")}-${monthNumPadded}-${year}`
  }

  // Calculate earnings - use grouped structure with fallbacks
  const basic = calculations?.basicPay ?? salaryData?.basicPay ?? 0
  const allowance = allowances?.allowance ?? allowances?.hra ?? allowances?.transportAllowance ?? salaryData?.allowance ?? salaryData?.hra ?? salaryData?.transportAllowance ?? 0
  const otherAllowance = allowances?.otherAllowance ?? allowances?.bonus ?? salaryData?.otherAllowance ?? salaryData?.bonus ?? 0
  const other = allowances?.other ?? salaryData?.other ?? 0
  const grossEarning = calculations?.grossSalary ?? salaryData?.grossSalary ?? 0

  // Calculate deductions - use grouped structure with fallbacks
  const epfContribution = deductions?.pf ?? deductions?.epfContribution12Percent ?? salaryData?.pf ?? salaryData?.epfContribution12Percent ?? 0
  const esicContribution = deductions?.esic ?? deductions?.esic075Percent ?? salaryData?.esic ?? salaryData?.esic075Percent ?? 0
  const advance = deductions?.advance ?? deductions?.advanceTaken ?? salaryData?.advance ?? salaryData?.advanceTaken ?? 0
  const grossDeduction = deductions?.totalDeductions ?? salaryData?.totalDeductions ?? (epfContribution + esicContribution + advance)

  return {
    company: record.companyName || information?.companyName || "TULSYAN SECURITY SERVICES PVT. LTD.",
    month: formatMonth(record.month),
    pay_period: getPayPeriod(record.month),
    employee: {
      name: employeeName || information?.employeeName || record.employeeId || "Employee",
      employee_id: record.employeeId,
      category: salaryData?.salaryCategory ?? salaryData?.category ?? "N/A",
      department: information?.department ?? salaryData?.department ?? "N/A",
      location: information?.location ?? salaryData?.location ?? "N/A",
      working_days: calculations?.dutyDone ?? calculations?.workingDays ?? salaryData?.dutyDone ?? salaryData?.workingDays ?? salaryData?.presentDays ?? 0,
      account_no: information?.bankAccountNumber ?? salaryData?.bankAccountNumber ?? "",
      esic_no: information?.esicNumber ?? salaryData?.esicNumber ?? "",
      uan_no: information?.uanNumber ?? information?.pfUanNumber ?? salaryData?.pfUanNumber ?? salaryData?.uanNumber ?? "",
    },
    earnings: {
      basic,
      allowance,
      other_allowance: otherAllowance,
      other,
      gross_earning: grossEarning,
    },
    deductions: {
      epf_contribution_12_percent: epfContribution,
      esic_0_75_percent: esicContribution,
      advance,
      gross_deduction: grossDeduction,
    },
    net_pay: calculations?.netSalary ?? salaryData?.netSalary ?? 0,
  }
}

const PayrollReportPDF = ({ data, title, totalRecords, startMonth, endMonth, employeeName }: PayrollReportPDFProps) => {
  // If single employee, use salary slip format
  if (data.length === 1) {
    const record = data[0]
    const salarySlipData = convertToSalarySlipData(record, employeeName)
    
    return (
      <Document
        title={`Salary Slip - ${salarySlipData.employee.name} - ${salarySlipData.month}`}
        author={BRAND.name}
        subject="Salary Slip"
        keywords="Tulsyan Security Services, Salary, Payslip"
      >
        <SalarySlipPDFPage data={salarySlipData} />
      </Document>
    )
  }

  // Multiple employees - use table format
  // Calculate summary statistics using grouped structure
  const totalGrossSalary = data.reduce((sum, record) => {
    const calculations = record.salaryData?.calculations || {}
    return sum + (calculations?.grossSalary ?? record.salaryData?.grossSalary ?? 0)
  }, 0)
  const totalNetSalary = data.reduce((sum, record) => {
    const calculations = record.salaryData?.calculations || {}
    return sum + (calculations?.netSalary ?? record.salaryData?.netSalary ?? 0)
  }, 0)
  const totalDeductions = data.reduce((sum, record) => {
    const deductions = record.salaryData?.deductions || {}
    return sum + (deductions?.totalDeductions ?? record.salaryData?.totalDeductions ?? 0)
  }, 0)
  const totalBasicPay = data.reduce((sum, record) => {
    const calculations = record.salaryData?.calculations || {}
    return sum + (calculations?.basicPay ?? record.salaryData?.basicPay ?? 0)
  }, 0)
  const totalPF = data.reduce((sum, record) => {
    const deductions = record.salaryData?.deductions || {}
    return sum + (deductions?.pf ?? record.salaryData?.pf ?? 0)
  }, 0)
  const totalESIC = data.reduce((sum, record) => {
    const deductions = record.salaryData?.deductions || {}
    return sum + (deductions?.esic ?? record.salaryData?.esic ?? 0)
  }, 0)
  const totalBonus = data.reduce((sum, record) => {
    const allowances = record.salaryData?.allowances || {}
    return sum + (allowances?.bonus ?? record.salaryData?.bonus ?? 0)
  }, 0)

  const periodText = startMonth && endMonth 
    ? `${startMonth} to ${endMonth}`
    : startMonth 
      ? startMonth
      : "All Periods"

  return (
    <Document
      title={`${title} - Payroll Report`}
      author={BRAND.name}
      subject="Payroll Report"
      keywords="Tulsyan Security Services, Payroll, Report"
    >
      <BrandPage orientation="landscape">
        <PdfHeader 
          title={`${title} Payroll Report`} 
          subtitle={`Period: ${periodText} • Total Records: ${totalRecords} • Showing: ${data.length}`} 
        />

        {/* Summary Section */}
        <Section title="Summary">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Gross Salary:</Text>
            <Text style={brandStyles.value}>₹{totalGrossSalary.toLocaleString("en-IN")}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Net Salary:</Text>
            <Text style={brandStyles.value}>₹{totalNetSalary.toLocaleString("en-IN")}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Deductions:</Text>
            <Text style={brandStyles.value}>₹{totalDeductions.toLocaleString("en-IN")}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Basic Pay:</Text>
            <Text style={brandStyles.value}>₹{totalBasicPay.toLocaleString("en-IN")}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total PF:</Text>
            <Text style={brandStyles.value}>₹{totalPF.toLocaleString("en-IN")}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total ESIC:</Text>
            <Text style={brandStyles.value}>₹{totalESIC.toLocaleString("en-IN")}</Text>
          </View>
          {totalBonus > 0 && (
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Total Bonus:</Text>
              <Text style={brandStyles.value}>₹{totalBonus.toLocaleString("en-IN")}</Text>
            </View>
          )}
        </Section>

        {/* Report Data Table */}
        <Section title="Report Data">
          <View style={[brandStyles.table, { marginTop: 0 }]}>
            {/* Header Row */}
            <View style={[brandStyles.tableRow, brandStyles.tableHeader]}>
              <Text style={[brandStyles.tableHeaderCell, { width: "8%" }]}>Employee ID</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "10%" }]}>Company</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "6%" }]}>Month</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "7%" }]}>Category</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "7%" }]}>Rate</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "8%" }]}>Basic Pay</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "8%" }]}>Gross</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "6%" }]}>PF</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "6%" }]}>ESIC</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "6%" }]}>LWF</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "6%" }]}>Bonus</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "8%" }]}>Net</Text>
              <Text style={[brandStyles.tableHeaderCell, { width: "8%" }]}>Deductions</Text>
            </View>

            {/* Data Rows */}
            {data.map((record) => {
              const salaryData = record.salaryData as any
              // Access grouped salary data with fallbacks
              const calculations = salaryData?.calculations || {}
              const deductions = salaryData?.deductions || {}
              const allowances = salaryData?.allowances || {}
              const information = salaryData?.information || {}
              
              const salaryCategory = salaryData?.salaryCategory || salaryData?.category
              const isSpecialized = salaryCategory === "SPECIALIZED"
              const pfAmount = deductions?.pf ?? salaryData?.pf ?? 0
              const esicAmount = deductions?.esic ?? salaryData?.esic ?? 0
              const lwfAmount = deductions?.lwf ?? salaryData?.lwf ?? 0
              const bonusAmount = allowances?.bonus ?? salaryData?.bonus ?? 0
              
              // Get rate from calculations or fallback to top-level
              const rate = calculations?.rate ?? calculations?.wagesPerDay ?? salaryData?.rate ?? salaryData?.wagesPerDay
              const monthlySalary = salaryData?.monthlySalary
              const salaryPerDay = salaryData?.salaryPerDay
              
              return (
                <View key={record.id} style={brandStyles.tableRow}>
                  <Text style={[brandStyles.tableCell, { width: "8%" }]}>{record.employeeId}</Text>
                  <Text style={[brandStyles.tableCell, { width: "10%" }]}>{record.companyName || information?.companyName || "N/A"}</Text>
                  <Text style={[brandStyles.tableCell, { width: "6%" }]}>{record.month}</Text>
                  <Text style={[brandStyles.tableCell, { width: "7%" }]}>
                    {salaryCategory || "N/A"}
                    {salaryData?.salarySubCategory ? `\n${salaryData.salarySubCategory}` : ""}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "7%", textAlign: "right" }]}>
                    {isSpecialized && monthlySalary
                      ? `₹${(monthlySalary || 0).toLocaleString("en-IN")}\n/mo`
                      : salaryPerDay
                        ? `₹${(salaryPerDay || 0).toLocaleString("en-IN")}\n/day`
                        : rate
                          ? `₹${(rate || 0).toLocaleString("en-IN")}\n/day`
                          : "N/A"}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "8%", textAlign: "right" }]}>
                    ₹{(calculations?.basicPay ?? salaryData?.basicPay ?? 0).toLocaleString("en-IN")}
                </Text>
                  <Text style={[brandStyles.tableCell, { width: "8%", textAlign: "right" }]}>
                    ₹{(calculations?.grossSalary ?? salaryData?.grossSalary ?? 0).toLocaleString("en-IN")}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "6%", textAlign: "right" }]}>
                    {pfAmount > 0 ? `₹${pfAmount.toLocaleString("en-IN")}` : "-"}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "6%", textAlign: "right" }]}>
                    {esicAmount > 0 ? `₹${esicAmount.toLocaleString("en-IN")}` : "-"}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "6%", textAlign: "right" }]}>
                    {lwfAmount > 0 ? `₹${lwfAmount.toLocaleString("en-IN")}` : "-"}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "6%", textAlign: "right" }]}>
                    {bonusAmount > 0 ? `₹${bonusAmount.toLocaleString("en-IN")}` : "-"}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "8%", textAlign: "right" }]}>
                    ₹{(calculations?.netSalary ?? salaryData?.netSalary ?? 0).toLocaleString("en-IN")}
                  </Text>
                  <Text style={[brandStyles.tableCell, { width: "8%", textAlign: "right" }]}>
                    ₹{(deductions?.totalDeductions ?? salaryData?.totalDeductions ?? 0).toLocaleString("en-IN")}
                  </Text>
                </View>
              )
            })}
          </View>
        </Section>

        <PdfFooter rightNote="This is a computer-generated report" />
      </BrandPage>
    </Document>
  )
}

export default PayrollReportPDF
