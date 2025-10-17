"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Play, Heart, MessageCircle, Share, EyeIcon, Bookmark, ChevronUp, ChevronDown, Minimize2, Maximize2, X, Facebook, Twitter, Linkedin, Instagram, Share2, LinkIcon, Send, Mail } from 'lucide-react';
import VideoDetails from '@/components/VideoDetails/VideoDetails';
import Image from 'next/image';
import { usePostContext } from '@/lib/postContext';
import axios from 'axios';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { HiArrowUp } from "react-icons/hi";
import { IoFilter } from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import FilterComponent from '@/components/FilterComponent/FilterComponent';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from '../../../assets/logo.png'
import { FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import { IoIosMail, IoIosSend } from 'react-icons/io';
import { FaSquareThreads, FaXTwitter } from "react-icons/fa6";
import { useRouter } from 'next/navigation';
import { tokenStore } from '@/lib/token';
import { initializeApi } from '@/lib/http';

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
        is_liked?: boolean; // Added to track like status
        is_saved?: boolean;

    };
    stats: any
    is_liked: any
    is_saved: any
    user: {
        id: string;
        name: string;
        profile_photo: string;
        isFollowing?: boolean;
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
    const api = initializeApi(tokenStore).getApi();

    const { selectedPost, setSelectedPost } = usePostContext();
    const { setOpenFilter, filters, openFilter, user, openLogin } = useAuth()
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
    const router = useRouter()
    const [posts, setPosts] = useState<Post[]>([]);

    const [selectedVideo, setSelectedVideo] = useState<Post | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    console.log("wathchsdsososkodksokdsokdskdoskdsok", isDetailsOpen)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        totalCount: 0,
        limit: 20,
        offset: 0
    });
    const [userPausedVideos, setUserPausedVideos] = useState<Set<string>>(new Set());
    const [fullScreenVideoId, setFullScreenVideoId] = useState<string | null>(null);
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const videoRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const videoElementRefs = useRef<Record<string, HTMLVideoElement | null>>({});

    const [isMobile, setIsMobile] = useState(false);
    console.log("ismobile", isMobile);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            // 👇 Close details if entering mobile view
            if (mobile) {
                setIsDetailsOpen(false);
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);



    const getPosts = async (offset = 0, appliedFilters: any) => {
        try {
            const filterQuery = appliedFilters
                ? Object.entries(appliedFilters)
                    .filter(([_, value]) => {
                        return (
                            (typeof value === "string" && value.trim() !== "") ||
                            (Array.isArray(value) && value.length > 0) ||
                            typeof value === "number" ||
                            typeof value === "boolean"
                        );
                    })
                    .map(([key, value]) => {
                        if (key === "priceRange" && Array.isArray(value)) {
                            return `minPrice=${encodeURIComponent(value[0])}&maxPrice=${encodeURIComponent(value[1])}`;
                        }
                        return `${key}=${encodeURIComponent(String(value))}`;
                    })
                    .join("&")
                : "";
            console.log("filterQuery:", filterQuery);

            setLoading(true);
            let res;
            // If we have a logged-in user → use private API
            if (user) {
                if (filterQuery?.length > 0) {
                    res = await api.get(`/listings-v2/search/posts?offset=${offset}&limit=${25}&${filterQuery}`);
                } else {
                    res = await api.get(`/posts/feed?offset=${offset}&limit=${25}`);
                }
            }
            // Else → use public API
            else {
                if (filterQuery?.length > 0) {
                    res = await api.get(`/public/posts/search?offset=${offset}&limit=${25}&${filterQuery}`);
                } else {
                    res = await api.get(`/public/posts/feed?offset=${offset}&limit=${25}`);
                }
            }


            if (res.data) {
                let newPosts = res.data.posts ?? res?.data;

                // Add is_liked property to posts (assuming API returns this or we fetch separately)
                newPosts = await Promise.all(
                    newPosts.map(async (post: Post) => {
                        let profile
                        if (user) {
                            profile = await getUserProfile(post.user.id);
                        }
                        return {
                            ...post,
                            is_liked: post.is_liked ?? false,
                            is_saved: post.is_saved ?? false,
                            user: {
                                ...post.user,
                                isFollowing: profile?.isFollowing ?? false, // Add follow status
                            },
                            stats: {
                                ...post.stats,
                                like_count: post.stats?.like_count ?? 0,
                                save_count: post.stats?.save_count ?? 0,
                            },
                        };
                    })
                );


                if (selectedPost) {
                    newPosts = newPosts.filter((p: any) => p.post.id !== selectedPost.post.id);
                    newPosts = [selectedPost, ...newPosts];
                    setSelectedPost(null);
                }

                if (offset === 0) {
                    setPosts(newPosts);
                } else {
                    setPosts((prev) => [...prev, ...newPosts]);
                }

                setPagination(res.data.pagination);

                if (!selectedVideo && newPosts.length > 0) {
                    setSelectedVideo(newPosts[0]);
                }
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (post: Post) => {
        try {
            const userId = post?.user?.id;
            const isCurrentlyFollowing = post?.user?.isFollowing;

            // ✅ Optimistic update
            setPosts(prevPosts =>
                prevPosts.map(p =>
                    p.user.id === userId
                        ? {
                            ...p,
                            user: {
                                ...p.user,
                                isFollowing: !isCurrentlyFollowing,
                            },
                        }
                        : p
                )
            );

            if (selectedVideo?.user.id === userId) {
                setSelectedVideo(prev =>
                    prev && {
                        ...prev,
                        user: {
                            ...prev.user,
                            isFollowing: !isCurrentlyFollowing,
                        },
                    }
                );
            }

            if (isCurrentlyFollowing) {
                await api.delete(`/users/unfollow`, { data: { userId } });
            } else {
                await api.post(`/users/follow`, { userId });
            }

            // ✅ API call

        } catch (err) {
            console.error("Error toggling follow:", err);

            // ❌ Revert optimistic update
            setPosts(prevPosts =>
                prevPosts.map(p =>
                    p.user.id === post.user.id
                        ? {
                            ...p,
                            user: {
                                ...p.user,
                                isFollowing: post.user.isFollowing,
                            },
                        }
                        : p
                )
            );

            if (selectedVideo?.user.id === post.user.id) {
                setSelectedVideo(prev =>
                    prev && {
                        ...prev,
                        user: {
                            ...prev.user,
                            isFollowing: post.user.isFollowing,
                        },
                    }
                );
            }

            setError("Failed to update follow status");
        }
    };

    // LIKE toggle functionality
    const handleLikeToggle = async (post: Post) => {
        try {
            const postId = post?.post?.id;
            const isCurrentlyLiked = post?.is_liked;

            // Optimistic update
            setPosts(prevPosts =>
                prevPosts.map(p =>
                    p.post.id === postId
                        ? {
                            ...p,
                            is_liked: !isCurrentlyLiked,
                            stats: {
                                ...p?.stats,
                                like_count: isCurrentlyLiked
                                    ? p?.stats?.like_count - 1
                                    : p?.stats?.like_count + 1,
                            },
                        }
                        : p
                )
            );

            if (selectedVideo?.post.id === postId) {
                setSelectedVideo(prev => prev && {
                    ...prev,
                    is_liked: !isCurrentlyLiked,
                    stats: {
                        ...prev?.stats,
                        like_count: isCurrentlyLiked
                            ? prev?.stats?.like_count - 1
                            : prev?.stats?.like_count + 1,
                    },
                });
            }

            // API call
            if (isCurrentlyLiked) {
                await api.delete(`/posts/${postId}/like`);
            } else {
                await api.post(`/posts/${postId}/like`);
            }
        } catch (err) {
            console.error("Error toggling like:", err);
            // Revert optimistic update
            setPosts(prevPosts =>
                prevPosts.map(p =>
                    p.post.id === post.post.id
                        ? { ...p, is_liked: post?.is_liked, stats: { ...p.stats, like_count: post.stats?.like_count } }
                        : p
                )
            );
            if (selectedVideo?.post.id === post.post.id) {
                setSelectedVideo(prev => prev && {
                    ...prev,
                    is_liked: post.is_liked,
                    stats: { ...prev?.stats, like_count: post.stats?.like_count },
                });
            }
            setError("Failed to update like status");
        }
    };



    // SAVE toggle functionality
    const handleSaveToggle = async (post: Post) => {
        try {
            const postId = post?.post?.id;
            const isCurrentlySaved = post?.is_saved;

            // Optimistic update
            setPosts(prevPosts =>
                prevPosts.map(p =>
                    p.post.id === postId
                        ? {
                            ...p,
                            is_saved: !isCurrentlySaved,
                            stats: {
                                ...p?.stats,
                                save_count: isCurrentlySaved
                                    ? p?.stats?.save_count - 1
                                    : p?.stats?.save_count + 1,
                            },
                        }
                        : p
                )
            );

            if (selectedVideo?.post.id === postId) {
                setSelectedVideo(prev => prev && {
                    ...prev,
                    is_saved: !isCurrentlySaved,
                    stats: {
                        ...prev?.stats,
                        save_count: isCurrentlySaved
                            ? prev?.stats?.save_count - 1
                            : prev?.stats?.save_count + 1,
                    },
                });
            }

            // API call
            if (isCurrentlySaved) {
                await api.delete(`/posts/${postId}/save`);
            } else {
                await api.post(`/posts/${postId}/save`);
            }
        } catch (err) {
            console.error("Error toggling save:", err);
            // Revert optimistic update
            setPosts(prevPosts =>
                prevPosts.map(p =>
                    p.post.id === post.post.id
                        ? { ...p, is_saved: post?.is_saved, stats: { ...p?.stats, save_count: post?.stats?.save_count } }
                        : p
                )
            );
            if (selectedVideo?.post.id === post.post.id) {
                setSelectedVideo(prev => prev && {
                    ...prev,
                    is_saved: post.is_saved,
                    stats: { ...prev?.stats, save_count: post?.stats?.save_count },
                });
            }
            setError("Failed to update save status");
        }
    };



    // Load initial posts
    useEffect(() => {
        setPosts([]); // Clear existing posts
        setPagination((prev) => ({ ...prev, offset: 0 })); // Reset offset
        getPosts(0, filters);
    }, [filters, user]);

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
            if (!loading && posts.length < pagination?.totalCount) {
                getPosts(posts.length, filters);
            }
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [posts?.length, pagination?.totalCount, loading]);

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
    const [c, setC] = useState(false)

    const [sharedLink, setSharedLink] = useState("")
    console.log("sharedLink here", sharedLink);

    const generateLinkFn = async (id: string, setSharedLink: any) => {
        try {
            const res = await api.post(`/posts/${id}/share-link`);
            if (res.data) {
                setSharedLink(
                    res?.data?.shareUrl.replace(
                        "https://listifyi.com",
                        "http://localhost:3000"
                    )
                );
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };


    const getUserProfile = async (id: string) => {
        try {
            const res = await api.get<any>(`users/profile/${id}`);
            return res?.data

        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };



    // save wishlist fun

    const getAllWishlistFn = async () => {
        try {
            const response = await api.get<any>("/wishlists");
            const wishlists = response?.data?.wishlists || [];
            console.log("lo", wishlists);

            const filteredWishlists = wishlists.filter(
                (wishlist: any) => wishlist?.name?.toLowerCase() !== "saved posts"
            );
            return filteredWishlists;
        } catch (err: any) {
            console.error("Error fetching wishlist:", err.response || err);
            return [];
        }
    };

    const [wishlist, setWishlist] = useState<any>({ wishlists: [] });
    console.log("wishlist", wishlist);


    const getAllWishlist = async () => {
        try {
            const response = await getAllWishlistFn();
            setWishlist(response ?? []);
        } catch (error) {
            setWishlist([]);
        }
    };
    useEffect(() => {
        if (user) {
            getAllWishlist()

        }
    }, [user])

    // save wishlist fun


    if (loading && posts.length === 0) {
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
                        onClick={() => getPosts(0, filters)}
                        className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(sharedLink);
            setC(true)
        } catch (error) {
            setC(false)
            alert("Failed to copy link.");

        }
    };

    const shareOptions = [
        {
            name: `${c ? "Copied" : "Copy link"}`,
            icon: <LinkIcon size={20} />,
            onClick: handleCopy,
        },
        {
            name: "WhatsApp",
            icon: <FaWhatsapp size={20} className="text-[#25D366]" />,
            url: `https://api.whatsapp.com/send?text=${sharedLink}`,
        },
        {
            name: "Facebook",
            icon: <FaFacebookF size={20} className="text-[#1877F2]" />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${sharedLink}`,
        },
        {
            name: "Messenger",
            icon: <IoIosSend size={20} className="text-[#0084FF]" />,
            url: `https://www.facebook.com/dialog/send?link=${sharedLink}`,
        },

        {
            name: "Email",
            icon: <IoIosMail size={20} className="text-gray-700" />,
            url: `mailto:?subject=Check%20this%20out&body=${sharedLink}`,
        },
        {
            name: "Threads",
            icon: <FaSquareThreads size={20} className="text-gray-700" />,
            url: `https://www.threads.net/intent/post?text=${sharedLink}`,
        },
        {
            name: "X",
            icon: <FaXTwitter size={20} className="text-gray-700" />,
            url: `https://twitter.com/intent/tweet?url=${sharedLink}`,
        },
    ];
    console.log(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharedLink)}`);

    return (
        <div className="h-full bg-white text-white overflow-hidden ">

            {/* save */}
            <Dialog open={wishlistModalOpen} onOpenChange={setWishlistModalOpen}>
                <DialogContent
                    showCloseButton={false}
                    className="w-[90%] md:max-w-xl lg:max-w-xl rounded-2xl overflow-hidden p-0"
                >
                    {/* Header */}
                    <div className="flex flex-row justify-between items-center p-4 border-b">
                        <div className="flex flex-row gap-2 items-center">
                            <Image
                                src={Logo}
                                alt="logo"
                                className="max-w-[30px] h-[30px] border rounded-md"
                            />
                            <h1 className="text-[22px] text-black font-[700] text-nowrap">
                                Wishlist
                            </h1>
                        </div>

                        <button
                            onClick={() => setShareModalOpen(false)}
                            className="flex border border-slate-300 cursor-pointer hover:bg-gray-50 transition-all duration-300 rounded-full w-[32px] h-[32px] justify-center items-center"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    <div className='border border-red-600 w-full px-4'>
                        <h1>Collections</h1>
                        <div className='border-[4px] border-green-400 '>

                            {
                                wishlist?.length && wishlist?.map((i: any) => {
                                    return (
                                        <div key={i?._id}>{i?.name}</div>

                                    )
                                })
                            }                        </div>

                    </div>

                </DialogContent>
            </Dialog>
            {/* save */}

            <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
                <DialogContent
                    showCloseButton={false}
                    className="w-[90%] md:max-w-xl lg:max-w-xl rounded-2xl overflow-hidden p-0"
                >
                    {/* Header */}
                    <div className="flex flex-row justify-between items-center p-4 border-b">
                        <div className="flex flex-row gap-2 items-center">
                            <Image
                                src={Logo}
                                alt="logo"
                                className="max-w-[30px] h-[30px] border rounded-md"
                            />
                            <h1 className="text-[22px] text-black font-[700] text-nowrap">
                                Listifyi
                            </h1>
                        </div>

                        <button
                            onClick={() => setShareModalOpen(false)}
                            className="flex border border-slate-300 cursor-pointer hover:bg-gray-50 transition-all duration-300 rounded-full w-[32px] h-[32px] justify-center items-center"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* Share options */}
                    <div
                        className="
        flex gap-4 py-4 px-4 
        overflow-x-auto 
        scrollbar-hide 
        justify-start 
        md:justify-center
        scroll-smooth
      "
                    >
                        {shareOptions.map((opt) => (
                            <div
                                key={opt.name}
                                onClick={() => {
                                    if (opt.onClick) return opt.onClick();
                                    if (opt.url) window.open(opt.url, "_blank");
                                }}
                                className="flex flex-col items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-200">
                                    {opt.icon}
                                </div>
                                <span className="text-xs text-gray-600 text-center w-[60px] truncate">
                                    {opt.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={openFilter} onOpenChange={() => {
                setOpenFilter(false)
            }}

            >
                <DialogContent showCloseButton={false} className="p-2 fixed h-[80%] sm:max-w-full w-[900px]">
                    <FilterComponent />
                </DialogContent>

            </Dialog>
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
                                            className="w-full h-full object-cover"
                                            loop={true}
                                            muted={true}
                                            playsInline
                                            preload="metadata"
                                            onClick={(e) => handleVideoClick(postData, e)}
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                                    </div>

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
                                                    <h1 className='text-[16px] font-[500]'>
                                                        <span
                                                            onClick={() => {
                                                                if (user?.id === postData.user.id) {
                                                                    router.push(`/profile`)

                                                                }
                                                                else {
                                                                    router.push(`/profile/${postData.user.id}`)

                                                                }
                                                            }}

                                                        >{postData.user.name}</span>
                                                        {user?.id !== postData.user.id &&

                                                            <button onClick={() => {
                                                                if (user) {
                                                                    handleFollowToggle(postData)
                                                                } else {
                                                                    openLogin()
                                                                }
                                                            }} className='text-[15px] transition-all duration-200 border px-2 rounded-sm  font-semibold ml-1'>
                                                                {
                                                                    postData.user.isFollowing ? "Following" : "Follow"
                                                                }
                                                            </button>
                                                        }
                                                    </h1>
                                                </div>
                                                <h3 className="text-[16px] font-bold">{postData.post.title}</h3>
                                                <div className="showWidth text-[12px] font-light tracking-wide">
                                                    {expanded || postData.post.description.length <= 80
                                                        ? (
                                                            <>
                                                                {postData.post.description}{" "}<br />{postData.post.tags.map((i) => `#${i} `)}
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
                                                                                className="px-4 h-10 py-[10px] mt-2 border bottom-0 bg-[rgba(0,0,0,0.4)] border-gray-500  shadow-md rounded-md text-[12px] font-medium transition-colors duration-200  showWidth "
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
                                                                                isDetailsOpen={isDetailsOpen}
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
                                                                    className="px-4 py-[10px] mt-2 border bottom-0 bg-[rgba(0,0,0,0.4)] border-gray-500  shadow-md rounded-md text-[12px] font-medium transition-colors duration-200 showWidth"
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
                                            <div className={`flex-col space-y-3 hidden md:flex alignAction `}>
                                                <div className="flex flex-col space-y-3">
                                                    <button
                                                        onClick={(e) => {
                                                            if (user) {
                                                                e.stopPropagation();
                                                                handleLikeToggle(postData);
                                                            } else {
                                                                openLogin()
                                                            }
                                                        }}
                                                        className="duration-200  actionColor cursor-pointer"
                                                    >
                                                        <Heart
                                                            size={26}
                                                            className={postData?.is_liked ? 'fill-red-500 text-red-500' : ''}
                                                        />
                                                        <span className="text-[16px]">
                                                            {formatNumber(postData?.post?.like_count ?? postData?.stats?.like_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200   actionColor cursor-pointer">
                                                        <MessageCircle size={26} />
                                                        <span className="text-[16px]">
                                                            {formatNumber(postData?.post?.comment_count ?? postData?.stats?.comment_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200  actionColor cursor-pointer ">
                                                        <EyeIcon size={26} />
                                                        <span className=" text-[16px]">
                                                            {formatNumber(postData?.post?.view_count ?? postData?.stats?.view_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {

                                                            if (user) {
                                                                e.stopPropagation();

                                                                // if (!postData?.is_saved) {
                                                                handleSaveToggle(postData);
                                                                // setWishlistModalOpen(true)
                                                                // } else {
                                                                // setWishlistModalOpen(true)
                                                                // }

                                                            } else {
                                                                openLogin()
                                                            }
                                                        }}
                                                        className="duration-200 actionColor  cursor-pointer"
                                                    >
                                                        <Bookmark
                                                            size={26}
                                                            className={postData?.is_saved ? 'fill-red-500 text-red-500' : ''}
                                                        />
                                                        <span className="text-[16px]">
                                                            {formatNumber(postData?.post?.save_count ?? postData?.stats?.save_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (user) {
                                                                generateLinkFn(postData?.post?.id, setSharedLink)
                                                                setShareModalOpen(true)


                                                            }
                                                            else {
                                                                openLogin()
                                                            }
                                                        }}
                                                        className="duration-200 actionColor cursor-pointer  ">
                                                        <Share size={26} />
                                                        <span className=" text-[16px]">
                                                            {formatNumber(postData?.post?.share_count ?? postData?.stats?.share_count ?? 0)}
                                                        </span>
                                                    </button>


                                                    <button
                                                        onClick={() => {
                                                            setOpenFilter(true)
                                                        }}
                                                        className="duration-200 flex md:hidden lg:hidden actionColor cursor-pointer  ">
                                                        <IoFilter className="text" size={26} />
                                                    </button>

                                                </div>
                                            </div>
                                            <div className={`flex-col space-y-3 flex md:hidden alignAction2 `}>
                                                <div className="flex flex-col space-y-3">
                                                    <button
                                                        onClick={(e) => {
                                                            if (user) {
                                                                e.stopPropagation();
                                                                handleLikeToggle(postData);
                                                            } else {
                                                                openLogin()
                                                            }
                                                        }}
                                                        className="duration-200  actionColor2 cursor-pointer"
                                                    >
                                                        <Heart
                                                            size={26}
                                                            className={postData?.is_liked ? 'fill-red-500 text-red-500' : ''}
                                                        />
                                                        <span className="text-[16px]">
                                                            {formatNumber(postData?.post?.like_count ?? postData?.stats?.like_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200   actionColor2 cursor-pointer">
                                                        <MessageCircle size={26} />
                                                        <span className="text-[16px]">
                                                            {formatNumber(postData?.post?.comment_count ?? postData?.stats?.comment_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button className="duration-200  actionColor2 cursor-pointer ">
                                                        <EyeIcon size={26} />
                                                        <span className=" text-[16px]">
                                                            {formatNumber(postData?.post?.view_count ?? postData?.stats?.view_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {

                                                            if (user) {


                                                                e.stopPropagation();

                                                                // if (!postData?.is_saved) {
                                                                handleSaveToggle(postData);
                                                                // setWishlistModalOpen(true)
                                                                // } else {
                                                                // setWishlistModalOpen(true)
                                                                // }

                                                            } else {
                                                                openLogin()
                                                            }
                                                        }}
                                                        className="duration-200 actionColor2  cursor-pointer"
                                                    >
                                                        <Bookmark
                                                            size={26}
                                                            className={postData?.is_saved ? 'fill-red-500 text-red-500' : ''}
                                                        />
                                                        <span className="text-[16px]">
                                                            {formatNumber(postData?.post?.save_count ?? postData?.stats?.save_count ?? 0)}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (user) {
                                                                generateLinkFn(postData?.post?.id, setSharedLink)
                                                                setShareModalOpen(true)


                                                            }
                                                            else {
                                                                openLogin()
                                                            }
                                                        }}
                                                        className="duration-200 actionColor2 cursor-pointer  ">
                                                        <Share size={26} />
                                                        <span className=" text-[16px]">
                                                            {formatNumber(postData?.post?.share_count ?? postData?.stats?.share_count ?? 0)}
                                                        </span>
                                                    </button>


                                                    <button
                                                        onClick={() => {
                                                            setOpenFilter(true)
                                                        }}
                                                        className="duration-200 flex md:hidden lg:hidden actionColor2 cursor-pointer  ">
                                                        <IoFilter className="text" size={26} />
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
                        className={`h-full hidden md:flex border-l border-gray-400  rounded-[20px] overflow-hidden transition-transform duration-700  ease-out absolute top-0 w-1/2 ${isDetailsOpen ? 'translate-x-0  right-[0px]' : 'translate-x-full  right-[0px]'}`}
                    >

                        {selectedVideo && (
                            <VideoDetails
                                post={selectedVideo}
                                handleCloseDetails={handleCloseDetails}
                                isDetailsOpen={isDetailsOpen}
                            />
                        )}
                    </div>
                }
            </div>
        </div>
    );
};

export default VideoScrollingUI;