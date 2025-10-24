import React from 'react';
import { format } from 'date-fns';
import { ChevronDown, MapPin, DollarSign, Image as ImageIcon, Video, FileText, Plus, Play, Image, Bed, Bath, Sun } from 'lucide-react';



const ListingPreview = () => {
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
    const [isAmenitiesOpen, setIsAmenitiesOpen] = React.useState(false);

    return (
        <div className="mx-auto w-full">
            <div className='flex flex-row h-[60vh] gap-4'>
                <div className='border rounded-md overflow-hidden border-black flex flex-1 bg-red-500'>ok</div>
                <div className='flex flex-col max-w-[300px] gap-4 w-full'>
                    <div className="bg-red-300 flex flex-1 relative rounded-md overflow-hidden">
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-black/40 z-10" />

                        {/* Play button (centered) */}
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="w-[40px] h-[40px] bg-black/70 text-white flex items-center justify-center rounded-full">
                                <Play className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-300 flex flex-1 relative rounded-md overflow-hidden">
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-black/40 z-10" />

                        {/* Play button (centered) */}
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="px-4 h-[40px] flex-row gap-2 bg-black/70 text-white flex items-center justify-center rounded-full">
                                <Image className="w-6 h-6" /> 14
                            </div>
                        </div>
                    </div>
                </div>

            </div>



            <div className='mt-4 flex flex-col gap-2 '>
                <h1 className='text-2xl text-black font-semibold'>$ 1231213</h1>
                <h1 className='text-[15px] font-normal text-gray-500'>Name</h1>
                <h1 className='text-[15px] font-normal text-gray-500'>Location</h1>
                <div className='flex flex-row gap-5 text-[15px] font-normal text-gray-500'>
                    <span className='flex flex-row gap-2 items-center text-[14px]'><Bed size={14} /> Bed</span>
                    <span className='flex flex-row gap-2 items-center text-[14px]'><Bath size={14} /> Bathroom</span>
                    <span className='flex flex-row gap-2 items-center text-[14px]'><Sun size={14} /> Balcony</span>
                    <span className='flex flex-row gap-2 items-center text-[14px]'><Sun size={14} /> Sqft</span>
                </div>

            </div>
        </div>
    );
};

export default ListingPreview;