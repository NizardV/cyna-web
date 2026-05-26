"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { parseDate } from "chrono-node"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export type DatePickerMode =
  | "single"
  | "range"
  | "dob"
  | "time"
  | "natural"

export interface DatePickerProps {
  mode?: DatePickerMode
  date?: Date | DateRange | undefined
  onDateChange?: (date: Date | DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  buttonClassName?: string
  numberOfMonths?: number
  fromYear?: number
  toYear?: number
}

// Internal component that gets recreated when mode changes via key
function DatePickerContent({
  mode,
  date,
  onDateChange,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  numberOfMonths = 2,
  placeholder,
  onOpenChange,
}: {
  mode: DatePickerMode
  date?: Date | DateRange
  onDateChange?: (date: Date | DateRange | undefined) => void
  fromYear?: number
  toYear?: number
  numberOfMonths?: number
  placeholder?: string
  onOpenChange?: (open: boolean) => void
}) {
  // Single mode state (used for single, dob, natural)
  const [singleDate, setSingleDate] = React.useState<Date | undefined>(
    mode === "single" || mode === "dob" || mode === "natural" ? date as Date : undefined
  )
  
  // Range mode state
  const [rangeDate, setRangeDate] = React.useState<DateRange | undefined>(
    mode === "range" ? date as DateRange : undefined
  )
  
  // Time mode state
  const [timeDate, setTimeDate] = React.useState<Date | undefined>(
    mode === "time" ? date as Date : undefined
  )
  const [hour, setHour] = React.useState<string>(
    timeDate ? timeDate.getHours().toString().padStart(2, "0") : "12"
  )
  const [minute, setMinute] = React.useState<string>(
    timeDate ? timeDate.getMinutes().toString().padStart(2, "0") : "00"
  )
  const [naturalLanguageInput, setNaturalLanguageInput] = React.useState("")

  // Update internal state when external date prop changes (only for controlled mode)
  React.useEffect(() => {
    if (mode === "single" || mode === "dob" || mode === "natural") {
      if (date !== undefined && date !== singleDate) {
        setSingleDate(date as Date)
      }
    } else if (mode === "range") {
      if (date !== undefined && date !== rangeDate) {
        setRangeDate(date as DateRange)
      }
    } else if (mode === "time") {
      if (date !== undefined && date !== timeDate) {
        setTimeDate(date as Date)
        if (date) {
          const d = date as Date
          setHour(d.getHours().toString().padStart(2, "0"))
          setMinute(d.getMinutes().toString().padStart(2, "0"))
        }
      }
    }
  }, [date, mode, singleDate, rangeDate, timeDate])

  // Handle single date change
  const handleSingleDateChange = (newDate: Date | undefined) => {
    setSingleDate(newDate)
    onDateChange?.(newDate)
    if (newDate) onOpenChange?.(false)
  }

  // Handle range date change
  const handleRangeDateChange = (newRange: DateRange | undefined) => {
    setRangeDate(newRange)
    onDateChange?.(newRange)
    if (newRange?.from && newRange?.to) onOpenChange?.(false)
  }

  // Handle time change
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return
    
    const [h, m] = [parseInt(hour), parseInt(minute)]
    newDate.setHours(h, m)
    setTimeDate(newDate)
    onDateChange?.(newDate)
    onOpenChange?.(false)
  }

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    if (type === "hour") setHour(value)
    else setMinute(value)

    if (!timeDate) return

    const newDate = new Date(timeDate)
    if (type === "hour") newDate.setHours(parseInt(value))
    else newDate.setMinutes(parseInt(value))
    
    setTimeDate(newDate)
    onDateChange?.(newDate)
  }

  // Handle natural language
  const handleNaturalLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedDate = parseDate(naturalLanguageInput)
    if (parsedDate) {
      setSingleDate(parsedDate)
      onDateChange?.(parsedDate)
      onOpenChange?.(false)
      setNaturalLanguageInput("")
    }
  }

  // Get display text
  const getDisplayText = () => {
    switch (mode) {
      case "single":
        return singleDate ? format(singleDate, "PPP") : placeholder
      case "range":
        if (!rangeDate?.from) return placeholder
        if (rangeDate.to) return `${format(rangeDate.from, "PPP")} - ${format(rangeDate.to, "PPP")}`
        return format(rangeDate.from, "PPP")
      case "dob":
        return singleDate ? format(singleDate, "PPP") : "Select date of birth"
      case "time":
        return timeDate ? format(timeDate, "PPP HH:mm") : placeholder
      case "natural":
        return singleDate ? format(singleDate, "PPP") : placeholder
      default:
        return placeholder
    }
  }

  // Render calendar based on mode
  const renderCalendar = () => {
    switch (mode) {
      case "single":
      case "natural":
        return (
          <Calendar
            mode="single"
            selected={singleDate}
            onSelect={handleSingleDateChange}
          />
        )
      
      case "dob":
        return (
          <Calendar
            mode="single"
            selected={singleDate}
            onSelect={handleSingleDateChange}
            disabled={{ before: new Date(fromYear, 0, 1), after: new Date(toYear, 11, 31) }}
          />
        )
      
      case "range":
        return (
          <Calendar
            mode="range"
            selected={rangeDate}
            onSelect={handleRangeDateChange}
            numberOfMonths={numberOfMonths}
          />
        )
      
      case "time":
        return (
          <>
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Select value={hour} onValueChange={(v) => handleTimeChange("hour", v)}>
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>:</span>
                <Select value={minute} onValueChange={(v) => handleTimeChange("minute", v)}>
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Minute" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Calendar
              mode="single"
              selected={timeDate}
              onSelect={handleDateSelect}
            />
          </>
        )
      
      default:
        return null
    }
  }

  return (
    <>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={false}
          data-empty={!getDisplayText() || getDisplayText() === placeholder}
          className={cn(
            "w-70 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{getDisplayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {mode === "natural" ? (
          <div className="p-3">
            <form onSubmit={handleNaturalLanguageSubmit} className="space-y-3">
              <Input
                placeholder="e.g., next Friday, tomorrow, 2 weeks from now"
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                className="w-70"
              />
              <Button type="submit" className="w-full">
                Set Date
              </Button>
            </form>
            <div className="mt-3 pt-3 border-t">
              <Calendar
                mode="single"
                selected={singleDate}
                onSelect={handleSingleDateChange}
              />
            </div>
          </div>
        ) : (
          renderCalendar()
        )}
      </PopoverContent>
    </>
  )
}

export function DatePicker({
  mode = "single",
  date,
  onDateChange,
  placeholder = "Pick a date",
  numberOfMonths = mode === "range" ? 2 : 1,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Use mode as part of the key to force re-creation when mode changes
  // This automatically resets all internal state without needing an effect
  const componentKey = `${mode}-${fromYear}-${toYear}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DatePickerContent
        key={componentKey}
        mode={mode}
        date={date}
        onDateChange={onDateChange}
        onOpenChange={setOpen}
        fromYear={fromYear}
        toYear={toYear}
        numberOfMonths={numberOfMonths}
        placeholder={placeholder}
      />
    </Popover>
  )
}