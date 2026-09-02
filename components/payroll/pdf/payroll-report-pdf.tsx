import { Document, Text, View } from "@react-pdf/renderer"
import { resolveEmployeeName, type PayrollReportRecord } from "@/utils/payroll-export"
import { formatMoney, formatMonth, label } from "@/lib/labels"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"
import { SalarySlipPDFPage, payrollRecordToSalarySlip } from "@/components/pdf/salary-slip-pdf"

interface PayrollReportPDFProps {
  data: PayrollReportRecord[]
  title: string
  totalRecords: number
  startMonth?: string
  endMonth?: string
  employeeName?: string
}

const NUM = { fontFamily: "IBMPlexMono", fontSize: 7.5 } as const
const CELL = { padding: 4, fontSize: 8.5 } as const
const HEADER_CELL = { padding: 4, fontSize: 7 } as const

interface Amounts {
  clientName: string
  category: string
  rate: string
  basic: number
  gross: number
  net: number
  pf: number
  esic: number
  lwf: number
  bonus: number
  totalDeductions: number
}

const readAmounts = (record: PayrollReportRecord): Amounts => {
  const salaryData = record.salaryData as any
  const calculations = salaryData?.calculations || {}
  const deductions = salaryData?.deductions || {}
  const allowances = salaryData?.allowances || {}
  const information = salaryData?.information || {}

  const salaryCategory = information?.salaryCategory ?? salaryData?.salaryCategory
  const salarySubCategory = information?.salarySubCategory ?? salaryData?.salarySubCategory
  const isSpecialized = salaryCategory === "SPECIALIZED"
  const rate = calculations?.rate ?? calculations?.wagesPerDay ?? salaryData?.rate ?? salaryData?.wagesPerDay
  const monthlySalary = salaryData?.monthlySalary
  const salaryPerDay = salaryData?.salaryPerDay

  return {
    clientName: record.clientName || information?.clientName || "-",
    category: salaryCategory
      ? `${label.salaryCategory(salaryCategory)}${salarySubCategory ? `\n${label.salarySubCategory(salarySubCategory)}` : ""}`
      : "-",
    rate:
      isSpecialized && monthlySalary
        ? `${formatMoney(monthlySalary)}/mo`
        : salaryPerDay
          ? `${formatMoney(salaryPerDay)}/day`
          : rate
            ? `${formatMoney(rate)}/day`
            : "-",
    basic: calculations?.basicPay ?? salaryData?.basicPay ?? 0,
    gross: calculations?.grossSalary ?? salaryData?.grossSalary ?? 0,
    net: calculations?.netSalary ?? salaryData?.netSalary ?? 0,
    pf: deductions?.pf ?? salaryData?.pf ?? 0,
    esic: deductions?.esic ?? salaryData?.esic ?? 0,
    lwf: deductions?.lwf ?? salaryData?.lwf ?? 0,
    bonus: allowances?.bonus ?? salaryData?.bonus ?? 0,
    totalDeductions: deductions?.totalDeductions ?? salaryData?.totalDeductions ?? 0,
  }
}

interface Column {
  key: string
  label: string
  weight: number
  right?: boolean
  mono?: boolean
  render: (record: PayrollReportRecord, amounts: Amounts) => string
}

const optionalMoney = (value: number): string => (value > 0 ? formatMoney(value) : "-")

