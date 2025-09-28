import { Bath, Bed, ImageOff, LocateIcon, Map, MapPin, Sun } from 'lucide-react';
import React from 'react'

const PropetiesCard = ({ item }: any) => {
    console.log(item);
    return (
        <div className=' shadow-sm flex justify-between flex-col rounded-md   lg:max-w-[220px] w-[100%] h-[340px] mx-auto'>
            <div className='h-[80%] rounded-md overflow-hidden relative'>

                {
                    !!item?.media?.images?.length ?
                        <img alt={item.propertyName} src={item?.media?.images[0]} className='w-full h-full object-cover' />
                        :
                        // <img alt={item.propertyName} src={"https://www.google.com/search?q=no+image+available&sca_esv=861dc178219c5a10&rlz=1C1CHBD_enIN1130IN1130&udm=2&biw=1536&bih=826&sxsrf=AE3TifMxZIoal2kHiaImoRtZJoArqduTsw%3A1759024201967&ei=SZTYaP_qOpmG4-EPtdjn8QI&oq=no+image+av&gs_lp=Egtnd3Mtd2l6LWltZyILbm8gaW1hZ2UgYXYqAggAMgoQABiABBhDGIoFMgoQABiABBhDGIoFMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgARI1AtQb1iKBXABeACQAQCYAfEBoAHRBKoBBTAuMi4xuAEByAEA-AEBmAIEoAL8BMICDRAAGIAEGLEDGEMYigXCAgYQABgHGB6YAwCIBgGSBwUxLjIuMaAHmxCyBwUwLjIuMbgH7QTCBwUyLTIuMsgHIQ&sclient=gws-wiz-img#vhid=adRgxP47ko1kpM&vssid=mosaic"} className='w-full h-full object-cover' />
                        <div className='bg-gray-200 w-full h-full flex flex-col justify-center items-center'>
                            <ImageOff className='text-gray-400' size={42} />
                            <h1 className='text-sm font-medium text-gray-400 '>No Image Available</h1>
                        </div>

                }
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/60 via-black/40 to-transparent flex items-end gap-3 px-4 text-white">
                    {
                        (item?.entityType === "villa" || item?.entityType === "flat") &&
                        (
                            <>
                                <span className="pb-2 text-sm flex flex-row gap-1"><Bed color='#fff' size={17} />1</span>
                                <span className="pb-2 text-sm flex flex-row gap-1"><Bath color='#fff' size={17} />1</span>
                                <span className="pb-2 text-sm flex flex-row gap-1"><Sun color='#fff' size={17} />1</span>
                            </>
                        )
                    }
                </div>

            </div>
            <div className='flex-1  px-2 py-2  flex flex-col justify-center'>
                {/* <div className="flex gap-1 items-center text-sm font-medium">
                    <MapPin size={16} className="text-gray-500 shrink-0 mt-[2px]" />
                    <p className="line-clamp-2">{item?.location?.address}</p>
                </div> */}


                {item?.entityType === "flat" && (
                    <h1 className="text-sm font-medium truncate">{item?.details?.bhkType} {item.entityType}</h1>
                )}
                {item?.entityType === "plot" && (
                    <h1 className="text-sm font-medium truncate">{item?.details?.plotArea} Sq.ft {item.entityType}</h1>
                )}

                {item?.entityType === "villa" && (
                    <h1 className="text-sm font-medium truncate">{item?.details?.plotArea} Sq.ft {item.entityType}</h1>
                )}
                <h1 className="text-sm font-medium truncate">₹{item?.details?.priceRange}</h1>
            </div>
        </div>
    )
}

export default PropetiesCard
