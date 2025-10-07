"use client"

import BuilderAgentCardLoader from '@/components/Loader/BuilderAgentCardLoader';
import { http } from '@/lib/http';
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';

const Agents = () => {
    const [allAgents, setAllAgents] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalAgents, setTotalAgents] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const limit = 25;

    const getAllAgents = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await http.get(`/public/agents?page=${pageNum}&limit=${limit}`);
            const newAgents = res?.data?.agents || [];
            console.log('API Response:', res?.data);
            console.log('New Builder:', newAgents);

            setAllAgents((prevAgents) => {
                const existingIds = new Set(prevAgents.map(a => a._id));
                const filteredNewAgents = newAgents.filter((a: any) => !existingIds.has(a._id));
                return [...prevAgents, ...filteredNewAgents];
            });

            if (pageNum === 1) {
                const total = res?.data?.total || 0;
                console.log('Total Builder:', total);
                setTotalAgents(total);
            }

            setHasMore(newAgents.length > 0 && allAgents.length + newAgents.length < res?.data?.total);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setAllAgents([]);
        setPage(1);
        setHasMore(true);
        let subscribed = true;
        (async () => {
            if (subscribed) {
                await getAllAgents(1);
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
            getAllAgents(nextPage);
            return nextPage;
        });
    };


    return (
        <div>
            <div
                className=" h-full overflow-y-auto"
                id="scrollableDiv"
            >
                <InfiniteScroll
                    dataLength={allAgents?.length}
                    next={handleLoadMoreData}
                    hasMore={hasMore}
                    loader={
                        <div className={`grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-5 gap-x-4 lg:p-6 p-4`} >
                            {
                                Array.from({ length: 6 }).map((_, idx) => (
                                    <BuilderAgentCardLoader key={idx} />
                                ))
                            }
                        </div>
                    }
                    endMessage={<p className="text-center py-4">No more agents to load.</p>}
                    scrollableTarget="scrollableDiv" // Specify scroll container
                >
                    <div className={`grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-5 gap-x-4 ${!loading && !!allAgents?.length ? "lg:p-6 p-4" : "lg:p-0 p-0"}`} >
                        {allAgents?.length === 0 && !loading ? (
                            // <p>No more builders available.</p>
                            ""
                        ) : (
                            allAgents?.map((agent, index) => {


                                return (
                                    <div
                                        key={agent?._id || `builder-${index}`}
                                        className="rounded-[10px] cursor-pointer shadow-sm  h-[240px]"
                                    >
                                        <div className="flex  flex-col h-full justify-center py-6 px-4 items-center border rounded-[14px] relative overflow-hidden">
                                            <div className='w-[80px] h-[80px] mb-8  rounded-full m-auto border border-[#454545] flex justify-center items-center overflow-hidden '>
                                                {
                                                    agent?.logoUrl ?
                                                        <img src={agent.logoUrl} className='w-full h-full object-cover' /> :
                                                        <h1 className='text-black font-semibold text-xl'>{agent?.agentName[0]}</h1>


                                                }
                                            </div>
                                            <div className='flex-1'>
                                                <h1 className='text-[16px] text-black font-semibold text-center'>{agent.agentName}</h1>
                                                <h1 className='text-sm text-black font-normal text-center leading-tight'>{agent.companyName}</h1>
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

export default Agents
