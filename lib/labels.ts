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
