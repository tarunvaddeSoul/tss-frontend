import type { PropsWithChildren, ReactNode } from "react"
import { Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

// Register brand fonts (served from Next public folder) - safely
try {
  Font.register({
    family: "PublicSans",
    fonts: [
      { src: "/fonts/PublicSans-Regular.ttf", fontWeight: "normal" },
      { src: "/fonts/PublicSans-Medium.ttf", fontWeight: 500 },
      { src: "/fonts/PublicSans-SemiBold.ttf", fontWeight: 600 },
      { src: "/fonts/PublicSans-Bold.ttf", fontWeight: "bold" },
    ],
  })
  Font.register({
    family: "Archivo",
    fonts: [
      { src: "/fonts/Archivo-SemiBold.ttf", fontWeight: 600 },
      { src: "/fonts/Archivo-Bold.ttf", fontWeight: "bold" },
    ],
  })
  Font.register({
    family: "IBMPlexMono",
    fonts: [
      { src: "/fonts/IBMPlexMono-Regular.ttf", fontWeight: "normal" },
      { src: "/fonts/IBMPlexMono-SemiBold.ttf", fontWeight: 600 },
    ],
  })
} catch (e) {
  // Fallback will be used by renderer if registration fails
}

export const BRAND = {
  name: "Tulsyan Security Services Pvt. Ltd.",
  tagline: "Professional Security Services",
  colors: {
    primary: "#B42025",
    text: "#1B1B1D",
    muted: "#5B5B60",
    border: "#E4E4E1",
    softBg: "#FAFAF9",
    tableHeaderBg: "#F1F1EF",
  },
  fonts: {
    body: "PublicSans",
    display: "Archivo",
    mono: "IBMPlexMono",
  },
}

export const brandStyles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 52,
    backgroundColor: "#ffffff",
    fontFamily: "PublicSans",
    color: BRAND.colors.text,
  },
  header: {
    marginBottom: 18,
    paddingBottom: 10,
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
    marginBottom: 6,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 7,
  },
  brandName: {
    fontFamily: "Archivo",
    fontSize: 12,
    fontWeight: "bold",
    color: BRAND.colors.text,
  },
  headerTitle: {
    fontFamily: "Archivo",
    fontSize: 15,
    fontWeight: "bold",
    color: BRAND.colors.text,
  },
  headerSubtitle: {
    fontFamily: "IBMPlexMono",
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: BRAND.colors.muted,
    marginTop: 3,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  tag: {
    fontFamily: "IBMPlexMono",
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: BRAND.colors.primary,
    borderWidth: 1,
    borderColor: BRAND.colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  section: {
    marginBottom: 14,
    paddingBottom: 2,
  },
  sectionTitle: {
    fontFamily: "IBMPlexMono",
    fontSize: 8.5,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: BRAND.colors.primary,
    marginBottom: 7,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "55%",
    fontSize: 9,
    fontWeight: 500,
    color: BRAND.colors.muted,
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
    fontFamily: "IBMPlexMono",
    fontSize: 7.5,
    fontWeight: 600,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: BRAND.colors.muted,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: BRAND.colors.border,
  },
  tableCell: {
    fontSize: 9,
    color: BRAND.colors.text,
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
    fontFamily: "IBMPlexMono",
    fontSize: 7.5,
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
