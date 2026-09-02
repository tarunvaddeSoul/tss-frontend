import * as XLSX from "xlsx"

export interface ParsedAttendanceRow {
  row: number
  employeeId: string
  employeeName: string
  presentDays: number
}

export interface ParsedAttendanceExcel {
  rows: ParsedAttendanceRow[]
  skippedBlank: number
  problems: string[]
}

export type ParseAttendanceExcelResult = { ok: true; data: ParsedAttendanceExcel } | { ok: false; error: string }

// Same header rules as the backend importer so a sheet that works on Upload Attendance works here too.
const ID_HEADER = /employee\s*id|emp\s*id|^id$/i
const PRESENT_HEADER = /present|duty|days/i
const NAME_HEADER = /name/i
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"]

function cellText(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

function findHeaderRow(rows: unknown[][]): { index: number; idCol: number; presentCol: number; nameCol: number } | null {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const cells = (rows[i] ?? []).map(cellText)
    const idCol = cells.findIndex((c) => ID_HEADER.test(c))
    if (idCol === -1) continue
    const presentCol = cells.findIndex((c, index) => index !== idCol && PRESENT_HEADER.test(c))
    if (presentCol === -1) continue
    const nameCol = cells.findIndex((c, index) => index !== idCol && index !== presentCol && NAME_HEADER.test(c))
    return { index: i, idCol, presentCol, nameCol }
  }
  return null
}

export async function parseAttendanceExcel(file: File, maxDays: number): Promise<ParseAttendanceExcelResult> {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."))
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return { ok: false, error: "Only Excel files (.xlsx or .xls) can be uploaded." }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "The file is larger than 10MB. Please upload a smaller file." }
  }

  let sheetRows: unknown[][]
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" })
    const firstSheet = workbook.SheetNames[0]
    if (!firstSheet) return { ok: false, error: "The workbook has no sheets." }
    sheetRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1, blankrows: false }) as unknown[][]
  } catch {
    return { ok: false, error: "We could not read this file. Please make sure it is a valid Excel file." }
  }

  const header = findHeaderRow(sheetRows)
  if (!header) {
    return {
      ok: false,
      error: "The sheet needs an Employee ID column and a Present Days column. Download the template to see the expected layout.",
    }
  }

  const rows: ParsedAttendanceRow[] = []
  const problems: string[] = []
  let skippedBlank = 0

  for (let i = header.index + 1; i < sheetRows.length; i++) {
    const cells = sheetRows[i] ?? []
    const employeeId = cellText(cells[header.idCol]).toUpperCase()
    const employeeName = header.nameCol === -1 ? "" : cellText(cells[header.nameCol])
    const rawPresent = cellText(cells[header.presentCol])
    const rowNumber = i + 1

    if (!employeeId && !rawPresent) continue
    if (!employeeId) {
      problems.push(`Row ${rowNumber}: no employee ID.`)
      continue
    }
    if (!rawPresent) {
      skippedBlank += 1
      continue
    }

    const presentDays = Number(rawPresent)
    const label = `Row ${rowNumber} (${employeeName || employeeId})`
    if (Number.isNaN(presentDays)) {
      problems.push(`${label}: "${rawPresent}" is not a number.`)
      continue
    }
    if (!Number.isInteger(presentDays)) {
      problems.push(`${label}: ${presentDays} must be a whole number.`)
      continue
    }
    if (presentDays < 0 || presentDays > maxDays) {
      problems.push(`${label}: ${presentDays} must be between 0 and ${maxDays}.`)
      continue
    }

    rows.push({ row: rowNumber, employeeId, employeeName, presentDays })
  }

  if (rows.length === 0 && skippedBlank === 0 && problems.length === 0) {
    return { ok: false, error: "The sheet has a header row but no employee rows." }
  }

  return { ok: true, data: { rows, skippedBlank, problems } }
}
