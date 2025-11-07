import { Document, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { BRAND, BrandPage, PdfFooter, brandStyles } from "@/components/pdf/brand"

// Salary slip data structure based on the provided JSON
export interface SalarySlipData {
  company: string
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
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND.colors.primary,
    marginBottom: 5,
    textAlign: "center",
  },
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
    marginTop: 15,
    padding: 15,
    backgroundColor: "#fff7ed",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: BRAND.colors.primary,
    alignItems: "center",
  },
  netPayLabel: {
    fontSize: 11,
    color: BRAND.colors.muted,
    marginBottom: 5,
  },
  netPayValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: BRAND.colors.primary,
  },
  periodInfo: {
    fontSize: 9,
    color: BRAND.colors.muted,
    textAlign: "center",
    marginBottom: 15,
  },
})

interface SalarySlipPDFProps {
  data: SalarySlipData
}

// Core component that renders just the page (for embedding in other documents)
export const SalarySlipPDFPage = ({ data }: SalarySlipPDFProps) => {
  return (
    <BrandPage>
      {/* Header with Branding */}
      <View style={styles.header}>
        <Image src="/tss-logo.png" style={styles.logo} cache={false} />
        <Text style={styles.companyName}>{data.company || "TULSYAN SECURITY SERVICES PVT. LTD."}</Text>
        <Text style={styles.periodInfo}>
          Salary Slip for {data.month || "N/A"} | Pay Period: {data.pay_period || "N/A"}
        </Text>
      </View>

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
          <Text style={styles.employeeDetailsLabel}>Department:</Text>
          <Text style={styles.employeeDetailsValue}>{data.employee?.department || "N/A"}</Text>
        </View>
        <View style={styles.employeeDetailsRow}>
          <Text style={styles.employeeDetailsLabel}>Location:</Text>
          <Text style={styles.employeeDetailsValue}>{data.employee?.location || "N/A"}</Text>
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

        {/* Content Rows */}
        <View style={styles.salaryTableRow}>
          <View style={styles.earningsColumn}>
            <Text style={styles.tableCellLabel}>Basic</Text>
            <Text style={styles.tableCellValue}>
              ₹{((data.earnings?.basic || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.deductionsColumn}>
            <Text style={styles.tableCellLabel}>EPF Contribution (12%)</Text>
            <Text style={styles.tableCellValue}>
              ₹{((data.deductions?.epf_contribution_12_percent || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <View style={styles.salaryTableRow}>
          <View style={styles.earningsColumn}>
            <Text style={styles.tableCellLabel}>Allowance</Text>
            <Text style={styles.tableCellValue}>
              ₹{((data.earnings?.allowance || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.deductionsColumn}>
            <Text style={styles.tableCellLabel}>ESIC (0.75%)</Text>
            <Text style={styles.tableCellValue}>
              ₹{((data.deductions?.esic_0_75_percent || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {((data.earnings?.other_allowance || 0) > 0 || (data.deductions?.advance || 0) > 0) && (
          <View style={styles.salaryTableRow}>
            <View style={styles.earningsColumn}>
              {(data.earnings?.other_allowance || 0) > 0 ? (
                <View>
                  <Text style={styles.tableCellLabel}>Other Allowance</Text>
                  <Text style={styles.tableCellValue}>
                    ₹{((data.earnings?.other_allowance || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ) : (
                <Text style={styles.tableCellValue}>-</Text>
              )}
            </View>
            <View style={styles.deductionsColumn}>
              {(data.deductions?.advance || 0) > 0 ? (
                <View>
                  <Text style={styles.tableCellLabel}>Advance</Text>
                  <Text style={styles.tableCellValue}>
                    ₹{((data.deductions?.advance || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ) : (
                <Text style={styles.tableCellValue}>-</Text>
              )}
            </View>
          </View>
        )}

        {(data.earnings?.other || 0) > 0 && (
          <View style={styles.salaryTableRow}>
            <View style={styles.earningsColumn}>
              <Text style={styles.tableCellLabel}>Other</Text>
              <Text style={styles.tableCellValue}>
                ₹{((data.earnings?.other || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.deductionsColumn}>
              <Text style={styles.tableCellValue}>-</Text>
            </View>
          </View>
        )}

        {/* Totals Row */}
        <View style={[styles.salaryTableRow, { backgroundColor: BRAND.colors.tableHeaderBg }]}>
          <View style={styles.earningsColumn}>
            <Text style={[styles.tableCellLabel, { fontWeight: "bold" }]}>Gross Earning</Text>
            <Text style={[styles.tableCellValue, { fontWeight: "bold" }]}>
              ₹{((data.earnings?.gross_earning || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.deductionsColumn}>
            <Text style={[styles.tableCellLabel, { fontWeight: "bold" }]}>Gross Deduction</Text>
            <Text style={[styles.tableCellValue, { fontWeight: "bold" }]}>
              ₹{((data.deductions?.gross_deduction || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>

      {/* Net Pay Section */}
      <View style={styles.netPaySection}>
        <Text style={styles.netPayLabel}>TAKE HOME PAY</Text>
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
      keywords="Tulsyan Security Solutions, Salary, Payslip"
    >
      <SalarySlipPDFPage data={data} />
    </Document>
  )
}

export default SalarySlipPDF
