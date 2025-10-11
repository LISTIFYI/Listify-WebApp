"use client";
import React from "react";

const PropertiesHomeCard = () => {
    return (
        <div className="shadow-sm flex justify-between flex-col rounded-md  w-[100%] h-[260px] mx-auto animate-pulse">
            <div className="h-[80%] rounded-md overflow-hidden relative bg-gray-200">
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="flex-1 px-2 py-2  flex flex-col justify-center gap-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    );
};

export default PropertiesHomeCard;
