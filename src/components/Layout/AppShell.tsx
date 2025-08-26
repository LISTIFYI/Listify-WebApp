"use client";

import React, { useState } from "react";
import Header from "./Header";
import { Sidebar } from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Header
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={() => setIsSidebarCollapsed((v) => !v)}
            />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar isCollapsed={isSidebarCollapsed} />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
