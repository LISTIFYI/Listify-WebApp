"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Video, ImageIcon, X } from "lucide-react"
import { UploadPhoto } from "@/utils/api"
import { tokenStore } from "@/lib/token"

const MediaUpload = ({ setCoverVideo, setGalleryFiles, coverVideo, galleryFiles, removeGalleryItem }: {
    setCoverVideo: any
    setGalleryFiles: any
    galleryFiles: any
    coverVideo: any,
    removeGalleryItem: any
}) => {


    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
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
            setCoverVideo(res.fileUrl);

        }
    }

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        }
    }


    return (
        <div className="space-y-6 w-full">
            {/* Cover Video Upload */}
            <div className="border-2 border-slate-300 border-dashed rounded-lg p-4 w-fit">
                <div className="flex text-sm items-center gap-2 mb-3 font-semibold">
                    <Video className="w-4 h-4" />Upload Property Walkthrough Video
                </div>
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    {coverVideo ? (
                        <video
                            src={coverVideo}
                            controls
                            className="w-full h-[300px] rounded-lg object-cover"
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
                </div>
            </div>
        </div>
    )
}

export default MediaUpload
