import { Document, StyleSheet, Text, View } from "@react-pdf/renderer"
import type { Company } from "@/types/company"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"

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

interface CompanyViewPDFProps {
  company: Company
}

const CompanyViewPDF = ({ company }: CompanyViewPDFProps) => {
  const currentDate = new Date().toLocaleDateString()

  // Get enabled salary template fields for display
  const getEnabledFields = () => {
    // salaryTemplates is an array, so get the first template
    const template = Array.isArray(company.salaryTemplates) ? company.salaryTemplates[0] : company.salaryTemplates
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
      title={`${company.name} - Company Profile`}
      author={BRAND.name}
      subject="Company Profile"
      keywords="Tulsyan Security Solutions, Company, Profile"
    >
      <BrandPage>
        <PdfHeader title={company.name} subtitle="Company Profile" tag={company.status || "ACTIVE"} logoSrc="/tss-logo.png" />

        <Section title="Basic Information">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Company Name:</Text>
            <Text style={brandStyles.value}>{company.name}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Address:</Text>
            <Text style={brandStyles.value}>{company.address}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Status:</Text>
            <Text style={brandStyles.value}>{company.status || "ACTIVE"}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Onboarding Date:</Text>
            <Text style={brandStyles.value}>{company.companyOnboardingDate || "Not specified"}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Company ID:</Text>
            <Text style={brandStyles.value}>{company.id}</Text>
          </View>
        </Section>

        <Section title="Contact Information">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Contact Person:</Text>
            <Text style={brandStyles.value}>{company.contactPersonName}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Contact Number:</Text>
            <Text style={brandStyles.value}>{company.contactPersonNumber}</Text>
          </View>
        </Section>

        {enabledFields.length > 0 && (
          <Section title="Salary Template Configuration">
            <View style={brandStyles.table}>
              <View style={[brandStyles.tableRow, brandStyles.tableHeader]}>
                <Text style={[brandStyles.tableHeaderCell, { width: "40%" }]}>Field Name</Text>
                <Text style={[brandStyles.tableHeaderCell, { width: "20%" }]}>Type</Text>
                <Text style={[brandStyles.tableHeaderCell, { width: "20%" }]}>Purpose</Text>
                <Text style={[brandStyles.tableHeaderCell, { width: "20%" }]}>Default Value</Text>
              </View>
              {enabledFields.map((field) => (
                <View key={field.key} style={brandStyles.tableRow}>
                  <Text style={[brandStyles.tableCell, { width: "40%" }]}>{field.label}</Text>
                  <Text style={[brandStyles.tableCell, { width: "20%" }]}>{field.type}</Text>
                  <Text style={[brandStyles.tableCell, { width: "20%" }]}>{field.purpose}</Text>
                  <Text style={[brandStyles.tableCell, { width: "20%" }]}>
                    {field.defaultValue || field.rules?.defaultValue || "Not specified"}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        <PdfFooter rightNote="This is a computer-generated document" />
      </BrandPage>
    </Document>
  )
}

export default CompanyViewPDF
