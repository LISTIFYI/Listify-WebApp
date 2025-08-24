"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Play, Heart, MessageCircle, Share, X, Clock, Eye, EyeIcon, Bookmark } from 'lucide-react';
import VideoDetails from '@/components/VideoDetails/VideoDetails';
import Image from 'next/image';

const VideoScrollingUI = () => {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const scrollContainerRef = useRef(null);
    const videoRefs = useRef({});

    // Mock video data
    const videos = [
        {
            id: 1,
            title: "Amazing Sunset Timelapse",
            creator: "NatureFilms",
            thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
            duration: "2:34",
            likes: "12.5K",
            comments: "234",
            views: "45.2K",
            description: "Watch this breathtaking sunset timelapse captured over the mountains. The golden hour creates magical lighting that transforms the entire landscape.",
            tags: ["nature", "sunset", "timelapse", "mountains"]
        },
        {
            id: 2,
            title: "Urban Street Photography",
            creator: "CityLens",
            thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=600&fit=crop",
            duration: "3:21",
            likes: "8.7K",
            comments: "156",
            views: "23.1K",
            description: "Exploring the vibrant streets of downtown with a focus on candid moments and architectural beauty. Street photography at its finest.",
            tags: ["street", "urban", "photography", "city"]
        },
        {
            id: 3,
            title: "Ocean Waves Relaxation",
            creator: "SerenitySound",
            thumbnail: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=600&fit=crop",
            duration: "5:45",
            likes: "25.3K",
            comments: "567",
            views: "78.9K",
            description: "Peaceful ocean waves washing onto the shore. Perfect for meditation, relaxation, or background ambiance while working or studying.",
            tags: ["ocean", "relaxation", "meditation", "nature"]
        },
        {
            id: 4,
            title: "Mountain Hiking Adventure",
            creator: "AdventureSeeker",
            thumbnail: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=600&fit=crop",
            duration: "4:12",
            likes: "15.2K",
            comments: "289",
            views: "34.7K",
            description: "Join us on an epic mountain hiking adventure through rugged terrain and breathtaking vistas. Experience the thrill of reaching new heights.",
            tags: ["hiking", "mountains", "adventure", "outdoor"]
        },
        {
            id: 5,
            title: "City Lights Night Drive",
            creator: "NightCrawler",
            thumbnail: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=600&fit=crop",
            duration: "3:56",
            likes: "19.8K",
            comments: "445",
            views: "56.3K",
            description: "Cruise through the city at night with neon lights reflecting off wet streets. The perfect urban nighttime driving experience.",
            tags: ["city", "night", "driving", "urban", "neon"]
        },
        {
            id: 6,
            title: "Forest Morning Mist",
            creator: "WildernessWalk",
            thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop",
            duration: "2:18",
            likes: "11.4K",
            comments: "178",
            views: "28.5K",
            description: "Early morning mist drifts through an ancient forest creating an ethereal atmosphere. Listen to the sounds of nature awakening.",
            tags: ["forest", "morning", "mist", "nature", "peaceful"]
        }
    ];

    // Initialize with first video
    useEffect(() => {
        if (videos.length > 0) {
            setSelectedVideo(videos[0]);
        }
    }, []);

    // Intersection Observer to detect which video is in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        const videoId = parseInt(entry.target.dataset.videoId);
                        const video = videos.find(v => v.id === videoId);
                        if (video && (!selectedVideo || selectedVideo.id !== videoId)) {
                            setSelectedVideo(video);
                        }
                    }
                });
            },
            {
                root: scrollContainerRef.current,
                threshold: 0.5,
                rootMargin: '0px'
            }
        );

        // Observe all video elements
        Object.values(videoRefs.current).forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            observer.disconnect();
        };
    }, [videos, selectedVideo]);

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        setIsDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setTimeout(() => setSelectedVideo(null), 300);
    };

    const handleOpenDetails = () => {
        setIsDetailsOpen(true);
    };

    return (
        <div className="h-full bg-gray-950 text-white overflow-hidden">
            <div className="flex h-full relative">
                {/* Video Scrolling Section */}
                <div className={`h-full transition-all duration-700 ease-out ${isDetailsOpen ? 'w-1/2' : 'w-full'}`}>
                    <div
                        ref={scrollContainerRef}
                        className="h-full overflow-y-auto snap-y snap-mandatory flex justify-center no-scrollbar"
                    >
                        <div className="w-[400px] space-y-4 border-[4px]">
                            {videos.map((video) => (
                                <div
                                    key={video.id}
                                    ref={(el) => videoRefs.current[video.id] = el}
                                    data-video-id={video.id}
                                    className="h-full snap-start relative group cursor-pointer rounded-xl "
                                    style={{
                                        backgroundImage: `url(${video.thumbnail})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 rounded-xl" />

                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button
                                            onClick={() => handleVideoClick(video)}
                                            className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300"
                                        >
                                            <Play className="w-8 h-8 text-white fill-white" />
                                        </button>
                                    </div>

                                    {/* Video Info */}
                                    <div className="absolute bottom-0 left-0 right-0 px-2  bg-gradient-to-t from-black/90 to-transparent rounded-b-xl">
                                        <div className="flex justify-between items-end ">
                                            <div className="flex-1 mb-[20px]">
                                                <div className='flex flex-row items-center gap-2'>
                                                    <div className='border w-[28px] h-[28px] overflow-hidden rounded-full'>
                                                        <Image
                                                            src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG5CPz89vwuDB4H5EsXhkpKz0_koS-0HK0Yg&s"}
                                                            objectFit="cover" // Ensure the image covers the area without distortion
                                                            width={0} // Required with layout="fill"
                                                            height={0} // Required with layout="fill"
                                                            alt='img'
                                                            className='w-full h-full'
                                                        />
                                                    </div>


                                                    <h1 className='text-[14px] font-[500]'>Jignesh Sharma</h1>

                                                </div>
                                                <h3 className="text-[16px] font-bold ">{video.title}</h3>
                                                <h3 className="text-[12px] font-normal">{"description"}</h3>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDetails();
                                                    }}
                                                    className="px-4 py-[12px] mt-2 shadow-md rounded-md text-[14px] font-medium transition-colors duration-200 w-[80%] bg-[#00000099]"
                                                >
                                                    View Details
                                                </button>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col  space-y-3  absolute bottom-[20px] -right-[50px]">

                                                <div className="flex flex-col space-y-2">
                                                    <button className="bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200 p-2">
                                                        <Heart className="w-6 h-6" />
                                                    </button>
                                                    <button className="bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200 p-2">
                                                        <MessageCircle className="w-6 h-6" />
                                                    </button>
                                                    <button className="bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200 p-2">
                                                        <EyeIcon className="w-6 h-6" />
                                                    </button>
                                                    <button className="bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200 p-2">
                                                        <Bookmark className="w-6 h-6" />
                                                    </button>
                                                    <button className="bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200 p-2">
                                                        <Share className="w-6 h-6" />
                                                    </button>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details Panel */}
                <div
                    className={`h-full bg-gray-900 border-l border-gray-700 transition-transform duration-700 ease-out absolute top-0 right-0 w-1/2 ${isDetailsOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    {selectedVideo && (
                        <VideoDetails selectedVideo={selectedVideo} handleCloseDetails={handleCloseDetails} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoScrollingUI;