"use client";

import { Building2, Calendar, Clock, MapPin, MessageCircle, Phone, Play, Star, X, ChevronLeft, ChevronRight, Loader, Ellipsis, LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DirectMessageModal from '../DirectMessageModal/DirectMessageModal';
import ChatsDetails from '../ChatsComponent/ChatsDetails';
import { useChat } from '@/context/ChatContext';
import { tokenStore } from '@/lib/token';
import { initializeApi } from '@/lib/http';

// Shared interfaces (ideally move to types/index.ts)
interface Location {
    address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
}

interface Pricing {
    type: string;
    pricePerSqft: number;
    amount: number;
    negotiable: boolean;
    maintenanceCharges: number;
}

interface Listing {
    id: string;
    location: Location;
    pricing: Pricing;
    status: string;
    title: string;
    propertyValues?: {
        bedroom?: number;
        bathroom?: number;
        hall?: number;
        totalFloor?: number;
        sqft_area?: number;
    };
}

interface Post {
    comment_count: number;
    comments_disabled: boolean;
    created_at: string;
    description: string;
    duration_seconds: number;
    id: string;
    like_count: number;
    location: string;
    mentions: string[];
    save_count: number;
    share_count: number;
    status: string;
    tags: string[];
    thumbnail_url: string;
    title: string;
    updated_at: string;
    video_url: string;
    view_count: number;
    visibility: string;
}

interface User {
    id: string;
    name: string;
    profile_photo: string;
}

interface Pagination {
    totalCount: number;
    limit: number;
    offset: number;
}

interface ApiResponse {
    listing: Listing;
    post: Post;
    user: User;
    pagination?: Pagination;
}

type VideoDetailsProps = {
    handleCloseDetails: () => void;
    post: any;
    isDetailsOpen: boolean
};

interface AutoCarouselProps {
    images: string[];
    interval?: number; // slide interval in ms
}
const VideoDetails = ({ handleCloseDetails, post, isDetailsOpen }: VideoDetailsProps) => {
    console.log("sdsmdskdmskdmskmdsskdmdksm", post);
    const api = initializeApi(tokenStore).getApi();

    const tabs = ["Location map", "Shopping", "School"];
    const [activeTab, setActiveTab] = useState("Location map");
    const { user, openLogin } = useAuth()
    const { setChatDetails } = useChat()

    const [dataDetails, setDataDetails] = useState<any>(null)
    console.log("datadetails", dataDetails);

    const [similarProperties, setSimilarProperties] = useState([])
    const [loading, setLoading] = useState(false)
    console.log("d", dataDetails);
    console.log("similar proer", similarProperties);


    const getDetailsById = async (id: string): Promise<void> => {
        try {
            setLoading(true);

            const endpoint = user
                ? `/listings-v2/${id}`
                : `/public/listings-v2/${id}`;

            const { data } = await api.get(endpoint);
            setDataDetails(data?.data ?? null);

        } catch (error) {
            console.error("Failed to fetch details:", error);
        } finally {
            setLoading(false);
        }
    };


    const getSimilarrPoperty = async (id: string) => {
        setLoading(true)
        try {
            const response = await axios.get(`https://listifyi-api-1012443530727.asia-south1.run.app/public/listings-v2/${id}/similar`)
            setSimilarProperties(response?.data?.data?.listings);
        } catch (error) {
            console.log("something went wrong", error);
        } finally {
            setLoading(false)
        }


    }

    const [profile, setProfile] = useState<any>(null)
    const getUserProfile = async (id: string) => {
        try {
            const res = await api.get<any>(`users/profile/${id}`);
            setProfile(res?.data)

        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };


    useEffect(() => {
        if (post && isDetailsOpen) {
            getDetailsById(post.listing.id);
            getSimilarrPoperty(post.listing.id);

        }
    }, [isDetailsOpen, post]);

    useEffect(() => {
        if (dataDetails) {
            getUserProfile(dataDetails?.userId)
        }
    }, [dataDetails])

    const combinedMedia: any[] = [];

    if (dataDetails?.media) {
        console.log(dataDetails?.media?.videos);
        console.log(dataDetails?.media?.images);

        // Add videos to combinedMedia with type 'video'
        if (dataDetails.media.videos) {
            combinedMedia.push(...dataDetails.media.videos.map((video: any) => ({ type: 'video', content: video })));
        }

        // Add images to combinedMedia with type 'image'
        if (dataDetails.media.images) {
            combinedMedia.push(...dataDetails.media.images.map((image: any) => ({ type: 'image', content: image })));
        }
    } ``
    console.log("p[[[[", combinedMedia);

    const images = [
        post.post.thumbnail_url ||
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4sly3zeMUd6G3eUB5qx9VhYQC05CAZlBQkQ&s",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3PXXOg4AefDv6XwHm2CdL1lHBdiDcA2KVPw&s",
    ];

    const interval = 6000;
    const [activeIndex, setActiveIndex] = useState(0);
    const slideRef = useRef<HTMLDivElement>(null);

    // Auto-slide
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % images.length);
        }, interval);
        return () => clearInterval(timer);
    }, []);

    // Slide animation
    useEffect(() => {
        if (slideRef.current) {
            slideRef.current.style.transform = `translateX(-${activeIndex * 100}%)`;
        }
    }, [activeIndex]);

    const handleNext = () => setActiveIndex((prev) => (prev + 1) % images.length);
    const handlePrev = () =>
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

    console.log(post);

    const router = useRouter()

    const [open, setOpen] = useState(false)
    const [openMessageModal, setOpenMessageModal] = useState(false)
    const [selectedBHK, setSelectedBHK] = useState<string>('All'); // State to track selected BHK type
    // Get unique BHK types for buttons
    const bhkTypes = Array.from(
        new Set(dataDetails?.details?.floorPlanningPricing?.map((item: any) => `${item?.noOfBathroom || 1} BHK`))
    );

    // Filter floor plans based on selected BHK type
    const filteredFloorPlans =
        selectedBHK === 'All'
            ? dataDetails?.details?.floorPlanningPricing
            : dataDetails?.details?.floorPlanningPricing?.filter(
                (item: any) => `${item?.noOfBathroom || 1} BHK` === selectedBHK
            );


    console.log("post", post?.user?.id);
    console.log("post", post?.user?.name);
    console.log("post", dataDetails?.id);
    console.log("post--", dataDetails?.title);


    // username: post?.user?.name,
    //     contentID: post?.user?.id,
    //     profilePic: "",
    //     listingId: listingId,
    //     propertyName: propertyName,
    //     id: previousChatId
    return (
        <>
            {/* {
                loading ?
                    <div className='transition-all h-full flex justify-center items-center flex-col gap-2'>
                        <h1 className='font-medium text-[16px]'>Property Details</h1>
                        <h1 className='animate-spin duration-300'><LoaderCircle /></h1>
                    </div>
                    : */}
            <div className="h-full flex flex-col  overflow-y-auto transition-all md:py-0 py-6">

                <div className="absolute hidden md:flex top-2 right-[20px] z-50">
                    <button
                        onClick={handleCloseDetails}
                        className="p-2 bg-[rgba(0,0,0,0.4)]  cursor-pointer rounded-full transition-colors duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className=" text-black flex flex-col">

                    {/* Details */}
                    <div className="p-4 space-y-4 pb-28">
                        {/* Price + Location */}
                        <div className=''>
                            <h1 className="text-[15px] font-semibold">Price ₹ {dataDetails?.details?.priceRange || "N/A"}</h1>
                            <div className="flex items-center text-gray-600 text-[13px]">
                                <MapPin size={16} className="mr-1" />
                                {post?.listing?.location?.address || "Address not available"}
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className=''>
                            <h2 className="font-semibold text-[15px]">Property Highlights</h2>
                            <div className="flex gap-6 mt-2">
                                <div className="flex flex-col items-center">
                                    <div className="text-[13px] font-bold">{post?.listing?.propertyValues?.sqft_area || 1000}</div>
                                    <div className="text-[11px] text-gray-600">sqft Area</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="text-[13px] font-bold">{post?.listing?.propertyValues?.bedroom || 2}</div>
                                    <div className="text-[11px] text-gray-600">Bedrooms</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                                {post?.post?.tags?.length > 0
                                    && post?.post?.tags?.map((tag: any) => (
                                        <span key={tag} className="px-3 py-1 rounded-full bg-gray-800 text-[12px]">
                                            {tag}
                                        </span>
                                    ))
                                }
                            </div>
                        </div>

                        {/* About */}
                        <div className=''>
                            <h2 className="font-semibold text-[15px]">About Property</h2>
                            <p className="text-gray-600 text-[13px]">{post?.post?.description || "No description available"}</p>
                        </div>

                        {/* Builder */}
                        {/* <div className="bg-gray-900 p-3 rounded-xl flex items-center justify-between ">
                            <div className="flex items-center gap-3">
                                <Image
                                    src={post.user.profile_photo || "/builder.jpg"}
                                    alt="Builder"
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 border border-white rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-semibold">{post?.user?.name || "Unknown Builder"}</p>
                                    <p className="text-green-400 text-xs">Builder</p>
                                    <div className="flex items-center text-yellow-400 text-sm">
                                        <span>4.0</span>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i < 4 ? "yellow" : "gray"}
                                                stroke="none"
                                                className="ml-1"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button className="bg-gray-800 p-2 rounded-full">
                                <MessageCircle size={18} />
                            </button>
                        </div> */}

                        {/* BHK Sizes */}
                        <div className=''>
                            <h2 className="font-semibold text-[15px]">Floor Planning & Pricing</h2>

                            <div className="flex gap-3 mb-1 mt-3">
                                <button
                                    className={`px-4 py-1 rounded-full text-sm border cursor-pointer ${selectedBHK === 'All' ? 'bg-black-600 text-black' : 'bg-white text-black'
                                        }`}
                                    onClick={() => setSelectedBHK('All')}
                                >
                                    All
                                </button>
                                <div>
                                    {bhkTypes?.map((bhk: any) => (
                                        <button
                                            key={bhk}
                                            className={`px-4 py-1 rounded-full border text-sm cursor-pointer ${selectedBHK === bhk ? 'bg-black-600 text-black' : 'bg-white text-black'
                                                }`}
                                            onClick={() => setSelectedBHK(bhk)}
                                        >
                                            {bhk}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4  border-neutral-800 relative pb-[80px]">
                                <Carousel className="w-full">
                                    <CarouselContent className="flex gap-4">
                                        {filteredFloorPlans?.map((_: any, i: any) => (
                                            <CarouselItem key={i} className="basis-auto">
                                                <div className="shadow-sm my-2 border border-gray-50 mx-1 p-3 rounded-xl min-w-[340px] inline-flex ">
                                                    <div className='flex flex-row gap-4'>
                                                        <div className='overflow-hidden h-[90px] w-[120px] rounded-md'>
                                                            <img src={_?.floorPlanImages[0]} className='w-full h-full object-cover' alt="" /> </div>
                                                        <div>
                                                            <p className="text-[14px] text-gray-800 flex-1">Super Area</p>
                                                            <p className="text-black text-[13px]">{`${_?.superArea || 100} ${_?.unitSize}  | ${_?.noOfBathroom || 1
                                                                } BHK`}</p>
                                                            <p className="text-black text-[13px]">₹{_?.amount.toLocaleString() || "N/A"} Onwards</p>
                                                            <p className="text-black text-[13px]"></p>
                                                            {/* <a href="#" className="underline text-[14px] mt-2 inline-block">
                                                                See all properties
                                                            </a> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))}

                                    </CarouselContent>

                                    {/* Bottom Centered Arrows */}
                                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
                                        <CarouselPrevious className="bg-neutral-800 text-white rounded-full p-2 hover:bg-neutral-700" />
                                        <CarouselNext className="bg-neutral-800 text-white rounded-full p-2 hover:bg-neutral-700" />
                                    </div>
                                </Carousel>
                            </div>

                        </div>

                        {/* Amenities */}
                        <div className=''>
                            <h2 className="font-semibold text-[15px]">Amenities</h2>
                            <div className="grid grid-cols-2 gap-3 mt-3 text-[13px]">
                                {dataDetails?.amenities?.map((amenity: any) => (
                                    <div key={amenity} className="flex items-center gap-2">
                                        • {amenity}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interior Details */}
                        <div className=''>
                            <h2 className="font-semibold text-[15px]">Interior Details</h2>
                            <div className="mt-2 text-[13px]">
                                <div className="justify-between py-1  grid grid-cols-2">
                                    <span>Extra Rooms</span>
                                    <span className="font-semibold">
                                        {dataDetails?.details?.additionalRooms?.length
                                            ? dataDetails.details.additionalRooms.join(", ")
                                            : "—"}
                                    </span>
                                </div>
                                <div className="justify-between py-1 grid grid-cols-2">
                                    <span>Furnishing Status</span>
                                    <span className="font-semibold">{dataDetails?.details?.furnished}</span>
                                </div>
                                <div className="justify-between py-1 grid grid-cols-2">
                                    <span>Green Quality</span>
                                    <span className="font-semibold">{dataDetails?.details?.greenQuality}</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Details */}
                        <div className=''>
                            <h2 className="font-semibold text-[15px]">Project Details</h2>
                            <div className="grid grid-cols-2 gap-y-2 text-[13px] mt-2">
                                {
                                    dataDetails?.details?.ownership &&
                                    <>
                                        <span>Ownership</span>
                                        <span className="font-semibold">{dataDetails?.details?.ownership}</span>
                                    </>
                                }
                                {
                                    dataDetails?.details?.ownership &&
                                    <>
                                        <span>Project Status</span>
                                        <span className="font-semibold">{dataDetails?.details?.propertyCategory}</span>

                                    </>
                                }

                                <span>Possession Date</span>
                                <span className="font-semibold">{new Date(post?.post.created_at).toLocaleDateString() || "2025-08-21"}</span>
                                {

                                    dataDetails?.details?.towers &&
                                    <>
                                        <span>Towers / Blocks</span>
                                        <span className="font-semibold">10</span>
                                    </>
                                }
                                {
                                    dataDetails?.details?.totalUnits &&

                                    <>
                                        <span>Total Units</span>
                                        <span className="font-semibold">1000 Units</span>
                                    </>
                                }
                                <span>Project Area</span>
                                <span className="font-semibold">{post?.listing?.propertyValues?.sqft_area || 1000} Acres</span>
                                <span>Unit Size Range</span>
                                <span className="font-semibold">{post?.listing?.propertyValues?.sqft_area || 1000} sq.ft</span>
                                <span>Price per Sq. Ft.</span>
                                <span className="font-semibold">₹{post?.listing?.pricing?.pricePerSqft.toLocaleString() || 10000}</span>
                                <span>Price Range</span>
                                <span className="font-semibold">₹{post?.listing?.pricing?.amount.toLocaleString() || 10000}</span>
                                <span>Approval Authority</span>
                                <span className="font-semibold">Dhdhd</span>
                                <span>Unit Types</span>
                                <span className="font-semibold">{`${post?.listing?.propertyValues?.bedroom || 1} BHK`}</span>
                                <span>Facing Direction</span>
                                <span className="font-semibold">North-West</span>
                                <span>Age of Property</span>
                                <span className="font-semibold">Less than 3 years</span>
                                <span>Purpose</span>
                                <span className="font-semibold">Living</span>
                                <span>Available Offers</span>
                                <span className="font-semibold">No Floor Rise Charges, Flat 10% Cashback</span>
                                <span>Approved Banks</span>
                                <span className="font-semibold">LIC Housing, Axis</span>
                            </div>
                        </div>

                        {/* Society Details */}
                        <div className="p-4">
                            <h3 className="text-[15px] font-semibold mb-2">Society Details</h3>
                            <div className="flex items-center gap-1 mb-3">
                                {Array(5)
                                    .fill(0)
                                    .map((_, i) => (
                                        <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                                    ))}
                                <span className="ml-2 text-[13px] text-gray-600">(120 reviews)</span>
                            </div>
                            <div className="space-y-2 text-gray-600 text-[13px]">
                                <div className="flex justify-between">
                                    <span className='text-gray-600'>Built by</span>
                                    <span className="text-black font-medium">{post?.user?.name || "Shree"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className='text-gray-600'>Year built</span>
                                    <span className="text-black font-medium">{new Date(post?.post?.created_at).getFullYear() || 2020}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className='text-gray-600'>Total units</span>
                                    <span className="text-black font-medium">1000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className='text-gray-600'>Available units</span>
                                    <span className="text-black font-medium">1000</span>
                                </div>
                            </div>
                        </div>

                        {/* <div className="flex border-b border-neutral-800">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                  flex-1 text-center py-3 text-sm font-medium
                  transition-all duration-200
                  ${activeTab === tab ? "text-white border-b-2 border-purple-500 bg-neutral-900 rounded-t-lg" : "text-gray-400 hover:text-white"}
                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div> */}

                        {/* Map Section */}
                        {/* <div className="w-full h-40 bg-neutral-900 flex items-center justify-center">
                        <p className="text-gray-500">[Google Map Placeholder]</p>
                    </div> */}

                        {/* Location Info */}
                        {/* <div className="p-4 border-b border-neutral-800 space-y-2">
                        <div className="flex items-center gap-2 text-gray-300">
                            <MapPin size={18} /> <span>{post?.listing?.location?.address || "Rajasthan, India"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Clock size={18} /> <span>10 mins to Metro</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Building2 size={18} /> <span>5 mins to Mall</span>
                        </div>
                    </div> */}

                        {/* Similar Properties */}
                        {
                            !!similarProperties?.length &&
                            <div className="p-4 border-b border-neutral-800 relative pb-[80px]">
                                <h3 className="text-[16px] font-semibold mb-3">Similar Properties</h3>

                                <Carousel className="w-full">
                                    <CarouselContent className="flex gap-4">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <CarouselItem key={i} className="basis-auto">
                                                <div className="h-[190px] cursor-pointer w-[280px] border rounded-lg bg-neutral-900 shrink-0"></div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>

                                    {/* Bottom Centered Arrows */}
                                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
                                        <CarouselPrevious className="bg-neutral-800 text-white rounded-full p-2 hover:bg-neutral-700" />
                                        <CarouselNext className="bg-neutral-800 text-white rounded-full p-2 hover:bg-neutral-700" />
                                    </div>
                                </Carousel>
                            </div>
                        }


                        {/* Branding */}
                        <div className="flex flex-col items-center p-6 text-center">
                            <h1 className="text-[56px] font-bold">Listifyi</h1>
                            <p className="text-[16px] text-gray-500 mt-1">Crafted with ❤️ in Bengaluru, India</p>
                            <p className="text-[14px] text-gray-600 mt-2">© 2024 Listifyi Technologies Pvt. Ltd. | All Rights Reserved</p>
                        </div>

                        {/* Disclaimer Dropdown */}
                        {/* <div className="border-t border-neutral-800 p-4">
                        <details>
                            <summary className="cursor-pointer font-medium">Disclaimer</summary>
                            <p className="text-gray-400 text-sm mt-2">
                                All property details are as provided by the builder/seller and are subject to verification.
                            </p>
                        </details>
                    </div> */}
                    </div>

                    {/* Bottom Actions */}
                    {
                        user?.id !== profile?.id &&
                        <div className="fixed bottom-0 left-0 w-full border-t  bg-white p-2 flex justify-around border-gray-200">
                            <button
                                onClick={() => {
                                    if (user) {
                                        setChatDetails({
                                            username: `${profile?.builderProfile ? profile?.builderProfile?.builderName : profile?.agentProfile ? profile?.agentProfile?.agentName : ""}`,
                                            profilePic: `${profile?.builderProfile ? profile?.builderProfile?.logoUrl : profile?.agentProfile ? profile?.agentProfile?.profilePhoto : ""}`,
                                            propertyName: dataDetails?.title,
                                            listingId: dataDetails?.id,
                                            id: dataDetails?.chatId,
                                            contentID: profile?.id


                                        })
                                        setOpenMessageModal(true)
                                    } else {
                                        openLogin()
                                    }

                                }}
                                className=" cursor-pointer flex flex-col items-center hover:text-gray-400  transition-all duration-300">
                                <MessageCircle size={18} />
                                <span className="text-xs mt-1">Message</span>
                            </button>
                            <button className=" cursor-pointer flex flex-col items-center  hover:text-gray-400  transition-all duration-300">
                                <Calendar size={18} />
                                <span className="text-xs mt-1">Schedule</span>
                            </button>
                            <button className=" cursor-pointer flex flex-col items-center hover:text-gray-400  transition-all duration-300">
                                <Phone size={18} />
                                <span className="text-xs mt-1">Call</span>
                            </button>
                        </div>
                    }
                </div>
            </div>
            <DirectMessageModal open={openMessageModal} setOpen={setOpenMessageModal} />

            {/* } */}
        </>
    );
};

export default VideoDetails;