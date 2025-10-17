import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { initializeApi } from '@/lib/http';
import { tokenStore } from '@/lib/token';
import axios from 'axios';
import { Bell, ChevronLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

export const notificationButtonMap: Record<string, string> = {
    post_liked: "View Post",
    post_commented: "View Comment",
    post_shared: "See Post",
    post_saved: "View Post",
    chat_message: "Reply",
    chat_request: "Accept Request",
    chat_accepted: "View Chat",
    meeting_invitation: "View Invite",
    meeting_reminder: "View Details",
    meeting_cancelled: "See Update",
    meeting_rescheduled: "View New Time",
    calendar_event: "View Event",
    calendar_reminder: "View Calendar",
    user_followed: "Follow Back",
    user_mentioned: "View Mention",
    wishlist_shared: "View Wishlist",
    wishlist_item_added: "View Post",
    system_announcement: "Read",
    account_update: "View Update",
    security_alert: "Check Now",
};


const NotificationPanel = ({ setIsSheetOpen, onMob }: any) => {
    const api = initializeApi(tokenStore).getApi();
    const { user } = useAuth()
    const { setChatDetails } = useChat()
    const router = useRouter()
    const [allNotifications, setAllNotifications] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;

    const getAllNotifications = async (pageNum: number) => {
        setLoading(true);
        try {
            const tk = tokenStore.get();
            const res = await api.get(`/notifications?page=${pageNum}&limit=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${tk?.accessToken}`,
                    },
                }
            );
            const newNotifications = res?.data?.notifications || [];
            console.log('API Response:', res?.data);
            console.log('New Notifications:', newNotifications);

            setAllNotifications((prevNotifications) => {
                const existingIds = new Set(prevNotifications.map(n => n._id));
                const filteredNewNotifications = newNotifications.filter((n: any) => !existingIds.has(n._id));
                return [...prevNotifications, ...filteredNewNotifications];
            });

            if (pageNum === 1) {
                const total = res?.data?.total || 0;
                console.log('Total Notifications:', total);
                setTotalNotifications(total);
            }

            setHasMore(newNotifications.length > 0 && allNotifications.length + newNotifications.length < res?.data?.total);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setAllNotifications([]);
        setPage(1);
        setHasMore(true);
        let subscribed = true;
        (async () => {
            if (subscribed) {
                await getAllNotifications(1);
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
            getAllNotifications(nextPage);
            return nextPage;
        });
    };

    function normalizeBackendText(text: string) {
        return text
            .replace(/\\"/g, "")
            .replace(/"/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function timeAgo(timestamp: string) {
        const now = new Date();
        const past = new Date(timestamp);
        const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (isNaN(seconds)) return "";

        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(seconds / 3600);
        const days = Math.floor(seconds / 86400);
        const weeks = Math.floor(seconds / (86400 * 7));
        const months = Math.floor(seconds / (86400 * 30));
        const years = Math.floor(seconds / (86400 * 365));

        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        if (weeks < 5) return `${weeks}w ago`;
        if (months < 12) return `${months}mo ago`;
        return `${years}y ago`;
    }


    const fetchChatDetails = async (chatId: string) => {
        if (!chatId) return;
        try {
            const { data } = await api.get<any>(`chats/${chatId}`);
            const filterData = data?.participants.filter((item: any) => item.userId !== user?.id);
            console.log("ftilerData", filterData);

            if (data?.status == "accepted") {
                setChatDetails({
                    username: filterData?.companyName ? filterData?.companyName : filterData?.agentName ? filterData?.agentName : filterData?.name,
                    contentID: "",
                    profilePic: "",
                    listingId: "",
                    propertyName: "",
                    id: data?.id,
                })
                setIsSheetOpen(false)
                router.push("/messages/")
                // navigation.navigate("ChatScreen", {
                //   username: filterData?.companyName ? filterData?.companyName : filterData?.agentName ? filterData?.agentName : filterData?.name,
                //   contentID: null,
                //   profilePic: null,
                //   listingId: null,
                //   propertyName: null,
                //   id: data?.id,
                // });
            } else {
                // navigation.navigate("chatsc")
                // setActiveTab("Messages")
                setIsSheetOpen(false)
                router.push("/messages/")


            }

        } catch (error: any) {
            console.error('Failed to fetch chat details:', error.response);
        }
    };
    const handleButtonPress = async (item: any) => {
        if (item?.type === "post_liked" || item?.type === "post_saved" || item?.type === "post_commented" || item?.type === "post_shared") {
            console.log("calledddd");
            const response = await api.get(`/posts/${item?.metadata?.post_id}`)
            console.log("responsee", response);

        }
        if (item?.type === "chat_message" || item?.type === "chat_accepted" || "chat_requested") {
            console.log("oneee", item?.type === "chat_message" || item?.type === "chat_accepted" || "chat_requested");
            fetchChatDetails(item?.metadata?.chat_id)
        } else if (item?.type === "post_liked" || item?.type === "post_saved" || item?.type === "post_commented" || item?.type === "post_shared") {
            console.log("two", item?.type === "post_liked" || item?.type === "post_saved" || item?.type === "post_commented" || item?.type === "post_shared");


            //   const transformResponseData = (response: any) => {
            //     const data = response || {};
            //     const transformedData = {
            //       post_id: data._id || "",
            //       user: {
            //         id: data?.user_id?._id || "",
            //         name: data?.user_id?.name || "",
            //         profile_pic: "", // Not provided in input
            //       },
            //       // // stats: defaultStats,
            //       post: {
            //         id: data?._id,
            //         title: data?.title,
            //         description: data?.description,
            //         thumbnail_url: data?.thumbnail_url,
            //         video_url: data?.video_url,
            //         duration_seconds: data?.duration_seconds,
            //         location: data?.location,
            //         tags: data?.tags,
            //       },

            //       stats: {
            //         view_count: data?.view_count,
            //         like_count: data?.like_count,
            //         comment_count: data?.comment_count,
            //         share_count: data?.share_count,
            //         save_count: data?.save_count,
            //         report_count: data?.report_count
            //       },

            //       // is_liked: false, // Assume false since like_count is 0
            //       // is_saved: false, // Not provided in input
            //       listing: data?.associatedListing
            //     };
            //     return transformedData;
            //   };
            //   if (response?.data) {
            //     const transformedData = transformResponseData(response?.data);
            //     setTempPost(transformedData)
            //     setTimeout(() => {
            //       navigation.push("BottomTabNav", {
            //         screen: "BuyAndRent",
            //       });
            //     }, 2000);
            //   }
        } else if (item?.type === "user_followed") {
            console.log("three", item?.type === "user_followed");

            const followerId = item?.metadata?.follower_id;
            if (followerId) {
                console.log("three", followerId);
                // followUser(followerId, item?._id);
            }
            return;
        }
    };

    return (
        <div className='h-full flex flex-col'>
            <div className={`h-[65px] border flex ${onMob ? "justify-start px-2 " : "justify-between px-4 "} items-center`}>
                {onMob &&
                    <ChevronLeft className="cursor-pointer" size={28} />
                }
                <h1 className='text-[18px] font-medium flex flex-row gap-1 items-center'><Bell size={20} />Notifications</h1>
                {
                    !onMob &&
                    <button className='cursor-pointer' onClick={() => {
                        setIsSheetOpen(false)
                    }}>
                        <X />
                    </button>
                }
            </div>
            <div
                className=" h-full shadow-lg  overflow-y-auto"
                id="scrollableDiv"
            >
                <InfiniteScroll
                    dataLength={allNotifications.length}
                    next={handleLoadMoreData}
                    hasMore={hasMore}
                    loader={<p className="text-center py-4">Loading...</p>}
                    endMessage={<p
                        style={{ color: "rgb(115,115,115)" }}
                        className="text-center py-4 text-[14px] ">{allNotifications.length === 0 ? "No Notification" : "No more notification to load."}</p>}
                    scrollableTarget="scrollableDiv" // Specify scroll container
                >
                    <div className="">

                        {
                            allNotifications.map((notification, index) => {

                                let buttonText = notificationButtonMap[notification?.type] ?? "View";

                                // 👇 Add this check here
                                if (notification?.type === "user_followed") {
                                    buttonText = notification?.isFollowingBack ? "Following" : "Follow Back";
                                }


                                let message = normalizeBackendText(notification?.message);
                                if (
                                    (notification?.sender_agent_name || notification?.sender_builder_name) &&
                                    notification?.sender_name &&
                                    notification?.sender_company_name
                                ) {
                                    const regex = new RegExp(`\\b${notification.sender_name}\\b`, "g");
                                    message = message.replace(regex, `${notification.sender_company_name} `);
                                }

                                const displayName =
                                    notification?.sender_agent_name || notification?.sender_builder_name
                                        ? notification?.sender_company_name?.trim()
                                        : notification?.sender_name?.trim();

                                return (
                                    <div
                                        key={notification._id || `notification-${index}`}
                                        className='flex flex-row justify-between items-center py-5 px-4 border-b bg-white'
                                    >
                                        <div className='w-[42px] h-[42px] bg-[#dbdbdb] flex rounded-full overflow-hidden mr-[8px] justify-center items-center border border-[#fff]'>
                                            {notification?.sender_profile_pic ?
                                                <img src={notification?.sender_profile_pic ?? ""} alt="" className='w-fit h-full object-cover' />
                                                :
                                                <h1 className='text-[14px] font-sm font-semibold'>
                                                    {displayName ? displayName.charAt(0).toUpperCase() : ""}
                                                </h1>
                                            }
                                        </div>

                                        <div className='flex-1 justify-center'>
                                            <h1 className='text-[14px] text-black font-normal pr-[16px]'>{message}</h1>
                                            <h1
                                                style={{ color: "rgb(115,115,115)" }}
                                                className='text-[12px] mt-[6px]'>
                                                {timeAgo(notification?.created_at)} {index + 1}
                                            </h1>
                                        </div>
                                        <button
                                            onClick={() => {
                                                handleButtonPress(notification)
                                            }}
                                            className='bg-black text-[12px] font-normal text-white rounded-full py-1 px-3'>
                                            {buttonText}
                                        </button>
                                    </div>
                                )
                            })
                        }
                    </div>
                </InfiniteScroll>
            </div>
        </div>
    );
};

export default NotificationPanel;