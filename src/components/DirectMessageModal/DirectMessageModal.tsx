"use client";

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { ChevronLeft, Maximize2, Pencil, X } from "lucide-react";
import ChatsDetails from "../ChatsComponent/ChatsDetails";
import { useChat } from "@/context/ChatContext";
import { useRouter } from "next/navigation";


export default function DirectMessageModal({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (val: boolean) => void;
}) {

    const { chatDetails } = useChat()
    const router = useRouter()
    return (
        <>
            <Dialog
                modal={false}
                open={open} onOpenChange={setOpen} >
                <DialogContent className="sm:max-w-lg p-0  mb-0 overflow-hidden pb-4 bg-gray-100" showCloseButton={false}>
                    <div className='flex flex-row justify-between items-center  p-4 pb-3 border-b'>
                        <div className='flex flex-row items-center'>
                            <ChevronLeft className="cursor-pointer" size={28} onClick={() => {
                                setOpen(false)
                            }} />
                            <h1 className='text-[16px]  text-black font-medium text-nowrap  text-start'>{chatDetails?.username}</h1>
                        </div>
                        <div className="flex flex-row items-center gap-4">
                            <div className="transition-transform duration-300   w-fit h-fit hover:scale-110 cursor-pointer" onClick={() => {
                                router.push("/messages/")
                            }}>
                                <Maximize2 size={22} />
                            </div>

                            <div
                                onClick={() => {
                                    setOpen(false)
                                }}
                                className='flex border cursor-pointer ml-auto border-slate-300  hover:bg-gray-50 transition-all duration-300 rounded-full w-[32px] h-[32px] justify-center items-center '>
                                <X size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="h-[65vh] flex flex-1 overflow-y-auto">
                        <ChatsDetails showheader={false} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
