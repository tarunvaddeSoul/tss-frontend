import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { SalaryTemplateConfig } from "@/types/company"
import { SalaryFieldPurpose, SalaryFieldType } from "@/types/company"

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#D12702",
    paddingBottom: 15,
    textAlign: "center",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D12702",
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
  },
  section: {
    marginBottom: 15,
    backgroundColor: "#fafafa",
    padding: 10,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#D12702",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
    paddingBottom: 3,
  },
  label: {
    width: "60%",
    fontSize: 11,
    fontWeight: "bold",
    color: "#555555",
  },
  value: {
    width: "40%",
    fontSize: 11,
    color: "#333333",
    textAlign: "right",
  },
  totalSection: {
    marginTop: 20,
    backgroundColor: "#f0f9ff",
    padding: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D12702",
  },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#D12702",
  },
  totalLabel: {
    width: "60%",
    fontSize: 14,
    fontWeight: "bold",
    color: "#D12702",
  },
  totalValue: {
    width: "40%",
    fontSize: 14,
    fontWeight: "bold",
    color: "#D12702",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 9,
    color: "#999999",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
  },
  summarySection: {
    marginTop: 15,
    backgroundColor: "#ffffff",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingVertical: 2,
  },
  summaryLabel: {
    width: "70%",
    fontSize: 10,
    color: "#666666",
  },
  summaryValue: {
    width: "30%",
    fontSize: 10,
    color: "#333333",
    textAlign: "right",
  },
})

interface SalarySlipPDFProps {
  config: SalaryTemplateConfig
  employeeName: string
  month: string
  year: string
}

const SalarySlipPDF = ({ config, employeeName, month, year }: SalarySlipPDFProps) => {
  const currentDate = new Date().toLocaleDateString()

  // Helper to get enabled fields by purpose
  const getEnabledFieldsByPurpose = (purpose: SalaryFieldPurpose) => {
    const mandatoryFields = config.mandatoryFields.filter((field) => field.enabled && field.purpose === purpose)
    const optionalFields = config.optionalFields.filter((field) => field.enabled && field.purpose === purpose)
    const customFields = config.customFields?.filter((field) => field.enabled && field.purpose === purpose) || []
    return [...mandatoryFields, ...optionalFields, ...customFields]
  }

  // Get field value with better formatting
  const getFieldValue = (field: any) => {
    if (field.key === "employeeName") return employeeName
    if (field.key === "month") return month
    if (field.key === "year") return year
    if (field.key === "basicDuty") return `${field.defaultValue || "30"} days`

    if (field.type === SalaryFieldType.NUMBER) {
      const value = field.rules?.defaultValue || field.defaultValue || 0
      return `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    }

    if (field.type === SalaryFieldType.SELECT) {
      return field.defaultValue || "-"
    }

    return field.defaultValue || "N/A"
  }

  // Get numeric value for calculations
  const getNumericValue = (field: any) => {
    if (field.type === SalaryFieldType.NUMBER) {
      return Number(field.rules?.defaultValue || field.defaultValue || 0)
    }
    return 0
  }

  // Get fields by purpose
  const informationFields = getEnabledFieldsByPurpose(SalaryFieldPurpose.INFORMATION)
  const allowanceFields = getEnabledFieldsByPurpose(SalaryFieldPurpose.ALLOWANCE)
  const deductionFields = getEnabledFieldsByPurpose(SalaryFieldPurpose.DEDUCTION)
  const calculationFields = getEnabledFieldsByPurpose(SalaryFieldPurpose.CALCULATION)

  // Calculate totals
  const totalAllowances = allowanceFields.reduce((sum, field) => sum + getNumericValue(field), 0)
  const totalDeductions = deductionFields.reduce((sum, field) => sum + getNumericValue(field), 0)

  // Find basic salary or use first calculation field
  const basicSalaryField =
    calculationFields.find((field) => field.key === "basicSalary" || field.key === "basic") || calculationFields[0]

  const basicSalary = basicSalaryField ? getNumericValue(basicSalaryField) : 0
  const grossSalary = basicSalary + totalAllowances
  const netSalary = grossSalary - totalDeductions

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>Tulsyan Security Solutions</Text>
          <Text style={styles.title}>Salary Slip</Text>
          <Text style={styles.subtitle}>
            For the month of {month} {year}
          </Text>
        </View>

        {/* Employee Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Employee Name:</Text>
            <Text style={styles.value}>{employeeName}</Text>
          </View>

          {informationFields.map((field) => (
            <View style={styles.row} key={field.key}>
              <Text style={styles.label}>{field.label}:</Text>
              <Text style={styles.value}>{getFieldValue(field)}</Text>
            </View>
          ))}
        </View>

        {/* Salary Calculation */}
        {calculationFields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salary Calculation</Text>
            {calculationFields.map((field) => (
              <View style={styles.row} key={field.key}>
                <Text style={styles.label}>{field.label}:</Text>
                <Text style={styles.value}>{getFieldValue(field)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Allowances */}
        {allowanceFields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allowances</Text>
            {allowanceFields.map((field) => (
              <View style={styles.row} key={field.key}>
                <Text style={styles.label}>{field.label}:</Text>
                <Text style={styles.value}>{getFieldValue(field)}</Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={styles.label}>Total Allowances:</Text>
              <Text style={styles.value}>₹{totalAllowances.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>
        )}

        {/* Deductions */}
        {deductionFields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deductions</Text>
            {deductionFields.map((field) => (
              <View style={styles.row} key={field.key}>
                <Text style={styles.label}>{field.label}:</Text>
                <Text style={styles.value}>{getFieldValue(field)}</Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={styles.label}>Total Deductions:</Text>
              <Text style={styles.value}>₹{totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Salary Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Basic Salary:</Text>
            <Text style={styles.summaryValue}>
              ₹{basicSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Allowances:</Text>
            <Text style={styles.summaryValue}>
              ₹{totalAllowances.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gross Salary:</Text>
            <Text style={styles.summaryValue}>
              ₹{grossSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Deductions:</Text>
            <Text style={styles.summaryValue}>
              ₹{totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Net Salary */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Net Salary:</Text>
            <Text style={styles.totalValue}>₹{netSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Generated on {currentDate} | Tulsyan Security Solutions</Text>
          <Text>This is a computer-generated salary slip and does not require a signature.</Text>
        </View>
      </Page>
    </Document>
  )
}

export default SalarySlipPDF
