import { Document, Text, View, StyleSheet } from "@react-pdf/renderer"
import { BRAND, BrandPage, PdfFooter, PdfHeader } from "@/components/pdf/brand"
import { formatMoney, formatMonth, humanize, isPlaceholder, label } from "@/lib/labels"
import { resolveEmployeeName, type PayslipSourceRecord } from "@/utils/payroll-export"

export interface SalarySlipData {
  client: string
  month: string
  pay_period: string
  employee: {
    name: string
    employee_id: string
    category: string
    department: string
    location: string
    working_days: number
    account_no: string
    esic_no: string
    uan_no: string
    designation?: string
    father_name?: string
    bank_name?: string
    ifsc_code?: string
  }
  earnings: {
    basic: number
    allowance: number
    other_allowance: number
    other: number
    gross_earning: number
    bonus?: number
  }
  deductions: {
    epf_contribution_12_percent: number
    esic_0_75_percent: number
    advance: number
    gross_deduction: number
    lwf?: number
  }
  net_pay: number
}

const styles = StyleSheet.create({
  employeeDetails: {
    marginBottom: 20,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BRAND.colors.border,
  },
  employeeDetailsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingVertical: 3.5,
  },
  employeeDetailsLabel: {
    width: "40%",
    fontFamily: "IBMPlexMono",
    fontSize: 7.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: BRAND.colors.muted,
  },
  employeeDetailsValue: {
    width: "60%",
    fontSize: 9.5,
    color: BRAND.colors.text,
  },
  employeeDetailsValueMono: {
    width: "60%",
    fontFamily: "IBMPlexMono",
    fontSize: 9,
    color: BRAND.colors.text,
  },
  salaryTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    marginBottom: 20,
  },
  salaryTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
    minHeight: 30,
  },
  salaryTableHeader: {
    backgroundColor: BRAND.colors.tableHeaderBg,
    fontWeight: "bold",
  },
  earningsColumn: {
    width: "50%",
    borderRightWidth: 1,
    borderRightColor: BRAND.colors.border,
    padding: 8,
  },
  deductionsColumn: {
    width: "50%",
    padding: 8,
  },
  tableHeaderText: {
    fontFamily: "IBMPlexMono",
    fontSize: 8.5,
    fontWeight: 600,
    letterSpacing: 1.2,
    color: BRAND.colors.muted,
    textAlign: "center",
  },
  netPaySection: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 2,
    borderTopColor: BRAND.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netPayLabel: {
    fontFamily: "IBMPlexMono",
    fontSize: 8.5,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: BRAND.colors.text,
  },
  netPayValue: {
    fontFamily: "Archivo",
    fontSize: 15,
    fontWeight: "bold",
    color: BRAND.colors.primary,
  },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  lineLabel: {
    fontSize: 9,
    color: BRAND.colors.muted,
    flexShrink: 1,
    paddingRight: 8,
  },
  lineValue: {
    fontFamily: "IBMPlexMono",
    fontSize: 9,
    color: BRAND.colors.text,
    textAlign: "right",
  },
  lineBold: {
    fontWeight: 600,
    color: BRAND.colors.text,
  },
  lineEmpty: {
    fontSize: 9,
    color: BRAND.colors.muted,
  },
})

const firstNumber = (...values: unknown[]): number => {
  for (const value of values) {
    if (typeof value === "number" && !Number.isNaN(value)) return value
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value)
  }
  return 0
}

const firstText = (...values: unknown[]): string => {
  for (const value of values) {
    if (value === null || value === undefined) continue
    const text = String(value).trim()
    if (text && !isPlaceholder(text)) return text
  }
  return ""
}

const payPeriod = (month: string): string => {
  if (!/^\d{4}-\d{2}$/.test(month)) return month || "-"
  const [year, monthNum] = month.split("-")
  const lastDay = new Date(Number(year), Number(monthNum), 0).getDate()
  return `01-${monthNum}-${year} to ${String(lastDay).padStart(2, "0")}-${monthNum}-${year}`
}

