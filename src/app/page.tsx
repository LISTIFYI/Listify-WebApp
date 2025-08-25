"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { CiHeart, CiBookmark, CiShare2 } from "react-icons/ci";
import { Bath, BedDouble, BrickWall, Eye, MessageCircle, Sofa, TriangleRight } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { usePostContext } from "@/lib/postContext";

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

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState("");
  const router = useRouter();
  const { setSelectedPost } = usePostContext();
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialMount = useRef(true);

  const limit = 20;

  const tags = [
    "Flat",
    "Villa",
    "Plot",
  ];

  // Cancel any ongoing requests
  const cancelOngoingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Reset all pagination state
  const resetPaginationState = useCallback(() => {
    setPosts([]);
    setCurrentOffset(0);
    setHasMore(true);
    setLoading(false);
    cancelOngoingRequests();
  }, [cancelOngoingRequests]);

  const getPosts = useCallback(async (offset: number = 0, reset: boolean = false) => {
    // Prevent multiple simultaneous requests
    if (loading && !reset) return;

    // If no more data and not resetting, don't make request
    if (!hasMore && !reset) return;

    try {
      // Cancel previous request
      cancelOngoingRequests();

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      setLoading(true);

      const res = await axios.get<ApiResponse>(
        `https://listifyi-api-1012443530727.asia-south1.run.app/public/posts/feed?limit=${limit}&offset=${offset}${selected ? `&tag=${selected}` : ""
        }`,
        {
          signal: abortControllerRef.current.signal
        }
      );

      if (res.data && res.data.posts) {
        const newPosts = res.data.posts;

        setPosts((prev) => {
          if (reset) return newPosts;

          // Ensure no duplicates by filtering based on post.id
          const existingIds = new Set(prev.map((post) => post.post.id));
          const uniqueNewPosts = newPosts.filter((post: Post) => !existingIds.has(post.post.id));
          return [...prev, ...uniqueNewPosts];
        });

        const pagination = res.data.pagination;
        if (pagination) {
          const newOffset = offset + limit;
          setCurrentOffset(newOffset);
          setHasMore(newOffset < pagination.totalCount);
        } else {
          setHasMore(false);
        }
      } else {
        console.log("No posts found in response");
        setHasMore(false);
      }
    } catch (error) {
      // Don't log error if request was aborted
      if (axios.isCancel(error)) {
        console.log("Request cancelled");
        return;
      }
      console.error("Error fetching posts:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, selected, limit, cancelOngoingRequests]);

  // Initial load and tag change effect
  useEffect(() => {
    resetPaginationState();
    getPosts(0, true);
  }, [selected]); // Remove getPosts and resetPaginationState from deps to avoid infinite loop

  // Component mount effect - reset everything when component mounts
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      resetPaginationState();
      getPosts(0, true);
    }

    // Cleanup on unmount
    return () => {
      cancelOngoingRequests();
    };
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && posts.length > 0) {
          getPosts(currentOffset);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '10px'
      }
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
      observer.disconnect();
    };
  }, [hasMore, loading, currentOffset, posts.length, getPosts]);

  const handleClick = (post: Post) => {
    setSelectedPost(post);
    router.push("/explore");
  };

  return (
    <div className="w-[100%] py-4 ">
      <div className="lg:px-6 px-4 flex w-full overflow-x-auto gap-2 no-scrollbar">
        {tags.map((tag, index) => (
          <div
            onClick={() => setSelected(tag)}
            key={index}
            className={`px-[16px] cursor-pointer py-[4px] text-[12px] border-[1px] border-[#EAEAEA] transition-all rounded-full ${selected === tag ? "bg-[#F8F8F8]" : "bg-[#fff]"
              }`}
          >
            {tag}
          </div>
        ))}
      </div>

      {/* Loading state for initial load */}
      {loading && posts.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading properties...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-5 gap-x-4 lg:p-6 p-4">
          {posts.map((post: Post) => (
            <div
              onClick={() => handleClick(post)}
              key={post.post.id}
              className="rounded-[20px] cursor-pointer"
            >
              <div className="h-[460px] rounded-[14px] relative overflow-hidden">
                <Image
                  className="object-cover w-full h-full"
                  alt={post?.post.title || "Property image"}
                  src={post?.post.thumbnail_url || "https://via.placeholder.com/300x280?text=Image+Not+Available"}
                  width={300}
                  height={460}
                />
                <h2 className="absolute top-4 left-4 bg-white px-2 py-0.5 rounded-full text-black text-[8px]">
                  Sponsored
                </h2>
                <div
                  style={{
                    boxShadow: "inset 0 -10px 24px -2px rgba(0, 0, 0, 0.8)",
                  }}
                  className="absolute flex flex-row gap-[10px] bottom-0 bg-opacity-80 backdrop-blur-[2px] w-full left-0 items-center px-4 py-2 text-black text-[8px]"
                >
                  <div className="flex flex-row gap-[4px] justify-center items-center">
                    <CiHeart color="#fff" size={18} />
                    <h1 className="text-white text-[12px]">{post?.post?.like_count || 0}</h1>
                  </div>
                  <div className="flex flex-row gap-[4px] justify-center items-center">
                    <MessageCircle color="#fff" size={14} />
                    <h1 className="text-white text-[12px]">{post?.post?.comment_count || 0}</h1>
                  </div>
                  <div className="flex flex-row gap-[4px] justify-center items-center">
                    <CiShare2 color="#fff" size={16} />
                    <h1 className="text-white text-[12px]">{post?.post?.share_count || 0}</h1>
                  </div>
                  <div className="flex flex-row gap-[4px] justify-center items-center">
                    <CiBookmark color="#fff" size={14} />
                    <h1 className="text-white text-[12px]">{post?.post.save_count || 0}</h1>
                  </div>
                  <div className="flex flex-row gap-[4px] justify-center items-center">
                    <Eye color="#fff" size={12} />
                    <h1 className="text-white text-[12px]">{post?.post.view_count || 0}</h1>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="flex flex-col gap-[2px]">
                  {post?.listing?.pricing?.amount && (
                    <h1 className="text-black text-[18px] font-[600] truncate text-ellipsis">
                      ₹{post?.listing?.pricing?.amount || "N/A"}
                    </h1>
                  )}
                  <h1 className="text-black text-[16px] font-[600] truncate text-ellipsis">
                    {post?.post.title || "Untitled Property"}
                  </h1>
                  <h1 className="text-[#A5A5A5] text-[12px] truncate text-ellipsis">
                    {post?.listing?.location?.address || "Address not available"}
                  </h1>
                </div>
                <div className="flex flex-row gap-[4px] mt-[6px]">
                  <div className="flex flex-row justify-start items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                    <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                      <BedDouble color="#000" size={12} />
                    </div>
                    <h1 className="text-black text-[12px] px-[6px]">{post?.listing?.propertyValues?.bedroom || 0}</h1>
                  </div>
                  <div className="flex flex-row justify-center items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                    <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                      <Bath color="#000" size={12} />
                    </div>
                    <h1 className="text-black text-[12px] px-[6px]">{post?.listing?.propertyValues?.bathroom || 0}</h1>
                  </div>
                  <div className="flex flex-row justify-center items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                    <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                      <Sofa color="#000" size={12} />
                    </div>
                    <h1 className="text-black text-[12px] px-[6px]">{post?.listing?.propertyValues?.hall || 0}</h1>
                  </div>
                  <div className="flex flex-row justify-center items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                    <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                      <BrickWall color="#000" size={12} />
                    </div>
                    <h1 className="text-black text-[12px] px-[6px]">{post?.listing?.propertyValues?.totalFloor || 0}</h1>
                  </div>
                  {post?.listing?.propertyValues?.sqft_area && (
                    <div className="flex flex-row justify-center items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                      <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                        <TriangleRight color="#000" size={12} />
                      </div>
                      <h1 className="text-black text-[12px] px-[6px]">{`${post?.listing?.propertyValues?.sqft_area ?? ""} sqft` || "N/A"}</h1>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite scroll loader */}
      {hasMore && posts.length > 0 && (
        <div ref={loaderRef} className="flex justify-center items-center h-16">
          {loading && <p>Loading more properties...</p>}
        </div>
      )}

      {/* No more data message */}
      {!hasMore && posts.length > 0 && (
        <div className="flex justify-center items-center h-16">
          <p className="text-gray-500">No more properties to load</p>
        </div>
      )}
    </div>
  );
};

export default Home;