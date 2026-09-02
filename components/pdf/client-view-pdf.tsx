import { Document, Text, View } from "@react-pdf/renderer"
import type { Client, SalaryTemplateField } from "@/types/client"
import { displayValue, formatDate, humanize, label } from "@/lib/labels"
import { BRAND, BrandPage, PdfFooter, PdfHeader, Section, brandStyles } from "@/components/pdf/brand"

interface ClientViewPDFProps {
  client: Client
}

const PURPOSE_ORDER = ["INFORMATION", "CALCULATION", "ALLOWANCE", "DEDUCTION"]
const COL = { field: "40%", purpose: "22%", type: "18%", input: "20%" }

const getEnabledFields = (client: Client): SalaryTemplateField[] => {
  const templates = client.salaryTemplates as unknown
  const template = Array.isArray(templates) ? templates[0] : templates
  if (!template || typeof template !== "object") return []
  const config = template as Partial<Record<"mandatoryFields" | "optionalFields" | "customFields", SalaryTemplateField[]>>

  return [...(config.mandatoryFields || []), ...(config.optionalFields || []), ...(config.customFields || [])]
    .filter((field) => field.enabled)
    .sort((a, b) => PURPOSE_ORDER.indexOf(String(a.purpose)) - PURPOSE_ORDER.indexOf(String(b.purpose)))
}

const ClientViewPDF = ({ client }: ClientViewPDFProps): JSX.Element => {
  const enabledFields = getEnabledFields(client)

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
            <Text style={[brandStyles.value, { textAlign: "left" }]}>{displayValue(client.address)}</Text>
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
            <Text style={[brandStyles.value, { textAlign: "left", fontFamily: "IBMPlexMono", fontSize: 8.5 }]}>{client.id}</Text>
          </View>
        </Section>

        <Section title="Contact Information">
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Contact Person:</Text>
            <Text style={[brandStyles.value, { textAlign: "left" }]}>{displayValue(client.contactPersonName)}</Text>
          </View>
          <View style={brandStyles.row}>
            <Text style={brandStyles.label}>Contact Number:</Text>
            <Text style={[brandStyles.value, { fontFamily: "IBMPlexMono", fontSize: 9 }]}>{displayValue(client.contactPersonNumber)}</Text>
          </View>
        </Section>

        <Section title="Salary Template">
          {enabledFields.length === 0 ? (
            <Text style={{ fontSize: 9, color: BRAND.colors.muted }}>No salary template fields are enabled for this client.</Text>
          ) : (
            <View style={[brandStyles.table, { marginTop: 0 }]}>
              <View style={[brandStyles.tableRow, brandStyles.tableHeader]} fixed>
                <Text style={[brandStyles.tableHeaderCell, { width: COL.field }]}>Field</Text>
                <Text style={[brandStyles.tableHeaderCell, { width: COL.purpose }]}>Purpose</Text>
                <Text style={[brandStyles.tableHeaderCell, { width: COL.type }]}>Type</Text>
                <Text style={[brandStyles.tableHeaderCell, { width: COL.input }]}>Filled By</Text>
              </View>
              {enabledFields.map((field) => (
                <View key={field.key} style={brandStyles.tableRow} wrap={false}>
                  <Text style={[brandStyles.tableCell, { width: COL.field }]}>{field.label || humanize(field.key)}</Text>
                  <Text style={[brandStyles.tableCell, { width: COL.purpose }]}>{humanize(String(field.purpose))}</Text>
                  <Text style={[brandStyles.tableCell, { width: COL.type }]}>{humanize(String(field.type))}</Text>
                  <Text style={[brandStyles.tableCell, { width: COL.input }]}>{field.requiresAdminInput ? "Admin each month" : "System"}</Text>
                </View>
              ))}
            </View>
          )}
        </Section>

        <PdfFooter rightNote="This is a computer-generated document" />
      </BrandPage>
    </Document>
  )
}

export default ClientViewPDF
