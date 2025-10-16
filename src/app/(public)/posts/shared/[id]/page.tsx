"use client"

import { http } from '@/lib/http';
import { usePostContext } from '@/lib/postContext';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { motion, useAnimation } from "framer-motion";
import SPImage from '@/assets/Logo.svg'
import Image from 'next/image';


const SharedPost = () => {
    const { id } = useParams();
    const { setSelectedPost } = usePostContext()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const GetPost = async () => {
        try {
            setLoading(true)
            const res = await http.get(`posts/shared/${id}`)
            if (res?.data) {
                const properPost = await http.get(`posts/${res?.data.post.id}`)

                const transformResponseData = (response: any) => {
                    const data = response || {};
                    const transformedData = {
                        post_id: data._id || "",
                        user: {
                            id: data?.user_id?._id || "",
                            name: data?.user_id?.name || "",
                            profile_pic: "", // Not provided in input
                        },
                        // // stats: defaultStats,
                        post: {
                            id: data?._id,
                            title: data?.title,
                            description: data?.description,
                            thumbnail_url: data?.thumbnail_url,
                            video_url: data?.video_url,
                            duration_seconds: data?.duration_seconds,
                            location: data?.location,
                            tags: data?.tags,
                        },

                        stats: {
                            view_count: data?.view_count,
                            like_count: data?.like_count,
                            comment_count: data?.comment_count,
                            share_count: data?.share_count,
                            save_count: data?.save_count,
                            report_count: data?.report_count
                        },

                        // is_liked: false, // Assume false since like_count is 0
                        // is_saved: false, // Not provided in input
                        listing: data?.associatedListing
                    };

                    return transformedData;
                };


                if (properPost?.data) {
                    const transformedData = transformResponseData(properPost?.data);
                    setSelectedPost(transformedData as any)
                    setTimeout(() => {
                        router.push("/explore");
                        setLoading(false)

                    }, 3200);
                }
            }


        } catch (error) {
            console.log("something went wrong");
            setLoading(false)

        }


    }
    useEffect(() => {
        if (id) {
            GetPost()
        }
    }, [id])

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-white">
                <SplashScreen />
            </div>
        )
    }

    return null
}

export default SharedPost

export const SplashScreen = () => {
    const logoControls = useAnimation();
    const textControls = useAnimation();

    useEffect(() => {
        const animateSequence = async () => {
            // ✅ Step 1: Logo bounce (using tween for multi-keyframe support)
            await logoControls.start({
                scale: [0.4, 1.1, 1],
                transition: {
                    duration: 1.2,
                    ease: [0.34, 1.56, 0.64, 1], // spring-like cubic-bezier
                },
            });

            // ✅ Step 2: Fade + scale text
            await textControls.start({
                opacity: [0, 1],
                scale: [0.8, 1],
                transition: {
                    duration: 0.6,
                    ease: "easeOut",
                },
            });
        };

        animateSequence();
    }, [logoControls, textControls]);

    return (
        <div className="flex flex-col w-full  justify-center items-center h-screen bg-white relative overflow-hidden">
            {/* Animated Logo */}
            <motion.div
                animate={logoControls}
                initial={{ scale: 0.4 }}
                className="w-36 h-36 flex justify-center items-center"
            >
                <Image
                    src={SPImage}
                    alt="Loading logo"
                    className="w-full h-full object-contain"
                    priority
                />
            </motion.div>

            {/* Animated Text */}
            <motion.h1
                animate={textControls}
                initial={{ opacity: 0, scale: 0.8 }}
                className="text-4xl tracking-widest ml-2 text-black font-[900]"
            >
                Listifyi
            </motion.h1>

            {/* Footer Text */}
            <div className=" absolute  bottom-8 text-gray-600 text-[16px]">
                Crafted with ❤️ in Bengaluru, India
            </div>
        </div>
    );
};