const PayrollReportPDF = ({ data, title, totalRecords, startMonth, endMonth, employeeName }: PayrollReportPDFProps): JSX.Element => {
  if (data.length === 1) {
    const slip = payrollRecordToSalarySlip(data[0], data[0].clientName)
    if (slip.employee.name === "-" && employeeName) slip.employee.name = employeeName

    return (
      <Document
        title={`Salary Slip - ${slip.employee.name} - ${slip.month}`}
        author={BRAND.name}
        subject="Salary Slip"
        keywords="Tulsyan Security Services, Salary, Payslip"
      >
        <SalarySlipPDFPage data={slip} />
      </Document>
    )
  }

  const rows = data.map((record) => ({ record, amounts: readAmounts(record) }))
  const sum = (pick: (amounts: Amounts) => number): number => rows.reduce((total, row) => total + pick(row.amounts), 0)

  const totalGrossSalary = sum((a) => a.gross)
  const totalNetSalary = sum((a) => a.net)
  const totalDeductions = sum((a) => a.totalDeductions)
  const totalBasicPay = sum((a) => a.basic)
  const totalPF = sum((a) => a.pf)
  const totalESIC = sum((a) => a.esic)
  const totalBonus = sum((a) => a.bonus)
  const totalLwf = sum((a) => a.lwf)

  const singleClient = new Set(data.map((record) => record.clientId)).size <= 1

  const columns: Column[] = [
    { key: "name", label: "Employee", weight: 15, render: (record) => resolveEmployeeName(record) ?? "-" },
    { key: "empId", label: "ID", weight: 9, mono: true, render: (record) => record.employeeId },
    ...(singleClient ? [] : [{ key: "client", label: "Client", weight: 18, render: (_: PayrollReportRecord, a: Amounts) => a.clientName }]),
    { key: "month", label: "Month", weight: 9, mono: true, render: (record) => formatMonth(record.month) },
    { key: "category", label: "Category", weight: 9, render: (_, a) => a.category },
    { key: "rate", label: "Rate", weight: 11, right: true, mono: true, render: (_, a) => a.rate },
    { key: "basic", label: "Basic Pay", weight: 11, right: true, mono: true, render: (_, a) => formatMoney(a.basic) },
    { key: "gross", label: "Gross", weight: 11, right: true, mono: true, render: (_, a) => formatMoney(a.gross) },
    { key: "pf", label: "PF", weight: 10, right: true, mono: true, render: (_, a) => optionalMoney(a.pf) },
    { key: "esic", label: "ESIC", weight: 10, right: true, mono: true, render: (_, a) => optionalMoney(a.esic) },
    ...(totalLwf > 0 ? [{ key: "lwf", label: "LWF", weight: 9, right: true, mono: true, render: (_: PayrollReportRecord, a: Amounts) => optionalMoney(a.lwf) }] : []),
    ...(totalBonus > 0 ? [{ key: "bonus", label: "Bonus", weight: 10, right: true, mono: true, render: (_: PayrollReportRecord, a: Amounts) => optionalMoney(a.bonus) }] : []),
    { key: "deductions", label: "Deductions", weight: 11, right: true, mono: true, render: (_, a) => formatMoney(a.totalDeductions) },
    { key: "net", label: "Net", weight: 11, right: true, mono: true, render: (_, a) => formatMoney(a.net) },
  ]
  const totalWeight = columns.reduce((total, column) => total + column.weight, 0)
  const widthOf = (column: Column): string => `${(column.weight / totalWeight) * 100}%`

  const periodText = startMonth && endMonth
    ? `${formatMonth(startMonth)} to ${formatMonth(endMonth)}`
    : startMonth
      ? formatMonth(startMonth)
      : "All months"

  const summaryRows: Array<[string, number]> = [
    ["Total Gross Salary", totalGrossSalary],
    ["Total Net Salary", totalNetSalary],
    ["Total Deductions", totalDeductions],
    ["Total Basic Pay", totalBasicPay],
    ["Total PF", totalPF],
    ["Total ESIC", totalESIC],
    ...(totalBonus > 0 ? ([["Total Bonus", totalBonus]] as Array<[string, number]>) : []),
  ]

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

        <Section title="Summary">
          {summaryRows.map(([text, value]) => (
            <View key={text} style={brandStyles.row}>
              <Text style={brandStyles.label}>{text}:</Text>
              <Text style={[brandStyles.value, NUM, { fontSize: 9 }]}>{formatMoney(value)}</Text>
            </View>
          ))}
        </Section>

        <Section title="Report Data">
          <View style={[brandStyles.table, { marginTop: 0 }]}>
            <View style={[brandStyles.tableRow, brandStyles.tableHeader]} fixed>
              {columns.map((column) => (
                <Text
                  key={column.key}
                  style={[brandStyles.tableHeaderCell, HEADER_CELL, { width: widthOf(column), textAlign: column.right ? "right" : "left" }]}
                >
                  {column.label}
                </Text>
              ))}
            </View>

            {rows.map(({ record, amounts }) => (
              <View key={record.id} style={brandStyles.tableRow} wrap={false}>
                {columns.map((column) => (
                  <Text
                    key={column.key}
                    style={[
                      brandStyles.tableCell,
                      CELL,
                      { width: widthOf(column), textAlign: column.right ? "right" : "left" },
                      ...(column.mono ? [NUM] : []),
                    ]}
                  >
                    {column.render(record, amounts)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </Section>

        <PdfFooter rightNote="This is a computer-generated report" />
      </BrandPage>
    </Document>
  )
}

export default PayrollReportPDF
