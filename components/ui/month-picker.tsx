"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MonthPickerProps {
  value?: Date
  onChange?: (date: Date) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  yearRange?: { from: number; to: number }
}

export function MonthPicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select month",
  className,
  yearRange = { from: 2020, to: 2030 },
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentYear, setCurrentYear] = React.useState(value?.getFullYear() || new Date().getFullYear())

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentYear, monthIndex, 1)
    onChange?.(newDate)
    setIsOpen(false)
  }

  const handleYearChange = (direction: "prev" | "next") => {
    setCurrentYear((prev) => {
      const newYear = direction === "prev" ? prev - 1 : prev + 1
      return Math.max(yearRange.from, Math.min(yearRange.to, newYear))
    })
  }

  const formatDisplayValue = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {value ? formatDisplayValue(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleYearChange("prev")}
              disabled={currentYear <= yearRange.from}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold text-lg">{currentYear}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleYearChange("next")}
              disabled={currentYear >= yearRange.to}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => {
              const isSelected = value && value.getMonth() === index && value.getFullYear() === currentYear
              const isCurrentMonth = new Date().getMonth() === index && new Date().getFullYear() === currentYear

              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9 text-sm",
                    isCurrentMonth && !isSelected && "bg-accent",
                    isSelected && "bg-primary text-primary-foreground",
                  )}
                  onClick={() => handleMonthSelect(index)}
                >
                  {month.slice(0, 3)}
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
