"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Play, Heart, MessageCircle, Share, EyeIcon, Bookmark, ChevronUp, ChevronDown, Minimize2, Maximize2 } from 'lucide-react';
import VideoDetails from '@/components/VideoDetails/VideoDetails';
import Image from 'next/image';
import { usePostContext } from '@/lib/postContext';
import axios from 'axios';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { HiArrowUp } from "react-icons/hi";

// Update the Post interface
type Post = {
    post: {
        id: string;
        title: string;
        description: string;
        video_url: string;
        thumbnail_url: string;
        duration_seconds: number;
        tags: string[];
        mentions: string[];
        view_count: number;
        like_count: number;
        comment_count: number;
        share_count: number;
        save_count: number;
        status: string;
        visibility: string;
        location: string;
        comments_disabled: boolean;
        created_at: string;
        updated_at: string;
    };
    user: {
        id: string;
        name: string;
        profile_photo: string;
    };
    listing: {
        id: string;
        location: {
            address: string;
            area: string;
            city: string;
            state: string;
            pincode: string;
        };
        pricing: {
            type: string;
            pricePerSqft: number;
            amount: number;
            negotiable: boolean;
            maintenanceCharges: number;
        };
        status: string;
        title: string;
        propertyValues?: {
            bedroom?: number;
            bathroom?: number;
            hall?: number;
            totalFloor?: number;
            sqft_area?: number;
        };
    };
};

type ApiResponse = {
    posts: Post[];
    pagination: {
        totalCount: number;
        limit: number;
        offset: number;
    };
    success: boolean;
    message: string;
};

