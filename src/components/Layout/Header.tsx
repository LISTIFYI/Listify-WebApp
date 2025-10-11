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
import Logo from '../../assets/logo.png'
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";

type HeaderProps = {
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
    isSheetOpen: any
    setIsSheetOpen: any
};

const Header = ({ isSidebarCollapsed = false, onToggleSidebar, isSheetOpen, setIsSheetOpen }: HeaderProps) => {
    const [activeToggle, setActiveToggle] = useState("all");
    const { user, openLogin, logout, addFilters, setOpenFilter } = useAuth()
    console.log("user", user);
    const router = useRouter()
    const pathname = usePathname();
    const hideLogo =
        pathname.startsWith("/discover") ||
        pathname.startsWith("/setting") ||
        pathname.startsWith("/messages") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/properties");


    return (
        <div className="bg-white border z-0 h-[60px] border-b-[#EAEAEA]">
            <div className="flex flex-row  items-center h-full  my-auto">
                {/* Left: Hamburger + Logo */}
                <div

                    onClick={() => {
                        router.replace("/")
                    }}
                    className={`flex gap-3 my-auto items-center  transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "w-[53px] justify-start" : "w-fit md:w-56 justify-between pr-4"}`}>
                    <div className={`hidden md:flex   flex-row items-center  gap-2 justify-start transition-all duration-300 ${isSidebarCollapsed ? "px-2" : "px-4"}`}>
                        <Image src={Logo} alt="logo" className="max-w-[32px] h-[32px] border " />
                        <h1 className={`text-[22px]  text-black font-[700] text-nowrap  text-start ${isSidebarCollapsed ? "hidden" : "flex"}`}>Listifyi</h1>
                    </div>
                    <div className=" md:hidden flex items-center gap-2 pl-4">
                        <Image src={Logo} alt="logo" className="w-[32px] h-[32px]" />
                        <h1 className={`text-[22px]  text-black font-[700] text-nowrap  text-start`}>Listifyi</h1>

                    </div>
                </div>

                {/* Middle: filters/search (your existing UI) */}
                <div className="flex p-2 flex-1 flex-row justify-between items-center">
                    {
                        !hideLogo &&
                        <>
                            <div className="flex md:ml-0 items-center flex-row gap-4 hideFilterOne">
                                <div className="hidden md:block  ">
                                    <button
                                        onClick={onToggleSidebar}
                                        aria-label="Toggle sidebar"
                                        className={clsx(
                                            "inline-flex  items-center justify-center rounded-md border border-gray-200 w-9 h-9 hover:bg-gray-50 transition",
                                            isSidebarCollapsed ? "bg-gray-50" : "bg-white"
                                        )}
                                    >
                                        <RxHamburgerMenu size={18} />
                                    </button>
                                </div>
                                <div className="bg-[#F9FAFB] hidden md:flex flex-row justify-center items-center rounded-full p-[4px]">
                                    <div
                                        className={clsx(
                                            "px-4 flex flex-row justify-center items-center gap-1 py-2 text-[12px] rounded-full cursor-pointer",
                                            activeToggle === "all"
                                                ? "bg-[#fff] text-black font-[500] shadow-[0px_0px_2px_0.1px_#989CA066]"
                                                : "border-gray-300"
                                        )}
                                        onClick={() => {
                                            setActiveToggle("all")
                                            addFilters({
                                                type: ""
                                            })
                                        }}
                                    >
                                        <RiHome6Line className="text-[#989CA0]" size={14} />
                                        All
                                    </div>

                                    <div
                                        className={clsx(
                                            "px-4 py-2 text-[12px] rounded-full cursor-pointer flex flex-row gap-1",
                                            activeToggle === "sale"
                                                ? "bg-[#fff] text-black font-[500] shadow-[0px_0px_2px_0.1px_#989CA066]"
                                                : "border-gray-300"
                                        )}
                                        onClick={() => {
                                            setActiveToggle("sale")
                                            addFilters({
                                                type: "sale"
                                            })

                                        }}
                                    >
                                        <PiBuildingOfficeThin className="text-[#989CA0]" size={14} />
                                        Sale
                                    </div>

                                    <div

                                        className={clsx(
                                            "px-4 py-2 text-[12px] rounded-full cursor-pointer flex flex-row gap-1",
                                            activeToggle === "resale"
                                                ? "bg-[#fff] text-black font-[500] shadow-[0px_0px_2px_0.1px_#989CA066]"
                                                : "border-gray-300"
                                        )}
                                        onClick={() => {
                                            setActiveToggle("resale")
                                            addFilters({
                                                type: "resale"
                                            })
                                        }}
                                    >
                                        <PiBuildingOfficeThin className="text-[#989CA0]" size={14} />
                                        Resale
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row gap-3">
                                <div className="border hideSearchbar rounded-full bg-[#F9FAFB] flex flex-row justify-center items-center gap-1 py-2 px-2.5 border-[#E7ECEE]">
                                    <IoSearch className="text-[#989CA0]" size={14} />
                                    <input
                                        placeholder="Whitefield, banglore"
                                        className="text-[12px] font-[400] outline-none px-0.5 border-none text-[#989CA0] placeholder:text-[#989CA0] max-w-[210px] w-[100%]"
                                    />
                                    <RxCross2 className="text-[#989CA0]" size={14} />
                                </div>

                                <div onClick={() => {
                                    setOpenFilter(true)
                                }} className="border cursor-pointer rounded-full bg-[#F9FAFB] hidden md:flex flex-row justify-center items-center gap-1 py-2 px-4 border-[#E7ECEE]">
                                    <IoFilter className="text-[#989CA0]" size={14} />
                                    <h1 className="text-[12px] hideFilterText font-[400] text-[#989CA0]">Filter</h1>
                                </div>
                            </div></>
                    }
                    {/* Right: actions (unchanged) */}
                    <div className="flex  ml-auto flex-row gap-4  items-center justify-center">
                        {
                            user &&
                            <>
                                <div
                                    onClick={() => {
                                        console.log("user", user);

                                        if (user?.roles?.includes("Builder") || user?.roles?.includes("Agent")) {
                                            router.push("/property-listing");
                                        } else {
                                            router.push("/role");
                                        }
                                    }}
                                    className="cursor-pointer hideFilterTwo flex bg-[#F3F4F6] px-2 py-1.5 rounded-sm flex-row gap-2 justify-center items-center">
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
                                    <div onClick={() => {
                                        setIsSheetOpen(true)
                                    }} className="border cursor-pointer border-[#EBEBEB] relative flex justify-center items-center w-[34px] h-[34px] rounded-full">
                                        <FiBell color="black" size={16} />
                                        <div className="border w-[18px] h-[18px] bg-black absolute -top-1 -right-1 rounded-full text-[9px] flex justify-center items-center text-white">+6</div>
                                    </div>
                                </div>
                            </>
                        }


                        {
                            !user
                                ? <>
                                    <div className="hideFilterThree w-[1px] bg-[#EBEBEB] h-[12px]" />
                                    <div
                                        onClick={() => {
                                            openLogin()
                                        }}
                                        className="flex cursor-pointer flex-row gap-2 items-center justify-center pr-4">
                                        <h1 className="text-[14px]  text-black font-[700]">Login</h1>
                                        {/* <IoChevronDown color="black" size={14} /> */}
                                    </div>
                                </> :
                                <>

                                    <div className="hideFilterThree  w-[1px] bg-[#EBEBEB] h-[12px]" />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className="flex cursor-pointer bg flex-row gap-2 items-center justify-center pr-4">
                                                <div className="border hover:bg-gray-100  transition-all duration-300 overflow-hidden border-[#EBEBEB] flex justify-center items-center w-[34px] h-[34px] rounded-full">
                                                    {/* Replace with user avatar if available */}
                                                    <span className="text-[12px] font-bold">
                                                        {user?.name?.[0] ?? "U"}
                                                    </span>
                                                </div>
                                                {/* <h1 className="text-[12px] md:block hidden text-black font-[700]">
                                                    {user?.name}
                                                </h1>
                                                <IoChevronDown color="black" size={14} /> */}
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-40">
                                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    // route to profile page
                                                    // window.location.href = "/profile";
                                                    router.push("/profile")
                                                }}
                                            >
                                                Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    logout();
                                                }}
                                            >
                                                Logout
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
