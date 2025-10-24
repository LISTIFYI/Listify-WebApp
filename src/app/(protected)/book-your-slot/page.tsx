"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import DatePickerCustom from "@/components/CustomFields/DatePickerCustom";
import TextAreaBox from "@/components/CustomFields/TextAreaBox";
import { useRouter } from "next/navigation";
import { initializeApi } from "@/lib/http";
import { tokenStore } from "@/lib/token";
import ButtonCommon from "@/components/CustomFields/Button";
import Lottie from "lottie-react";
import listingAnimation from '../../../assets/lotties/Success Check.json'
import { toast } from "sonner";


// Mock service for creating time slot (replace with actual API call)
const adminCalendarServices = {
    createTimeSlot: async (payload: { startTime: string | null; endTime: string | null; reason: string }) => {
        console.log("Creating time slot with payload:", payload);
        return true; // Simulate successful API call
    },
};

const BookYourSlot: React.FC = () => {

    const api = initializeApi(tokenStore).getApi();

    const router = useRouter()
    const [successShow, setShowSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Validation function
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!date) {
            newErrors.date = "Date is required";
        }

        if (!startTime) {
            newErrors.startTime = "Start time is required";
        }

        if (!endTime) {
            newErrors.endTime = "End time is required";
        }

        if (startTime && endTime) {
            // Convert 12-hour format to 24-hour for comparison
            const [startHour, startMinute, startPeriod] = startTime.split(/[: ]/);
            const [endHour, endMinute, endPeriod] = endTime.split(/[: ]/);
            const startHour24 = startPeriod === "PM" && startHour !== "12" ? parseInt(startHour) + 12 : startHour === "12" && startPeriod === "AM" ? 0 : parseInt(startHour);
            const endHour24 = endPeriod === "PM" && endHour !== "12" ? parseInt(endHour) + 12 : endHour === "12" && endPeriod === "AM" ? 0 : parseInt(endHour);
            const startTotalMinutes = startHour24 * 60 + parseInt(startMinute);
            const endTotalMinutes = endHour24 * 60 + parseInt(endMinute);

            if (startTotalMinutes >= endTotalMinutes) {
                newErrors.endTime = "End time must be after start time";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBlockTime = async () => {
        if (validateForm()) {
            // Convert 12-hour format to 24-hour for ISO string
            const convertTo24Hour = (time: string) => {
                const [hour, minute, period] = time.split(/[: ]/);
                const hour24 = period === "PM" && hour !== "12" ? parseInt(hour) + 12 : period === "AM" && hour === "12" ? 0 : parseInt(hour);
                return `${hour24.toString().padStart(2, "0")}:${minute}`;
            };

            const startTime24 = startTime ? convertTo24Hour(startTime) : "";
            const endTime24 = endTime ? convertTo24Hour(endTime) : "";

            // Ensure ISO strings are generated only with valid date and time
            const startTimeISO = date && startTime24
                ? new Date(`${format(date, "yyyy-MM-dd")}T${startTime24}:00`).toISOString()
                : "";
            const endTimeISO = date && endTime24
                ? new Date(`${format(date, "yyyy-MM-dd")}T${endTime24}:00`).toISOString()
                : "";

            const payload = {
                startTime: startTimeISO,
                endTime: endTimeISO,
                reason,
            }

            try {
                setLoading(true)
                const res = await api.post(`/calendar/block-time`, payload);
                console.log("Ressss", res);
                setShowSuccess(true)
                setLoading(false)
            } catch (error: any) {
                console.log("Validation failed:", errors);
                setLoading(false)
                toast.error(error?.response?.data?.message || error?.message || "Something went wrong!");


            }
        };
    }
    return (
        <div className="flex flex-col h-full w-full bg-white">
            {
                successShow ?
                    <div className="border flex flex-col justify-center items-center px-4 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] m-auto max-w-lg w-full rounded-lg">
                        <Check className="text-white w-8 h-8" />
                        <Lottie
                            animationData={listingAnimation}
                            loop={false}
                            autoplay
                            className="w-24 h-24 mx-auto"
                        />

                        {/* Heading */}
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Time Blocked!</h2>

                        {/* Card */}
                        <div className="bg-gray-50 rounded-2xl shadow-sm p-6 w-full max-w-sm text-left">
                            <div className="mb-3">
                                <p className="text-[14px] text-gray-400 font-medium">Date</p>
                                <p className="text-gray-800 font-normal text-[13px]">
                                    {date ? format(date, "MMMM d, yyyy") : "Not selected"}
                                </p>
                            </div>

                            <div className="mb-3">
                                <p className="text-[14px] text-gray-400 font-medium">Time</p>
                                <p className="text-gray-800 font-normal text-[13px]">
                                    {startTime && endTime ? `${startTime} - ${endTime}` : "Not selected"}
                                </p>
                            </div>

                            <div>
                                <p className="text-[14px] text-gray-400 font-medium">Reason</p>
                                <p className="text-gray-800 font-normal text-[13px]">
                                    {reason || "No reason provided"}
                                </p>
                            </div>

                        </div>
                        <div className="max-w-sm mt-8 w-full">
                            <ButtonCommon
                                onClick={() => {
                                    router.push("/admin-calendar")
                                }}
                                title="Back to Calendar"
                                bgColor="bg-black"
                                border="border-[0px]"
                                textC="text-white"
                            />
                        </div>

                        {/* Button */}
                        {/* <button
                            className="mt-6 bg-[#0C1222] hover:bg-[#1B2233] text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all"
                            onClick={() => alert("Back to Calendar clicked")}
                        >
                            Back to Calendar
                        </button> */}

                    </div>
                    :
                    <div className="border p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] m-auto max-w-lg w-full rounded-lg">
                        <h1 className="text-start text-lg font-semibold mb-6 flex items-center gap-1 text-gray-900">
                            Add Availability Block
                        </h1>
                        <div className="border border-gray-300 rounded-xl w-full p-4 flex flex-col gap-4 bg-white">
                            {/* Date Picker */}
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <DatePickerCustom
                                    value={date}
                                    onChange={(selectedDate) => {
                                        setDate(selectedDate);
                                        setErrors((prev) => ({ ...prev, date: "" }));
                                    }}
                                    disabled={(date) => date < new Date()}
                                    placeholder="Select date"
                                />
                                {errors.date && (
                                    <span className="text-red-500 text-xs mt-1">{errors.date}</span>
                                )}
                            </div>

                            {/* Start Time Picker */}
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                <TimePicker
                                    value={startTime}
                                    onChange={(val) => {
                                        setStartTime(val);
                                        setErrors((prev) => ({ ...prev, startTime: "" }));
                                    }}
                                    placeholder="Select start time"
                                />
                                {errors.startTime && (
                                    <span className="text-red-500 text-xs mt-1">{errors.startTime}</span>
                                )}
                            </div>

                            {/* End Time Picker */}
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700">End Time</label>
                                <TimePicker
                                    value={endTime}
                                    onChange={(val) => {
                                        setEndTime(val);
                                        setErrors((prev) => ({ ...prev, endTime: "" }));
                                    }}
                                    placeholder="Select end time"
                                />
                                {errors.endTime && (
                                    <span className="text-red-500 text-xs mt-1">{errors.endTime}</span>
                                )}
                            </div>

                            {/* Reason Input */}
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700">Reason</label>
                                <TextAreaBox
                                    name="Reason"
                                    value={reason}
                                    onChange={(text) => setReason(text)}
                                    placeholder="Reason"
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            {/* Buttons */}
                            {
                                loading ?
                                    <div className="flex w-full gap-4">
                                        <Button
                                            disabled
                                            className="bg-black w-full disabled:bg-gray-200 text-gray-400 cursor-not-allowed font-medium"
                                        >
                                            Submitting...
                                        </Button>
                                    </div>
                                    :
                                    <div className="flex justify-end gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                router.replace("/admin-calendar")
                                                setDate(undefined);
                                                setStartTime("");
                                                setEndTime("");
                                                setReason("");
                                                setErrors({});
                                            }}
                                            className="border-gray-300 cursor-pointer font-medium text-gray-700 hover:bg-gray-100"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleBlockTime}
                                            className="bg-black cursor-pointer text-white font-medium"
                                        >
                                            Block Time
                                        </Button>
                                    </div>
                            }

                        </div>
                    </div>
            }
        </div>
    );
};

