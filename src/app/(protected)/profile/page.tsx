"use client"

import MapWithMarkers from '@/components/GoogleMapComponent/MapWithMarkers';
import ProfileForm from '@/components/Layout/ProfileForm/ProfileForm';
import { initializeApi } from '@/lib/http';
import { usePostContext } from '@/lib/postContext';
import { tokenStore } from '@/lib/token';
import axios from 'axios';
import { EllipsisVertical, Loader, Play } from 'lucide-react';
import type { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const ProfilePage: NextPage = () => {
    const api = initializeApi(tokenStore).getApi();

    const router = useRouter()
    const [profileData, setProfileData] = useState<any>(null);
    const [postData, setPostData] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string>("")
    // pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const getProfile = async () => {
        try {
            const tk = tokenStore.get();
            const res = await api.get("/users/profile");
            console.log("resssssssss", res);

            setProfileData(res.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const [activeTab, setActiveTab] = useState("All");


    const getPosts = async (currentPage: number) => {
        if (loading) return;
        setLoading(true);

        try {
            const tk = tokenStore.get();
            const res = await api.get(`/posts/my-posts?page=${currentPage}&limit=20&??pricingType=${activeTab.toLowerCase()}&status=published`);
            const newPosts = res?.data?.posts || [];

            // ✅ ensure uniqueness by filtering with IDs
            setPostData((prev) => {
                const existingIds = new Set(prev.map((p) => p.post?.id));
                const filtered = newPosts.filter((p: any) => !existingIds.has(p.post?.id));
                return [...prev, ...filtered];
            });

            setTotalCount(res?.data?.pagination?.total ?? 0);

            const totalPages = res?.data?.pagination?.totalPages ?? 1;
            setHasMore(currentPage < totalPages);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile()
    }, [])

    useEffect(() => {
        // Reset when tab changes
        setPostData([]);
        setPage(1);
        setHasMore(true);
        getPosts(1);
    }, [activeTab]);
    const { setSelectedPost } = usePostContext()

    const fetchMorePosts = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            getPosts(nextPage);
        }
    };
    const tabs = ["All", "Sale", "Resale"];

    return (
        <div className='overflow-y-scroll h-full'>
            <div className="h-full  md:max-w-[100%] lg:w-[85%] w-[100%] md:mx-auto lg:mx-auto">
                {/* <MapWithMarkers /> */}
                {/* Profile Header */}
                <div className="mx-auto p-4 sm:p-6 max-w-[90%] w-[100%] ">
                    <div className="flex flex-row  items-center  space-y-4 space-x-4">
                        <div className="relative  w-18 h-18 sm:w-32 sm:h-32 rounded-full my-auto overflow-hidden border justify-center items-center flex">
                            {profileData?.profile_pic && profileData?.profile_pic.trim() !== "" ? (
                                <Image
                                    src={profileData?.profile_pic}
                                    alt="Profile picture"
                                    className="rounded-full object-cover"
                                    fill
                                    sizes="(max-width: 640px) 96px, 128px"
                                />
                            ) : (
                                <span className="text-3xl sm:text-5xl font-semibold text-gray-700">
                                    {profileData?.name?.charAt(0)?.toUpperCase() || ""}
                                </span>
                            )}
                        </div>
                        <div className="flex-1  my-auto ">
                            <div className="flex flex-row md:flex lg:flex-row gap-2">

                                <h1 className="text-xl sm:text-2xl font-semibold">{profileData?.name} </h1>
                                <button
                                    // onClick={() => {
                                    //     // router.push(`/profile/${profileData?.id}`);
                                    //     setSelectedId(profileData?.id)
                                    //     setOpen(true)
                                    // }}
                                    className="">
                                    <EllipsisVertical size={22} />                                </button>
                            </div>
                            <div className="mt-4 flex space-x-2 md:space-x-4  lg:space-x-6 text-sm">
                                <span>
                                    <strong>{totalCount ?? 0}</strong> posts
                                </span>
                                <span>
                                    <strong>{profileData?.followerscount ?? 0}</strong> followers
                                </span>
                                <span>
                                    <strong>{profileData?.followingcount ?? 0}</strong> following
                                </span>
                            </div>
                            <div className="mt-2 text-sm">
                                <p>{profileData?.bio}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            // router.push(`/profile/${profileData?.id}`);
                            setSelectedId(profileData?.id)
                            setOpen(true)
                        }}
                        className="mt-2.5 flex  px-4 py-2 w-[50%]  justify-center items-center rounded-md text-[16px] font-medium bg-gray-200 text-gray-800">
                        Edit Profile
                    </button>
                </div>
                <div className="w-full">
                    {/* Tabs */}
                    <div className="flex justify-center gap-4 border-b border-gray-200 pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative flex-1 flex justify-center items-center px-4 py-2 text-sm font-medium transition-all
              ${activeTab === tab
                                        ? "text-black-600"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black rounded-full"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Posts Grid with Infinite Scroll */}
                <InfiniteScroll
                    dataLength={postData.length}
                    next={fetchMorePosts}
                    hasMore={hasMore}
                    loader={<div className='py-40'>
                        <p className="text-center py-4 animate-spin w-fit m-auto text-black  justify-center items-center duration-300"><Loader size={32} /></p>

                    </div>}
                    endMessage={<p className="text-center py-4 text-gray-500">No more posts</p>}
                >
                    <div className="grid  grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-1 p-4">
                        {postData.map((post: any) => (
                            <div
                                onClick={() => {
                                    router.push(`/post/${post.user?.id}`)
                                    setSelectedPost(post)
                                }}
                                key={post.post?.id} className="relative aspect-[4/6] overflow-hidden">
                                {
                                    post.post?.thumbnail_url ?
                                        <Image
                                            src={post.post?.thumbnail_url}
                                            alt={post.post?.title}
                                            className="object-cover"
                                            fill
                                            sizes="(max-width: 640px) 33vw, 25vw"
                                        />
                                        :
                                        <div className="relative bg-black/30 h-full w-full flex justify-center items-center">
                                            {/* Soft gradient glow behind button */}
                                            <div className="absolute w-20 h-20 bg-white/10 blur-xl rounded-full"></div>

                                            {/* Play Button */}
                                            <div className="relative w-[46px] h-[46px] flex justify-center items-center bg-white/90 rounded-full shadow-lg shadow-black/20 backdrop-blur-sm">
                                                <Play color="black" size={22} />
                                            </div>
                                        </div>

                                }

                            </div>
                        ))}
                    </div>
                </InfiniteScroll>

                <ProfileForm open={open} setOpen={setOpen} selectedId={selectedId} getProfileFn={getProfile} />
            </div>
        </div>
    );
};

export default ProfilePage;
