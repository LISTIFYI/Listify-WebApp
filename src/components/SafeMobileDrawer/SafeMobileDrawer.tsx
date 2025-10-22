"use client";
import React, { useRef, useEffect } from "react";
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
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // ✅ Only close if the click happened *outside* the drawer content
        if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div
                    className="fixed inset-0 z-40 flex flex-col justify-end bg-black/50 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        ref={drawerRef}
                        className="bg-white rounded-t-2xl shadow-xl w-full sm:max-w-lg mx-auto overflow-hidden"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()} // Prevent click inside drawer from bubbling
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
                            className="max-h-[70vh] bg-red-300 overflow-y-auto p-4"
                            style={{
                                WebkitOverflowScrolling: "touch",
                            }}
                        >
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SafeMobileDrawer;
