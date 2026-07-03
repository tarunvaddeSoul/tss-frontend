import type React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { Client } from "@/types/client"
import { label, formatDate } from "@/lib/labels"

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  tableCell: {
    fontSize: 10,
    color: "#555555",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
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
  const currentDate = formatDate(new Date())

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
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{client.name}</Text>
            <Text style={styles.subtitle}>Client Profile</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={client.status === "ACTIVE" ? styles.badge : { ...styles.badge, ...styles.inactiveBadge }}>
              <Text>{label.status(client.status)}</Text>
            </View>
            <Text style={{ fontSize: 10, marginTop: 5 }}>ID: {client.id}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Client Name:</Text>
            <Text style={styles.value}>{client.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{client.address}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{label.status(client.status)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Onboarding Date:</Text>
            <Text style={styles.value}>{formatDate(client.clientOnboardingDate)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Contact Person:</Text>
            <Text style={styles.value}>{client.contactPersonName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Contact Number:</Text>
            <Text style={styles.value}>{client.contactPersonNumber}</Text>
          </View>
        </View>

        {enabledFields.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salary Template Configuration</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableHeaderCell, { width: "40%" }]}>Field Name</Text>
                <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Type</Text>
                <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Purpose</Text>
                <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Default Value</Text>
              </View>
              {enabledFields.map((field) => (
                <View key={field.key} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: "40%" }]}>{field.label}</Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>{field.type}</Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>{field.purpose}</Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>
                    {field.defaultValue || field.rules?.defaultValue || "Not specified"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          Generated on {currentDate} | This is a computer-generated document, no signature is required.
        </Text>
      </Page>
    </Document>
  )
}

export default ClientViewPDF
