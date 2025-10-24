"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, ChevronsLeft, ChevronsRight, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { tokenStore } from '@/lib/token';
import { initializeApi } from '@/lib/http';
import { format, isSameDay } from 'date-fns';
import CommonCalendar from '@/components/CustomFields/CommonCalendar';
import { formatTime } from '@/utils/timeUtils';



interface ScheduleItem {
    id: number;
    title: string;
    name: string;
    time: string;
    status: 'confirmed' | 'pending' | 'cancelled';
}

const CustomCalendar = () => {
    const api = initializeApi(tokenStore).getApi();

    const router = useRouter()
    const [currentDate] = useState(new Date('2025-10-20T17:08:00'));
    const [allBlocktime, setAllBlockTime] = useState<any>(null)

    const fetchallCalendar = async (): Promise<void> => {
        const tk = tokenStore.get();
        try {
            const res = await api.get(`/calendar`);
            setAllBlockTime(res?.data?.calendar?.blockedTimes);
        } catch (err) {
            console.error(err);
        } finally {
        }
    };


    useEffect(() => {
        fetchallCalendar()
    }, [])

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


    const [selectedDate, setSelectedDate] = useState(new Date('2025-10-20T17:08:00'));

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        // Optionally fetch new blocked times for the selected date
        // fetchallCalendar();
    };


    const getFormattedDate = () => {
        const today = new Date();
        return isSameDay(selectedDate, today)
            ? `Today, ${format(selectedDate, 'MMM d')}`
            : `${format(selectedDate, 'EEE, MMM d')}`;
    };
    return (
        <div className="flex flex-col h-full bg-gray-50 font-sans">
            <div className='flex flex-col lg:flex-row h-full bg-gray-50 font-sans border-[10px]'>
                {/* LEFT PANEL: Calendar + Time Slots */}
                <div className="w-full h-fit lg:w-96  bg-white border-r border-gray-200 flex flex-col">
                    <CommonCalendar
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                    />


                    {/* Selected Date + Time Slots */}
                    <div className="border-t bg-gray-50 p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                            {getFormattedDate()} – Available Slots
                        </h3>
                        <div className="space-y-2">
                            {allBlocktime?.map((slot: any, index: any) => (
                                <label
                                    key={slot?._id}
                                    className={`flex bg-[#E6F4EA] items-center px-3 py-2 rounded-md border cursor-pointer transition-all border-gray-200 hover:border-gray-300 bg-white'
                `}
                                >
                                    <span className="text-sm font-medium text-gray-700">
                                        {formatTime(slot?.startTime)} - {formatTime(slot?.endTime)}
                                    </span>
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

            <button
                onClick={() => {
                    router.push("/book-your-slot")
                }}
                className='text-white cursor-pointer bg-black text-[14px] absolute flex flex-row gap-1 rounded-md bottom-10 right-10 py-2 items-center px-4 '><Plus size={18} />Block Time</button>
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