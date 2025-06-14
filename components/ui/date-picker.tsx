"use client"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DatePickerProps {
  date: Date | null
  onSelect: (date: Date | null) => void
  className?: string
  yearRange?: { from: number; to: number }
}

export function DatePicker({
  date,
  onSelect,
  className,
  yearRange = { from: 1900, to: 2100 }
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(date || new Date())

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

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Create a new date at midnight to avoid timezone issues
      const dateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      onSelect(dateOnly)
    } else {
      onSelect(null)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd-MM-yyyy") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
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
          onSelect={handleDateSelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          initialFocus
          className="p-0"
        />
      </PopoverContent>
    </Popover>
  )
}