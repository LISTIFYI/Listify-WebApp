"use client";

import React, { useState } from 'react';
import { Calendar, ChevronsLeft, ChevronsRight, Trash2 } from 'lucide-react';

interface ScheduleItem {
    id: number;
    title: string;
    name: string;
    time: string;
    status: 'confirmed' | 'pending' | 'cancelled';
}

const CustomCalendar = () => {
    const [currentDate] = useState(new Date('2025-10-20T17:08:00'));
    const [selectedDate] = useState(new Date('2025-10-20T17:08:00'));
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const today = new Date('2025-10-20');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="flex flex-col lg:flex-row h-full bg-gray-50 font-sans">
            {/* LEFT PANEL: Calendar + Time Slots */}
            <div className="w-full h-fit lg:w-96  bg-white border-r border-gray-200 flex flex-col">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronsLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {months[month]} {year}
                    </h2>
                    <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronsRight className="w-5 h-5 text-gray-700" />
                    </button>
                </div>

                {/* Month Grid */}
                <div className="flex-1 p-3">
                    <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                            <div key={d} className="h-8 flex items-center justify-center">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }, (_, i) => (
                            <div key={`empty-start-${i}`} />
                        ))}
                        {dates.map(date => {
                            const dateObj = new Date(year, month, date);
                            const isToday = dateObj.toDateString() === today.toDateString();
                            const isSelected = dateObj.toDateString() === selectedDate.toDateString();
                            const isPast = dateObj < today && !isToday;

                            return (
                                <button
                                    key={date}
                                    disabled={isPast}
                                    className={`
                    h-9 w-9 rounded-full text-sm flex items-center justify-center transition-all
                    ${isToday ? 'bg-blue-600 text-white font-semibold' : ''}
                    ${isSelected && !isToday ? 'bg-gray-900 text-white' : ''}
                    ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                    ${!isToday && !isSelected && !isPast ? 'hover:bg-gray-100 text-gray-700' : ''}
                  `}
                                >
                                    {date}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Date + Time Slots */}
                <div className="border-t bg-gray-50 p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Mon, Oct 20 – Available Slots
                    </h3>
                    <div className="space-y-2">
                        {["10:00 AM - 11:00 AM", "03:00 PM - 04:00 PM", "05:00 PM - 06:00 PM"].map(slot => (
                            <label
                                key={slot}
                                className={`
                  flex items-center p-3 rounded-lg border cursor-pointer transition-all
                  ${selectedSlot === slot
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }
                `}
                            >
                                <input
                                    type="radio"
                                    name="slot"
                                    value={slot}
                                    checked={selectedSlot === slot}
                                    onChange={() => setSelectedSlot(slot)}
                                    className="sr-only"
                                />
                                <div className={`
                  w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 transition-all
                  ${selectedSlot === slot
                                        ? 'border-blue-600 bg-blue-600 ring-2 ring-blue-200'
                                        : 'border-gray-300'
                                    }`}
                                />
                                <span className="text-sm font-medium text-gray-700">{slot}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Today's Schedule */}
            <div className="flex-1 p-6 overflow-y-auto">
                <TodaysScheduleImproved />
            </div>
        </div>
    );
};

const TodaysScheduleImproved = () => {
    const [filter, setFilter] = useState('All');

    const scheduleData: ScheduleItem[] = [
        { id: 1, title: 'Triaix Splendour', name: 'Satya Narayana', time: 'Today, 2:30 PM', status: 'confirmed' },
        { id: 2, title: 'Sarang by Sumadhura', name: 'Satya Narayana', time: 'Today, 2:30 PM', status: 'pending' },
        { id: 3, title: 'Triaix Splendour Plus', name: 'Satya Narayana', time: 'Today, 2:30 PM', status: 'cancelled' },
        { id: 4, title: 'Mathapathi Grand Field', name: 'Satya Narayana', time: 'Today, 2:30 PM', status: 'confirmed' },
        { id: 5, title: 'Trendsquare Akino', name: 'Satya Narayana', time: 'Today, 2:30 PM', status: 'pending' },
    ];

    const filteredData = filter === 'All'
        ? scheduleData
        : scheduleData.filter(item => item.status === filter.toLowerCase());

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getInitials = (title: string) => {
        return title.split(' ').map(w => w[0]).join('').toUpperCase();
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Schedule</h1>
                <span className="text-sm text-gray-500">Monday, October 20</span>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-200">
                {['All', 'Pending', 'Confirmed', 'Cancel'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`
              pb-3 px-2 text-sm font-medium transition-all relative
              ${filter === tab
                                ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }
            `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Schedule List */}
            <div className="space-y-3">
                {filteredData.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No {filter.toLowerCase()} appointments</p>
                ) : (
                    filteredData.map(item => (
                        <div
                            key={item.id}
                            className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                        >
                            {/* Initials Avatar */}
                            <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex-shrink-0 flex items-center justify-center text-xs font-medium text-gray-600">
                                {getInitials(item.title)}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                            </div>

                            {/* Status Badge */}
                            <span className={`
                px-3 py-1 rounded-full text-xs font-medium mr-3
                ${getStatusStyle(item.status)}
              `}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>

                            {/* Actions */}
                            <div className="flex gap-1.5">
                                <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                </button>
                                <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                                    <Trash2 className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CustomCalendar;