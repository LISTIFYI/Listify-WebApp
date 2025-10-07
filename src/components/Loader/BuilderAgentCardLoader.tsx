"use client";
import React from "react";

const BuilderAgentCardLoader = () => {
    return (
        <div className="shadow-sm  flex justify-between flex-col rounded-md  w-[100%] h-[240px] mx-auto  py-6 px-4  animate-pulse">
            {/* Image placeholder */}
            <div className=" w-[90px]  h-[90px] mx-auto rounded-full overflow-hidden relative bg-gray-200">
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Details placeholder */}
            <div className="flex-1 px-6 py-4  flex flex-col justify-center gap-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    );
};

export default BuilderAgentCardLoader;
