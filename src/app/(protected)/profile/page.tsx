"use client"

import MapWithMarkers from '@/components/GoogleMapComponent/MapWithMarkers';
import ProfileForm from '@/components/Layout/ProfileForm/ProfileForm';
import { tokenStore } from '@/lib/token';
import axios from 'axios';
import type { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const ProfilePage: NextPage = () => {
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
            const res = await axios.get(
                "https://listifyi-api-1012443530727.asia-south1.run.app/users/profile",
                { headers: { Authorization: `Bearer ${tk?.accessToken}` } }
            );
            setProfileData(res.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const getPosts = async (currentPage: number) => {
        if (loading) return;
        setLoading(true);

        try {
            const tk = tokenStore.get();
            const res = await axios.get(
                `https://listifyi-api-1012443530727.asia-south1.run.app/posts/my-posts?page=${currentPage}&limit=20&?pricingType=all&status=published`,
                { headers: { Authorization: `Bearer ${tk?.accessToken}` } }
            );
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
        getProfile();
        getPosts(1);
    }, []);

    const fetchMorePosts = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            getPosts(nextPage);
        }
    };

    return (
        <div className='overflow-y-scroll h-full'>
            <div className="h-full max-w-[85%] w-[100%] mx-auto">
                {/* <MapWithMarkers /> */}
                {/* Profile Header */}
                <div className="mx-auto p-4 sm:p-6 max-w-[90%] w-[100%]">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="relative w-16 h-16 sm:w-32 sm:h-32 rounded-full overflow-hidden border justify-center items-center flex">
                            {profileData?.profile_pic && profileData?.profile_pic.trim() !== "" ? (
                                <Image
                                    src={profileData.profile_pic}
                                    alt="Profile picture"
                                    className="rounded-full object-cover"
                                    fill
                                    sizes="(max-width: 640px) 96px, 128px"
                                />
                            ) : (
                                <span className="text-3xl sm:text-5xl font-semibold text-gray-700">
                                    {profileData?.name?.charAt(0)?.toUpperCase() || "U"}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 text-center sm:text-left my-auto">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                                <h1 className="text-xl sm:text-2xl font-semibold">{profileData?.name}</h1>
                                <button
                                    onClick={() => {
                                        // router.push(`/profile/${profileData?.id}`);
                                        setSelectedId(profileData?.id)
                                        setOpen(true)
                                    }}
                                    className="mt-2 sm:mt-0 px-4 py-1.5 rounded-md text-sm font-medium bg-gray-200 text-gray-800">
                                    Edit Profile
                                </button>
                            </div>
                            <div className="mt-4 flex justify-center sm:justify-start space-x-6 text-sm">
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
                </div>

                {/* Posts Grid with Infinite Scroll */}
                <InfiniteScroll
                    dataLength={postData.length}
                    next={fetchMorePosts}
                    hasMore={hasMore}
                    loader={<p className="text-center py-4">Loading...</p>}
                    endMessage={<p className="text-center py-4 text-gray-500">No more posts</p>}
                >
                    <div className="grid grid-cols-4 gap-1 sm:gap-1">
                        {postData.map((post: any) => (
                            <div key={post.post?.id} className="relative aspect-square">
                                <Image
                                    src={post.post?.thumbnail_url}
                                    alt={post.post?.title}
                                    className="object-cover"
                                    fill
                                    sizes="(max-width: 640px) 33vw, 25vw"
                                />
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
