import { X } from 'lucide-react';
import React, { useState, useRef } from 'react';
import CommentList from '../CommentList/CommentList';
import InputBox from '../CustomFields/InputBox';
import { initializeApi } from '@/lib/http';
import { tokenStore } from '@/lib/token';
import { useAuth } from '@/context/AuthContext';

interface CommentProps {
    post: any;
    isCommentClosed: () => void;
    isCommentOpen: boolean;
    onCommentAdded?: (postId: string, action?: 'increase' | 'decrease') => void;
}

const CommentComponent = ({ post, isCommentClosed, onCommentAdded }: CommentProps) => {
    const [commentT, setCommentT] = useState("");
    const commentListRef = useRef<any>(null);
    const api = initializeApi(tokenStore).getApi();
    const { user } = useAuth();

    const handlePostComment = async () => {
        if (!commentT.trim()) return;

        const tempComment = {
            _id: `temp-${Date.now()}`,
            text: commentT,
            user_id: {
                name: user?.name || "You",
                profile_photo: user?.profile_pic || "",
            },
            created_at: new Date().toISOString(),
            isTemp: true,
        };

        // Add locally
        commentListRef.current?.addLocalComment(tempComment);

        // Increment comment count locally
        onCommentAdded?.(post?.post?.id, "increase");
        setCommentT("");

        // Send to API
        try {
            await api.post(`/posts/${post?.post?.id}/comments`, { text: commentT });
        } catch (err) {
            console.error("Failed to post comment:", err);
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex px-4 py-2 items-center bg-white justify-between border-b">
                <h1 className="text-lg font-semibold text-black">Comments</h1>
                <X color="#000" size={22} onClick={isCommentClosed} className="cursor-pointer" />
            </div>

            <div className="h-full">
                <CommentList
                    ref={commentListRef}
                    postId={post?.post?.id}
                    onCommentDeleted={(id) => onCommentAdded?.(post?.post?.id, 'decrease')}
                />
            </div>

            <div className="px-4 py-2 border-t bg-white">
                <div className="flex items-center gap-2">
                    <InputBox
                        placeholder="Comment"
                        onChange={(text) => setCommentT(text)}
                        value={commentT}
                    />
                    <button
                        onClick={handlePostComment}
                        className="text-black font-medium text-sm px-2 py-1 rounded-lg hover:opacity-80"
                    >
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentComponent;
