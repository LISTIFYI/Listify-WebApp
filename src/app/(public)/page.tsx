"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { CiHeart, CiBookmark, CiShare2 } from "react-icons/ci";
import { Bath, BedDouble, BrickWall, Eye, Heart, ImageOff, MessageCircle, Play, Sofa, TriangleRight } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { usePostContext } from "@/lib/postContext";
import clsx from "clsx";
import { RiHome6Line } from "react-icons/ri";
import { PiBuildingOfficeThin } from "react-icons/pi";
import { IoFilter, IoSearch } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import PropertiesHomeCard from "@/components/Loader/PropertyHomeLoader";
import { useAuth } from "@/context/AuthContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import FilterComponent from "@/components/FilterComponent/FilterComponent";
import { initializeApi } from "@/lib/http";
import { tokenStore } from "@/lib/token";

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

  const tags = [
    "All",
    "Flat",
    "Villa",
    "Plot",
  ];


  const { filters, addFilters, openFilter, setOpenFilter } = useAuth()
  const { setSelectedPost } = usePostContext();
  const router = useRouter()
  const api = initializeApi(tokenStore).getApi();

  const [selected, setSelected] = useState("");
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 25;

  const getAllProperties = async (currentOffset: number, appliedFilters?: any) => {

    const filterQuery = appliedFilters
      ? Object.entries(appliedFilters)
        .filter(([_, value]) => {
          // Include only non-empty strings, numbers, or booleans
          return (
            (typeof value === "string" && value.trim() !== "") ||
            typeof value === "number" ||
            typeof value === "boolean"
          );
        })
        .map(([key, value]) => {
          return `${key}=${encodeURIComponent(String(value))}`;
        })
        .join("&")
      : "";
    console.log("filters", filterQuery);

    setLoading(true);

    let res
    try {
      let res;
      if (filterQuery?.length > 0) {
        // call search api
        res = await api.get(`/public/posts/search?offset=${currentOffset}&limit=${limit}&${filterQuery}`);
      } else {
        // call feed api with pagination
        res = await api.get(
          `/public/posts/feed?offset=${currentOffset}&limit=${limit}`
        );
      }

      console.log("nice", res);

      const newProperties = filterQuery?.length > 0 ? res?.data : res?.data?.posts || [];
      console.log('new', newProperties);
      setAllProperties((prevProperties) => {
        const existingIds = new Set(prevProperties.map(p => p?.post?.id));
        const filteredNewNotifications = newProperties.filter((p: any) => !existingIds.has(p?.post?.id));
        return [...prevProperties, ...filteredNewNotifications];
      });

      if (currentOffset === 1) {
        const total = res?.data?.pagination?.totalCount || 0;
        setTotalProperties(total);
      }


      console.log("Start=======");

      console.log(newProperties.length);
      console.log(allProperties.length);
      console.log(allProperties.length + newProperties.length);
      console.log(res?.data?.pagination?.totalCount);

      setHasMore(newProperties?.length > 0 && allProperties?.length + newProperties?.length < res?.data?.pagination?.totalCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    setAllProperties([]);
    setOffset(0); // Reset offset on mount
    setHasMore(true);
    let subscribed = true;
    (async () => {
      if (subscribed) {
        await getAllProperties(0, filters); // Initial fetch with offset 0
      }
    })();
    return () => {
      subscribed = false;
    };
  }, [filters]);

  const handleLoadMoreData = () => {
    if (loading || !hasMore) return;
    setOffset((prevOffset) => {
      const nextOffset = prevOffset + limit; // Increment offset by limit
      getAllProperties(nextOffset, filters);
      return nextOffset;
    });
  };

  const handleClick = (post: Post) => {
    setSelectedPost(post);
    router.push("/explore");
  };
  return (
    <div className="h-full flex flex-col">

      <Dialog open={openFilter} onOpenChange={() => {
        setOpenFilter(false)
      }}

      >
        <DialogContent showCloseButton={false} className="p-2 fixed h-[80%] sm:max-w-full w-[900px]">
          <FilterComponent />
        </DialogContent>

      </Dialog>
      <div className="flex flex-row justify-between items-center lg:px-6  py-3  border-b px-4">
        <div className=" flex w-full overflow-x-auto gap-2 no-scrollbar">
          {tags.map((tag, index) => (
            <div
              onClick={() => {
                setSelected(tag)
                addFilters({
                  type: tag === "All" ? "" : tag?.toLowerCase()

                })
              }}
              key={index}
              className={`px-[16px] cursor-pointer py-[4px] text-[12px] border-[1px] border-[#EAEAEA] transition-all rounded-full ${selected === tag ? "bg-gray-200" : "bg-[#fff]"
                }`}
            >
              {tag}
            </div>
          ))}
        </div>
        <div
          onClick={() => {
            setOpenFilter(true)
          }}
          className="flex md:hidden lg:hidden border rounded-full w-[40px]  justify-center items-center h-[40px]">
          <IoFilter className="text-[#989CA0]" size={22} />

        </div>
      </div>
      <div className="w-[100%] flex  flex-col overflow-y-scroll pb-4  h-full ">
        <InfiniteScroll
          dataLength={allProperties.length}
          next={handleLoadMoreData}
          hasMore={hasMore}
          loader={
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-5 gap-x-4 lg:p-6 p-4">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <PropertiesHomeCard key={idx} />
                ))}
              </div>
            ) : null
          }

          endMessage={<p className="text-center py-4">No more properties to load.</p>}
          scrollableTarget="scrollableDiv"
          className=""
        >

          <div className={`grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-y-5 gap-x-4 ${!loading && !!allProperties.length ? "lg:p-6 p-4" : "lg:p-0 p-0"}`} >
            {allProperties.map((property) => (
              <div
                onClick={() => handleClick(property)}
                key={property.post.id}
                className="rounded-[20px] cursor-pointer"
              >
                <div className="aspect-[4/5]  md:aspect-[2/3] lg:aspect-[2/3] rounded-[14px] relative overflow-hidden">
                  {property?.post.thumbnail_url ? (
                    <Image
                      className="object-cover w-full h-full rounded-lg transition-transform duration-300 hover:scale-105"
                      alt={property?.post.title || "Property image"}
                      src={property.post.thumbnail_url}
                      width={300}
                      height={460}
                    />
                  ) : (
                    <div className="w-full h-full px-2 text-center flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 border border-gray-300 shadow-inner hover:shadow-md transition duration-300">
                      <div className="p-3 bg-white/70 rounded-full shadow-sm mb-3">
                        <ImageOff className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-600 text-sm font-medium">No Thumbnail Available</p>
                    </div>
                  )}


                  {
                    property?.post.view_count > 0 &&
                    <h2 className="absolute top-2 font-[600] text-[16px] flex flex-row items-center gap-2  left-1 px-2 py-0.5 rounded-full text-white">
                      <Play size={18} color="#fff" /> {property?.post.view_count || 0}
                    </h2>
                  }
                  <div
                    className="absolute flex flex-row gap-[10px] bottom-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent w-full left-0 items-center px-4 py-2 text-black text-[8px]"
                  >
                    <div className="flex flex-row gap-[4px] justify-center items-center">
                      <BedDouble color="#fff" size={18} />
                      <h1 className="text-white text-[12px]">{property?.listing?.propertyValues?.bedroom || 0}</h1>
                    </div>

                    <div className="flex flex-row gap-[4px] justify-center items-center">
                      <Bath color="#fff" size={14} />
                      <h1 className="text-white text-[12px]">{property?.listing?.propertyValues?.bathroom || 0}</h1>
                    </div>
                    <div className="flex flex-row gap-[4px] justify-center items-center">
                      <Sofa color="#fff" size={16} />
                      <h1 className="text-white text-[12px]">{property?.listing?.propertyValues?.hall || 0}</h1>
                    </div>

                    <div className="flex flex-row gap-[4px] justify-center items-center">
                      <BrickWall color="#fff" size={14} />
                      <h1 className="text-white text-[12px]">{property?.listing?.propertyValues?.totalFloor || 0}</h1>
                    </div>
                    {property?.listing?.propertyValues?.sqft_area &&
                      <div className="flex flex-row gap-[4px] justify-center items-center">
                        <TriangleRight color="#fff" size={12} />
                        <h1 className="text-white text-[12px]">{property?.listing?.propertyValues?.sqft_area || 0}</h1>
                      </div>
                    }
                  </div>

                </div>
                <div className="px-2 py-[4px]">
                  <div className="flex flex-col">
                    <div className="flex flex-row justify-between w-full">
                      <h2 className="text-black flex-1 text-[14px] font-[600] text-ellipsis truncate">
                        {property?.post.title || "Untitled Property"}
                      </h2>
                      {/* <div className="flex w-[20%] justify-end flex-row gap-1 items-center pr-2 text-black">
                      <Heart size={16} />
                      <span className="text-[14px] font-medium">{post?.post.view_count || 0}</span>
                    </div> */}
                      {property?.listing?.pricing?.amount && (
                        <div className="text-black text-[14px] w-fit text-end font-[500] truncate">
                          ₹{property?.listing?.pricing?.amount.toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <h2 className="text-black w-[80%]   text-[12px] font-[600] line-clamp-2">
                        {property?.post?.description}
                      </h2>
                      <div className="flex w-[20%] justify-end flex-row gap-1 items-start text-black">
                        <Heart size={16} />
                        <span className="text-[14px] font-medium">{property?.post.view_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Home;