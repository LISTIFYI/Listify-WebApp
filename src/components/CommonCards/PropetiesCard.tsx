'use client'

import { Bath, Bed, EllipsisVertical, FlipVertical, ImageOff, LocateIcon, Map, MapPin, Sun } from 'lucide-react';
import React, { useState } from 'react'
import { RxDotsVertical } from 'react-icons/rx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { IoChevronDown } from 'react-icons/io5';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';

const PropetiesCard = ({ item, onDelete }: any) => {
    console.log(item);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className='cursor-pointer shadow-sm flex justify-between flex-col rounded-md   lg:max-w-[220px] w-[100%] h-[340px] mx-auto'>
            <div className='h-[80%] rounded-md overflow-hidden relative'>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex  absolute right-0 cursor-pointer flex-row gap-2 items-center justify-center pr-2 mt-1">
                            <div style={{ backgroundColor: "rgba(0,0,0,0.8)" }} className="border border-gray-50 overflow-hidden shadow-md flex justify-center items-center w-[25px] h-[25px] rounded-full">
                                <span className="text-[12px] font-bold">
                                    <EllipsisVertical color='#fff' size={16} />
                                </span>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                        <DropdownMenuItem
                            onClick={() => {
                                // route to profile page
                                // window.location.href = "/profile";
                            }}
                        >
                            Edit
                        </DropdownMenuItem>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Delete
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirm Deletion</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete the property "{item.propertyName || 'this property'}"? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={async () => {
                                            await onDelete();
                                            setIsDialogOpen(false);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </DropdownMenuContent>
                </DropdownMenu>
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
