import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"; // Assuming shadcn dialog import path

interface MediaItem {
    url: string;
    type: "image" | "video";
}

const VideoSectionComponent = ({ dataDetails, onModalVideoPlay }: any) => {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const images = dataDetails?.media?.images || [];
    const videos = dataDetails?.media?.videos || [];

    const combinedMedia: MediaItem[] = [
        ...images.map((url: string) => ({ url, type: "image" })),
        ...videos.map((url: string) => ({ url, type: "video" })),
    ];

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const scrollAmount = direction === "left" ? -300 : 300;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    // Handle mouse drag scroll
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // drag speed
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMediaClick = (index: number, e: React.MouseEvent) => {
        setSelectedIndex(index);
        setIsModalOpen(true);
        if (combinedMedia[index].type === "video" && onModalVideoPlay) {
            onModalVideoPlay(e); // ✅ Pass event here
        }
    };


    // Navigate in modal
    const navigateModal = (direction: "prev" | "next") => {
        if (direction === "prev") {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : combinedMedia.length - 1));
        } else {
            setSelectedIndex((prev) => (prev < combinedMedia.length - 1 ? prev + 1 : 0));
        }
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedIndex(0);
    };

    if (!combinedMedia?.length) return null;

    return (
        <div className="relative w-full py-6">
            {/* Scrollable container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto no-scrollbar px-4 cursor-grab active:cursor-grabbing scroll-smooth select-none"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                {combinedMedia.map((item, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 w-[160px] aspect-[9/12] rounded-2xl shadow-md relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={(e) => handleMediaClick(i, e)}
                    >
                        {item.type === "image" ? (
                            <img
                                src={item.url}
                                alt="media"
                                className="w-full h-full object-cover rounded-2xl"
                            />
                        ) : (
                            <video
                                src={item.url}
                                className="w-full h-full object-cover rounded-2xl"
                                muted
                                controls={false}
                                autoPlay={false}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center items-center gap-6 mt-4">
                <button
                    onClick={() => scroll("left")}
                    className="p-2 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700 transition"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={() => scroll("right")}
                    className="p-2 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700 transition"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* shadcn Dialog for Full-Screen Media Viewer */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} >
                <DialogContent showCloseButton={false} className="border-none bg-black shadow-none flex  h-[90vh] items-center justify-center max-w-lg p-0 overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-xl overflow-hidden">
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-6 right-6 z-20 text-white hover:text-gray-300 p-2 rounded-full bg-black/30 backdrop-blur-sm transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Navigation Buttons */}
                        <button
                            onClick={() => navigateModal("prev")}
                            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all backdrop-blur-sm disabled:opacity-50"
                            disabled={combinedMedia.length <= 1}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <button
                            onClick={() => navigateModal("next")}
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all backdrop-blur-sm disabled:opacity-50"
                            disabled={combinedMedia.length <= 1}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>

                        {/* Media Display */}
                        <div className="relative w-full h-full flex items-center justify-center p-10">
                            <div className="w-full  max-w-[900px] h-full flex items-center justify-center rounded-xl overflow-hidden bg-white">
                                {combinedMedia[selectedIndex].type === "image" ? (
                                    <img
                                        src={combinedMedia[selectedIndex].url}
                                        alt="media"
                                        className="max-w-full max-h-full  object-contain rounded-xl"
                                    />
                                ) : (
                                    <video
                                        src={combinedMedia[selectedIndex].url}
                                        className="max-w-full max-h-full  object-contain rounded-xl"
                                        autoPlay
                                        controls
                                        onEnded={() => navigateModal("next")}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Indicator */}
                        {combinedMedia.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                                <span className="text-sm font-medium">
                                    {selectedIndex + 1} / {combinedMedia.length}
                                </span>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default VideoSectionComponent;