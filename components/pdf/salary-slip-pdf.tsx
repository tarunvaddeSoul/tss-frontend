import { Document, Text, View, StyleSheet } from "@react-pdf/renderer"
import { BRAND, BrandPage, PdfFooter, PdfHeader, brandStyles } from "@/components/pdf/brand"

// Salary slip data structure based on the provided JSON
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
  }
  earnings: {
    basic: number
    allowance: number
    other_allowance: number
    other: number
    gross_earning: number
  }
  deductions: {
    epf_contribution_12_percent: number
    esic_0_75_percent: number
    advance: number
    gross_deduction: number
  }
  net_pay: number
}

const styles = StyleSheet.create({
  employeeDetails: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: BRAND.colors.softBg,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BRAND.colors.border,
  },
  employeeDetailsRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  employeeDetailsLabel: {
    width: "40%",
    fontSize: 9,
    fontWeight: "bold",
    color: BRAND.colors.muted,
  },
  employeeDetailsValue: {
    width: "60%",
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
  tableCellLabel: {
    fontSize: 9,
    color: BRAND.colors.muted,
    marginBottom: 4,
  },
  tableCellValue: {
    fontSize: 10,
    color: BRAND.colors.text,
    fontWeight: "normal",
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: "bold",
    color: BRAND.colors.text,
    textAlign: "center",
  },
  netPaySection: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: BRAND.colors.softBg,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netPayLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: BRAND.colors.text,
  },
  netPayValue: {
    fontSize: 13,
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
    fontSize: 10,
    color: BRAND.colors.text,
    textAlign: "right",
  },
  lineBold: {
    fontWeight: "bold",
    color: BRAND.colors.text,
  },
})

const rupees = (value: number): string =>
  `₹${(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`

const LineItem = ({ label, value, bold = false }: { label: string; value: number; bold?: boolean }) => (
  <View style={styles.lineItem}>
    <Text style={[styles.lineLabel, ...(bold ? [styles.lineBold] : [])]}>{label}</Text>
    <Text style={[styles.lineValue, ...(bold ? [styles.lineBold] : [])]}>{rupees(value)}</Text>
  </View>
)

interface SalarySlipPDFProps {
  data: SalarySlipData
}

// Core component that renders just the page (for embedding in other documents)
export const SalarySlipPDFPage = ({ data }: SalarySlipPDFProps) => {
  const earningItems: { label: string; value: number }[] = [
    { label: "Basic", value: data.earnings?.basic || 0 },
    { label: "Allowance", value: data.earnings?.allowance || 0 },
    ...((data.earnings?.other_allowance || 0) > 0
      ? [{ label: "Other Allowance", value: data.earnings.other_allowance }]
      : []),
    ...((data.earnings?.other || 0) > 0 ? [{ label: "Other", value: data.earnings.other }] : []),
  ]
  const deductionItems: { label: string; value: number }[] = [
    { label: "EPF Contribution (12%)", value: data.deductions?.epf_contribution_12_percent || 0 },
    { label: "ESIC (0.75%)", value: data.deductions?.esic_0_75_percent || 0 },
    ...((data.deductions?.advance || 0) > 0 ? [{ label: "Advance", value: data.deductions.advance }] : []),
  ]

  return (
    <BrandPage>
      {/* Brand Header */}
      <PdfHeader
        title="Salary Slip"
        subtitle={`${data.month || "N/A"} | Pay Period: ${data.pay_period || "N/A"}`}
        logoSrc="/tss-logo.png"
      />

      {/* Employee Details */}
      <View style={styles.employeeDetails}>
        <View style={styles.employeeDetailsRow}>
          <Text style={styles.employeeDetailsLabel}>Employee Name:</Text>
          <Text style={styles.employeeDetailsValue}>{data.employee?.name || "N/A"}</Text>
        </View>
        <View style={styles.employeeDetailsRow}>
          <Text style={styles.employeeDetailsLabel}>Employee ID:</Text>
          <Text style={styles.employeeDetailsValue}>{data.employee?.employee_id || "N/A"}</Text>
        </View>
        <View style={styles.employeeDetailsRow}>
          <Text style={styles.employeeDetailsLabel}>Category:</Text>
          <Text style={styles.employeeDetailsValue}>{data.employee?.category || "N/A"}</Text>
        </View>
        <View style={styles.employeeDetailsRow}>
          <Text style={styles.employeeDetailsLabel}>Working Days:</Text>
          <Text style={styles.employeeDetailsValue}>{String(data.employee?.working_days ?? 0)}</Text>
        </View>
        {data.employee.account_no && data.employee.account_no.trim() !== "" && (
          <View style={styles.employeeDetailsRow}>
            <Text style={styles.employeeDetailsLabel}>Account No:</Text>
            <Text style={styles.employeeDetailsValue}>{data.employee.account_no}</Text>
          </View>
        )}
        {data.employee.esic_no && data.employee.esic_no.trim() !== "" && (
          <View style={styles.employeeDetailsRow}>
            <Text style={styles.employeeDetailsLabel}>ESIC No:</Text>
            <Text style={styles.employeeDetailsValue}>{data.employee.esic_no}</Text>
          </View>
        )}
        {data.employee.uan_no && data.employee.uan_no.trim() !== "" && (
          <View style={styles.employeeDetailsRow}>
            <Text style={styles.employeeDetailsLabel}>UAN No:</Text>
            <Text style={styles.employeeDetailsValue}>{data.employee.uan_no}</Text>
          </View>
        )}
      </View>

      {/* Salary Table - Earnings on Left, Deductions on Right */}
      <View style={styles.salaryTable}>
        {/* Header Row */}
        <View style={[styles.salaryTableRow, styles.salaryTableHeader]}>
          <View style={styles.earningsColumn}>
            <Text style={styles.tableHeaderText}>EARNINGS</Text>
          </View>
          <View style={styles.deductionsColumn}>
            <Text style={styles.tableHeaderText}>DEDUCTIONS</Text>
          </View>
        </View>

        {/* Line items: each column is its own aligned list (label left, amount right) */}
        <View style={styles.salaryTableRow}>
          <View style={styles.earningsColumn}>
            {earningItems.map((item, i) => (
              <LineItem key={i} label={item.label} value={item.value} />
            ))}
          </View>
          <View style={styles.deductionsColumn}>
            {deductionItems.map((item, i) => (
              <LineItem key={i} label={item.label} value={item.value} />
            ))}
          </View>
        </View>

        {/* Totals Row */}
        <View style={[styles.salaryTableRow, { backgroundColor: BRAND.colors.tableHeaderBg }]}>
          <View style={styles.earningsColumn}>
            <LineItem label="Gross Earning" value={data.earnings?.gross_earning || 0} bold />
          </View>
          <View style={styles.deductionsColumn}>
            <LineItem label="Gross Deduction" value={data.deductions?.gross_deduction || 0} bold />
          </View>
        </View>
      </View>

      {/* Net Pay Section */}
      <View style={styles.netPaySection}>
        <Text style={styles.netPayLabel}>Net Pay (Take Home)</Text>
        <Text style={styles.netPayValue}>
          ₹{((data.net_pay || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </Text>
      </View>

      <PdfFooter rightNote="This is a computer-generated salary slip" />
    </BrandPage>
  )
}

// Standalone component with Document wrapper (for individual use)
const SalarySlipPDF = ({ data }: SalarySlipPDFProps) => {
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
