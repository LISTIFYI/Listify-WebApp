"use client"


import React, { useState } from "react";
// import Icon from "../Icons";
import { FiBell } from "react-icons/fi";
import { LuMessageSquareText } from "react-icons/lu";
import { IoChevronDown } from "react-icons/io5";
import { IoIosCheckboxOutline } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { RiHome6Line } from "react-icons/ri";
import { PiBuildingOfficeThin } from "react-icons/pi";
import { RxCross2 } from "react-icons/rx";

const Header = () => {
    const [activeToggle, setActiveToggle] = useState("All");

    const handleToggle = (option: string) => {
        setActiveToggle(option);
    };
    return (
        <div className="bg-white p-4 border border-b-[#EAEAEA]">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-2 items-center justify-center">
                    {/* <Icon name="logo" width={42} height={42}></Icon> */}
                    <h1 className="text-[22px] text-black font-[700]">Listifyi</h1>
                </div>
                <div className="flex flex-row gap-4 hideFilterOne">
                    <div className="bg-[#F9FAFB] flex flex-row justify-center items-center rounded-full p-[4px]">
                        <div
                            className={`px-4 flex flex-row justify-center items-center gap-1 py-2 text-[12px] rounded-full cursor-pointer ${activeToggle === "All"
                                ? "bg-[#fff] text-black font-[500] shadow-[0px_0px_2px_0.1px_#989CA066]"
                                : "border-gray-300"
                                }`}
                            onClick={() => handleToggle("All")}
                        >
                            <RiHome6Line className="text-[#989CA0]" size={14} />
                            All
                        </div>
                        <div
                            className={`px-4 py-2 text-[12px] rounded-full cursor-pointer flex flex-row gap-1 ${activeToggle === "Sale"
                                ? "bg-[#fff] text-black font-[500] shadow-[0px_0px_2px_0.1px_#989CA066]"
                                : "border-gray-300"
                                }`}
                            onClick={() => handleToggle("Sale")}
                        >
                            <PiBuildingOfficeThin className="text-[#989CA0]" size={14} />
                            Sale
                        </div>
                    </div>
                    <div className="border rounded-full bg-[#F9FAFB] flex flex-row justify-center items-center gap-1 py-1.5 px-2.5 border-[#E7ECEE]">
                        <IoSearch className="text-[#989CA0]" size={14} />
                        <input
                            placeholder="Whitefield, banglore"
                            className="text-[12px] font-[400] outline-none px-0.5 border-none text-[#989CA0] placeholder:text-[#989CA0] w-[210px]"
                        />
                        <RxCross2 className="text-[#989CA0] " size={14} />
                    </div>
                    <div className="border rounded-full bg-[#F9FAFB] flex flex-row justify-center items-center gap-1 py-1.5 px-4 border-[#E7ECEE]">
                        <IoFilter className="text-[#989CA0]" size={14} />
                        <h1 className="text-[12px] font-[400] text-[#989CA0] ">Filter</h1>
                    </div>
                </div>
                <div className="flex flex-row gap-4 items-center justify-center">
                    <div className="hideFilterTwo flex bg-[#F3F4F6] px-2 py-1.5 rounded-sm flex-row gap-2 justify-center items-center">
                        <div className="bg-[#FEF08A] w-[20px] h-[20px] flex justify-center items-center rounded-[4px]">
                            <IoIosCheckboxOutline color="black" size={14} />
                        </div>
                        <div className="text-[12px] text-black font-[400]">
                            Post Property
                        </div>
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
                        <div className="border  overflow-hidden border-[#EBEBEB] flex justify-center items-center w-[34px] h-[34px] rounded-full">
                            {/* <Image
                                src={
                                    "https://media.licdn.com/dms/image/v2/D5603AQF8DUVx2YcPdw/profile-displayphoto-scale_200_200/B56ZfLIvGbHEAg-/0/1751459756499?e=2147483647&v=beta&t=SfeizIuLm08wH_W6leKdza4VTPvbaDPNn0lsErNu06I"
                                }
                                className="w-[100%] h-[100%]"
                                width={200}
                                height={200}
                                alt="profile-pic"
                            /> */}
                        </div>
                        <h1 className="text-[12px] hideUserName text-black font-[700]">
                            Vijendra Paliwal
                        </h1>
                        <IoChevronDown color="black" size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
