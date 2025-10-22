import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Heart, Trash2 } from 'lucide-react';
import { initializeApi } from '@/lib/http';
import { tokenStore } from '@/lib/token';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const CommentList = forwardRef(({ postId, onCommentDeleted }: { postId: string; onCommentDeleted?: (postId: string) => void }, ref) => {
    const api = initializeApi(tokenStore).getApi();
    const { user } = useAuth();
    const [allComments, setAllComments] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalComments, setTotalComments] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;

    const router = useRouter()

    const getAllComments = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await api.get(`/posts/${postId}/comments?page=${pageNum}&limit=${limit}`);
            const newComments = res?.data?.comments || res?.data || [];
            setAllComments((prev) => [...prev, ...newComments]);
            setHasMore(newComments.length >= limit);
            if (pageNum === 1) setTotalComments(res?.data?.total || 0);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setAllComments([]);
        setPage(1);
        setHasMore(true);
        getAllComments(1);
    }, [postId]);

    // 👇 Expose method to parent for adding comment locally
    useImperativeHandle(ref, () => ({
        addLocalComment: (newComment: any) => {
            setAllComments((prev) => [newComment, ...prev]);
        },
    }));



    // 👇 local delete function
    const handleDeleteComment = async (id: string) => {
        const previousComments = [...allComments];
        setAllComments((prev) => prev.filter((c) => c._id !== id));
        onCommentDeleted?.(postId);
        try {
            await api.delete(`posts/comments/${id}`);
        } catch (err) {
            console.error('Error deleting comment:', err);
            setAllComments(previousComments);
        }
    };


    const handleLikeDislike = async (commentId: string, isCurrentlyLiked: boolean) => {
        setAllComments((prevComments) =>
            prevComments.map((comment) =>
                comment._id === commentId
                    ? {
                        ...comment,
                        is_liked: !isCurrentlyLiked,
                        like_count: isCurrentlyLiked
                            ? comment.like_count - 1
                            : comment.like_count + 1,
                    }
                    : comment
            )
        );

        try {
            if (!isCurrentlyLiked) {
                await api.post(`posts/comments/${commentId}/like`);
            } else {
                await api.delete(`posts/comments/${commentId}/like`);
            }
        } catch (error) {
            console.error("Error liking/unliking comment:", error);
            setAllComments((prevComments) =>
                prevComments.map((comment) =>
                    comment._id === commentId
                        ? {
                            ...comment,
                            is_liked: isCurrentlyLiked,
                            like_count: isCurrentlyLiked
                                ? comment.like_count + 1
                                : comment.like_count - 1,
                        }
                        : comment
                )
            );
        }
    };

    const handleLoadMoreData = () => {
        if (!loading && hasMore) {
            const next = page + 1;
            setPage(next);
            getAllComments(next);
        }
    };

    const timeAgo = (timestamp: string) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return `${Math.floor(diff / 604800)}w ago`;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="h-full shadow-lg overflow-y-auto" id="scrollableDiv">
                <InfiniteScroll
                    dataLength={allComments.length}
                    next={handleLoadMoreData}
                    hasMore={hasMore}
                    loader={<p className="text-center py-4">Loading...</p>}
                    endMessage={<p className="text-center py-4 text-gray-500 text-sm">No more comments</p>}
                    scrollableTarget="scrollableDiv"
                >
                    {allComments.map((comment, i) => (
                        <div key={comment._id || i} className="flex justify-between items-center py-2 px-4  bg-white">
                            <div className="flex items-start">
                                <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden mr-2 flex items-center justify-center border border-white">
                                    {comment?.user_id?.profile_photo ? (
                                        <img src={comment.user_id.profile_photo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-semibold">{comment?.user_id?.name?.[0]}</span>
                                    )}
                                </div>
                                <div>


                                    <div className="flex  items-start gap-0.5 flex-col">
                                        <div className='flex items-center gap-1'>
                                            <p
                                                onClick={() => {
                                                    if (user?.id === comment?.user_id?._id) {
                                                        router.push(`/profile`)

                                                    }
                                                    else {
                                                        router.push(`/profile/${comment?.user_id?._id}`)

                                                    }
                                                }}

                                                className="text-black text-[12px] font-medium cursor-pointer">{comment?.user_id?.name}</p>
                                            <span className="text-xs text-gray-500">{timeAgo(comment.created_at)}</span>
                                        </div>
                                        <h1 className=' text-[13px] text-black'>{comment?.text}</h1>

                                    </div>
                                    <div className="flex gap-4 mt-1 ">
                                        <div className='flex flex-row gap-2 items-center'>
                                            <Heart
                                                size={13}
                                                className={`cursor-pointer transition-all ${comment.is_liked ? "text-red-500 fill-red-500" : "text-gray-500"
                                                    }`}
                                                onClick={() => handleLikeDislike(comment._id, comment.is_liked)}
                                            />
                                            <span className="text-xs text-gray-600 ml-1">{comment.like_count || 0}</span>

                                        </div>
                                        <Trash2
                                            onClick={() => handleDeleteComment(comment._id)}
                                            size={12} className="cursor-pointer" color='#000' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </InfiniteScroll>
            </div>
        </div>
    );
});

CommentList.displayName = "CommentList";
export default CommentList;
