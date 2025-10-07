import React from 'react'

const CarouselCardLoader = () => {
    return (
        <div className="px-2 flex justify-center my-5">
            <div
                className="flex flex-col max-w-[320px] min-w-[100%] justify-center items-center shadow-md"
                style={{
                    height: '240px',
                    backgroundColor: '#fff',
                    opacity: '82%',
                    borderRadius: '10%',
                }}
            >
                <div className="flex flex-1 w-full justify-center items-center">
                    <div className="rounded-full h-[100px] w-[100px] overflow-hidden border">
                        <div className="w-full h-full bg-gray-200 animate-pulse" />
                    </div>
                </div>
                <div className="text-center justify-center items-center flex-col w-full flex py-6">
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        </div>
    )
}

export default CarouselCardLoader
