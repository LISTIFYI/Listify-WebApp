"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerCustomProps {
    value?: Date
    onChange?: (date: Date | undefined) => void
    disabled?: (date: Date) => boolean
    placeholder?: string
    className?: string
}

const DatePickerCustom: React.FC<DatePickerCustomProps> = ({
    value,
    onChange,
    disabled,
    placeholder = "Pick a date",
    className,
}) => {
    const [date, setDate] = React.useState<Date | undefined>(value)

    const handleSelect = (selected: Date | undefined) => {
        setDate(selected)
        onChange?.(selected)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-empty={!date}
                    className={cn(
                        "w-full h-10 rounded-sm justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    disabled={disabled}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

export default DatePickerCustom
