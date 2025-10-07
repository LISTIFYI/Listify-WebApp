"use client"

import ButtonCommon from '@/components/CustomFields/Button';
import BuilderAgentCardLoader from '@/components/Loader/BuilderAgentCardLoader';
import CarouselCardLoader2 from '@/components/Loader/CarouselCardLoader2';
import { http } from '@/lib/http';
import { AlignVerticalSpaceBetween, Heart, LocateIcon, MapPin } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';

const NearbyProperties = () => {
    const [allNearbyProperties, setAllNearbyProperties] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalNearbyP, setTotalNearbyP] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const limit = 25;
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getAllNearbyProperties = async (pageNum: number) => {
        setLoading(true);
        try {

            const res = await http.get(`/public/listings-v2/nearby?page=${pageNum}&limit=${limit}&lat=${Number(24.5956608)}&lng=${Number(73.777152)}`);
            const newNP = res?.data?.agents || [];
            console.log('API Response:', res?.data);
            console.log('New Builder:', newNP);

            setAllNearbyProperties((prevNP) => {
                const existingIds = new Set(prevNP.map(a => a._id));
                const filteredNewNP = newNP.filter((a: any) => !existingIds.has(a._id));
                return [...prevNP, ...filteredNewNP];
            });

            if (pageNum === 1) {
                const total = res?.data?.total || 0;
                console.log('Total Builder:', total);
                setTotalNearbyP(total);
            }

            setHasMore(newNP.length > 0 && AlignVerticalSpaceBetween.length + newNP.length < res?.data?.total);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setAllNearbyProperties([]);
        setPage(1);
        setHasMore(true);
        let subscribed = true;
        (async () => {
            if (subscribed && location) {
                await getAllNearbyProperties(1);
            }
        })();
        return () => {
            subscribed = false;
        };
    }, [location]);

    const handleLoadMoreData = () => {
        if (loading || !hasMore) return;
        console.log('Loading more data, current page:', page, 'hasMore:', hasMore);
        setPage((prevPage) => {
            const nextPage = prevPage + 1;
            getAllNearbyProperties(nextPage);
            return nextPage;
        });
    };



    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by this browser.");
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                setLoading(false);
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
                // Optional: Use this data to fetch nearby places, e.g., via an API call
                // fetchNearbyPlaces(latitude, longitude);
            },
            (err) => {
                setLoading(false);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError("Location access denied. Please enable it in browser settings.");
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError("Location information unavailable.");
                        break;
                    case err.TIMEOUT:
                        setError("Location request timed out.");
                        break;
                    default:
                        setError("An unknown error occurred.");
                }
            },
            {
                enableHighAccuracy: true, // Use GPS for better accuracy (slower)
                timeout: 10000,           // 10 seconds max
                maximumAge: 0,            // Always fetch fresh location (no cache)
            }
        );
    };

    useEffect(() => {
        // Auto-request on mount (or trigger via button for better UX)
        getLocation();
    }, []);

    return (
        <div className='overflow-y-auto h-full'>
            <div
                className=" h-full overflow-y-auto"
                id="scrollableDiv"
            >
                <InfiniteScroll
                    dataLength={allNearbyProperties?.length}
                    next={handleLoadMoreData}
                    hasMore={hasMore}
                    loader={
                        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-y-5 gap-x-4 lg:p-6 p-4`} >
                            {
                                Array.from({ length: 6 }).map((_, idx) => (
                                    <CarouselCardLoader2 key={idx} />
                                ))
                            }
                        </div>
                    }
                    endMessage={<p className="text-center py-4">No more nearby properties to load.</p>}
                    scrollableTarget="scrollableDiv" // Specify scroll container
                >
                    <div className={`grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-y-5 gap-x-4 ${!loading && !!allNearbyProperties?.length ? "lg:p-6 p-4" : "lg:p-0 p-0"}`} >
                        {allNearbyProperties?.length === 0 && !loading ? (
                            ""
                        ) : (
                            allNearbyProperties?.map((np, index) => {
                                return (
                                    <div key={index} className='p-4 w-[320px]'>
                                        <div
                                            className="flex flex-col flex-1 items-center shadow-sm bg-[#fff] rounded-[30px]  overflow-hidden"
                                        >

                                            <div className="h-[260px] overflow-hidden border w-full">
                                                <img src="https://is1-3.housingcdn.com/4f2250e8/7b8debc34e219b419bc9dd59c3aea1ce/v0/fs/prestige_finsbury_park-gummanahalli-bengaluru-prestige_projects_pvt_ltd.png" className='w-full h-full' alt="" />
                                            </div>

                                            <div className='w-full flex flex-col gap-1 p-4'>
                                                <div className='px-2 flex flex-row justify-between items-center w-full'>
                                                    <h1>$34343443</h1>
                                                    <h1><Heart size={20} /></h1>
                                                </div>
                                                <div className='px-2 flex flex-row gap-1 items-center w-full mb-2'>
                                                    {/* <h1>$34343443</h1> */}
                                                    <MapPin size={16} color='#4B5563' />
                                                    <h1 className='truncate text-ellipsis text-sm text-[#4B5563]'>Lik sjdns jdnsjdns jnsd sdnds sdjnsde</h1>
                                                </div>
                                                <button className='cursor-pointer h-10 rounded-md text-[14px] border border-[#454545] px-4 font-medium flex justify-center items-center w-full  transition-all duration-300'>
                                                    View Details
                                                </button>
                                            </div>
                                            {/* <button>View Details</button> */}

                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </InfiniteScroll>
            </div>
        </div>
    )
}

export default NearbyProperties
