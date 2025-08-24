"use client"

import { Building2, Calendar, Clock, MapPin, MessageCircle, Phone, Play, Star, X } from 'lucide-react'
import React, { useState } from 'react'

const VideoDetails = ({ selectedVideo, handleCloseDetails }) => {

    const tabs = ["Location map", "Shopping", "School"];
    const [activeTab, setActiveTab] = useState("Location map");

    const images = [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4sly3zeMUd6G3eUB5qx9VhYQC05CAZlBQkQ&s",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3PXXOg4AefDv6XwHm2CdL1lHBdiDcA2KVPw&s",
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="h-full flex flex-col overflow-scroll">


            {/* Header */}
            {/* <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold">Video Details</h2>
             
            </div> */}
            <div className='absolute top-0 right-[20px] z-50'>
                <button
                    onClick={handleCloseDetails}
                    className="p-2 hover:bg-gray-700 bg-gray-600 cursor-pointer rounded-full transition-colors duration-200"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="bg-black text-white flex flex-col">
                {/* Header Image */}
                <div className="relative w-full overflow-x-auto flex snap-x snap-mandatory no-scrollbar">
                    {images.map((src, index) => (
                        <div
                            key={index}
                            className="w-full flex-shrink-0 snap-center relative "
                        >
                            <img
                                src={src}
                                alt={`Property ${index + 1}`}
                                className="w-full h-64 object-cover"
                            />
                            {/* Play Button Overlay */}
                            <button className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black bg-opacity-50 p-4 rounded-full">
                                    <Play size={32} className="text-white" />
                                </div>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Details */}
                <div className="p-4 space-y-8 pb-28">
                    {/* Price + Location */}
                    <div>
                        <h1 className="text-xl font-semibold">Price ₹10,000</h1>
                        <div className="flex items-center text-gray-400">
                            <MapPin size={16} className="mr-1" />
                            Rajasthan, India
                        </div>
                    </div>

                    {/* Highlights */}
                    <div>
                        <h2 className="font-semibold text-lg">Property Highlights</h2>
                        <div className="flex gap-6 mt-2">
                            <div className="flex flex-col items-center">
                                <div className="text-lg font-bold">1000</div>
                                <div className="text-xs text-gray-400">sqft Area</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-lg font-bold">2</div>
                                <div className="text-xs text-gray-400">Parking</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            {["Smart Home", "Lake View", "Pet Friendly"].map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full bg-gray-800 text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* About */}
                    <div>
                        <h2 className="font-semibold text-lg">About Property</h2>
                        <p className="text-gray-300 text-sm mt-1">
                            Udaipur new testing gone wrong
                        </p>
                    </div>

                    {/* Builder */}
                    <div className="bg-gray-900 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/builder.jpg"
                                alt="Builder"
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <p className="font-semibold">Jinu shar</p>
                                <p className="text-green-400 text-xs">Builder</p>
                                <div className="flex items-center text-yellow-400 text-sm">
                                    <span>4.0</span>
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            fill={i < 4 ? "yellow" : "gray"}
                                            stroke="none"
                                            className="ml-1"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button className="bg-gray-800 p-2 rounded-full">
                            <MessageCircle size={18} />
                        </button>
                    </div>

                    {/* BHK Sizes */}
                    <div>
                        <div className="flex gap-3 mb-2">
                            <button className="px-4 py-1 rounded-full bg-gray-800 text-sm">
                                All
                            </button>
                            <button className="px-4 py-1 rounded-full bg-gray-800 text-sm">
                                1 BHK
                            </button>
                        </div>

                        <div className="bg-gray-900 p-3 rounded-xl flex justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Super Area</p>
                                <p className="text-white text-sm">100 Sqft | 1 BHK</p>
                                <p className="text-white text-sm">₹1000.00 Cr Onwards</p>
                                <p className="text-white text-sm">₹1000 EMI</p>
                                <p className="text-gray-400 text-xs">Aug 2025</p>
                                <a href="#" className="underline text-sm mt-2 inline-block">
                                    See all properties
                                </a>
                            </div>
                            <button className="self-end bg-white text-black px-4 py-1 rounded-full text-sm">
                                Contact
                            </button>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h2 className="font-semibold text-lg">Amenities</h2>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                            {[
                                "Garden",
                                "Security",
                                "Swimming Pool",
                                "Gym",
                                "Parking",
                                "Elevator",
                                "Water Supply",
                                "Power Backup",
                                "Clubhouse",
                                "Playground",
                            ].map((amenity) => (
                                <div key={amenity} className="flex items-center gap-2">
                                    • {amenity}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interior Details */}
                    <div>
                        <h2 className="font-semibold text-lg">Interior Details</h2>
                        <div className="mt-2 text-sm">
                            <div className="flex justify-between py-1">
                                <span>Extra Rooms</span>
                                <span className="font-semibold">Pooja Room, Servant Room</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Furnishing Status</span>
                                <span className="font-semibold">Furnished</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Green Quality</span>
                                <span className="font-semibold">Sjsj</span>
                            </div>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div>
                        <h2 className="font-semibold text-lg">Project Details</h2>
                        <div className="grid grid-cols-2 gap-y-2 text-sm mt-2">
                            <span>Ownership</span>
                            <span className="font-semibold">Leasehold</span>
                            <span>Project Status</span>
                            <span className="font-semibold">New/Under Construction</span>
                            <span>Possession Date</span>
                            <span className="font-semibold">2025-08-21</span>
                            <span>Towers / Blocks</span>
                            <span className="font-semibold">10</span>
                            <span>Total Units</span>
                            <span className="font-semibold">1000 Units</span>
                            <span>Project Area</span>
                            <span className="font-semibold">1000 Acres</span>
                            <span>Unit Size Range</span>
                            <span className="font-semibold">1000 sq.ft</span>
                            <span>Price per Sq. Ft.</span>
                            <span className="font-semibold">₹10000</span>
                            <span>Price Range</span>
                            <span className="font-semibold">₹10000</span>
                            <span>Approval Authority</span>
                            <span className="font-semibold">Dhdhd</span>
                            <span>Unit Types</span>
                            <span className="font-semibold">1 BHK</span>
                            <span>Facing Direction</span>
                            <span className="font-semibold">North-West</span>
                            <span>Age of Property</span>
                            <span className="font-semibold">Less than 3 years</span>
                            <span>Purpose</span>
                            <span className="font-semibold">Living</span>
                            <span>Available Offers</span>
                            <span className="font-semibold">
                                No Floor Rise Charges, Flat 10% Cashback
                            </span>
                            <span>Approved Banks</span>
                            <span className="font-semibold">LIC Housing, Axis</span>
                        </div>
                    </div>


                    {/* Society Details */}
                    <div className="p-4 border-b border-neutral-800">
                        <h3 className="text-lg font-semibold mb-2">Society Details</h3>
                        <div className="flex items-center gap-1 mb-3">
                            {Array(5).fill(0).map((_, i) => (
                                <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                            ))}
                            <span className="ml-2 text-sm text-gray-400">(120 reviews)</span>
                        </div>
                        <div className="space-y-2 text-gray-300 text-sm">
                            <div className="flex justify-between">
                                <span>Built by</span>
                                <span className="text-white font-medium">Shree</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Year built</span>
                                <span className="text-white font-medium">2020</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total units</span>
                                <span className="text-white font-medium">1000</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Available units</span>
                                <span className="text-white font-medium">1000</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex border-b border-neutral-800">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
            flex-1 text-center py-3 text-sm font-medium
            transition-all duration-200
            ${activeTab === tab
                                        ? "text-white border-b-2 border-purple-500 bg-neutral-900 rounded-t-lg"
                                        : "text-gray-400 hover:text-white"}
          `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Map Section */}
                    <div className="w-full h-40 bg-neutral-900 flex items-center justify-center">
                        <p className="text-gray-500">[Google Map Placeholder]</p>
                    </div>

                    {/* Location Info */}
                    <div className="p-4 border-b border-neutral-800 space-y-2">
                        <div className="flex items-center gap-2 text-gray-300">
                            <MapPin size={18} /> <span>Rajasthan, India</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Clock size={18} /> <span>10 mins to Metro</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Building2 size={18} /> <span>5 mins to Mall</span>
                        </div>
                    </div>

                    {/* Similar Properties */}
                    <div className="p-4 border-b border-neutral-800">
                        <h3 className="text-lg font-semibold mb-3">Similar Properties</h3>

                        <div className="flex gap-4 overflow-x-auto no-scrollbar">
                            <div className="h-[190px] cursor-pointer w-[300px] border rounded-lg bg-neutral-900 shrink-0"></div>
                            <div className="h-[190px] cursor-pointer w-[300px] border rounded-lg bg-neutral-900 shrink-0"></div>
                            <div className="h-[190px] cursor-pointer w-[300px] border rounded-lg bg-neutral-900 shrink-0"></div>
                            <div className="h-[190px] cursor-pointer w-[300px] border rounded-lg bg-neutral-900 shrink-0"></div>
                            <div className="h-[190px] cursor-pointer w-[300px] border rounded-lg bg-neutral-900 shrink-0"></div>
                        </div>
                    </div>


                    {/* Branding */}
                    <div className="flex flex-col items-center p-6 text-center">
                        <h1 className="text-3xl font-bold">Listifyi</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Crafted with ❤️ in Bengaluru, India
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            © 2024 Listifyi Technologies Pvt. Ltd. | All Rights Reserved
                        </p>
                    </div>

                    {/* Disclaimer Dropdown */}
                    <div className="border-t border-neutral-800 p-4">
                        <details>
                            <summary className="cursor-pointer font-medium">Disclaimer</summary>
                            <p className="text-gray-400 text-sm mt-2">
                                All property details are as provided by the builder/seller and are subject to verification.
                            </p>
                        </details>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="fixed bottom-0 left-0 w-full bg-black p- flex justify-around border-t border-gray-800">
                    <button className="flex flex-col items-center">
                        <MessageCircle size={18} />
                        <span className="text-xs mt-1">Message</span>
                    </button>
                    <button className="flex flex-col items-center text-green-500">
                        <Calendar size={18} />
                        <span className="text-xs mt-1">Schedule</span>
                    </button>
                    <button className="flex flex-col items-center">
                        <Phone size={18} />
                        <span className="text-xs mt-1">Call</span>
                    </button>
                </div>
            </div>


        </div>
    )
}

export default VideoDetails
