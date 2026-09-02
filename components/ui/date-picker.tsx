"use client"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DatePickerProps {
  date?: Date | null
  onSelect: (date: Date | null) => void
  className?: string
  yearRange?: { from: number; to: number }
}

export function DatePicker({
  date,
  onSelect,
  className,
  yearRange = { from: 1900, to: 2100 }
}: DatePickerProps): JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(date || new Date())
  const [open, setOpen] = useState(false)

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = Array.from(
    { length: yearRange.to - yearRange.from + 1 },
    (_, i) => yearRange.from + i
  )

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(parseInt(monthIndex))
    setCurrentMonth(newDate)
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(parseInt(year))
    setCurrentMonth(newDate)
  }

  const clear = (): void => {
    onSelect(null)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={"outline"}
            onKeyDown={(e) => {
              if (date && (e.key === "Backspace" || e.key === "Delete")) {
                e.preventDefault()
                clear()
              }
            }}
            className={cn(
              "w-full justify-start text-left font-normal h-10 min-w-0",
              !date && "text-muted-foreground",
              date && "pr-9",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate flex-1 text-left">
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </span>
          </Button>
        </PopoverTrigger>
        {date && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between space-x-2">
            <Select
              value={currentMonth.getMonth().toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentMonth.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(date) => {
            onSelect(date || null)
            setOpen(false)
          }}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          initialFocus
          className="p-0"
        />
      </PopoverContent>
    </Popover>
  )
}
