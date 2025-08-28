"use client";

import React from "react";
import { Home, PlayCircle, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CgProfile } from "react-icons/cg";

interface BottomNavItem {
    id: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    href: string;
}

const navItems: BottomNavItem[] = [
    { id: "home", icon: Home, label: "Properties", href: "/" },
    { id: "explore", icon: PlayCircle, label: "Explore Reels", href: "/explore/" },
    { id: "settings", icon: CgProfile, label: "Settings", href: "/setting/" },
];

export function BottomNavigation() {
    const pathname = usePathname();

    return (
        <nav className="bg-white border-t border-gray-200 px-2 py-1 flex md:hidden justify-around items-center">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={clsx(
                            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors flex-1",
                            isActive
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        )}
                        aria-label={item.label}
                        title={item.label}
                    >
                        <Icon size={20} className="mb-1" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}