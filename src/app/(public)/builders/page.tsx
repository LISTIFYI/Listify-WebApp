"use client"

import BuilderAgentCardLoader from '@/components/Loader/BuilderAgentCardLoader';
import { initializeApi } from '@/lib/http';
import { tokenStore } from '@/lib/token';
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';

const Builders = () => {
    const api = initializeApi(tokenStore).getApi();

    const [allBuilders, setAllBuilders] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalbuilders, setTotalBuilders] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const limit = 25;

    const getAllBuilders = async (pageNum: number) => {
        setLoading(true);
        console.log("ca;ed");

        try {
            const res = await api.get(`/public/builders?page=${pageNum}&limit=${limit}`);
            const newBuilders = res?.data?.builders || [];
            console.log('API Response:', res?.data);
            console.log('New Builder:', newBuilders);

            setAllBuilders((prevBuilders) => {
                const existingIds = new Set(prevBuilders.map(b => b._id));
                const filteredNewBuilders = newBuilders.filter((b: any) => !existingIds.has(b._id));
                return [...prevBuilders, ...filteredNewBuilders];
            });

            if (pageNum === 1) {
                const total = res?.data?.total || 0;
                console.log('Total Builder:', total);
                setTotalBuilders(total);
            }

            setHasMore(newBuilders.length > 0 && allBuilders.length + newBuilders.length < res?.data?.total);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setAllBuilders([]);
        setPage(1);
        setHasMore(true);
        let subscribed = true;
        (async () => {
            if (subscribed) {
                await getAllBuilders(1);
            }
        })();
        return () => {
            subscribed = false;
        };
    }, []);

    const handleLoadMoreData = () => {
        if (loading || !hasMore) return;
        console.log('Loading more data, current page:', page, 'hasMore:', hasMore);
        setPage((prevPage) => {
            const nextPage = prevPage + 1;
            getAllBuilders(nextPage);
            return nextPage;
        });
    };


    return (
        <div className='h-full'>

            <div
                className=" h-full overflow-y-auto"
                id="scrollableDiv"
            >
                <InfiniteScroll
                    dataLength={allBuilders?.length}
                    next={handleLoadMoreData}
                    hasMore={hasMore}
                    loader={
                        <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-5 gap-x-4 lg:p-6 p-4`} >
                            {
                                Array.from({ length: 6 }).map((_, idx) => (
                                    <BuilderAgentCardLoader key={idx} />
                                ))
                            }
                        </div>
                    }
                    endMessage={<p className="text-center py-4">No more builders to load.</p>}
                    scrollableTarget="scrollableDiv" // Specify scroll container
                >
                    <div className={`grid grid-cols-2  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-5 gap-x-4 ${!loading && !!allBuilders?.length ? "lg:p-6 p-4" : "lg:p-0 p-0"}`} >
                        {allBuilders?.length === 0 && !loading ? (
                            // <p>No more builders available.</p>
                            ""
                        ) : (
                            allBuilders?.map((builder, index) => {


                                return (
                                    <div
                                        key={builder._id || `builder-${index}`}
                                        className="rounded-[10px] cursor-pointer shadow-sm  h-[220px]"
                                    >
                                        <div className="flex  flex-col h-full justify-center py-6 px-4 items-center border rounded-[14px] relative overflow-hidden">
                                            <div className='flex flex-1'>
                                                <div className='w-[80px] h-[80px] mt-auto  rounded-full m-auto border border-[#454545] flex justify-center items-center overflow-hidden '>
                                                    {
                                                        builder?.logoUrl ?
                                                            <img src={builder.logoUrl} className='w-full h-full object-cover' /> :
                                                            <h1 className='text-black font-semibold text-xl'>{builder.builderName[0]}</h1>


                                                    }
                                                </div >
                                            </div>
                                            <div className='flex-1 mt-8'>
                                                <h1 className='text-[16px] text-black font-semibold text-center'>{builder.builderName}</h1>
                                                <h1 className='text-sm text-black font-normal text-center leading-tight'>{builder.companyName}</h1>
                                            </div>
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

export default Builders
