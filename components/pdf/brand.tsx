import type { PropsWithChildren, ReactNode } from "react"
import { Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

// Register brand fonts (served from Next public folder) - safely
try {
  Font.register({
    family: "Roboto",
    fonts: [
      { src: "/fonts/Roboto-Regular.ttf", fontWeight: "normal" },
      { src: "/fonts/Roboto-Bold.ttf", fontWeight: "bold" },
    ],
  })
} catch (e) {
  // Fallback will be used by renderer if registration fails
}

export const BRAND = {
  name: "Tulsyan Security Services Pvt. Ltd.",
  tagline: "Professional Security Services",
  colors: {
    primary: "#D12702",
    text: "#1f2937",
    muted: "#6b7280",
    border: "#e5e7eb",
    softBg: "#fafafa",
    tableHeaderBg: "#f9fafb",
  },
}

export const brandStyles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Roboto",
  },
  header: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: BRAND.colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND.colors.primary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND.colors.text,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    color: BRAND.colors.muted,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  tag: {
    fontSize: 9,
    color: "#ffffff",
    backgroundColor: BRAND.colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  section: {
    marginBottom: 14,
    backgroundColor: BRAND.colors.softBg,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BRAND.colors.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: BRAND.colors.primary,
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: "55%",
    fontSize: 10,
    fontWeight: "bold",
    color: "#4b5563",
  },
  value: {
    width: "45%",
    fontSize: 10,
    color: BRAND.colors.text,
    textAlign: "right",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    marginTop: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
  },
  tableHeader: {
    backgroundColor: BRAND.colors.tableHeaderBg,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: BRAND.colors.text,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: BRAND.colors.border,
  },
  tableCell: {
    fontSize: 9,
    color: BRAND.colors.muted,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: BRAND.colors.border,
  },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 9,
    color: BRAND.colors.muted,
    borderTopWidth: 1,
    borderTopColor: BRAND.colors.border,
    paddingTop: 8,
  },
})

export function PdfHeader({ title, subtitle, tag, logoSrc = "/tss-logo.png" }: { title: string; subtitle?: string; tag?: string; logoSrc?: string }) {
  return (
    <View style={brandStyles.header}>
      <View style={brandStyles.headerLeft}>
        <View style={brandStyles.headerBrandRow}>
          {logoSrc ? <Image src={logoSrc} style={brandStyles.logo} /> : null}
          <Text style={brandStyles.brandName}>{BRAND.name}</Text>
        </View>
        <Text style={brandStyles.headerTitle}>{title}</Text>
        <Text style={brandStyles.headerSubtitle}>{subtitle || BRAND.tagline}</Text>
      </View>
      {!!tag && (
        <View style={brandStyles.headerRight}>
          <Text style={brandStyles.tag}>{tag}</Text>
        </View>
      )}
    </View>
  )
}

export function PdfFooter({ rightNote }: { rightNote?: string }) {
  const generated = `Generated on ${new Date().toLocaleDateString()}`
  return (
    <Text
      style={brandStyles.footer}
      render={({ pageNumber, totalPages }) =>
        `${generated} | ${rightNote || BRAND.name} • Page ${pageNumber} of ${totalPages}`
      }
      fixed
    />
  )
}

// Formatting helpers
export function formatCurrencyINR(amount: number, withSymbol: boolean = true) {
  const formatted = amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })
  return withSymbol ? `₹${formatted}` : formatted
}

export function formatDate(date: string | number | Date) {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date
  return d.toLocaleDateString("en-IN")
}

// Convenience container to get a brand-styled page
export function BrandPage(props: PropsWithChildren<{ size?: "A4" | "A3" | "LETTER"; orientation?: "portrait" | "landscape" }>) {
  const { children, size = "A4", orientation = "portrait" } = props
  // Consumers still add PdfHeader and PdfFooter per page as needed
  return (
    <Page size={size} orientation={orientation} style={brandStyles.page}>
      {children}
    </Page>
  )
}

// Small building blocks
export function Section(props: PropsWithChildren<{ title?: string }>) {
  return (
    <View style={brandStyles.section}>
      {props.title ? <Text style={brandStyles.sectionTitle}>{props.title}</Text> : null}
      {props.children}
    </View>
  )
}

export function Row({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <View style={brandStyles.row}>
      <Text style={brandStyles.label}>{label as any}</Text>
      <Text style={brandStyles.value}>{value as any}</Text>
    </View>
  )
}


