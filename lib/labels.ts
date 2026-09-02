// Human-readable labels for the raw backend enums, so non-technical staff
// never see CENTRAL / HIGHSKILLED / INACTIVE in the UI.

const SALARY_CATEGORY: Record<string, string> = {
  CENTRAL: "Central",
  STATE: "State",
  SPECIALIZED: "Specialized",
}

const SALARY_SUB_CATEGORY: Record<string, string> = {
  SKILLED: "Skilled",
  UNSKILLED: "Unskilled",
  HIGHSKILLED: "Highly Skilled",
  SEMISKILLED: "Semi-Skilled",
}

const STATUS: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
}

const GENDER: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
}

const TITLE: Record<string, string> = {
  MR: "Mr",
  MS: "Ms",
}

const CATEGORY: Record<string, string> = {
  SC: "SC",
  ST: "ST",
  OBC: "OBC",
  GENERAL: "General",
}

const EDUCATION: Record<string, string> = {
  UNDER_8: "Below 8th",
  EIGHT: "8th Pass",
  TEN: "10th Pass",
  TWELVE: "12th Pass",
  GRADUATE: "Graduate",
  POST_GRADUATE: "Post Graduate",
}

const SALARY_TYPE: Record<string, string> = {
  PER_DAY: "Per Day",
  PER_MONTH: "Per Month",
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function look(map: Record<string, string>, value?: string | null): string {
  if (!value) return "-"
  return map[value] ?? titleCase(value)
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "-"
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return typeof value === "string" ? value : "-"
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export const label = {
  salaryCategory: (v?: string | null) => look(SALARY_CATEGORY, v),
  salarySubCategory: (v?: string | null) => look(SALARY_SUB_CATEGORY, v),
  status: (v?: string | null) => look(STATUS, v),
  gender: (v?: string | null) => look(GENDER, v),
  title: (v?: string | null) => look(TITLE, v),
  category: (v?: string | null) => look(CATEGORY, v),
  education: (v?: string | null) => look(EDUCATION, v),
  salaryType: (v?: string | null) => look(SALARY_TYPE, v),
}

const PLACEHOLDER_VALUES = new Set(["PENDING", "NA", "N/A", "0000000000", "NA_", "BULK IMPORT — GENERAL", "BULK IMPORT - GENERAL", "IMPORTED — UPDATE IN EMS", "IMPORTED - UPDATE IN EMS"])
const PLACEHOLDER_DATES = new Set(["2000-01-01", "1900-01-01"])

export function isPlaceholder(value?: string | number | null): boolean {
  if (value === null || value === undefined) return true
  const text = String(value).trim()
  if (text === "") return true
  if (PLACEHOLDER_VALUES.has(text.toUpperCase())) return true
  if (text.toUpperCase().startsWith("NA_") || text.toUpperCase().startsWith("PENDING-")) return true
  if (/^9000000\d{3}$/.test(text)) return true
  return PLACEHOLDER_DATES.has(text.slice(0, 10))
}

export function displayValue(value?: string | number | null, fallback = "-"): string {
  return isPlaceholder(value) ? fallback : String(value)
}

export function humanize(value?: string | null): string {
  if (!value) return "-"
  if (isPlaceholder(value)) return "-"
  return titleCase(value.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim())
}

export function employeeName(employee?: { title?: string | null; firstName?: string | null; lastName?: string | null } | null): string {
  if (!employee) return "-"
  const last = isPlaceholder(employee.lastName) ? "" : employee.lastName ?? ""
  return [employee.firstName ?? "", last].join(" ").trim() || "-"
}

export function formatMoney(value?: number | string | null, options: { decimals?: number } = {}): string {
  if (value === null || value === undefined || value === "") return "-"
  const n = typeof value === "string" ? Number(value) : value
  if (Number.isNaN(n)) return "-"
  const decimals = options.decimals ?? 2
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "-"
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return "-"
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function formatMonth(value?: string | null): string {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return value ?? "-"
  const [y, m] = value.split("-").map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
}
