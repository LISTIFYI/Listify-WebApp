"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Play, Heart, MessageCircle, Share, EyeIcon, Bookmark, ChevronUp, ChevronDown } from 'lucide-react';
import VideoDetails from '@/components/VideoDetails/VideoDetails';
import Image from 'next/image';
import { usePostContext } from '@/lib/postContext';
import axios from 'axios';

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
    const { selectedPost } = usePostContext();
    console.log("selecpost", selectedPost);

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

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const videoRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const videoElementRefs = useRef<Record<string, HTMLVideoElement | null>>({});

    const getPosts = async (offset = 0) => {
        try {
            setLoading(true);
            const res = await axios.get<ApiResponse>(
                `https://listifyi-api-1012443530727.asia-south1.run.app/public/posts/feed?limit=20&offset=${offset}`
            );

            if (res.data.success) {
                if (offset === 0) {
                    setPosts(res.data.posts);
                } else {
                    setPosts(prev => [...prev, ...res.data.posts]);
                }
                setPagination(res.data.pagination);

                // Set first video as selected if no video is selected
                if (!selectedVideo && res.data.posts.length > 0) {
                    setSelectedVideo(res.data.posts[0]);
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

    if (loading && posts.length === 0) {
        return (
            <div className="h-full bg-gray-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12  mx-auto mb-4"></div>
                    <p>Loading posts...</p>
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
        <div className="h-full bg-gray-950 text-white overflow-hidden py-6">
            <div className="flex h-full relative">
                {/* Video Scrolling Section */}
                <div className={`h-full transition-all duration-700 ease-out ${isDetailsOpen ? 'w-1/2' : 'w-full'}`}>
                    <div
                        ref={scrollContainerRef}
                        className="h-full overflow-y-auto snap-y snap-mandatory flex justify-center no-scrollbar"
                    >
                        <div className="w-[400px] space-y-4">
                            {posts.map((postData) => (
                                <div
                                    key={postData.post.id}
                                    ref={(el) => { videoRefs.current[postData.post.id] = el; }}
                                    data-video-id={postData.post.id}
                                    className="h-full snap-start  relative group cursor-pointer rounded-xl overflow-visible"
                                >
                                    {/* Video Element */}
                                    <div className='relative h-full rounded-xl overflow-hidden'>
                                        <video
                                            ref={(el) => { videoElementRefs.current[postData.post.id] = el; }}
                                            src={postData.post.video_url}
                                            poster={postData.post.thumbnail_url}
                                            className="w-full h-full object-cover"
                                            loop
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
                                                <h3 className="text-[12px] font-normal">{postData.post.description}</h3>
                                                {/* {postData.post.location && (
                                                    <p className="text-[10px] text-gray-300 mt-1">📍 {postData.post.location}</p>
                                                )} */}
                                                {
                                                    postData?.listing &&
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenDetails();
                                                        }}
                                                        className="px-4 py-[10px] mt-2 bottom-0  backdrop-blur-md  shadow-md rounded-md text-[12px] font-medium transition-colors duration-200 w-[80%] "
                                                    >
                                                        View Details
                                                    </button>
                                                }
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col space-y-3 absolute bottom-[10px] -right-[30px]">
                                                <div className="flex flex-col space-y-2">
                                                    <button className="duration-200 ">
                                                        <Heart className={`w-6 h-6 ${postData.post.like_count > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                                                        <span className="text-xs">
                                                            {formatNumber(postData.post.like_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200 ">
                                                        <MessageCircle className="w-6 h-6" />
                                                        <span className="text-xs">
                                                            {formatNumber(postData.post.comment_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200  ">
                                                        <EyeIcon className="w-6 h-6" />
                                                        <span className=" text-xs">
                                                            {formatNumber(postData.post.view_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200  ">
                                                        <Bookmark className="w-6 h-6" />
                                                        <span className=" text-xs">
                                                            {formatNumber(postData.post.save_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200  ">
                                                        <Share className="w-6 h-6" />
                                                        <span className=" text-xs">
                                                            {formatNumber(postData.post.share_count ?? 0)}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
                        <button
                            onClick={() => scrollToVideo('up')}
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-200 hover:scale-110"
                            disabled={loading}
                        >
                            <ChevronUp className="w-6 h-6 text-white" />
                        </button>
                        <button
                            onClick={() => scrollToVideo('down')}
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-200 hover:scale-110"
                            disabled={loading}
                        >
                            <ChevronDown className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Details Panel */}

                <div
                    className={`h-full bg-gray-900 border-l border-gray-700 transition-transform duration-700 ease-out absolute top-0 right-0 w-1/2 ${isDetailsOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    {selectedVideo && (
                        <VideoDetails
                            post={selectedVideo}
                            handleCloseDetails={handleCloseDetails}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoScrollingUI;