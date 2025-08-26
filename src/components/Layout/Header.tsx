// components/Layout/Header.tsx
"use client";

import React, { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FiBell } from "react-icons/fi";
import { LuMessageSquareText } from "react-icons/lu";
import { IoChevronDown } from "react-icons/io5";
import { IoIosCheckboxOutline } from "react-icons/io";
import { IoFilter, IoSearch } from "react-icons/io5";
import { RiHome6Line } from "react-icons/ri";
import { PiBuildingOfficeThin } from "react-icons/pi";
import { RxCross2 } from "react-icons/rx";
import clsx from "clsx";

type HeaderProps = {
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
};

const Header = ({ isSidebarCollapsed = false, onToggleSidebar }: HeaderProps) => {
    const [activeToggle, setActiveToggle] = useState("All");

    return (
        <div className="bg-white border border-b-[#EAEAEA]">
            <div className="flex flex-row  items-center">
                {/* Left: Hamburger + Logo */}
                <div className={`flex gap-3  items-center  transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "w-16 justify-center" : "w-56 justify-between pr-4"}`}>
                    {
                        !isSidebarCollapsed &&
                        <h1 className="text-[22px] px-4 text-black font-[700] text-nowrap">Listifyi</h1>
                    }
                    <button
                        onClick={onToggleSidebar}
                        aria-label="Toggle sidebar"
                        className={clsx(
                            "inline-flex items-center justify-center rounded-md border border-gray-200 w-9 h-9 hover:bg-gray-50 transition",
                            isSidebarCollapsed ? "bg-gray-50" : "bg-white"
                        )}
                    >
                        <RxHamburgerMenu size={18} />
                    </button>
                </div>

                {/* Middle: filters/search (your existing UI) */}
                <div className="flex p-2 flex-1 flex-row justify-between items-center">
                    <div className="flex flex-row gap-4 hideFilterOne">
                        <div className="bg-[#F9FAFB] flex flex-row justify-center items-center rounded-full p-[4px]">
                            <div
                                className={clsx(
                                    "px-4 flex flex-row justify-center items-center gap-1 py-2 text-[12px] rounded-full cursor-pointer",
                                    activeToggle === "All"
                                        ? "bg-[#fff] text-black font-[500] shadow-[0px_0px_2px_0.1px_#989CA066]"
                                        : "border-gray-300"
                                )}
                                onClick={() => setActiveToggle("All")}
                            >
                                <RiHome6Line className="text-[#989CA0]" size={14} />
                                All
                            </div>

                            <div
                                className={clsx(
                                    "px-4 py-2 text-[12px] rounded-full cursor-pointer flex flex-row gap-1",
                                    activeToggle === "Sale"
                                        ? "bg-[#fff] text-black font-[500] shadow-[0px_0px_2px_0.1px_#989CA066]"
                                        : "border-gray-300"
                                )}
                                onClick={() => setActiveToggle("Sale")}
                            >
                                <PiBuildingOfficeThin className="text-[#989CA0]" size={14} />
                                Sale
                            </div>

                            <div
                                className={clsx(
                                    "px-4 py-2 text-[12px] rounded-full cursor-pointer flex flex-row gap-1",
                                    activeToggle === "Resale"
                                        ? "bg-[#fff] text-black font-[500] shadow-[0px_0px_2px_0.1px_#989CA066]"
                                        : "border-gray-300"
                                )}
                                onClick={() => setActiveToggle("Resale")}
                            >
                                <PiBuildingOfficeThin className="text-[#989CA0]" size={14} />
                                Resale
                            </div>
                        </div>


                        <div className="border rounded-full bg-[#F9FAFB] flex flex-row justify-center items-center gap-1 py-1.5 px-2.5 border-[#E7ECEE]">
                            <IoSearch className="text-[#989CA0]" size={14} />
                            <input
                                placeholder="Whitefield, banglore"
                                className="text-[12px] font-[400] outline-none px-0.5 border-none text-[#989CA0] placeholder:text-[#989CA0] w-[210px]"
                            />
                            <RxCross2 className="text-[#989CA0]" size={14} />
                        </div>

                        <div className="border rounded-full bg-[#F9FAFB] flex flex-row justify-center items-center gap-1 py-1.5 px-4 border-[#E7ECEE]">
                            <IoFilter className="text-[#989CA0]" size={14} />
                            <h1 className="text-[12px] font-[400] text-[#989CA0]">Filter</h1>
                        </div>
                    </div>

                    {/* Right: actions (unchanged) */}
                    <div className="flex flex-row gap-4 items-center justify-center">
                        <div className="hideFilterTwo flex bg-[#F3F4F6] px-2 py-1.5 rounded-sm flex-row gap-2 justify-center items-center">
                            <div className="bg-[#FEF08A] w-[20px] h-[20px] flex justify-center items-center rounded-[4px]">
                                <IoIosCheckboxOutline color="black" size={14} />
                            </div>
                            <div className="text-[12px] text-black font-[400]">Post Property</div>
                            <div className="text-[10px] text-black bg-[#25D5DB] px-[6px] rounded-[4px] py-[0.6px] font-[400]">
                                Free
                            </div>
                        </div>

                        <div className="hideFilterTwo w-[1px] bg-[#EBEBEB] h-[12px]" />

                        <div className="hideFilterThree flex flex-row gap-2">
                            <div className="border border-[#EBEBEB] flex justify-center items-center w-[34px] h-[34px] rounded-full">
                                <LuMessageSquareText color="black" size={16} />
                            </div>
                            <div className="border border-[#EBEBEB] flex justify-center items-center w-[34px] h-[34px] rounded-full">
                                <FiBell color="black" size={16} />
                            </div>
                        </div>

                        <div className="hideFilterThree w-[1px] bg-[#EBEBEB] h-[12px]" />

                        <div className="flex cursor-pointer flex-row gap-2 items-center justify-center">
                            <div className="border overflow-hidden border-[#EBEBEB] flex justify-center items-center w-[34px] h-[34px] rounded-full" />
                            <h1 className="text-[12px] hideUserName text-black font-[700]">Vijendra Paliwal</h1>
                            <IoChevronDown color="black" size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
