"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { http } from '@/lib/http';
import { Link, Mic } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

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

const ChatsDetails = ({
    id,
    username,
    contentID,
    profilePic,
    listingId,
    propertyName,
}: {
    id?: string;
    username?: string;
    contentID?: string;
    profilePic?: string;
    listingId?: string;
    propertyName?: string;
}) => {
    const { user } = useAuth();
    const { chatDetails: ChatDetails } = useChat();
    console.log("my dtails", ChatDetails);


    const router = useRouter();
    const bottomSheetRef = useRef<any>(null);
    const scrollableDivRef = useRef<HTMLDivElement>(null);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isNewChat, setIsNewChat] = useState<boolean>(!id);
    const [actualChatId, setActualChatId] = useState<string | null>(id || null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
    const [inputText, setInputText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const API_ROUTES = {
        createNewChat: '/chats/request',
        getChatsById: `/chats/${actualChatId}/messages`,
        getChatdetails: `/chats/${actualChatId}`,
    };

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
            <div className="flex flex-col w-full">
                <div
                    className={`p-2 rounded-lg ${isCurrentUser
                        ? 'bg-blue-500 text-white self-end'
                        : 'bg-gray-200 text-black self-start'
                        }`}
                >
                    <p>{item?.content}</p>
                </div>
                <div
                    className={`flex items-center mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}
                >
                    <p className={`text-xs ${isCurrentUser ? 'text-white' : 'text-gray-500'}`}>
                        {item?.time}
                    </p>
                    {isCurrentUser && (
                        <Image
                            src="/double-check.png"
                            alt="Read"
                            width={12}
                            height={12}
                            className="ml-1"
                        />
                    )}
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
                    <p className="text-gray-500 text-center text-lg">
                        Start a conversation with {username}
                    </p>
                </div>
            );
        }
        return null;
    }, [messages.length, isLoading, username]);

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
    }, [actualChatId, user?.id]);

    const createNewChatRequest = async (messageContent: string) => {
        try {
            const { data } = await http.post(API_ROUTES.createNewChat, {
                contentId: listingId,
                contentType: 'listing',
                initialMessage: messageContent,
                title: propertyName,
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
            const { data } = await http.get(
                `${API_ROUTES.getChatsById}?page=${page}&limit=${MESSAGES_PER_PAGE}`
            );

            const formattedMessages = data?.messages
                ?.filter((msg: ChatMessage) => msg.messageType !== 'system')
                .map((msg: any) => ({
                    ...msg,
                    time: formatTimestamp(msg.created_at),
                    isSender: msg?.senderId?.id === user?.id,
                }));

            if (isInitial) {
                setMessages(formattedMessages.reverse());
                setCurrentPage(1);
            } else {
                setMessages((prevMessages) => [...formattedMessages.reverse(), ...prevMessages]);
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
            const { data } = await http.get(API_ROUTES.getChatdetails);
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
                : { _id: contentID || '', name: username || 'Unknown' },
            content: messageContent,
            created_at: new Date().toISOString(),
            messageType: 'text',
            attachments: [],
            time: formatTimestamp(new Date().toISOString()),
            isSender: true,
        };

        setMessages((prevMessages) => [optimisticMessage, ...prevMessages]);
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
                await http.post(API_ROUTES.getChatsById, {
                    content: messageContent,
                    messageType: 'text',
                    attachments: [],
                });
                fetchMessages(1, true);
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



    // Conditional rendering logic moved to JSX
    const renderContent = () => {
        if (!id) {
            return <div className="w-full h-full"></div>;
        }

        if (error && !isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                    <p className="text-red-500 text-center mb-4">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="mt-2 text-red-500 hover:underline"
                    >
                        Go back
                    </button>
                </div>
            );
        }

        if (isLoading && actualChatId) {
            return (
                <div className="flex flex-col flex-1 items-center justify-center h-screen bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                    <p className="text-gray-500 mt-4">Loading chat...</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col h-full w-full bg-black text-white">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <button onClick={() => router.back()} className="mr-4">
                        <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>
                    <div className="flex items-center">
                        {otherParticipant?.profile_photo || profilePic ? (
                            <Image
                                src={otherParticipant?.profile_photo ?? profilePic!}
                                alt={otherParticipant?.name || username || 'User'}
                                width={40}
                                height={40}
                                className="rounded-full mr-2"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                                <p className="text-white text-lg font-bold">
                                    {(otherParticipant?.name || username)?.charAt(0).toUpperCase()}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-semibold">
                                {otherParticipant?.name || username}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button>
                            seee
                        </button>
                        <button>
                            <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2z" />
                            </svg>
                        </button>
                        <button onClick={handlePresentChatOptions}>
                            <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div
                    ref={scrollableDivRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    id="scrollableDiv"
                >
                    <InfiniteScroll
                        dataLength={messages.length}
                        next={handleLoadMore}
                        hasMore={hasMoreMessages}
                        loader={<p className="text-center py-4">Loading...</p>}
                        endMessage={<p className="text-center py-4">No more messages to load.</p>}
                        scrollableTarget="scrollableDiv"
                    >
                        <div className="space-y-4">
                            {renderEmptyState() || messages.map((item) => renderMessage(item)).reverse()}
                        </div>
                    </InfiniteScroll>
                </div>
                {chatDetails?.status === 'rejected' ? (
                    <div className="p-3 bg-gray-800 rounded-lg mx-3 mb-3 text-center">
                        <p className="text-gray-300 text-sm">
                            Your chat request was rejected. You cannot send messages in this conversation.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center p-2 bg-gray-900">
                        <button className="mr-2">
                            <Link />
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 p-2 bg-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none"
                            disabled={isSending}
                        />
                        <button className="ml-2">
                            <Mic />
                        </button>
                        <button
                            onClick={sendMessage}
                            className="ml-2 p-2 bg-blue-500 rounded-full disabled:bg-blue-300"
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