"use client";

import React, { useState } from "react";
import Header from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNavigation } from "./BottomTabNavigation";
import LoginModal from "../auth/LoginModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { X } from "lucide-react";
import NotificationPanel from "../NotificationPanel/NotificationPanel";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <div className="flex flex-col h-[100dvh] bg-gray-50">
            <Header
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={() => setIsSidebarCollapsed((v) => !v)}
                isSheetOpen={isSheetOpen} setIsSheetOpen={setIsSheetOpen}
            />

            <div className=" flex  flex-1 overflow-hidden ">
                <Sidebar isCollapsed={isSidebarCollapsed} isSheetOpen={isSheetOpen} setIsSheetOpen={setIsSheetOpen} />
                <main className="flex-1 h-full ">{children}
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}  >
                        <SheetContent side="right" className={` p-0 !max-w-none ${isSidebarCollapsed ? " w-[500px]" : " w-[500px]"} z-50`}>
                            <NotificationPanel setIsSheetOpen={setIsSheetOpen} />
                        </SheetContent>
                    </Sheet>

                </main>
            </div>

            <BottomNavigation />
            <LoginModal />

        </div>
    );
}
