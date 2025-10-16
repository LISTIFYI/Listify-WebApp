"use client";

import React, { useEffect, useState } from "react";
import {
    Home,
    PlayCircle,
    PlusCircle,
    Search,
    FilePlus2,
    UserStar,
    Send,
    Settings,
    List,
    X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import { FaRegUser } from "react-icons/fa";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent } from "../ui/dialog";

interface BottomNavItem {
    id: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    href: string;
    isPopover?: boolean;
    isAdmin?: boolean;
}

const navItems: BottomNavItem[] = [
    { id: "home", icon: Home, label: "Properties", href: "/" },
    { id: "explore", icon: PlayCircle, label: "Explore", href: "/explore/" },
    { id: "create", icon: PlusCircle, label: "Create", href: "/#", isPopover: true },
    { id: "messages", icon: Send, label: "Messages", href: "/messages", isPopover: true },
    { id: "discover", icon: Search, label: "Discover", href: "/discover/" },
    { id: "settings", icon: UserStar, label: "Admin", href: "/#", isAdmin: true },
];

export function BottomNavigation() {
    const pathname = usePathname();
    const router = useRouter();
    const [openPopover, setOpenPopover] = useState(false);

    const { user, openLogin, isAdmin, toggleAdminMode } = useAuth();

    const handleAdminClick = () => {
        if (user?.roles?.includes("Builder") || user?.roles?.includes("Agent")) {
            if (!isAdmin) {
                toggleAdminMode()
                router.push("/dashboard")
            }
            else if (isAdmin) {
                toggleAdminMode()
                router.push("/")
            }
        }
        else {
            router.push("/role")
        }
    };


    const navItems: BottomNavItem[] = [
        { id: "home", icon: Home, label: "Properties", href: "/" },
        { id: "explore", icon: PlayCircle, label: "Explore", href: "/explore/" },
        { id: "create", icon: PlusCircle, label: "Create", href: "/#", isPopover: true },
        { id: "messages", icon: Send, label: "Messages", href: "/messages/" },
        { id: "discover", icon: Search, label: "Discover", href: "/discover/" },
        { id: "settings", icon: Settings, label: "Setting", href: "/settings" },

    ];
    const navItem2: BottomNavItem[] = [
        { id: "dasbboard", icon: Home, label: "Dashboard", href: "/dashboard/" },
        { id: "properties", icon: List, label: "Properties", href: "/properties/" },
        { id: "create", icon: PlusCircle, label: "Create", href: "/#", isPopover: true },
        { id: "messages", icon: Send, label: "Messages", href: "/messages/" },
        { id: "settings", icon: Settings, label: "Setting", href: "/settings" },
    ];


    const activeNavItems = isAdmin ? navItem2 : navItems;



    return (
        <nav className="bg-white border-t border-gray-200 px-2 py-1 flex md:hidden justify-around items-center relative">
            {activeNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                    item.id === "discover"
                        ? ["/discover", "/agents", "/builders"].some((path) =>
                            pathname.startsWith(path)
                        )
                        : pathname === item.href;

                console.log("isactibe", isActive);

                // 🟢 Handle Admin Button
                if (item.isAdmin) {
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={handleAdminClick}
                            className={clsx(
                                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors flex-1",
                                isActive
                                    ? "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            )}
                            aria-label={item.label}
                        // title={item.label}
                        >
                            <Icon size={26} className="mb-1" />
                            {/* <span className="text-xs font-medium">{item.label}</span> */}
                        </button>
                    );
                }
                const handleClick = (e: React.MouseEvent) => {
                    if (item.isPopover) {
                        e.preventDefault();
                        setOpenPopover(true);
                    }
                };
                // 🟢 Normal Navigation Links
                return (
                    <Link
                        key={item.id}
                        href={item.href}
                        onClick={item.isPopover ? handleClick : undefined}

                        className={clsx(
                            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors flex-1",
                            isActive
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        )}
                        aria-label={item.label}
                    // title={item.label}
                    >
                        <Icon size={24} className="mb-1" />
                        {/* <span className="text-xs font-medium">{item.label}</span> */}
                    </Link>
                );
            })}

            <Dialog open={openPopover} onOpenChange={() => {
                setOpenPopover(false)
            }}

            >
                <DialogContent showCloseButton={false} className="w-fit p-0">
                    <div className='flex flex-row justify-between items-center p-2  border-b'>
                        <div
                            onClick={() => {
                                setOpenPopover(false)


                            }}
                            className='flex border cursor-pointer ml-auto border-slate-300  hover:bg-gray-50 transition-all duration-300 rounded-full w-[32px] h-[32px] justify-center items-center '>
                            <X size={22} />
                        </div>
                    </div>
                    <div className="flex flex-row justify-center items-center gap-4 px-6 pt-4 pb-8 w-[300px]">
                        {/* Listing Button */}
                        <button
                            onClick={() => {
                                if (user?.roles?.includes("Builder") || user?.roles?.includes("Agent")) {
                                    setOpenPopover(false)
                                    router.push("/property-listing")

                                }
                                else {
                                    router.push("/role")

                                }
                            }
                            }
                            className="w-[100px] h-[100px] cursor-pointer bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center hover:bg-green-50 hover:border-green-500 hover:shadow-md transition-all duration-200"
                        >
                            <Home size={32} className="text-green-600 mb-2" />
                            <span className="font-medium text-gray-800 text-sm">Listing</span>
                        </button>

                        {/* Post Button */}
                        <button
                            onClick={() => {
                                setOpenPopover(false)
                                router.push("/create-post")
                            }}
                            className="w-[100px] h-[100px] cursor-pointer bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-500 hover:shadow-md transition-all duration-200"
                        >
                            <FilePlus2 size={32} className="text-blue-600 mb-2" />
                            <span className="font-medium text-gray-800 text-sm">Post</span>
                        </button>
                    </div>
                </DialogContent>

            </Dialog>
        </nav>
    );
}
