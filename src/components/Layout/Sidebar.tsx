"use client";

import { Home, PlayCircle, Bell, Send, UserStar, List, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";


type SidebarProps = {
    isCollapsed?: boolean,
    setIsSheetOpen: (value: boolean) => void,
    isSheetOpen: boolean
};

export function Sidebar({ isCollapsed = false, isSheetOpen, setIsSheetOpen }: SidebarProps) {
    const { isAdmin, toggleAdminMode, user } = useAuth();
    console.log("Sidebar isAdmin:", isAdmin);
    console.log("Sidebar toggleAdminMode:", toggleAdminMode);
    const [loading, setLoading] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const navItems = [
        { name: "Properties", href: "/", icon: Home },
        { name: "Explore", href: "/explore/", icon: PlayCircle },
        { name: "Messages", href: "/messages/", icon: Send },
        { name: "Discover", href: "/discover/", icon: Search },
    ];

    const navItems2 = [
        { name: "Dashboard", href: "/dashboard/", icon: Home },
        { name: "Properties", href: "/properties/", icon: List },
        { name: "Messages", href: "/messages/", icon: Send },
    ];

    const activeNavItems = isAdmin ? navItems2 : navItems;
    console.log("Sidebar activeNavItems:", activeNavItems);

    return (
        <aside
            className={clsx(
                "bg-white z-20 border-r shadow-sm transition-all duration-300 ease-in-out hidden md:block",
                isCollapsed ? "w-[64px] px-2 py-4" : "w-56 p-4"
            )}
        >
            <nav className="space-y-0.5">
                {activeNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center rounded-md transition-colors",
                                isCollapsed ? "justify-start gap-0 p-2" : "gap-2 p-2",
                                isActive
                                    ? "bg-blue-100 text-blue-600 font-medium"
                                    : "hover:bg-gray-100 text-gray-700"
                            )}
                            aria-label={item.name}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <Icon className={`h-4 w-4 shrink-0 z-20 ${isCollapsed ? "mx-auto" : ""}`} />
                            <span
                                className={clsx(
                                    "whitespace-nowrap overflow-hidden text-sm transition-all duration-200",
                                    isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                                )}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
            <div>
                <button
                    onClick={() => {
                        if (!!user) {
                            console.log("Toggle button clicked, isAdmin before:", isAdmin);
                            setLoading(true);
                            if (!isAdmin) {
                                setTimeout(() => {
                                    toggleAdminMode();
                                    setLoading(false);
                                    router.push("/dashboard/");
                                }, 500);
                            } else {
                                setTimeout(() => {
                                    toggleAdminMode();
                                    setLoading(false);
                                    router.push("/");
                                }, 500);
                            }
                            console.log("Toggle button clicked, isAdmin after:", isAdmin);
                        }
                    }}
                    className={clsx(
                        "flex items-center rounded-md transition-colors cursor-pointer",
                        isCollapsed ? "justify-start gap-0 p-2" : "gap-2 p-2"
                    )}
                >
                    <UserStar className={`h-4 w-4 shrink-0 z-20 ${isCollapsed ? "mx-auto" : ""}`} />
                    {/* <h1
                        className={clsx(
                            "whitespace-nowrap overflow-hidden text-sm transition-all duration-200",
                            isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                        )}
                    >
                        {loading ? "Switching" : "Switch"} to {isAdmin ? "User" : "Admin"}
                    </h1> */}
                    <span
                        className={clsx(
                            "whitespace-nowrap overflow-hidden text-gray-700 text-sm transition-all duration-200",
                            isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                        )}
                    >
                        {loading ? "Switching" : "Switch"} to {isAdmin ? "User" : "Admin"}
                    </span>
                </button>
            </div>


        </aside>
    );
}