"use client"

import React, { useState } from 'react';

const SubscriptionScreen = () => {
    const [selectedPlan, setSelectedPlan] = useState("12");

    const benefits = [
        "Access 2000+ expert insights",
        "Explore trending topics and expert picks",
        "Get tailored book recommendations",
        "Save favorites to your personal library",
        "Unlock interactive guides and daily challenges",
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Subscription
                    </h1>
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                        Premium Benefits
                    </h2>
                    <div className="space-y-3 mb-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <svg
                                    className="w-5 h-5 text-yellow-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <p className="text-sm sm:text-base text-gray-700">{benefit}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-4">
                        <button
                            onClick={() => setSelectedPlan("12")}
                            className={`w-full flex justify-between items-center p-4 rounded-lg border-2 ${selectedPlan === "12"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-300 bg-white"
                                } relative`}
                        >
                            <div className="text-left">
                                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                                    12 months
                                </p>
                                <p className="text-sm text-gray-600">$9.66 per month</p>
                                <p className="text-sm font-bold text-gray-900 mt-2">
                                    $115.98 <span className="text-xs font-medium text-gray-600">every 12 months</span>
                                </p>
                            </div>
                            <div className="flex items-center">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 ${selectedPlan === "12" ? "border-blue-500 bg-blue-500" : "border-gray-400"
                                        }`}
                                >
                                    {selectedPlan === "12" && (
                                        <div className="w-2.5 h-2.5 bg-white rounded-full m-1" />
                                    )}
                                </div>
                            </div>
                            {selectedPlan === "12" && (
                                <span className="absolute bottom-2 right-2 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">
                                    FREE for 7-days
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setSelectedPlan("6")}
                            className={`w-full flex justify-between items-center p-4 rounded-lg border-2 ${selectedPlan === "6"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-300 bg-white"
                                }`}
                        >
                            <div className="text-left">
                                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                                    6 months
                                </p>
                                <p className="text-sm text-gray-600">$16.66 per month</p>
                                <p className="text-sm font-bold text-gray-900 mt-2">
                                    $99.98 <span className="text-xs font-medium text-gray-600">every 6 months</span>
                                </p>
                            </div>
                            <div className="flex items-center">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 ${selectedPlan === "6" ? "border-blue-500 bg-blue-500" : "border-gray-400"
                                        }`}
                                >
                                    {selectedPlan === "6" && (
                                        <div className="w-2.5 h-2.5 bg-white rounded-full m-1" />
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Free Trial Note */}
                    <p className="text-center text-xs text-gray-600 mt-4">
                        FREE for 7-days, then $115.98 every 12 months
                    </p>

                    {/* Start Trial Button */}
                    <button className="w-full bg-gray-900 text-white text-base font-semibold py-4 rounded-lg mt-4 hover:bg-gray-800 transition">
                        Start your 7-days FREE trial
                    </button>
                </div>
            </main>
        </div>
    );
};

export default SubscriptionScreen;