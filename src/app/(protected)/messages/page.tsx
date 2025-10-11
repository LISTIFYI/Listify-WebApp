"use client";

import { useAuth } from "@/context/AuthContext";
import { http } from "@/lib/http";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { parse, format, isToday, isYesterday } from "date-fns";
import ChatsDetails from "@/components/ChatsComponent/ChatsDetails";

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
}

const MessagePage = () => {
    const { user } = useAuth();
    const [allMessages, setAllMessages] = useState<Chat[]>([]);
    const [page, setPage] = useState(1);
    const [totalMessages, setTotalMessages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedId, setSelectedId] = useState<SelectedUser | null>(null);

    const limit = 10;

    const getAllMessages = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await http.get(`/chats?page=${pageNum}&limit=${limit}`);
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

            console.log("Transformed Chats:", transformedChats);

            setAllMessages((prevMessages) => {
                const existingIds = new Set(prevMessages.map((m) => m.id));
                const filteredTransformedChats = transformedChats.filter((chat) => !existingIds.has(chat.id));
                return [...prevMessages, ...filteredTransformedChats];
            });

            if (pageNum === 1) {
                const total = res?.data?.total || 0;
                console.log("Total Messages:", total);
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
        console.log("Loading more data, current page:", page, "hasMore:", hasMore);
        setPage((prevPage) => {
            const nextPage = prevPage + 1;
            getAllMessages(nextPage);
            return nextPage;
        });
    };

    const handleSelectMessage = (id: string, username: string) => {
        console.log("Selecting message with id:", id, "username:", username); // Debug
        setSelectedId({ id, username });
    };

    return (
        <div className="h-full bg-white-200 flex flex-row">
            <div className="max-w-[400px] w-[100%]">
                <div className="h-full shadow-lg overflow-y-auto" id="scrollableDiv">
                    <InfiniteScroll
                        dataLength={allMessages.length}
                        next={handleLoadMoreData}
                        hasMore={hasMore}
                        loader={<p className="text-center py-4">Loading...</p>}
                        endMessage={<p
                            style={{ color: "rgb(115,115,115)" }}
                            className="text-center py-4 text-[14px] ">{allMessages.length === 0 ? "No messages" : "No more messages to load."}</p>}
                        scrollableTarget="scrollableDiv"
                    >
                        <div className="p-4">
                            {
                                allMessages.map((message, index) => (
                                    <div
                                        onClick={() => handleSelectMessage(message.id, message.userName)}
                                        key={message.id || `notification-${index}`}
                                        className="flex flex-row py-2 px-4 border-b cursor-pointer border-b-[#454545] items-center"
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
                                        <div className="flex flex-1 justify-between">
                                            {message.type !== "user" ? (
                                                <div className="flex flex-row justify-between">
                                                    <div className="flex flex-row items-center gap-2">
                                                        <h1 className="text-[14px] font-normal text-black">{message.userName}</h1>
                                                        <h1
                                                            style={{ color: "rgb(115,115,115)" }}
                                                            className="mt-0.5 font-normal text-12">
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
                                            {!message.initiatedByMessage && message.type === "request" && (
                                                <div className="flex flex-row mt-2 gap-2">
                                                    <button className="rounded-md py-1 px-3 bg-black text-white text-xs">
                                                        <h1>Accept</h1>
                                                    </button>
                                                    <button className="rounded-md py-1 px-3 bg-black text-white text-xs">
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
            <div className="border-l border-[2px] justify-center items-center flex flex-1">
                {selectedId ? (
                    <ChatsDetails
                        id={selectedId.id}
                        username={selectedId.username}
                        contentID={undefined}
                        profilePic={undefined}
                        listingId={allMessages.find((msg) => msg.id === selectedId.id)?.listingId}
                        propertyName={undefined}
                    />
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