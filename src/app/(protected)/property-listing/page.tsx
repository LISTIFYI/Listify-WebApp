"use client"

import DropdownMenuCustom from '@/components/CustomFields/DropdownMenuCustom'
import React, { useEffect, useRef, useState } from 'react'
import { DropdownConfig } from '@/types/listingTypes'
import Flat from '@/components/ListingComponents/Flat/Flat'
import Villa from '@/components/ListingComponents/Villa/Villa'
import Plot from '@/components/ListingComponents/Plot/Plot'
import MediaUpload from '@/components/MediaUpload/MediaUpload'
import { useAuth } from '@/context/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'
import Lottie from "lottie-react";
import listingAnimation from '../../../assets/lotties/Blue house.json'
import ButtonCommon from '@/components/CustomFields/Button'
import one from '@/assets/apartment-svgrepo-com.svg'
import two from '@/assets/big-house-with-car-garage-svgrepo-com.svg'
import three from '@/assets/square-dashed-svgrepo-com.svg'
import Image from 'next/image'

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
    const { role, user } = useAuth()
    console.log("pp", user);

    const [transactionType, setTransactionType] = useState('')
    const [entityType, setEntityType] = useState('')
    const [showNext, setShowNext] = useState(false)

    const totalSteps = 6;
    const [formCount, setFormCount] = useState(1)
    const [direction, setDirection] = useState(0); // 1 = next, -1 = back

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
            setDirection(1)
            setFormCount(2)

        }
    }, [entityType, transactionType])

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            position: "absolute",
        }),
        center: {
            x: 0,
            opacity: 1,
            position: "relative",
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -100 : 100,
            opacity: 0,
            position: "absolute",
        }),
    };

    const finalSubmit = (data: any, data2: any) => {
        console.log(data, data2);
    }

    return (
        <div className='h-full flex flex-col justify-center items-center'
        >
            <div className='flex flex-col w-[90%] h-[90%] overflow-hidden rounded-[50px]  shadow-[0_8px_30px_rgb(0,0,0,0.12)]'>
                <div className='flex flex-row h-full '>
                    <div className='flex-1 flex flex-col '>
                        <div className="px-8 py-4 border-b bg-gray-50 sticky top-0 z-10">
                            <div className="flex items-center justify-between mb-1">
                                <h1 className="text-gray-800 text-sm font-semibold tracking-tight">
                                    Step {formCount} of {totalSteps}
                                </h1>
                                <p className="text-xs text-gray-500">
                                    {Math.round(animatedProgress)}% complete
                                </p>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${animatedProgress}%` }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-1 overflow-auto  h-full px-8 py-4">
                            <div className='w-full h-full flex justify-center items-center'>
                                <AnimatePresence custom={direction} mode='wait'>
                                    {
                                        formCount === 1 &&
                                        <motion.div

                                            key={formCount}
                                            custom={direction}
                                            variants={variants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{
                                                x: { type: "spring", stiffness: 300, damping: 30 },
                                                opacity: { duration: 0.3 },
                                            }}
                                            className="flex mb-5 justify-center items-center   flex-col gap-6 w-full">
                                            <div className="text-center mb-8 ">
                                                <h2 className="text-2xl font-semibold text-gray-800">
                                                    Great! Let's set up your listing 👋
                                                </h2>
                                                <p className="text-gray-500 text-sm mt-2">
                                                    Start by selecting your transaction type and the kind of property you’re listing.
                                                </p>
                                                <div className='w-fit mx-auto mt-4 flex flex-row gap-4 flex-wrap'>
                                                    <div className='w-[64px] h-[64px] relative'>
                                                        <Image src={one} alt="icon one" fill className="object-contain w-full h-full" />
                                                    </div>
                                                    <div className='w-[64px] h-[64px] relative'>
                                                        <Image src={two} alt="icon two" fill className="object-contain w-full h-full" />
                                                    </div>
                                                    <div className='w-[64px] h-[64px] relative'>
                                                        <Image src={three} alt="icon three" fill className="object-contain w-full h-full" />
                                                    </div>
                                                </div>
                                            </div>
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
                                        </motion.div>
                                    }
                                </AnimatePresence>
                                {
                                    entityType === "flat" ?
                                        <Flat entityType={entityType}
                                            transactionType={transactionType}
                                            setShowNext={setShowNext}
                                            showNext={showNext}
                                            coverVideo={coverVideo}
                                            galleryFiles={galleryFiles}
                                            role={role ?? ""}
                                            formCount={formCount}
                                            setFormCount={setFormCount}
                                            totalSteps={totalSteps}
                                            direction={direction}
                                            finalSubmit={finalSubmit}
                                        /> :
                                        entityType === "villa" ?
                                            <Villa entityType={entityType} transactionType={transactionType} setShowNext={setShowNext} showNext={showNext} coverVideo={coverVideo} galleryFiles={galleryFiles} role={role ?? ""} /> :
                                            entityType === "plot" ?
                                                <Plot entityType={entityType} transactionType={transactionType} setShowNext={setShowNext} showNext={showNext} coverVideo={coverVideo} galleryFiles={galleryFiles} role={role ?? ""} /> :
                                                <></>
                                }
                            </div>
                        </div>
                        <div className={`h-10  my-4   mx-10 flex flex-row justify-between gap-4 `}>
                            {formCount > 1 && (
                                <ButtonCommon
                                    bgColor="bg-white"
                                    textC="text-black"
                                    border="border-[1px]"
                                    onClick={() => {
                                        setDirection(-1);
                                        setFormCount((prev: any) => Math.max(prev - 1, 1))
                                    }}
                                    title="Back"
                                />
                            )}

                            <ButtonCommon
                                bgColor="bg-black"
                                textC="text-white"
                                border="border-[0px]"
                                title={formCount < totalSteps ? "Next" : "Continue"}
                                onClick={() => {
                                    if (formCount < totalSteps) {
                                        setDirection(1);
                                        setFormCount((prev: any) => prev + 1);
                                    } else {
                                        finalSubmit();
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {
                        formCount !== 6 &&
                        <motion.div
                            className={`hidden lg:flex relative flex-1 border-l bg-gray-50 px-8 py-10 flex-col justify-center items-center`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            {/* Inner text that changes based on formCount */}
                            <AnimatePresence mode="wait">
                                {formCount !== 1 && (
                                    <motion.div
                                        key={formCount}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="text-center absolute top-14"
                                    >
                                        {formCount === 2 ? (
                                            <>
                                                <h2 className="text-xl font-semibold">Start with the Basics</h2>
                                                <p className="text-gray-600 mt-2">
                                                    Tell us about your property — name, address, and location details.
                                                </p>
                                            </>
                                        ) : formCount === 3 ? (
                                            <>
                                                <h2 className="text-xl font-semibold">Add Property Details</h2>
                                                <p className="text-gray-600 mt-2">
                                                    Specify area, price, and approval details.
                                                </p>
                                            </>
                                        ) : formCount === 4 ? (
                                            <>
                                                <h2 className="text-xl font-semibold">Property Features</h2>
                                                <p className="text-gray-600 mt-2">
                                                    Add bedroom count, flooring type, and other specifications.
                                                </p>
                                            </>
                                        ) :

                                            formCount === 5 ? (
                                                <>
                                                    <h2 className="text-xl font-semibold">Add Photos & Videos</h2>
                                                    <p className="text-gray-600 mt-2">Upload visuals that make your property shine.</p>
                                                </>
                                            ) : null
                                        }
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Static section that fades in once */}
                            <div className="text-center max-w-md mt-10">
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
                                    Present your products with clarity, style, and purpose —
                                    your first step toward growing visibility and trust.
                                </p>
                                <div className="border-l-4 border-blue-500 bg-white shadow-sm rounded-lg p-4 text-left text-gray-700">
                                    <p className="text-sm italic">
                                        “Your listings reflect your brand — make them detailed, authentic, and customer-focused.”
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    }
                </div>
            </div>
        </div>
    )
}

export default ListingPage


const ListingProgress = ({ animatedProgress }: { animatedProgress: number }) => {
    return (
        <div className='shadow-md  mx-auto w-full py-4  px-4 bg-white/70 backdrop-blur-sm border-t border-gray-100'>
            <div className="w-[90%] mx-auto  ">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-gray-800 text-sm font-semibold tracking-tight">
                        Your listing setup is {Math.round(animatedProgress)}% complete
                    </h1>
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
        </div>
    );
}



