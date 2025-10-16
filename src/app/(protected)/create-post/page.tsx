"use client";
import ButtonCommon from "@/components/CustomFields/Button";
import InputBox from "@/components/CustomFields/InputBox";
import TextAreaBox from "@/components/CustomFields/TextAreaBox";
import { Button } from "@/components/ui/button";
import { http } from "@/lib/http";
import { tokenStore } from "@/lib/token";
import { UploadPhoto } from "@/utils/api";
import { te } from "date-fns/locale";
import { Loader, Upload, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";

interface PostData {
    title: string;
    description: string;
    hashtags: string[];
    location: string;
    video: string | null;
    thumbnail: string | null;
}

const PostScreen: React.FC = () => {
    const router = useRouter()
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [location, setLocation] = useState<string>("");
    const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
    const [videoFile, setVideoFile] = useState<string | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    console.log("okokokok", thumbnailUrl);
    const [postType, setPostType] = useState("")
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Extract hashtags automatically
    const handleDescriptionChange = (value: string) => {
        setDescription(value);
        const tags = value.match(/#\w+/g);
        setHashtags(tags ? tags.map((t) => t.replace("#", "")) : []);
    };



    // Submit post
    const [createPost, setCreatePost] = useState(false)
    const handleSubmit = async (p: any) => {

        const cleanDescription = description.replace(/#\w+/g, "").trim();

        const payload = {
            title: title,
            description: cleanDescription,
            video_url: coverVideo?.url,
            thumbnail_url: "",
            duration_seconds: coverVideo?.duration,
            tags: hashtags,
            mentions: [],
            visibility: "PUBLIC",
            location: location || "Udaipur, Rajasthan - IN",
            comments_disabled: false,
            ...(p === 'DRAFT' ? { status: 'DRAFT' } : { status: 'PUBLISHED' }),
        };
        try {
            setCreatePost(true)
            const postResponse = await http.post(`/posts`, payload);
            router.replace("/");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong!");


        } finally {
            setCreatePost(false)

        }
    };


    const [coverVideo, setCoverVideo] = useState<any>()
    const [loading, setLoading] = useState(false)

    // Upload cover video and generate thumbnail
    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const videoUrl = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = videoUrl;

        const getDuration = () =>
            new Promise<number>((resolve, reject) => {
                video.addEventListener("loadedmetadata", () => {
                    if (video.duration && !isNaN(video.duration)) {
                        resolve(video.duration);
                    } else {
                        reject("Could not determine video duration");
                    }
                });
                video.addEventListener("error", () => reject("Error loading video metadata"));
            });

        try {
            const duration = await getDuration();

            const tk = tokenStore.get();
            const payload = {
                entity: "POST",
                fileExtension: file.type.split("/").pop(),
                type: "VIDEO",
                name: file.name.split(".")[0],
            };

            // Upload to server
            const res = await UploadPhoto(payload, tk?.accessToken ?? "", file, "video");

            // Save uploaded URL
            setCoverVideo({
                url: res.fileUrl,
                duration: duration,
            });

            // Generate thumbnail locally from uploaded file

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        } finally {
            URL.revokeObjectURL(videoUrl);
        }
    };



    return (
        <div className="h-full flex flex-col">
            <div className="h-full flex overflow-y-auto flex-col  py-4 px-4">
                <div className="flex flex-col mb-10 gap-2">
                    <h1 className="text-xl font-semibold text-black text-start">
                        Share Your Moment
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Create a new post to share your story, property, or experience with the world.
                    </p>
                </div>
                <div className="flex flex-col-reverse gap-4  lg:flex-row">
                    <div className="flex w-full lg:w-[60%] flex-col gap-2">
                        <div className='w-full ' >
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <InputBox
                                placeholder="Title"
                                value={title}
                                onChange={(text) => setTitle(text)}
                                className="mt-1"
                            />
                            {/* {errors.operatingSince && (
                                    <p className="text-red-500 text-sm mt-1">{errors.operatingSince}</p>
                                )} */}
                        </div>
                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <TextAreaBox
                                placeholder={"Description"}
                                value={description}
                                onChange={(text: string) => {
                                    setDescription(text)

                                    handleDescriptionChange(text)
                                }}
                                className="mt-1"
                            />
                        </div>



                        {/* Location */}
                        <div className='w-full'>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <TextAreaBox
                                placeholder={"Location"}
                                value={location}
                                onChange={(text: string) => setLocation(text)}
                                className="mt-1"
                            />
                            {/* {errors.operatingSince && (
                                    <p className="text-red-500 text-sm mt-1">{errors.operatingSince}</p>
                                )} */}
                        </div>
                        <div className=" flex-row gap-4 hidden lg:flex">
                            <ButtonCommon
                                bgColor="bg-white"
                                textC="text-black"
                                border="border-[1px]"
                                onClick={() => {
                                    // setFormCount((prev: any) => Math.max(prev - 1, 1))
                                    handleSubmit("DRAFT")
                                }}
                                title="Draft"
                            />
                            <ButtonCommon
                                bgColor="bg-black"
                                textC="text-white"
                                onClick={() => {
                                    // setFormCount((prev: any) => Math.max(prev - 1, 1))
                                    handleSubmit("POST")
                                }}
                                title={`${createPost ? "Posting..." : "Post"}`}

                            />
                        </div>
                    </div>
                    <div className="w-full lg:w-[40%]">
                        <div className="w-full border-2 border-slate-300 border-dashed rounded-lg p-4 ">
                            <div className="flex text-sm items-center gap-2 mb-3 font-semibold">
                                <Video className="w-4 h-4" />Upload Cover Video
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
                    </div>
                </div>

            </div>
            <div className=" flex-row gap-4 flex lg:hidden p-4">
                <ButtonCommon
                    bgColor="bg-white"
                    textC="text-black"
                    border="border-[1px]"
                    onClick={() => {
                        // setFormCount((prev: any) => Math.max(prev - 1, 1))
                        handleSubmit("DRAFT")
                    }}
                    title="Draft"
                />
                <ButtonCommon
                    bgColor="bg-black"
                    textC="text-white"
                    onClick={() => {
                        // setFormCount((prev: any) => Math.max(prev - 1, 1))
                        handleSubmit("POST")
                    }}
                    title={`${createPost ? "Posting..." : "Post"}`}
                />
            </div>
        </div>
    );
};

export default PostScreen;
