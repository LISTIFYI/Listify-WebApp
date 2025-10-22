"use client";
import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface CustomDrawerProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    showCloseButton?: boolean;
}

const SafeMobileDrawer: React.FC<CustomDrawerProps> = ({
    open,
    onClose,
    children,
    title,
    showCloseButton = true,
}) => {
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Prevent body scroll when drawer is open
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (e: PointerEvent) => {
            // Check if click/tap happened outside drawer
            if (
                drawerRef.current &&
                !drawerRef.current.contains(e.target as Node)
            ) {
                // Store the fact that pointer started outside
                (e as any)._outsideDrawer = true;
            }
        };

        const handlePointerUp = (e: PointerEvent) => {
            // Only close if both pointer down and up were outside
            if ((e as any)._outsideDrawer && drawerRef.current) {
                const path = e.composedPath();
                if (!path.includes(drawerRef.current)) {
                    onClose();
                }
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("pointerup", handlePointerUp);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("pointerup", handlePointerUp);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        ref={drawerRef}
                        className="bg-white rounded-t-2xl shadow-xl w-full sm:max-w-lg mx-auto overflow-hidden"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            {title && <h2 className="text-lg font-semibold">{title}</h2>}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-100 transition"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <div
                            className="max-h-[70vh] overflow-y-auto p-4"
                            style={{ WebkitOverflowScrolling: "touch" }}
                        >
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SafeMobileDrawer;