export function payrollRecordToSalarySlip(record: PayslipSourceRecord, clientName?: string | null): SalarySlipData {
  const salaryData = record.salaryData ?? {}
  const calculations = salaryData.calculations ?? {}
  const deductions = salaryData.deductions ?? {}
  const allowances = salaryData.allowances ?? {}
  const information = salaryData.information ?? {}

  const basic = firstNumber(calculations.basicPay, salaryData.basicPay)
  const allowance = firstNumber(
    allowances.allowance,
    allowances.hra,
    allowances.transportAllowance,
    salaryData.allowance,
    salaryData.hra,
    salaryData.transportAllowance,
  )
  const bonus = firstNumber(allowances.bonus, salaryData.bonus)
  const otherAllowance = firstNumber(allowances.otherAllowance, salaryData.otherAllowance)
  const other = firstNumber(allowances.other, salaryData.other)
  const grossEarning = firstNumber(calculations.grossSalary, salaryData.grossSalary)

  const pf = firstNumber(deductions.pf, deductions.epfContribution12Percent, salaryData.pf, salaryData.epfContribution12Percent)
  const esic = firstNumber(deductions.esic, deductions.esic075Percent, salaryData.esic, salaryData.esic075Percent)
  const lwf = firstNumber(deductions.lwf, salaryData.lwf)
  const advance = firstNumber(deductions.advance, deductions.advanceTaken, salaryData.advance, salaryData.advanceTaken)
  const grossDeduction = firstNumber(deductions.totalDeductions, salaryData.totalDeductions, pf + esic + lwf + advance)

  const salaryCategory = firstText(information.salaryCategory, salaryData.salaryCategory)
  const salarySubCategory = firstText(information.salarySubCategory, salaryData.salarySubCategory)
  const category = salaryCategory
    ? [label.salaryCategory(salaryCategory), salarySubCategory ? label.salarySubCategory(salarySubCategory) : ""]
        .filter(Boolean)
        .join(" / ")
    : ""

  return {
    client: firstText(clientName, record.clientName, information.clientName, salaryData.clientName),
    month: formatMonth(record.month),
    pay_period: payPeriod(record.month),
    employee: {
      name: resolveEmployeeName(record) ?? "-",
      employee_id: record.employeeId,
      category,
      designation: humanize(firstText(information.designation, salaryData.designation)),
      department: humanize(firstText(information.department, salaryData.department)),
      father_name: firstText(information.fatherName, salaryData.fatherName, record.employee?.fatherName),
      location: firstText(information.location, salaryData.location),
      working_days: firstNumber(
        calculations.dutyDone,
        calculations.workingDays,
        salaryData.dutyDone,
        salaryData.workingDays,
        salaryData.presentDays,
      ),
      account_no: firstText(information.bankAccountNumber, salaryData.bankAccountNumber),
      bank_name: firstText(information.bankName, salaryData.bankName),
      ifsc_code: firstText(information.ifscCode, salaryData.ifscCode),
      esic_no: firstText(information.esicNumber, salaryData.esicNumber),
      uan_no: firstText(information.pfUanNumber, information.uanNumber, salaryData.pfUanNumber, salaryData.uanNumber),
    },
    earnings: {
      basic,
      allowance,
      bonus,
      other_allowance: otherAllowance,
      other,
      gross_earning: grossEarning,
    },
    deductions: {
      epf_contribution_12_percent: pf,
      esic_0_75_percent: esic,
      lwf,
      advance,
      gross_deduction: grossDeduction,
    },
    net_pay: firstNumber(calculations.netSalary, salaryData.netSalary),
  }
}

const LineItem = ({ label: text, value, bold = false }: { label: string; value: number; bold?: boolean }): JSX.Element => (
  <View style={styles.lineItem}>
    <Text style={[styles.lineLabel, ...(bold ? [styles.lineBold] : [])]}>{text}</Text>
    <Text style={[styles.lineValue, ...(bold ? [styles.lineBold] : [])]}>{formatMoney(value || 0)}</Text>
  </View>
)

const DetailRow = ({
  label: text,
  value,
  mono = false,
}: {
  label: string
  value?: string | number | null
  mono?: boolean
}): JSX.Element | null => {
  const display = value === null || value === undefined ? "" : String(value).trim()
  if (!display || display === "-") return null
  return (
    <View style={styles.employeeDetailsRow}>
      <Text style={styles.employeeDetailsLabel}>{text}</Text>
      <Text style={mono ? styles.employeeDetailsValueMono : styles.employeeDetailsValue}>{display}</Text>
    </View>
  )
}

interface SalarySlipPDFProps {
  data: SalarySlipData
}

