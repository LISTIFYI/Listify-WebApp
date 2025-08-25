"use client"

import { Home, Building2, PlayCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

export function Sidebar() {
    const pathname = usePathname()

    const navItems = [
        { name: "Properties", href: "/", icon: Home },
        { name: "Explore Reels", href: "/explore/", icon: PlayCircle },
        // { name: "Projects", href: "/projects", icon: Building2 },
    ]

    return (
        <aside className="w-64 bg-white border-r shadow-sm p-4">
            <nav className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    console.log("no", pathname, item.href);


                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-2 p-2 rounded-md transition-colors",
                                isActive
                                    ? "bg-blue-100 text-blue-600 font-medium"
                                    : "hover:bg-gray-100 text-gray-700"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