const VideoScrollingUI = () => {
    const { selectedPost, setSelectedPost } = usePostContext();


    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Post | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        totalCount: 0,
        limit: 20,
        offset: 0
    });
    const [userPausedVideos, setUserPausedVideos] = useState<Set<string>>(new Set());
    const [fullScreenVideoId, setFullScreenVideoId] = useState<string | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const videoRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const videoElementRefs = useRef<Record<string, HTMLVideoElement | null>>({});

    const [isMobile, setIsMobile] = useState(false);
    console.log("ismobile", isMobile);

    useEffect(() => {
        // Detect mobile based on screen width (you can refine this with UA sniffing if needed)
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);


    const getPosts = async (offset = 0) => {
        try {
            setLoading(true);
            const res = await axios.get<ApiResponse>(
                `https://listifyi-api-1012443530727.asia-south1.run.app/public/posts/feed?limit=20&offset=${offset}`
            );

            if (res.data.success) {
                let newPosts = res.data.posts;

                if (selectedPost) {
                    // Avoid duplicates
                    newPosts = newPosts.filter(p => p.post.id !== selectedPost.post.id);
                    // Insert selectedPost at index 0
                    newPosts = [selectedPost, ...newPosts];

                    // ✅ clear it from context after placing it
                    setSelectedPost(null);
                }

                if (offset === 0) {
                    setPosts(newPosts);
                } else {
                    setPosts(prev => [...prev, ...newPosts]);
                }

                setPagination(res.data.pagination);

                // If no video is selected yet, pick the first one
                if (!selectedVideo && newPosts.length > 0) {
                    setSelectedVideo(newPosts[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };


    // Load initial posts
    useEffect(() => {
        getPosts();
    }, []);

    // Format duration from seconds to MM:SS
    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Format numbers (1000 -> 1K)
    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };


    const toggleFullScreen = (postId: string, videoElement: HTMLVideoElement | null) => {
        if (!videoElement) return;

        if (fullScreenVideoId === postId) {
            // Exit full-screen
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log("Exit fullscreen failed:", err));
            }
            setFullScreenVideoId(null);
        } else {
            // Enter full-screen
            videoElement.requestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
            setFullScreenVideoId(postId);
        }
    };

    useEffect(() => {
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                setFullScreenVideoId(null);
            }
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    // Intersection Observer to detect which video is in view and handle autoplay
    useEffect(() => {
        if (posts.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const target = entry.target as HTMLElement;
                    const videoId = target.dataset.videoId;
                    const videoElement = videoElementRefs.current[videoId!];

                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        const post = posts.find((p) => p.post.id === videoId);
                        if (post && (!selectedVideo || selectedVideo.post.id !== videoId)) {
                            setSelectedVideo(post);
                        }

                        // Auto-play video if user hasn't manually paused it
                        if (videoElement && !userPausedVideos.has(videoId!)) {
                            videoElement.play().catch(err => {
                                console.log("Autoplay prevented:", err);
                            });
                        }
                    } else {
                        // Pause video when out of view (unless user manually paused it)
                        if (videoElement && !videoElement.paused) {
                            videoElement.pause();
                        }
                    }
                });
            },
            {
                root: scrollContainerRef.current,
                threshold: 0.5,
                rootMargin: "0px",
            }
        );

        Object.values(videoRefs.current).forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            observer.disconnect();
        };
    }, [posts, selectedVideo, userPausedVideos]);

    // Load more posts when scrolling near bottom
    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight - 1000) { // Load more when 1000px from bottom
            if (!loading && posts.length < pagination.totalCount) {
                getPosts(posts.length);
            }
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [posts.length, pagination.totalCount, loading]);

    const handleVideoClick = (post: Post, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const videoElement = videoElementRefs.current[post.post.id];
        if (videoElement) {
            if (videoElement.paused) {
                // User wants to play - remove from paused set
                setUserPausedVideos(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(post.post.id);
                    return newSet;
                });
                videoElement.play().catch(err => console.log("Play failed:", err));
            } else {
                // User wants to pause - add to paused set
                setUserPausedVideos(prev => new Set(prev).add(post.post.id));
                videoElement.pause();
            }
        }
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setTimeout(() => setSelectedVideo(null), 300);
    };

    const handleOpenDetails = () => {
        if (selectedVideo) {
            setIsDetailsOpen(true);
        }
    };

    const [expanded, setExpanded] = useState(false);


    useEffect(() => {
        if (isDetailsOpen) {
            if (!selectedVideo || !selectedVideo.listing?.id) {
                setIsDetailsOpen(false);
                // Optional: Clear selectedVideo after animation completes
                setTimeout(() => {
                    if (!selectedVideo || !selectedVideo.listing?.id) {
                        setSelectedVideo(null);
                    }
                }, 300); // Match the transition duration
            }
        }
    }, [selectedVideo, isDetailsOpen]);

    const scrollToVideo = (direction: 'up' | 'down') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const containerHeight = container.clientHeight;
        const currentScroll = container.scrollTop;

        if (direction === 'down') {
            container.scrollTo({
                top: currentScroll + containerHeight,
                behavior: 'smooth'
            });
        } else {
            container.scrollTo({
                top: Math.max(0, currentScroll - containerHeight),
                behavior: 'smooth'
            });
        }
    };

    if (!loading && posts.length !== 0) {
        return (
            <div className="h-full md:max-w-[400px] mx-auto  snap-start relative group md:rounded-xl overflow-hidden">
                {/* Video Placeholder */}
                <div className="relative h-full bg-gray-200 animate-pulse md:rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                {/* Bottom Gradient Info Section */}
                <div className="absolute bottom-0 left-0 right-0 px-2 bg-gradient-to-t pt-6 from-black/90 to-transparent rounded-b-xl">
                    <div className="flex justify-between items-end">
                        <div className="flex-1 mb-[10px]">
                            {/* Profile and Name */}
                            <div className="flex flex-row items-center gap-2 mb-2">
                                <div className="w-[28px] h-[28px] bg-gray-300 rounded-full animate-pulse" />
                                <div className="w-[100px] h-[12px] bg-gray-300 rounded animate-pulse" />
                            </div>

                            {/* Title */}
                            <div className="w-[60%] h-[14px] bg-gray-300 rounded mb-2 animate-pulse" />

                            {/* Description Lines */}
                            <div className="w-[80%] h-[10px] bg-gray-300 rounded mb-1 animate-pulse" />
                            <div className="w-[70%] h-[10px] bg-gray-300 rounded mb-2 animate-pulse" />

                            {/* View Details Button */}
                            <div className="w-[50%] h-[32px] bg-gray-400/60 rounded-md animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full bg-gray-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={() => getPosts(0)}
                        className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }




    return (
        <div className="h-full bg-white text-white overflow-hidden md:py-6 p-0">
            <div className="flex h-full relative">
                {/* Video Scrolling Section */}
                <div className={`h-full md:transition-all  md:duration-700 md:ease-out  ${isDetailsOpen ? "w-1/2" : 'w-full'}`}>
                    <div
                        ref={scrollContainerRef}
                        className="h-full   overflow-y-auto snap-y snap-mandatory flex justify-center no-scrollbar"
                    >
                        <div className="md:max-w-[400px] w-[100%]  space-y-2">
                            {posts.map((postData) => (
                                <div
                                    key={postData.post.id}
                                    ref={(el) => { videoRefs.current[postData.post.id] = el; }}
                                    data-video-id={postData.post.id}
                                    className="h-full snap-start  relative group cursor-pointer md:rounded-xl overflow-visible"
                                >
                                    {/* Video Element */}
                                    <div className='relative h-full md:rounded-xl overflow-hidden'>
                                        <video
                                            ref={(el) => { videoElementRefs.current[postData.post.id] = el; }}
                                            src={postData.post.video_url}
                                            poster={postData.post.thumbnail_url}
                                            // className="w-full h-full object-cover"
                                            loop={true}
                                            muted={false}
                                            playsInline
                                            preload="metadata"
                                            onClick={(e) => handleVideoClick(postData, e)}
                                        />


                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />

                                    </div>
                                    {/* Duration Badge */}
                                    {/* <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded text-sm pointer-events-none">
                                        {formatDuration(postData.post.duration_seconds)}
                                    </div> */}

                                    {/* <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded pointer-events-auto">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFullScreen(postData.post.id, videoElementRefs.current[postData.post.id]);
                                            }}
                                            className="flex items-center justify-center"
                                        >
                                            {fullScreenVideoId === postData.post.id ? (
                                                <Minimize2 className="w-5 h-5 text-white" />
                                            ) : (
                                                <Maximize2 className="w-5 h-5 text-white" />
                                            )}
                                        </button>
                                    </div> */}
                                    {/* Play/Pause Button - only shows when video is paused */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <button
                                            onClick={(e) => handleVideoClick(postData, e)}
                                            className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 hover:scale-110 transition-all duration-300 pointer-events-auto opacity-0 group-hover:opacity-100"
                                            style={{
                                                opacity: userPausedVideos.has(postData.post.id) ? 1 : undefined
                                            }}
                                        >
                                            {userPausedVideos.has(postData.post.id) ? (
                                                <Play className="w-8 h-8 text-white fill-white" />
                                            ) : (
                                                <div className="w-8 h-8 flex items-center justify-center">
                                                    <div className="w-1 h-6 bg-white rounded mx-0.5"></div>
                                                    <div className="w-1 h-6 bg-white rounded mx-0.5"></div>
                                                </div>
                                            )}
                                        </button>
                                    </div>

                                    {/* Video Info */}
                                    <div className="absolute bottom-0 left-0 right-0 px-2 bg-gradient-to-t from-black/90 to-transparent rounded-b-xl">
                                        <div className="flex justify-between items-end">
                                            <div className="flex-1 mb-[10px]">
                                                <div className='flex flex-row items-center gap-2'>
                                                    <div className='border w-[28px] h-[28px] overflow-hidden rounded-full'>
                                                        <Image
                                                            src={postData.user.profile_photo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG5CPz89vwuDB4H5EsXhkpKz0_koS-0HK0Yg&s"}
                                                            objectFit="cover"
                                                            width={28}
                                                            height={28}
                                                            alt={postData.user.name}
                                                            className='w-full h-full'
                                                        />
                                                    </div>
                                                    <h1 className='text-[14px] font-[500]'>{postData.user.name} <button className='text-[12px] border px-2 rounded-sm  font-semibold ml-1'>Follow</button></h1>
                                                </div>
                                                <h3 className="text-[16px] font-bold">{postData.post.title}</h3>
                                                <div className="lg:w-[100%] md:w-[100%] w-[80%] text-[12px] font-light tracking-wide">
                                                    {expanded || postData.post.description.length <= 80
                                                        ? (
                                                            <>
                                                                {postData.post.description}{" "}
                                                                {postData.post.description.length > 80 && (
                                                                    <button
                                                                        className="text-blue-500 cursor-pointer font-medium"
                                                                        onClick={() => setExpanded(false)}
                                                                    >
                                                                        See less
                                                                    </button>
                                                                )}
                                                            </>
                                                        )
                                                        : (
                                                            <>
                                                                {postData.post.description.slice(0, 80)}{" "}
                                                                <button
                                                                    className="text-blue-500  cursor-pointerfont-medium"
                                                                    onClick={() => setExpanded(true)}
                                                                >
                                                                    See more
                                                                </button>
                                                            </>
                                                        )}
                                                </div>

                                                {
                                                    postData?.listing?.id &&
                                                    <>
                                                        {
                                                            isMobile ?

                                                                <Drawer>
                                                                    <DrawerTrigger asChild>

                                                                        {
                                                                            postData?.listing &&
                                                                            <Button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (!isMobile) {
                                                                                        handleOpenDetails();
                                                                                    }
                                                                                }}
                                                                                className="px-4 h-10 py-[10px] mt-2 border bottom-0 bg-[rgba(0,0,0,0.4)] border-gray-500  shadow-md rounded-md text-[12px] font-medium transition-colors duration-200  lg:w-[100%] md:w-[100%] w-[80%]  "
                                                                            >
                                                                                View Details
                                                                            </Button>
                                                                        }
                                                                        {/* <Button className="w-full">Open Drawer</Button> */}
                                                                    </DrawerTrigger>
                                                                    <DrawerContent showIndicator={false} className="sm:max-w-lg mx-auto overflow-hidden rounded-t-2xl">

                                                                        <div className="max-h-[70vh] overflow-y-auto">
                                                                            <VideoDetails
                                                                                post={selectedVideo}
                                                                                handleCloseDetails={handleCloseDetails}
                                                                            />
                                                                        </div>

                                                                    </DrawerContent>
                                                                </Drawer>
                                                                :
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (!isMobile) {
                                                                            handleOpenDetails();
                                                                        }
                                                                    }}
                                                                    className="px-4 py-[10px] mt-2 border bottom-0 bg-[rgba(0,0,0,0.4)] border-gray-500  shadow-md rounded-md text-[12px] font-medium transition-colors duration-200 lg:w-[100%] md:w-[100%] w-[80%] "
                                                                >
                                                                    View Details
                                                                </button>

                                                        }
                                                    </>
                                                }



                                                {/* {postData.post.location && (
                                                    <p className="text-[10px] text-gray-300 mt-1">📍 {postData.post.location}</p>
                                                )} */}

                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col space-y-3 absolute bottom-[10px] md:-right-[32px] right-2">
                                                <div className="flex flex-col space-y-3">
                                                    <button className="duration-200 lg:text-black md:text-black text-white cursor-pointer">
                                                        <Heart size={26} className={`${postData.post.like_count > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                                                        <span className="text-[16px]">
                                                            {formatNumber(postData.post.like_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200  lg:text-black md:text-black text-white cursor-pointer">
                                                        <MessageCircle size={26} />
                                                        <span className="text-[16px]">
                                                            {formatNumber(postData.post.comment_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200  lg:text-black md:text-black text-white cursor-pointer ">
                                                        <EyeIcon size={26} />
                                                        <span className=" text-[16px]">
                                                            {formatNumber(postData.post.view_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200  lg:text-black md:text-black text-white cursor-pointer ">
                                                        <Bookmark size={26} />
                                                        <span className=" text-[16px]">
                                                            {formatNumber(postData.post.save_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200 lg:text-black md:text-black text-white cursor-pointer  ">
                                                        <Share size={26} />
                                                        <span className=" text-[16px]">
                                                            {formatNumber(postData.post.share_count ?? 0)}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden  md:flex  fixed right-[6px] top-1/2 transform -translate-y-1/2 flex-col gap-2 z-10">
                                        <button
                                            onClick={() => scrollToVideo('up')}
                                            className="bg-[#f2f2f2] border border-slate-200   rounded-full p-2.5 transition-all duration-200 hover:scale-110"
                                            disabled={loading}
                                        >
                                            <HiArrowUp className="w-5 h-5 text-black" />

                                        </button>
                                        <button
                                            onClick={() => scrollToVideo('down')}
                                            className="bg-[#f2f2f2] border border-slate-200   rounded-full p-2.5 transition-all duration-200 hover:scale-110"
                                            disabled={loading}
                                        >
                                            <HiArrowUp className="w-5 h-5 text-black rotate-180" />

                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Loading indicator at bottom */}
                            {loading && posts.length > 0 && (
                                <div className="h-20 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Panel */}

                {
                    !isMobile &&
                    <div
                        className={`h-full hidden md:flex border-l border-gray-400  rounded-[20px] overflow-hidden transition-transform duration-700 ease-out absolute top-0 w-1/2 ${isDetailsOpen ? 'translate-x-0  right-[50px]' : 'translate-x-full  right-[0px]'}`}
                    >
                        {selectedVideo && (
                            <VideoDetails
                                post={selectedVideo}
                                handleCloseDetails={handleCloseDetails}
                            />
                        )}
                    </div>
                }
            </div>
        </div>
    );
};

export default VideoScrollingUI;