export const SalarySlipPDFPage = ({ data }: SalarySlipPDFProps): JSX.Element => {
  const earnings = data.earnings ?? { basic: 0, allowance: 0, other_allowance: 0, other: 0, gross_earning: 0 }
  const deductions = data.deductions ?? { epf_contribution_12_percent: 0, esic_0_75_percent: 0, advance: 0, gross_deduction: 0 }

  const earningItems = [
    { label: "Basic", value: earnings.basic || 0, always: true },
    { label: "Allowance", value: earnings.allowance || 0 },
    { label: "Bonus", value: earnings.bonus || 0 },
    { label: "Other Allowance", value: earnings.other_allowance || 0 },
    { label: "Other", value: earnings.other || 0 },
  ].filter((item) => item.always || item.value > 0)

  const deductionItems = [
    { label: "Provident Fund (PF)", value: deductions.epf_contribution_12_percent || 0 },
    { label: "ESIC", value: deductions.esic_0_75_percent || 0 },
    { label: "Labour Welfare Fund (LWF)", value: deductions.lwf || 0 },
    { label: "Advance", value: deductions.advance || 0 },
  ].filter((item) => item.value > 0)

  return (
    <BrandPage>
      <PdfHeader
        title="Salary Slip"
        subtitle={`${data.month || "-"} | Pay Period: ${data.pay_period || "-"}`}
        logoSrc="/tss-logo.png"
      />

      <View style={styles.employeeDetails}>
        <View style={styles.employeeDetailsRow}>
          <Text style={styles.employeeDetailsLabel}>Employee Name</Text>
          <Text style={styles.employeeDetailsValue}>{data.employee?.name || "-"}</Text>
        </View>
        <View style={styles.employeeDetailsRow}>
          <Text style={styles.employeeDetailsLabel}>Employee ID</Text>
          <Text style={styles.employeeDetailsValueMono}>{data.employee?.employee_id || "-"}</Text>
        </View>
        <DetailRow label="Client Site" value={data.client} />
        <DetailRow label="Designation" value={data.employee?.designation} />
        <DetailRow label="Department" value={data.employee?.department} />
        <DetailRow label="Father's Name" value={data.employee?.father_name} />
        <DetailRow label="Category" value={data.employee?.category} />
        <View style={styles.employeeDetailsRow}>
          <Text style={styles.employeeDetailsLabel}>Working Days</Text>
          <Text style={styles.employeeDetailsValue}>{String(data.employee?.working_days ?? 0)}</Text>
        </View>
        <DetailRow label="Account No" value={data.employee?.account_no} mono />
        <DetailRow label="Bank" value={data.employee?.bank_name} />
        <DetailRow label="IFSC" value={data.employee?.ifsc_code} mono />
        <DetailRow label="ESIC No" value={data.employee?.esic_no} mono />
        <DetailRow label="UAN No" value={data.employee?.uan_no} mono />
      </View>

      <View style={styles.salaryTable}>
        <View style={[styles.salaryTableRow, styles.salaryTableHeader]}>
          <View style={styles.earningsColumn}>
            <Text style={styles.tableHeaderText}>EARNINGS</Text>
          </View>
          <View style={styles.deductionsColumn}>
            <Text style={styles.tableHeaderText}>DEDUCTIONS</Text>
          </View>
        </View>

        <View style={styles.salaryTableRow}>
          <View style={styles.earningsColumn}>
            {earningItems.map((item) => (
              <LineItem key={item.label} label={item.label} value={item.value} />
            ))}
          </View>
          <View style={styles.deductionsColumn}>
            {deductionItems.length === 0 ? (
              <Text style={styles.lineEmpty}>No deductions</Text>
            ) : (
              deductionItems.map((item) => <LineItem key={item.label} label={item.label} value={item.value} />)
            )}
          </View>
        </View>

        <View style={[styles.salaryTableRow, { backgroundColor: BRAND.colors.tableHeaderBg }]}>
          <View style={styles.earningsColumn}>
            <LineItem label="Gross Earning" value={earnings.gross_earning || 0} bold />
          </View>
          <View style={styles.deductionsColumn}>
            <LineItem label="Gross Deduction" value={deductions.gross_deduction || 0} bold />
          </View>
        </View>
      </View>

      <View style={styles.netPaySection}>
        <Text style={styles.netPayLabel}>Net Pay (Take Home)</Text>
        <Text style={styles.netPayValue}>{formatMoney(data.net_pay || 0)}</Text>
      </View>

      <PdfFooter rightNote="This is a computer-generated salary slip" />
    </BrandPage>
  )
}

const SalarySlipPDF = ({ data }: SalarySlipPDFProps): JSX.Element => {
  return (
    <Document
      title={`Salary Slip - ${data.employee.name} - ${data.month}`}
      author={BRAND.name}
      subject="Salary Slip"
      keywords="Tulsyan Security Services, Salary, Payslip"
    >
      <SalarySlipPDFPage data={data} />
    </Document>
  )
}

export default SalarySlipPDF
