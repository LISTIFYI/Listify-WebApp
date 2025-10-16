"use client";
import { Home, PlayCircle, Bell, Send, UserStar, List, Search, PlusCircle, Settings, FilePlus2, Image, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";


type SidebarProps = {
    isCollapsed?: boolean,
    setIsSheetOpen: (value: boolean) => void,
    isSheetOpen: boolean
};

export function Sidebar({ isCollapsed = false, isSheetOpen, setIsSheetOpen }: SidebarProps) {
    const { isAdmin, toggleAdminMode, user, openLogin } = useAuth();
    console.log("Sidebar isAdmin:", isAdmin);
    console.log("Sidebar toggleAdminMode:", toggleAdminMode);
    const [loading, setLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


    const pathname = usePathname();
    const router = useRouter();
    const navItems: any[] = [
        { name: "Properties", href: "/", icon: Home },
        { name: "Explore", href: "/explore/", icon: PlayCircle },
        { name: "Create", href: "#", icon: PlusCircle, isModal: true },
        { name: "Messages", href: "/messages/", icon: Send },
        { name: "Discover", href: "/discover/", icon: Search },
        { name: "Settings", href: "/settings/", icon: Settings },
    ];

    const navItems2: any[] = [
        { name: "Dashboard", href: "/dashboard/", icon: Home },
        { name: "Properties", href: "/properties/", icon: List },
        { name: "Create", href: "#", icon: PlusCircle, isModal: true },
        { name: "Messages", href: "/messages/", icon: Send },
        { name: "Settings", href: "/settings/", icon: Settings },
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

                    const handleClick = (e: React.MouseEvent) => {
                        if (item.isModal) {
                            if (user) {
                                e.preventDefault();
                                setIsCreateModalOpen(true);
                            }
                            else {
                                openLogin()
                            }
                        }
                    };

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={item.isModal ? handleClick : undefined}
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

            <Dialog open={isCreateModalOpen} onOpenChange={() => {
                setIsCreateModalOpen(false)
            }}

            >
                <DialogContent showCloseButton={false} className="w-fit p-0">
                    <div className='flex flex-row justify-between items-center p-2  border-b'>
                        <div
                            onClick={() => {
                                setIsCreateModalOpen(false)

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
                                    setIsCreateModalOpen(false)
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
                            onClick={() => router.push("/create-post")}
                            className="w-[100px] h-[100px] cursor-pointer bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-500 hover:shadow-md transition-all duration-200"
                        >
                            <FilePlus2 size={32} className="text-blue-600 mb-2" />
                            <span className="font-medium text-gray-800 text-sm">Post</span>
                        </button>
                    </div>
                </DialogContent>

            </Dialog>
        </aside>
    );
}