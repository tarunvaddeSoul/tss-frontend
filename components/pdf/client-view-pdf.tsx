import { Document, StyleSheet, Text, View } from "@react-pdf/renderer"
import type { Client } from "@/types/client"
import { label, formatDate } from "@/lib/labels"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"
import { SalarySlipPDFPage, type SalarySlipData } from "@/components/pdf/salary-slip-pdf"

// Local styles (use brandStyles for most)
const styles = StyleSheet.create({
  badge: {
    fontSize: 10,
    color: "#ffffff",
    backgroundColor: "#22c55e",
    padding: 4,
    borderRadius: 4,
    textAlign: "center",
    width: 60,
  },
  inactiveBadge: {
    backgroundColor: "#6b7280",
  },
})

interface ClientViewPDFProps {
  client: Client
}

const ClientViewPDF = ({ client }: ClientViewPDFProps) => {
  const currentDate = new Date().toLocaleDateString()

  // Get enabled salary template fields for display
  const getEnabledFields = () => {
    // salaryTemplates is an array, so get the first template
    const template = Array.isArray(client.salaryTemplates) ? client.salaryTemplates[0] : client.salaryTemplates
    if (!template) return []

    return [
      ...(template.mandatoryFields || []),
      ...(template.optionalFields || []),
      ...(template.customFields || []),
    ].filter((field) => field.enabled)
  }

  const enabledFields = getEnabledFields()

  return (
    <Document
      title={`${client.name} - Client Profile`}
      author={BRAND.name}
      subject="Client Profile"
      keywords="Tulsyan Security Services, Client, Profile"
    >
      <BrandPage>
        <PdfHeader title={client.name} subtitle="Client Profile" tag={label.status(client.status)} logoSrc="/tss-logo.png" />

        <Section title="Basic Information">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Client Name:</Text>
            <Text style={brandStyles.value}>{client.name}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Address:</Text>
            <Text style={[brandStyles.value, { textAlign: "left" }]}>{client.address || "-"}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Status:</Text>
            <Text style={brandStyles.value}>{label.status(client.status)}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Onboarding Date:</Text>
            <Text style={brandStyles.value}>{formatDate(client.clientOnboardingDate)}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Client ID:</Text>
            <Text style={[brandStyles.value, { textAlign: "left" }]}>{client.id}</Text>
          </View>
        </Section>

        <Section title="Contact Information">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Contact Person:</Text>
            <Text style={[brandStyles.value, { textAlign: "left" }]}>{client.contactPersonName || "-"}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Contact Number:</Text>
            <Text style={brandStyles.value}>{client.contactPersonNumber || "-"}</Text>
          </View>
        </Section>

        <PdfFooter rightNote="This is a computer-generated document" />
      </BrandPage>

      {/* Page 2: Sample Salary Slip in New Format */}
      {enabledFields.length > 0 && (() => {
        // Create sample salary slip data
        const getNumericValue = (field: any) => {
          if (field.type === "NUMBER") {
            return Number(field.rules?.defaultValue || field.defaultValue || 0)
          }
          return 0
        }

        const calculationFields = enabledFields.filter((f) => f.purpose === "CALCULATION")
        const allowanceFields = enabledFields.filter((f) => f.purpose === "ALLOWANCE")
        const deductionFields = enabledFields.filter((f) => f.purpose === "DEDUCTION")

        const basicField = calculationFields.find((f) => f.key === "basic" || f.key === "basicSalary" || f.key === "basicPay")
        const basic = basicField ? getNumericValue(basicField) : 15000
        const allowance = allowanceFields.reduce((sum, field) => sum + getNumericValue(field), 0)
        const grossEarning = basic + allowance

        const epfContribution = deductionFields
          .filter((f) => f.key === "pf" || f.key === "epfContribution12Percent")
          .reduce((sum, field) => sum + getNumericValue(field), 0)
        const esicContribution = deductionFields
          .filter((f) => f.key === "esic" || f.key === "esic075Percent")
          .reduce((sum, field) => sum + getNumericValue(field), 0)
        const advance = deductionFields
          .filter((f) => f.key === "advance")
          .reduce((sum, field) => sum + getNumericValue(field), 0)
        const grossDeduction = epfContribution + esicContribution + advance
        const netPay = grossEarning - grossDeduction

        const currentDate = new Date()
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const month = `${monthNames[currentDate.getMonth()]}-${currentDate.getFullYear().toString().slice(-2)}`
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
        const monthNum = String(currentDate.getMonth() + 1).padStart(2, "0")
        const payPeriod = `01-${monthNum}-${currentDate.getFullYear()} to ${String(lastDay).padStart(2, "0")}-${monthNum}-${currentDate.getFullYear()}`

        const sampleSalarySlipData: SalarySlipData = {
          client: client.name,
          month,
          pay_period: payPeriod,
          employee: {
            name: "SAMPLE (template preview only)",
            employee_id: "SAMPLE",
            category: "Sample",
            department: "Sample Department",
            location: "Sample Location",
            working_days: 27,
            account_no: "",
            esic_no: "",
            uan_no: "",
          },
          earnings: {
            basic,
            allowance,
            other_allowance: 0,
            other: 0,
            gross_earning: grossEarning,
          },
          deductions: {
            epf_contribution_12_percent: epfContribution,
            esic_0_75_percent: esicContribution,
            advance,
            gross_deduction: grossDeduction,
          },
          net_pay: netPay,
        }

        return <SalarySlipPDFPage key="sample" data={sampleSalarySlipData} />
      })()}
    </Document>
  )
}

export default ClientViewPDF
