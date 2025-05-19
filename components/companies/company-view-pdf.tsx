import type React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { Company } from "@/types/company"

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: 150,
    fontSize: 12,
    fontWeight: "bold",
    color: "#555555",
  },
  value: {
    flex: 1,
    fontSize: 12,
    color: "#333333",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#999999",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
  },
})

interface CompanyViewPDFProps {
  company: Company
}

const CompanyViewPDF: React.FC<CompanyViewPDFProps> = ({ company }) => {
  const currentDate = new Date().toLocaleDateString()

  // Get enabled salary template fields for display
  const enabledSalaryFields = Object.entries(company.salaryTemplates || {})
    .filter(([_, field]) => field.enabled)
    .map(([key, field]) => ({
      key,
      value: field.value,
    }))

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{company.name}</Text>
          <Text style={styles.subtitle}>Company Details</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Company Name:</Text>
            <Text style={styles.value}>{company.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{company.address}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{company.status || "ACTIVE"}</Text>
          </View>

          {company.companyOnboardingDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Onboarding Date:</Text>
              <Text style={styles.value}>{company.companyOnboardingDate}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Contact Person:</Text>
            <Text style={styles.value}>{company.contactPersonName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Contact Number:</Text>
            <Text style={styles.value}>{company.contactPersonNumber}</Text>
          </View>
        </View>

        {enabledSalaryFields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salary Template Configuration</Text>

            {enabledSalaryFields.map((field) => (
              <View style={styles.row} key={field.key}>
                <Text style={styles.label}>{field.key}:</Text>
                <Text style={styles.value}>{field.value || "Not specified"}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text>Generated on {currentDate} | Tulsyan Security Solutions</Text>
        </View>
      </Page>
    </Document>
  )
}

export default CompanyViewPDF
