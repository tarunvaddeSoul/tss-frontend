import { Document, Text, View, StyleSheet } from "@react-pdf/renderer"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"
import type { SalaryTemplateConfig } from "@/types/company"
import { SalaryFieldPurpose, SalaryFieldType } from "@/types/company"

// Additional local styles that build on the brand system
const styles = StyleSheet.create({
  totalSection: {
    marginTop: 16,
    backgroundColor: "#fff7ed",
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BRAND.colors.primary,
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
    <Document
      title={`Salary Slip - ${employeeName} - ${month} ${year}`}
      author={BRAND.name}
      subject="Salary Slip"
      keywords="Tulsyan Security Solutions, Salary, Payslip"
    >
      <BrandPage>
        <PdfHeader title="Salary Slip" subtitle={`For the month of ${month} ${year}`} />

        <Section title="Employee Information">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Employee Name:</Text>
            <Text style={brandStyles.value}>{employeeName}</Text>
          </View>
          {informationFields.map((field) => (
            <View style={brandStyles.row} key={field.key}>
              <Text style={brandStyles.label}>{field.label}:</Text>
              <Text style={brandStyles.value}>{getFieldValue(field)}</Text>
            </View>
          ))}
        </Section>

        {calculationFields.length > 0 && (
          <Section title="Salary Calculation">
            {calculationFields.map((field) => (
              <View style={brandStyles.row} key={field.key}>
                <Text style={brandStyles.label}>{field.label}:</Text>
                <Text style={brandStyles.value}>{getFieldValue(field)}</Text>
              </View>
            ))}
          </Section>
        )}

        {allowanceFields.length > 0 && (
          <Section title="Allowances">
            {allowanceFields.map((field) => (
              <View style={brandStyles.row} key={field.key}>
                <Text style={brandStyles.label}>{field.label}:</Text>
                <Text style={brandStyles.value}>{getFieldValue(field)}</Text>
              </View>
            ))}
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Total Allowances:</Text>
              <Text style={brandStyles.value}>₹{totalAllowances.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
            </View>
          </Section>
        )}

        {deductionFields.length > 0 && (
          <Section title="Deductions">
            {deductionFields.map((field) => (
              <View style={brandStyles.row} key={field.key}>
                <Text style={brandStyles.label}>{field.label}:</Text>
                <Text style={brandStyles.value}>{getFieldValue(field)}</Text>
              </View>
            ))}
            <View style={brandStyles.row}>
              <Text style={brandStyles.label}>Total Deductions:</Text>
              <Text style={brandStyles.value}>₹{totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
            </View>
          </Section>
        )}

        <Section title="Salary Summary">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Basic Salary:</Text>
            <Text style={brandStyles.value}>₹{basicSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Allowances:</Text>
            <Text style={brandStyles.value}>₹{totalAllowances.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Gross Salary:</Text>
            <Text style={brandStyles.value}>₹{grossSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Total Deductions:</Text>
            <Text style={brandStyles.value}>₹{totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          </View>
        </Section>

        <View style={styles.totalSection}>
          <View style={brandStyles.row}>
            <Text style={[brandStyles.label, { color: BRAND.colors.primary }]}>Net Salary:</Text>
            <Text style={[brandStyles.value, { color: BRAND.colors.primary, fontWeight: "bold" }]}>₹{netSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        <PdfFooter rightNote="This is a computer-generated salary slip" />
      </BrandPage>
    </Document>
  )
}

export default SalarySlipPDF
