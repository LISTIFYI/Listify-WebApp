'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatParams {
    id?: string;
    username?: string;
    contentID?: string | undefined;
    profilePic?: string | undefined;
    listingId?: string | undefined;
    propertyName?: string | undefined;
}

const ChatContext = createContext<{
    chatDetails: ChatParams | null;
    setChatDetails: (details: ChatParams | null) => void;
}>({
    chatDetails: null,
    setChatDetails: () => { },
});

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chatDetails, setChatDetails] = useState<ChatParams | null>(null);

    return (
        <ChatContext.Provider value={{ chatDetails, setChatDetails }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);