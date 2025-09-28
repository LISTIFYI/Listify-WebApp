"use client";

import React, { useState } from "react";
import Header from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNavigation } from "./BottomTabNavigation";
import LoginModal from "../auth/LoginModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex flex-col h-[100dvh] bg-gray-50">
            <Header
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={() => setIsSidebarCollapsed((v) => !v)}
            />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar isCollapsed={isSidebarCollapsed} />
                <main className="flex-1 h-full ">{children}</main>
            </div>

            <BottomNavigation />
            <LoginModal />
        </div>
    );
}
