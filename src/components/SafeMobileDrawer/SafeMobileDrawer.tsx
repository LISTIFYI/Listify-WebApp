"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";

interface DrawerModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    showCloseButton?: boolean;
}

export function DrawerModal({
    open,
    onClose,
    children,
    title,
    showCloseButton = true,
}: DrawerModalProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent
                className="p-0 bg-transparent border-none shadow-none max-w-full sm:max-w-lg mx-auto flex justify-end flex-col"
                // Prevent closing on input focus blur
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white w-full rounded-t-2xl overflow-hidden shadow-xl"
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
            </DialogContent>
        </Dialog>
    );
}