// Custom TimePicker Component
interface TimePickerProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    error?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
    value,
    onChange,
    placeholder,
    error,
}) => {
    const [open, setOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState<string>("");
    const [selectedMinute, setSelectedMinute] = useState<string>("");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("AM");

    const hours = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i).toString().padStart(2, "0"));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
    const periods = ["AM", "PM"];

    useEffect(() => {
        if (value) {
            const [time, period] = value.split(" ");
            const [h, m] = time.split(":");
            setSelectedHour(h);
            setSelectedMinute(m);
            setSelectedPeriod(period);
        }
    }, [value]);

    const handleSelect = (type: "h" | "m" | "p", val: string) => {
        if (type === "h") setSelectedHour(val);
        if (type === "m") setSelectedMinute(val);
        if (type === "p") setSelectedPeriod(val);
        const newHour = type === "h" ? val : selectedHour || "12";
        const newMinute = type === "m" ? val : selectedMinute || "00";
        const newPeriod = type === "p" ? val : selectedPeriod || "AM";
        const newVal = `${newHour}:${newMinute} ${newPeriod}`;
        onChange(newVal);
        if (type === "m" || type === "p") setOpen(false); // Close after selecting minute or period
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full h-10 rounded-sm justify-between items-center text-left font-normal",
                        !value && "text-muted-foreground",
                        error && "border-red-500"
                    )}
                >
                    {value || placeholder}
                    <Clock className="ml-2 h-4 w-4 opacity-70" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
                <div className="flex justify-between gap-3">
                    {/* Hours */}
                    <div className="flex-1 max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white">
                        {hours.map((h) => (
                            <div
                                key={h}
                                onClick={() => handleSelect("h", h)}
                                className={cn(
                                    "px-3 py-1 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                    h === selectedHour && "bg-accent text-accent-foreground"
                                )}
                            >
                                {h}
                            </div>
                        ))}
                    </div>
                    {/* Minutes */}
                    <div className="flex-1 max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white">
                        {minutes.map((m) => (
                            <div
                                key={m}
                                onClick={() => handleSelect("m", m)}
                                className={cn(
                                    "px-3 py-1 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                    m === selectedMinute && "bg-accent text-accent-foreground"
                                )}
                            >
                                {m}
                            </div>
                        ))}
                    </div>
                    {/* AM/PM */}
                    <div className="w-16 max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white">
                        {periods.map((p) => (
                            <div
                                key={p}
                                onClick={() => handleSelect("p", p)}
                                className={cn(
                                    "px-3 py-1 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                    p === selectedPeriod && "bg-accent text-accent-foreground"
                                )}
                            >
                                {p}
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default BookYourSlot;