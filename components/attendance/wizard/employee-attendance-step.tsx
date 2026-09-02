"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Search, UserCheck, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"
import { employeeName } from "@/lib/labels"
import { cn } from "@/lib/utils"
import type { ActiveEmployee } from "@/types/attendance"

import { getEmployeeDisplayInfo } from "./types"
import type { AttendanceEntry, ExistingAttendanceRecord } from "./types"

const PAGE_SIZE = 50

interface EmployeeAttendanceStepProps {
  employees: ActiveEmployee[]
  entriesById: Map<string, AttendanceEntry>
  existingById: Map<string, ExistingAttendanceRecord>
  clientId: string
  month: Date
  maxDays: number
  selectedCount: number
  disabled: boolean
  onToggle: (employeeId: string, selected: boolean) => void
  onCountChange: (employeeId: string, presentCount: number) => void
  onSelectMany: (employeeIds: string[], selected: boolean) => void
  onFillSelected: (presentCount: number) => void
}

interface DaysInputProps {
  value: number
  max: number
  disabled: boolean
  onCommit: (value: number) => void
  className?: string
  ariaLabel: string
}

function clampDays(value: number, max: number): number {
  return Math.min(max, Math.max(0, Math.trunc(value)))
}

function DaysInput({ value, max, disabled, onCommit, className, ariaLabel }: DaysInputProps): JSX.Element {
  const [text, setText] = useState(String(value))

  useEffect(() => {
    setText(String(value))
  }, [value])

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={0}
      max={max}
      value={text}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => {
        const next = event.target.value
        setText(next)
        if (next === "") return
        const parsed = Number(next)
        if (Number.isFinite(parsed)) onCommit(clampDays(parsed, max))
      }}
      onBlur={() => {
        if (text === "") onCommit(0)
        setText(String(text === "" ? 0 : value))
      }}
      className={cn("font-mono text-[13px] tabular-nums", className)}
    />
  )
}

function SavedBadge({ record }: { record: ExistingAttendanceRecord | undefined }): JSX.Element | null {
  if (!record) return null
  return (
    <Badge variant="info" title="Attendance already saved for this month. Submitting will replace it.">
      Saved: {record.presentCount} {record.presentCount === 1 ? "day" : "days"}
    </Badge>
  )
}

export function EmployeeAttendanceStep({
  employees,
  entriesById,
  existingById,
  clientId,
  month,
  maxDays,
  selectedCount,
  disabled,
  onToggle,
  onCountChange,
  onSelectMany,
  onFillSelected,
}: EmployeeAttendanceStepProps): JSX.Element {
  const isMobile = useIsMobile()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [fillValue, setFillValue] = useState("")

  const indexed = useMemo(
    () =>
      employees.map((employee) => ({
        employee,
        name: employeeName(employee),
        searchKey: `${employeeName(employee)} ${employee.id}`.toLowerCase(),
        info: getEmployeeDisplayInfo(employee, clientId),
      })),
    [employees, clientId],
  )

  const query = search.trim().toLowerCase()
  const filtered = useMemo(
    () => (query ? indexed.filter((item) => item.searchKey.includes(query)) : indexed),
    [indexed, query],
  )

  useEffect(() => {
    setPage(1)
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(filtered.length, safePage * PAGE_SIZE)

  const allFilteredSelected = filtered.length > 0 && filtered.every((item) => entriesById.get(item.employee.id)?.selected)
  const selectAllLabel = `${allFilteredSelected ? "Deselect" : "Select"} all${query ? " matching" : ""} (${filtered.length})`

  const applyFill = (): void => {
    if (fillValue === "") return
    const parsed = Number(fillValue)
    if (!Number.isFinite(parsed)) return
    onFillSelected(clampDays(parsed, maxDays))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="employee-search">Find employee</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="employee-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name or employee ID"
                className="w-full pl-8 pr-8 sm:w-64"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onSelectMany(filtered.map((item) => item.employee.id), !allFilteredSelected)}
            disabled={disabled || filtered.length === 0}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            {selectAllLabel}
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fill-days">Set present days for selected</Label>
          <div className="flex items-center gap-2">
            <Input
              id="fill-days"
              type="number"
              inputMode="numeric"
              min={0}
              max={maxDays}
              value={fillValue}
              onChange={(event) => setFillValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  applyFill()
                }
              }}
              placeholder={`0 to ${maxDays}`}
              disabled={disabled || selectedCount === 0}
              className="w-28 font-mono text-[13px] tabular-nums"
            />
            <Button type="button" variant="secondary" onClick={applyFill} disabled={disabled || selectedCount === 0 || fillValue === ""}>
              Apply to {selectedCount}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedCount} of {employees.length} selected
          </Badge>
          {filtered.length > 0 && (
            <span>
              Showing {rangeStart} to {rangeEnd} of {filtered.length}
              {query ? " matching" : ""}
            </span>
          )}
        </div>
        <span>
          Max {maxDays} days in {format(month, "MMMM yyyy")}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-md border p-6 text-center text-sm text-muted-foreground">No employees match &quot;{search}&quot;.</p>
      ) : isMobile ? (
        <div className="space-y-3">
          {pageItems.map(({ employee, name, info }) => {
            const entry = entriesById.get(employee.id)
            const existing = existingById.get(employee.id)
            return (
              <div
                key={employee.id}
                className={cn("space-y-3 rounded-md border p-4", entry?.selected && "bg-muted/50", existing && "border-l-2 border-l-info")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={entry?.selected ?? false}
                      onCheckedChange={(checked) => onToggle(employee.id, checked === true)}
                      disabled={disabled}
                      aria-label={`Select ${name}`}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{employee.id}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {info.designation} · {info.department}
                      </p>
                    </div>
                  </div>
                  <SavedBadge record={existing} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Present days</span>
                  <DaysInput
                    value={entry?.presentCount ?? 0}
                    max={maxDays}
                    disabled={disabled}
                    onCommit={(value) => onCountChange(employee.id, value)}
                    ariaLabel={`Present days for ${name}`}
                    className="w-24"
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <span className="sr-only">Select</span>
                </TableHead>
                <TableHead className="min-w-[220px]">Employee</TableHead>
                <TableHead className="min-w-[120px]">Department</TableHead>
                <TableHead className="min-w-[120px]">Designation</TableHead>
                <TableHead className="w-32">Present Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map(({ employee, name, info }) => {
                const entry = entriesById.get(employee.id)
                const existing = existingById.get(employee.id)
                return (
                  <TableRow key={employee.id} className={cn(entry?.selected && "bg-muted/50", existing && "border-l-2 border-l-info")}>
                    <TableCell>
                      <Checkbox
                        checked={entry?.selected ?? false}
                        onCheckedChange={(checked) => onToggle(employee.id, checked === true)}
                        disabled={disabled}
                        aria-label={`Select ${name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="font-mono text-[13px] text-muted-foreground">{employee.id}</p>
                        </div>
                        <SavedBadge record={existing} />
                      </div>
                    </TableCell>
                    <TableCell>{info.department}</TableCell>
                    <TableCell>{info.designation}</TableCell>
                    <TableCell>
                      <DaysInput
                        value={entry?.presentCount ?? 0}
                        max={maxDays}
                        disabled={disabled}
                        onCommit={(value) => onCountChange(employee.id, value)}
                        ariaLabel={`Present days for ${name}`}
                        className="w-20"
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
