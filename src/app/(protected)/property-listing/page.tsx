"use client"

import DropdownMenuCustom from '@/components/CustomFields/DropdownMenuCustom'
import React, { useEffect, useRef, useState } from 'react'
import { DropdownConfig } from '@/types/listingTypes'
import Flat from '@/components/ListingComponents/Flat/Flat'
import Villa from '@/components/ListingComponents/Villa/Villa'
import Plot from '@/components/ListingComponents/Plot/Plot'
import MediaUpload from '@/components/MediaUpload/MediaUpload'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import Lottie from "lottie-react";
import listingAnimation from '../../../assets/lotties/Blue house.json'

const ListingPage = () => {
    const dropdownConfigs: DropdownConfig[] = [
        {
            key: 'transactionType',
            label: 'Transaction Type',
            placeholder: 'Select transaction type',
            options: [
                { value: "sale", label: "Sale" },
                { value: "resale", label: "Resale" },
            ],
        },
        {
            key: 'entityType',
            label: 'Entity Type',
            placeholder: 'Select entity type',
            options: [
                { value: "flat", label: "Flat" },
                // { value: "villa", label: "Villa" },
                // { value: "plot", label: "Plot" },
            ],
        },
    ]
    const { role } = useAuth()
    const [transactionType, setTransactionType] = useState('')
    const [entityType, setEntityType] = useState('')
    const [showNext, setShowNext] = useState(false)

    const totalSteps = 6;
    const [formCount, setFormCount] = useState(1)
    const progress = formCount > 1 ? ((formCount - 1) / (totalSteps - 1)) * 100 : 0;


    const [coverVideo, setCoverVideo] = useState<File | null>(null)
    const [galleryFiles, setGalleryFiles] = useState<string[]>([])
    const removeGalleryItem = (index: number) => {
        setGalleryFiles((prev: any) => prev.filter((_: any, i: any) => i !== index))
    }

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    }, [showNext]);


    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
        // Smoothly animate to the target progress value
        const timer = setTimeout(() => {
            setAnimatedProgress(progress);
        }, 100); // Slight delay for smoother effect
        return () => clearTimeout(timer);
    }, [progress]);

    useEffect(() => {
        if (entityType && transactionType) {
            setFormCount(2)
        }
    }, [entityType, transactionType])

    return (
        <div className='h-full flex flex-col'
        >
            {/* <div className='px-6 py-2 border-b  h-[80px] flex flex-col justify-center'>
                <h1 className="text-xl font-bold">Create New Listing</h1>
                <p className="text-gray-600 text-sm mt-1">
                    Fill in the details below to start your property listing.
                </p>
            </div> */}
            <div ref={containerRef} className='flex-1 transition-all scroll-smooth overflow-y-scroll no-scrollbar'>
                <div className='flex flex-row  h-full '>
                    <div className={` flex flex-col ${formCount === 1 ? "w-[50%]" : formCount === 6 ? "w-[80%] mx-auto" : "w-[50%] mx-auto"} w-[50%] p-4  `}>
                        {
                            formCount === 1 &&
                            <div className='flex flex-row gap-4 mb-3'>
                                <DropdownMenuCustom
                                    key={dropdownConfigs[0].key}
                                    options={dropdownConfigs[0].options}
                                    value={transactionType}
                                    onChange={(value) => setTransactionType(value as string)}
                                    placeholder={dropdownConfigs[0].placeholder}
                                    label={dropdownConfigs[0].label}
                                />

                                <DropdownMenuCustom
                                    key={dropdownConfigs[1].key}
                                    options={dropdownConfigs[1].options}
                                    value={entityType}
                                    onChange={(value) => setEntityType(value as string)}
                                    placeholder={dropdownConfigs[1].placeholder}
                                    label={dropdownConfigs[1].label}
                                />
                            </div>
                        }

                        <div className='flex flex-col  h-full'>
                            {
                                entityType === "flat" ?
                                    <Flat entityType={entityType} transactionType={transactionType} setShowNext={setShowNext} showNext={showNext}
                                        coverVideo={coverVideo}
                                        galleryFiles={galleryFiles} role={role ?? ""}
                                        formCount={formCount}
                                        setFormCount={setFormCount}
                                        totalSteps={totalSteps}
                                    /> :
                                    entityType === "villa" ?
                                        <Villa entityType={entityType} transactionType={transactionType} setShowNext={setShowNext} showNext={showNext} coverVideo={coverVideo} galleryFiles={galleryFiles} role={role ?? ""} /> :
                                        entityType === "plot" ?
                                            <Plot entityType={entityType} transactionType={transactionType} setShowNext={setShowNext} showNext={showNext} coverVideo={coverVideo} galleryFiles={galleryFiles} role={role ?? ""} /> :
                                            <></>
                            }
                        </div>
                    </div>

                    {
                        formCount === 1 &&
                        <div className="flex flex-1 h-full items-center justify-center p-8 bg-gray-50 border-l">
                            <div className="text-center max-w-md">
                                <Lottie
                                    animationData={listingAnimation}
                                    loop
                                    autoplay
                                    className="w-96 h-96 mx-auto"
                                />
                                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                                    Showcase What You Offer
                                </h2>
                                <p className="text-gray-600 mb-5 leading-relaxed">
                                    Every great business starts with a standout listing.
                                    Present your products with clarity, style, and purpose — your first step toward growing visibility and trust.
                                </p>
                                <div className="border-l-4 border-blue-500 bg-white shadow-sm rounded-lg p-4 text-left text-gray-700">
                                    <p className="text-sm italic">
                                        “Your listings reflect your brand — make them detailed, authentic, and customer-focused.”
                                    </p>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>

            <ListingProgress animatedProgress={animatedProgress} />
        </div>
    )
}

export default ListingPage


const ListingProgress = ({ animatedProgress }: { animatedProgress: number }) => {
    return (
        <div className="shadow-md py-4 w-full px-4 bg-white/70 backdrop-blur-sm border-t border-gray-100">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-gray-800 text-sm font-semibold tracking-tight">
                    Your listing setup is {Math.round(animatedProgress)}% complete
                </h1>

                {/* Dynamic Status Label */}
                <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${animatedProgress < 50
                        ? "bg-gray-200 text-gray-700"
                        : animatedProgress < 100
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                >
                    {animatedProgress < 50
                        ? "Just getting started"
                        : animatedProgress < 100
                            ? "Almost there"
                            : "Completed!"}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative shadow-inner">
                <motion.div
                    className="h-full bg-gradient-to-r from-black via-gray-700 to-gray-500 shadow-[0_0_10px_#444]"
                    initial={{ width: 0 }}
                    animate={{ width: `${animatedProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />
            </div>

            {/* Optional animated text feedback */}
            <motion.p
                className="text-xs text-gray-500 mt-2"
                key={animatedProgress}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {animatedProgress < 50
                    ? "Fill in more details to continue your setup."
                    : animatedProgress < 100
                        ? "You’re almost done! Just a few more fields."
                        : "All steps completed. Great job!"}
            </motion.p>
        </div>
    );
}
