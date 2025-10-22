"use client";
import React from "react";
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
    React.useEffect(() => {
        // Prevent background scroll when open
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Drawer Content */}
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl overflow-hidden"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        // 👇 Important: makes drawer stable even when keyboard appears
                        style={{ transform: "translateY(0)", willChange: "transform" }}
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
                            style={{
                                // Prevent resize glitches when keyboard opens
                                WebkitOverflowScrolling: "touch",
                            }}
                        >
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SafeMobileDrawer;
