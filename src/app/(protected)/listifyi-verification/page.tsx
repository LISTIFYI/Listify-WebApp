"use client"
import React, { useEffect, useState } from 'react';

const ListifyiVerificationScreen = () => {
    const targetDate = new Date('2025-12-01T00:00:00').getTime();
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setCountdown({ days, hours, minutes, seconds });

            if (distance < 0) {
                clearInterval(interval);
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Listifyi Verified
                    </h1>
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6 animate-pulse">
                        Coming Soon
                    </h2>
                    <p className="text-base sm:text-lg text-gray-500 mb-10 animate-fadeIn">
                        Listifyi Verification is launching soon! Stay tuned for a secure and trusted experience.
                    </p>
                    <div className="flex justify-center mx-auto space-x-4 sm:space-x-6 w-full max-w-md">
                        {[
                            { value: countdown.days, label: 'Days' },
                            { value: countdown.hours, label: 'Hours' },
                            { value: countdown.minutes, label: 'Minutes' },
                            { value: countdown.seconds, label: 'Seconds' },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-gray-800 text-white rounded-lg p-4 sm:p-6 w-16 sm:w-24 text-center"
                            >
                                <p className="text-xl sm:text-2xl font-bold">{item.value}</p>
                                <p className="text-xs sm:text-sm text-gray-300">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ListifyiVerificationScreen;