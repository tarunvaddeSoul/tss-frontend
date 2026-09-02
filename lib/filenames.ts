function slug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

function localDate(): string {
  const now = new Date()
  const pad = (n: number): string => String(n).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function period(month?: string | string[] | null): string {
  const months = (Array.isArray(month) ? month : [month]).filter((m): m is string => !!m)
  if (months.length === 0) return localDate()
  const sorted = [...new Set(months)].sort()
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  return first === last ? slug(first) : `${slug(first)}-to-${slug(last)}`
}

export function downloadFileName(
  type: string,
  client?: string | null,
  month?: string | string[] | null,
  extension = "pdf",
): string {
  const parts = [slug(type), client ? slug(client) : "", period(month)].filter(Boolean)
  return `${parts.join("-")}.${extension.replace(/^\./, "")}`
}
