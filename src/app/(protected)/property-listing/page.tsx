"use client"

import DropdownMenuCustom from '@/components/CustomFields/DropdownMenuCustom'
import React, { useEffect, useRef, useState } from 'react'
import { DropdownConfig } from '@/types/listingTypes'
import Flat from '@/components/ListingComponents/Flat/Flat'
import Villa from '@/components/ListingComponents/Villa/Villa'
import Plot from '@/components/ListingComponents/Plot/Plot'
import MediaUpload from '@/components/MediaUpload/MediaUpload'
import { useAuth } from '@/context/AuthContext'

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
                { value: "villa", label: "Villa" },
                { value: "plot", label: "Plot" },
            ],
        },
    ]
    const { role } = useAuth()
    const [transactionType, setTransactionType] = useState('')
    const [entityType, setEntityType] = useState('')
    const [showNext, setShowNext] = useState(false)
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

    return (
        <div className='h-full flex flex-col '
        >
            <div className='px-6 py-2 border-b  h-[80px] flex flex-col justify-center'>
                <h1 className="text-xl font-bold">Create New Listing</h1>
                <p className="text-gray-600 text-sm mt-1">
                    Fill in the details below to start your property listing.
                </p>
            </div>
            <div ref={containerRef} className='flex-1 transition-all scroll-smooth overflow-y-scroll no-scrollbar'>
                <div className='flex flex-row '>
                    <div className=' flex flex-col w-[50%] p-4'>
                        {
                            !showNext &&
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

                        <div className='border-red-200'>
                            {
                                entityType === "flat" ?
                                    <Flat entityType={entityType} transactionType={transactionType} setShowNext={setShowNext} showNext={showNext}
                                        coverVideo={coverVideo}
                                        galleryFiles={galleryFiles} role={role} /> :
                                    entityType === "villa" ?
                                        <Villa entityType={entityType} transactionType={transactionType} setShowNext={setShowNext} showNext={showNext} coverVideo={coverVideo} galleryFiles={galleryFiles} role={role} /> :
                                        entityType === "plot" ?
                                            <Plot entityType={entityType} transactionType={transactionType} setShowNext={setShowNext} showNext={showNext} coverVideo={coverVideo} galleryFiles={galleryFiles} role={role} /> :
                                            <></>
                            }
                        </div>

                    </div>
                    <div className='flex no-scrollbar flex-1 p-4 h-full overflow-scroll'>
                        {
                            showNext &&
                            <MediaUpload
                                coverVideo={coverVideo}
                                galleryFiles={galleryFiles}
                                setCoverVideo={setCoverVideo}
                                setGalleryFiles={setGalleryFiles}
                                removeGalleryItem={removeGalleryItem}
                            />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListingPage
