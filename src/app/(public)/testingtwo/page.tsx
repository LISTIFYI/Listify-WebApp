"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Heart, Share2, Bookmark, X } from "lucide-react";

const ReelLayout: React.FC = () => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="h-screen flex bg-black text-white overflow-hidden">
            {/* Left Section (Video) */}
            <motion.div
                className={`h-full md:transition-all md:duration-700 md:ease-out ${isDetailsOpen ? "md:w-1/2" : "w-full"
                    } flex justify-center items-center`}
            >
                <video
                    src="https://videos.pexels.com/video-files/855354/855354-hd_1920_1080_24fps.mp4"
                    className="object-cover h-full w-full"
                    autoPlay
                    loop
                    muted
                />
                {/* Right Corner Action Buttons */}
                <div className="absolute right-4 bottom-8 flex flex-col gap-4">
                    <button className="hover:scale-110 transition">
                        <Heart size={26} />
                    </button>
                    <button className="hover:scale-110 transition">
                        <MessageCircle size={26} />
                    </button>
                    <button className="hover:scale-110 transition">
                        <Share2 size={26} />
                    </button>
                    <button className="hover:scale-110 transition">
                        <Bookmark size={26} />
                    </button>
                </div>
                {/* Details Toggle Button */}
                <button
                    onClick={() => setIsDetailsOpen(true)}
                    className="absolute top-4 right-4 bg-white text-black px-4 py-1 rounded-full font-semibold text-sm"
                >
                    View Details
                </button>
            </motion.div>

            {/* Right Section (Details Panel) */}
            <AnimatePresence>
                {isDetailsOpen && (
                    <motion.div
                        key="details"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="fixed md:static top-0 right-0 h-full w-full md:w-1/2 bg-white text-black shadow-xl overflow-y-auto z-50"
                        ref={scrollContainerRef}
                    >
                        <div className="p-6 space-y-4 relative">
                            <button
                                onClick={() => setIsDetailsOpen(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-black"
                            >
                                <X size={24} />
                            </button>

                            {/* Property Info */}
                            <h2 className="text-2xl font-semibold">Luxury Apartment in Mumbai</h2>
                            <p className="text-gray-600">Bandra West · 3BHK · Sea View</p>
                            <p className="text-xl font-bold text-blue-600 mt-2">₹2.5 Cr</p>

                            <div className="border-t pt-4 space-y-2">
                                <h3 className="font-semibold text-lg">Highlights</h3>
                                <ul className="list-disc ml-6 text-gray-700">
                                    <li>Fully furnished 3BHK</li>
                                    <li>Sea-facing balcony</li>
                                    <li>Private parking</li>
                                    <li>Near Bandra Station</li>
                                </ul>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-lg mb-2">Comments</h3>
                                <div className="space-y-3">
                                    <p><strong>Rahul:</strong> Looks amazing 🔥</p>
                                    <p><strong>Priya:</strong> Is it still available?</p>
                                    <p><strong>Vikram:</strong> I’ve visited this property, great interiors!</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReelLayout;
