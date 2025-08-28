// components/Layout/Sidebar.tsx
"use client";

import { Home, PlayCircle, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type SidebarProps = { isCollapsed?: boolean };

export function Sidebar({ isCollapsed = false }: SidebarProps) {
    const pathname = usePathname();
    const navItems = [
        { name: "Properties", href: "/", icon: Home },
        { name: "Explore", href: "/explore/", icon: PlayCircle },
        { name: "Setting", href: "/setting/", icon: Settings },
    ];

    return (
        <aside
            className={clsx(
                "bg-white border-r shadow-sm transition-all duration-300 ease-in-out hidden md:block",
                isCollapsed ? "w-[53px] px-2 py-4" : "w-56 p-4" // <- smaller padding when collapsed
            )}
        >
            <nav className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center rounded-md transition-colors",
                                isCollapsed ? "justify-start gap-0 p-2" : "gap-2 p-2", // <- no gap when collapsed
                                isActive
                                    ? "bg-blue-100 text-blue-600 font-medium"
                                    : "hover:bg-gray-100 text-gray-700"
                            )}
                            aria-label={item.name}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <Icon className={`h-5 w-5 shrink-0 `} />

                            {/* Label collapses width + fades, so icons stay visible */}
                            <span
                                className={clsx(
                                    "whitespace-nowrap overflow-hidden transition-all duration-200",
                                    isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                                )}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
