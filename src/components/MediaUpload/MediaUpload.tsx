"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Video, ImageIcon, X, Image, Loader } from "lucide-react"
import { UploadPhoto } from "@/utils/api"
import { tokenStore } from "@/lib/token"

const MediaUpload = ({ setCoverVideo, setGalleryFiles, coverVideo, galleryFiles, removeGalleryItem }: {
    setCoverVideo: any
    setGalleryFiles: any
    galleryFiles: any
    coverVideo: any,
    removeGalleryItem: any
}) => {

    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const videoUrl = URL.createObjectURL(e.target.files?.[0] as any);

        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = videoUrl;

        // Use a Promise to reliably get duration
        const getDuration = () =>
            new Promise<number>((resolve, reject) => {
                video.addEventListener("loadedmetadata", () => {
                    if (video.duration && !isNaN(video.duration)) {
                        resolve(video.duration);
                    } else {
                        reject("Could not determine video duration");
                    }
                });

                video.addEventListener("error", () => {
                    reject("Error loading video metadata");
                });
            });
        console.log(e.target.files);
        console.log(e.target);

        setLoading(true)
        if (e.target.files?.[0]) {

            const duration = await getDuration();

            // Clean up memory
            URL.revokeObjectURL(videoUrl);

            setCoverVideo(e.target.files[0])
            console.log(e.target.files?.[0]);
            const tk = tokenStore.get()
            const payload = {
                entity: "POST",
                fileExtension: e.target.files[0].type.split("/").pop(),
                type: "VIDEO",
                name: e.target.files[0].name.split(".")[0],
            };
            const res = await UploadPhoto(payload, tk?.accessToken ?? "", e.target.files?.[0], "video")
            setCoverVideo({
                url: res.fileUrl,
                duration: duration,
            });

            setLoading(false)

        }
    }

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoading2(true)

        const tk = tokenStore.get()
        if (e.target.files) {
            const payload = {
                entity: "POST",
                fileExtension: e.target.files[0].type.split("/").pop(),
                type: e.target.files[0].type.split("/")[0] === "video" ? "VIDEO" : "IMAGE",
                name: e.target.files[0].name.split(".")[0],
            };
            const fileType = e.target.files[0].type.split("/")[0] === "video" ? "video" : "image"
            const res = await UploadPhoto(payload, tk?.accessToken ?? "", e.target.files?.[0], fileType)
            setGalleryFiles((prev: any) => [...prev, res.fileUrl])
            setLoading2(false)

        }
    }


    return (
        <div className="space-y-6 w-full">
            {/* Cover Video Upload */}
            <div className="border-2 border-slate-300 border-dashed rounded-lg p-4 w-full">
                <div className="flex text-sm items-center gap-2 mb-3 font-semibold">
                    <Video className="w-4 h-4" />Upload Property Walkthrough Video
                </div>
                {
                    loading ?
                        <div className="flex flex-col items-center  h-[260px] justify-center text-center space-y-3">
                            <div className="flex flex-row gap-2 text-lg">
                                <Video size={28} /> Uploading cover video...
                            </div>
                            <div className="w-fit h-fit animate-spin transition-all duration-100">
                                <Loader />
                            </div>
                        </div>
                        :
                        <div className="flex flex-col items-center  h-[260px] justify-center text-center space-y-3">
                            {coverVideo ? (
                                <video
                                    src={coverVideo.url}
                                    controls
                                    className="w-full h-[220px] rounded-lg object-cover"
                                />
                            ) : (
                                <div className="text-sm text-muted-foreground ">
                                    No cover video uploaded yet
                                </div>
                            )}
                            <label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={handleCoverUpload}
                                />
                                <Button asChild variant="outline">
                                    <span className="flex items-center gap-2">
                                        <Upload className="w-4 h-4" /> {coverVideo ? "Replace" : "Upload"} Cover Video
                                    </span>
                                </Button>
                            </label>
                        </div>
                }
            </div>

            {/* Gallery Upload */}
            <div className="border-[2px] border-slate-300 w-full border-dashed rounded-lg p-4 ">
                <div className="flex items-center text-sm gap-2 mb-3 font-semibold">
                    <ImageIcon className="w-4 h-4" /> Bring Your Property to Life (Gallery Upload)
                </div>
                <div className="flex flex-wrap gap-3">
                    {galleryFiles?.map((url: any, index: any) => (
                        <div
                            key={index}
                            className="relative w-32 h-32 border rounded-lg overflow-hidden"
                        >
                            {/\.(mp4|mov|avi|mkv)$/i.test(url) ? (
                                <video
                                    src={url}
                                    className="w-full h-full object-cover"
                                    controls
                                />
                            ) : (
                                <img
                                    src={url}
                                    alt={`media-${index}`}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <button
                                onClick={() => removeGalleryItem(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {/* Upload Button */}
                    {loading2 ?
                        <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer text-muted-foreground hover:bg-accent/10">

                            <div className="flex flex-row items-center gap-1 text-sm">
                                <Upload className="w-4 h-4" />  Uploading...
                            </div>
                            <div className="w-fit mt-1 h-fit animate-spin transition-all duration-100">
                                <Loader size={18} />
                            </div>
                        </label>
                        :

                        <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer text-muted-foreground hover:bg-accent/10">
                            <Upload className="w-6 h-6 mb-1" />
                            <span className="text-xs">Upload</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={handleGalleryUpload}
                            />
                        </label>
                    }
                </div>
            </div>
        </div>
    )
}

export default MediaUpload
