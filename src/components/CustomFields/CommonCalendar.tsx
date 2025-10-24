"use client";

import React, { useState } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

interface CalendarProps {
    currentDate?: Date;
    selectedDate?: Date;
    onDateSelect?: (date: Date) => void;
}

const CommonCalendar: React.FC<CalendarProps> = ({
    currentDate = new Date(),
    selectedDate = new Date(),
    onDateSelect,
}) => {
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
    ];

    // Manage currentDate as state
    const [displayDate, setDisplayDate] = useState(currentDate);

    const today = new Date();
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Handle month navigation
    const handlePreviousMonth = () => {
        setDisplayDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setDisplayDate(new Date(year, month + 1, 1));
    };

    const handleDateClick = (date: number) => {
        const newDate = new Date(year, month, date);
        if (onDateSelect && !isPast(newDate)) {
            onDateSelect(newDate);
        }
    };

    const isPast = (date: Date) => {
        const todayWithoutTime = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
        const dateWithoutTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );
        return dateWithoutTime < todayWithoutTime;
    };

    return (
        <div className="w-full bg-white border-r border-gray-200 flex flex-col">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <button
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={handlePreviousMonth}
                >
                    <ChevronsLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                    {months[month]} {year}
                </h2>
                <button
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={handleNextMonth}
                >
                    <ChevronsRight className="w-5 h-5 text-gray-700" />
                </button>
            </div>

            {/* Month Grid */}
            <div className="flex-1 p-3">
                <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                        <div key={d} className="h-8 flex items-center justify-center">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }, (_, i) => (
                        <div key={`empty-start-${i}`} />
                    ))}
                    {dates.map((date) => {
                        const dateObj = new Date(year, month, date);
                        const isToday = dateObj.toDateString() === today.toDateString();
                        const isSelected =
                            dateObj.toDateString() === selectedDate.toDateString();
                        const isPastDate = isPast(dateObj);

                        return (
                            <button
                                key={date}
                                disabled={isPastDate}
                                onClick={() => handleDateClick(date)}
                                className={`
                  h-9 w-9 rounded-full text-sm flex items-center justify-center transition-all
                  ${isToday ? "bg-blue-600 text-white font-semibold" : ""}
                  ${isSelected && !isToday ? "bg-gray-900 text-white" : ""}
                  ${isPastDate ? "text-gray-300 cursor-not-allowed" : ""}
                  ${!isToday && !isSelected && !isPastDate
                                        ? "hover:bg-gray-100 text-gray-700"
                                        : ""
                                    }
                `}
                            >
                                {date}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CommonCalendar;