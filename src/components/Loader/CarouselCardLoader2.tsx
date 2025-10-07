import React from 'react'

const CarouselCardLoader2 = () => {
    return (
        <div className="flex flex-col flex-1 items-center shadow-sm bg-[#fff] rounded-[30px] overflow-hidden">
            <div className="h-[260px] w-full bg-gray-200 animate-pulse" />
            <div className="w-full flex flex-col gap-1 p-4">
                <div className="px-2 flex flex-row justify-between items-center w-full">
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
                </div>

                <div className="px-2 flex flex-row gap-1 items-center w-full mb-2">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
            </div>
        </div>
    )
}

export default CarouselCardLoader2
