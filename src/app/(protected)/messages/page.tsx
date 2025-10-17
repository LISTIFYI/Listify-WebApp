"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { parse, format, isToday, isYesterday } from "date-fns";
import ChatsDetails from "@/components/ChatsComponent/ChatsDetails";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import { toast } from "sonner";
import { tokenStore } from "@/lib/token";
import { initializeApi } from "@/lib/http";

const formatTimestamp = (timestamp: string) => {
    const messageTime = new Date(timestamp);
    if (isToday(messageTime)) {
        return format(messageTime, "h:mm a");
    }
    if (isYesterday(messageTime)) {
        return "Yesterday";
    }
    return format(messageTime, "dd/MM/yy");
};

interface Chat {
    id: string;
    type: "request" | "user";
    statusType: string;
    userName: string;
    message: string;
    timestamp: Date;
    avatar: string;
    senderId: string;
    initiatedByMessage: boolean;
    listingId?: string;
    lastMessage: {
        senderId: string;
        content: string;
        created_at: string;
    };
    currentUserID: string;
}

interface SelectedUser {
    id: string;
    username: string;
    statusType: string
}

const MessagePage = () => {
    const api = initializeApi(tokenStore).getApi();

    const { user } = useAuth();
    const { chatDetails, setChatDetails } = useChat();
    const [allMessages, setAllMessages] = useState<Chat[]>([]);
    const [page, setPage] = useState(1);
    const [totalMessages, setTotalMessages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedId, setSelectedId] = useState<SelectedUser | null>(null);
    const router = useRouter()
    const limit = 10;

    const getAllMessages = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await api.get(`/chats?page=${pageNum}&limit=${limit}`);
            const newMessages = res?.data?.chats || [];

            const transformedChats: Chat[] = newMessages.map((chat: any) => {
                const sender =
                    chat.participants.find((p: any) => p.userId === chat.lastMessage?.senderId) ||
                    chat.participants[0] ||
                    { userId: null, name: "Unknown", profile_photo: "" };
                const otherParticipant =
                    chat.participants.find((p: any) => p.userId !== user?.id && p.userId !== null) ||
                    chat.participants.find((p: any) => p.userId === null) ||
                    { userId: null, name: "Unknown", profile_photo: "" };
                const initiatedByMe = chat.initiatedBy?.id === user?.id;

                return {
                    id: chat.id,
                    type: chat.status === "pending" ? "request" : "user",
                    statusType: chat.status,
                    userName: otherParticipant.name || "Unknown",
                    message: chat.lastMessage?.content || "",
                    timestamp: new Date(chat.lastMessage?.created_at || chat.created_at || Date.now()),
                    avatar: otherParticipant.profile_photo || "",
                    senderId: sender.userId || "",
                    initiatedByMessage: initiatedByMe,
                    listingId: chat.relatedContent?.contentType === "listing" ? chat.relatedContent.contentId : undefined,
                    lastMessage: chat.lastMessage || { senderId: "", content: "", created_at: "" },
                    currentUserID: user?.id || "",
                };
            });


            setAllMessages((prevMessages) => {
                const existingIds = new Set(prevMessages.map((m) => m.id));
                const filteredTransformedChats = transformedChats.filter((chat) => !existingIds.has(chat.id));
                return [...prevMessages, ...filteredTransformedChats];
            });

            if (pageNum === 1) {
                const total = res?.data?.total || 0;
                setTotalMessages(total);
            }

            setHasMore(newMessages.length > 0 && allMessages.length + transformedChats.length < (res?.data?.total || 0));
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setAllMessages([]);
        setPage(1);
        setHasMore(true);
        let subscribed = true;
        (async () => {
            if (subscribed) {
                await getAllMessages(1);
            }
        })();
        return () => {
            subscribed = false;
        };
    }, []);

    const handleLoadMoreData = () => {
        if (loading || !hasMore) return;
        setPage((prevPage) => {
            const nextPage = prevPage + 1;
            getAllMessages(nextPage);
            return nextPage;
        });
    };

    const handleSelectMessage = (id: string, username: string, statusType: string) => {
        setSelectedId({ id, username, statusType });
    };

    const handleAccept = async (id: string) => {
        try {
            const response = await api.put<any>(`chats/${id}/accept`);
            getAllMessages(1);
        } catch (err) {
            console.error("Failed to accept chat:", err);
            //   setError("Failed to accept chat");
        }
    };

    const handleRejected = async (id: string) => {
        try {
            const response = await api.put<any>(`chats/${id}/reject`);
            getAllMessages(1);
        } catch (err) {
            console.error("Failed to accept chat:", err);
            //   setError("Failed to accept chat");
        }
    };

    const handleNavigateToChatDetails = () => {

        // if (selectedId) {
        const params = {
            // id: selectedId,
            id: "343434343",
            // username: selectedId.username,
            username: "Jignesh",
            contentID: undefined,
            profilePic: undefined,
            // listingId: allMessages.find((msg) => msg.id === selectedId.id)?.listingId,
            listingId: "",

            propertyName: undefined,
        };
        // Use router.push with state for App Router
        setChatDetails(params)
        router.push('/messages/3434343');
        // }
    };
    console.log("no", allMessages);

    console.log("indererererer", window.innerWidth);

    return (
        <div className="h-full bg-white-200 flex flex-row">
            <div className="lg:max-w-[400px] md:max-w-[400px]   w-[100%]">
                <div className="h-full shadow-lg overflow-y-auto" id="scrollableDiv">
                    <InfiniteScroll
                        dataLength={allMessages.length}
                        next={handleLoadMoreData}
                        hasMore={hasMore}
                        loader={<p className="text-center py-4">Loading...</p>}
                        endMessage={<p
                            style={{ color: "rgb(115,115,115)" }}
                            className="text-center py-4 text-[16px] md:text-[14px] lg:text-[14px]">{allMessages.length === 0 ? "No messages" : "No more messages to load."}</p>}
                        scrollableTarget="scrollableDiv"
                    >
                        <div className="">
                            {
                                allMessages.map((message, index) => (
                                    <div
                                        onClick={() => {
                                            if (message?.statusType !== "pending" && message?.statusType !== "rejected") {

                                                if (window.innerWidth >= 768) {
                                                    setChatDetails({
                                                        id: message?.id,
                                                        username: message?.userName,
                                                        profilePic: message?.avatar,
                                                    });
                                                    handleSelectMessage(message.id, message.userName, message?.statusType);

                                                } else {
                                                    setChatDetails({
                                                        id: message?.id,
                                                        username: message?.userName,
                                                        profilePic: message?.avatar,
                                                    });
                                                    handleSelectMessage(message.id, message.userName, message?.statusType);
                                                    router.push(`/messages/${message?.id}`)
                                                }


                                            } else {
                                                toast.warning(`${message?.statusType === "rejected" ? "You cannot view messages for a rejected request." : "You can view messages only after accepting the request."}`);
                                                setChatDetails({})
                                                setSelectedId(null)

                                            }

                                        }}
                                        key={message.id || `notification-${index}`}
                                        className={`flex flex-row py-2 px-4 border-b cursor-pointer items-center transition-all duration-200  ${chatDetails?.id === message?.id ? "lg:bg-gray-100 md:bg-gray-100 bg-white" : "bg-white"}`}
                                    >
                                        <div className="border w-[42px] flex h-[42px] overflow-hidden rounded-full justify-center items-center border-[#fff] mr-3 bg-[#dbdbdb]">
                                            {message.avatar ? (
                                                <img src={message.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <h1 className="text-sm font-semibold text-black">
                                                    {message.userName ? message.userName.charAt(0).toUpperCase() : ""}
                                                </h1>
                                            )}
                                        </div>
                                        <div className="flex flex-1 justify-between flex-col">
                                            {message.type !== "user" ? (
                                                <div className="flex flex-row justify-between">
                                                    <div className="flex flex-row justify-between flex-1 items-center gap-2">
                                                        <h1 className="text-sm font-normal text-black">{message.userName}</h1>
                                                        <h1
                                                            style={{ color: "rgb(115,115,115)" }}
                                                            className="mt-0.5 font-normal text-xs">
                                                            {formatTimestamp(message.timestamp.toISOString())}
                                                        </h1>
                                                    </div>
                                                    {/* <div>
                                                        {message.olo && (
                                                            <h1 className="mt-0.5 font-normal text-[#6B5563] text-sm">
                                                                Location: {message.location}
                                                            </h1>
                                                        )}
                                                    </div> */}
                                                </div>
                                            ) : (
                                                <div className="flex flex-row justify-between flex-1">
                                                    <div className="flex-1 flex flex-col">
                                                        <h1 className="text-[14px] font-normal text-black">{message.userName}</h1>
                                                        <h1
                                                            style={{ color: "rgb(115,115,115)" }}
                                                            className="mt-0.5 flex flex-row items-center font-normal text-[12px]">
                                                            {message.message}
                                                        </h1>
                                                    </div>
                                                    <h1 className="mt-0.5 font-normal text-[#6B7280] text-xs">
                                                        {formatTimestamp(message.timestamp.toISOString())}
                                                    </h1>
                                                </div>
                                            )}
                                            {(!message.initiatedByMessage && message.type === "request") && (
                                                <div className="flex flex-row mt-2 gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleAccept(message?.id)
                                                        }}
                                                        className="rounded-md py-1 px-3 bg-black text-white text-xs">
                                                        <h1>Accept</h1>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRejected(message?.id)
                                                        }}
                                                        className="rounded-md py-1 px-3 bg-black text-white text-xs">
                                                        <h1>Reject</h1>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </InfiniteScroll>
                </div>
            </div>
            <div className="border-l border-[2px] justify-center items-center hidden md:flex lg:flex flex-1">
                {(selectedId?.id || chatDetails?.id) ? (
                    <ChatsDetails  />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p
                            style={{ color: "rgb(115,115,115)" }}
                            className="text-[14px]">Select a chat to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagePage;