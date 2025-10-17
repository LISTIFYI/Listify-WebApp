"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Link, Loader, Mic } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { tokenStore } from '@/lib/token';
import { initializeApi } from '@/lib/http';

interface SenderReceiver {
    _id: string;
    name: string;
    profile_photo?: string;
}

interface ChatMessage {
    _id: string;
    senderId: SenderReceiver;
    receiverId?: SenderReceiver;
    content: string;
    created_at: string;
    readBy?: Array<{ userId: string; readAt: string }>;
    isEdited?: boolean;
    isDeleted?: boolean;
    messageType: string;
    attachments: [];
    replyTo?: string;
    time?: string;
    isSender?: boolean;
}

interface ChatDetails {
    status: string;
    participants: Array<{
        userId: string;
        name: string;
        profile_photo?: string;
    }>;
}

const MESSAGES_PER_PAGE = 20;

const ChatsDetails = ({ showheader = true }: { showheader?: boolean }) => {
    const api = initializeApi(tokenStore).getApi();

    const { user } = useAuth();
    const { chatDetails: ChatDetailsInfo } = useChat();

    const router = useRouter();
    const bottomSheetRef = useRef<any>(null);
    const scrollableDivRef = useRef<HTMLDivElement>(null);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isNewChat, setIsNewChat] = useState<boolean>(!ChatDetailsInfo?.id);
    const [actualChatId, setActualChatId] = useState<string | null>(ChatDetailsInfo?.id || null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
    const [inputText, setInputText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    console.log("lets check ti sht F", actualChatId, isNewChat);
    console.log("lets check ti sht F", ChatDetailsInfo);

    useEffect(() => {
        if (ChatDetailsInfo?.id) {
            setActualChatId(ChatDetailsInfo.id);
            setIsNewChat(false);
        } else {
            setActualChatId(null);
            setIsNewChat(true);
        }
    }, [ChatDetailsInfo?.id]);

    const formatTimestamp = (timestamp: string) => {
        const messageTime = new Date(timestamp);
        if (isToday(messageTime)) return format(messageTime, 'h:mm a');
        if (isYesterday(messageTime)) return 'Yesterday';
        return format(messageTime, 'dd/MM/yy');
    };

    const otherParticipant = useMemo(() => {
        if (!chatDetails?.participants || !user?.id) return null;
        return (
            chatDetails?.participants.find(
                (participant) => participant?.userId !== user?.id
            ) || null
        );
    }, [chatDetails, user?.id]);

    const handleLoadMore = useCallback(() => {
        if (!isLoadingMore && hasMoreMessages && !isLoading && actualChatId) {
            fetchMessages(currentPage + 1, false);
        }
    }, [isLoadingMore, hasMoreMessages, isLoading, currentPage, actualChatId]);

    const handlePresentChatOptions = useCallback(() => {
        bottomSheetRef.current?.snapTo(0);
    }, []);

    const handleDismissChatOptions = useCallback(() => {
        bottomSheetRef.current?.snapTo(100);
    }, []);

    useEffect(() => {
        setCurrentUserId(user?.id || null);
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id || !actualChatId) return;
        const initializeChat = async () => {
            setIsLoading(true);
            setError(null);
            try {
                await Promise.all([fetchMessages(1, true), fetchChatDetails()]);
            } catch (err) {
                setError('Failed to load chat. Please try again.');
                console.error('Chat initialization error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initializeChat();
    }, [actualChatId, user?.id, ChatDetailsInfo]);

    const createNewChatRequest = async (messageContent: string) => {
        try {
            const { data } = await api.post("/chats/request", {
                contentId: ChatDetailsInfo?.listingId,
                contentType: 'listing',
                initialMessage: messageContent,
                title: ChatDetailsInfo?.propertyName,
            });

            const newChatId = data?.chatId || data?._id;
            setActualChatId(newChatId);
            setIsNewChat(false);

            fetchChatDetails(newChatId);
            return newChatId;
        } catch (error) {
            console.error('Failed to create new chat:', error);
            throw error;
        }
    };

    const fetchMessages = async (page: number = 1, isInitial: boolean = false) => {
        if (!actualChatId) return;

        try {
            if (!isInitial) setIsLoadingMore(true);

            const { data } = await api.get(
                `/chats/${actualChatId}/messages?page=${page}&limit=${MESSAGES_PER_PAGE}`
            );

            const formattedMessages = data?.messages
                ?.filter((msg: ChatMessage) => msg.messageType !== 'system')
                .map((msg: any) => ({
                    ...msg,
                    time: formatTimestamp(msg.created_at),
                    isSender: msg?.senderId?.id === user?.id,
                }));

            if (isInitial) {
                setMessages(formattedMessages); // Remove .reverse() to keep chronological order
                setCurrentPage(1);
            } else {
                setMessages((prevMessages) => [...prevMessages, ...formattedMessages]);
                setCurrentPage(page);
            }

            setHasMoreMessages(formattedMessages.length === MESSAGES_PER_PAGE);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            if (!isInitial) alert('Failed to load more messages');
            throw error;
        } finally {
            if (!isInitial) setIsLoadingMore(false);
        }
    };

    const fetchChatDetails = async (chatId: string = actualChatId!) => {
        if (!chatId) return;
        try {
            const { data } = await api.get(`/chats/${actualChatId}`);
            setChatDetails(data);
        } catch (error: any) {
            console.error('Failed to fetch chat details:', error.response);
        }
    };

    const sendMessage = async () => {
        const messageContent = inputText.trim();
        if (!messageContent) return;

        setIsSending(true);
        const tempId = `temp_${Date.now()}`;

        const optimisticMessage: ChatMessage = {
            _id: tempId,
            senderId: { _id: user?.id ?? '', name: 'You' },
            receiverId: otherParticipant
                ? { _id: otherParticipant.userId, name: otherParticipant.name }
                : { _id: ChatDetailsInfo?.contentID || '', name: ChatDetailsInfo?.username || 'Unknown' },
            content: messageContent,
            created_at: new Date().toISOString(),
            messageType: 'text',
            attachments: [],
            time: formatTimestamp(new Date().toISOString()),
            isSender: true,
        };

        setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
        setInputText('');

        try {
            if (isNewChat) {
                const chatIdToUse = await createNewChatRequest(messageContent);
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg._id === tempId ? { ...msg, _id: `new_${Date.now()}` } : msg
                    )
                );
            } else {
                await api.post(`/chats/${actualChatId}/messages`, {
                    content: messageContent,
                    messageType: 'text',
                    attachments: [],
                });
                // fetchMessages(1, true);
                setMessages((prev) => [
                    ...prev.filter((msg) => msg._id !== tempId),
                    {
                        ...optimisticMessage,
                        _id: `sent_${Date.now()}`,
                    },
                ]);

            }
        } catch (error: any) {
            console.error('Failed to send message:', error);
            setError(error.response?.data?.message);
            setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== tempId));
            setInputText(messageContent);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        if (scrollableDivRef.current) {
            scrollableDivRef.current.scrollTop = 0; // because flex-col-reverse flips direction
        }
    }, [messages]);

    const handleRetry = useCallback(() => {
        if (actualChatId) {
            const initializeChat = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    await Promise.all([fetchMessages(1, true), fetchChatDetails()]);
                } catch (err) {
                    setError('Failed to load chat. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            };
            initializeChat();
        } else {
            setError(null);
        }
    }, [actualChatId]);

    const renderMessage = useCallback((item: ChatMessage) => {
        const isCurrentUser = item?.isSender;
        return (
            <div className={`flex flex-col  ${isCurrentUser ? "ml-auto" : "mr-auto"} w-[90%]`}>
                <div
                    className={`rounded-lg flex gap-2 ${isCurrentUser
                        ? 'self-end flex-row'
                        : 'self-start flex-row-reverse'
                        }`}
                >
                    <div
                        className={`px-5 py-2 rounded-full flex ${isCurrentUser
                            ? 'bg-blue-500 text-white self-end flex-row'
                            : 'bg-gray-200 text-black self-start flex-row-reverse'
                            }`}
                    >
                        <p className='text-sm'>{item?.content}</p>
                    </div>
                    {
                        !isCurrentUser &&
                        <p className='w-[32px] h-[32px] rounded-full overflow-hidden'>
                            <img src={ChatDetailsInfo?.profilePic} alt="" className='w-full h-full object-cover' />
                        </p>
                    }
                </div>
                <div
                    className={`flex mt-1 items-center  ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                    <p className={`text-xs ${isCurrentUser ? 'text-gray-600' : 'text-gray-500'}`}>
                        {item?.time}
                    </p>
                </div>
            </div>
        );
    }, []);
    const renderFooter = useCallback(() => {
        if (!isLoadingMore) return null;
        return (
            <div className="flex flex-col items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                <p className="text-gray-500 mt-2">Loading more messages...</p>
            </div>
        );
    }, [isLoadingMore]);

    const renderEmptyState = useCallback(() => {
        if (messages.length === 0 && !isLoading) {
            return (
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-gray-500 text-center text-sm">
                        Start a conversation with {ChatDetailsInfo?.username}
                    </p>
                </div>
            );
        }
        return null;
    }, [messages.length, isLoading, ChatDetailsInfo?.username]);

    const renderContent = () => {
        if (error && !isLoading) {
            return (
                <div className="flex flex-col w-full items-center justify-center h-screen bg-gray-100">
                    <p className="text-red-500 text-center mb-4">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-blue-500 text-sm  text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="mt-2 text-red-500  text-sm hover:underline"
                    >
                        Go back
                    </button>
                </div>
            );
        }

        if (isLoading && actualChatId) {
            return (
                <div className="flex flex-col flex-1 items-center justify-center h-screen bg-gray-100">
                    <div className="py-4">
                        <Loader size={32} className="animate-spin text-black" />
                    </div>
                    <p className="text-gray-500 mt-1 text-sm">Loading chat...</p>
                </div>

            );
        }

        return (
            <div className="flex border  flex-col h-full w-full bg-gray-100 text-black">
                {showheader && (
                    <div className="flex items-center justify-between px-4 py-4 border-b">
                        {/* <button onClick={() => router.back()} className="mr-4">
                            <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button> */}
                        <div className="flex items-center"
                            onClick={() => {
                                if (otherParticipant?.userId === user?.id) {
                                    router.push(`/profile`)
                                } else {
                                    router.push(`/profile/${otherParticipant?.userId}`)

                                }
                            }}
                        >
                            <div className='w-10 h-10 overflow-hidden rounded-full'>
                                {otherParticipant?.profile_photo || ChatDetailsInfo?.profilePic ? (
                                    <Image
                                        src={otherParticipant?.profile_photo ?? ChatDetailsInfo?.profilePic ?? ""}
                                        alt={otherParticipant?.name || ChatDetailsInfo?.username || 'User'}
                                        width={40}
                                        height={40}
                                        className="rounded-full mr-2"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                                        <p className="text-white text-lg font-bold">
                                            {(otherParticipant?.name || ChatDetailsInfo?.username)?.charAt(0).toUpperCase()}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className='ml-4'>
                                <p className="text-sm font-semibold">
                                    {otherParticipant?.name || ChatDetailsInfo?.username}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button className='cursor-pointer'>
                                <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24">
                                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2z" />
                                </svg>
                            </button>
                            <button className='cursor-pointer' onClick={handlePresentChatOptions}>
                                <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <div
                    ref={scrollableDivRef}
                    id="scrollableDiv"
                    className="flex-1 overflow-y-auto p-4 no-scrollbar flex flex-col-reverse h-full"
                    style={{ scrollBehavior: "smooth" }}
                >
                    {isNewChat ? (
                        <div className="flex-1 flex items-center justify-center p-4 h-full">
                            <p className="text-gray-500 text-center text-sm">
                                Start a conversation with {ChatDetailsInfo?.username}
                            </p>
                        </div>
                    ) : (
                        <InfiniteScroll
                            dataLength={messages.length}
                            next={handleLoadMore}
                            hasMore={hasMoreMessages}
                            loader={<p className="text-center py-4">Loading...</p>}
                            endMessage={<p className="text-center"></p>}
                            scrollableTarget="scrollableDiv"
                            inverse={true} // 👈 key point: list grows upward
                            className="flex flex-col space-y-2 space-y-reverse"
                        >
                            {renderEmptyState() || messages.map((item) => renderMessage(item))}
                        </InfiniteScroll>
                    )}
                </div>


                {chatDetails?.status === 'rejected' ? (
                    <div className="p-3 bg-gray-800 rounded-lg mx-3 mb-3 text-center">
                        <p className="text-gray-300 text-sm">
                            Your chat request was rejected. You cannot send messages in this conversation.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center mx-4 bg-gray-100 mb-2">
                        <button className="mr-2">
                            <Link size={18} />
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            className=" flex-1 p-2 bg-white rounded-md text-black text-sm placeholder-gray-500 focus:outline-none"
                            disabled={isSending}
                        />
                        <button className="ml-2">
                            <Mic size={18} />
                        </button>
                        <button
                            onClick={sendMessage}
                            className="ml-2 p-2 w-[80px]  text-sm bg-blue-500 rounded-full disabled:bg-blue-300"
                            disabled={isSending || !inputText.trim()}
                        >
                            {isSending ? (
                                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            ) : (
                                'send'
                            )}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return renderContent();
};

export default ChatsDetails;