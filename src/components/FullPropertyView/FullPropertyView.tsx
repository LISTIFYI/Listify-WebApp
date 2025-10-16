import { Bath, Bed, DoorClosed, Sun } from 'lucide-react'
import React from 'react'
import ButtonCommon from '../CustomFields/Button'

const FullPropertyView = ({ propertyData }: any) => {

    return (
        <div className='px-4 h-full'>
            <div className='w-[100%] border border-green-400 mx-auto   bg-white flex-row hidden md:flex lg:flex'>
                <div className='flex-1 py-2 flex flex-col'>
                    <h1 className='text-black font-medium text-[16px]'>Price Ran</h1>
                    <h1 style={{
                        color: "rgb(96, 96, 96)"
                    }} className='text-[13px] font-medium text-[rgb(127, 127, 127)]'>2 BHK Flat sale for in Property Name, address</h1>
                </div>
                <div className='w-fit h-fit my-auto'>
                    <ButtonCommon title='Edit' bgColor='bg-black' textC='text-white' />
                </div>
            </div>
            <div className=' border-[4px]  border-red-300 w-[100%]'>
                <div className='md:h-[200px] lg:h-[400px] flex flex-row gap-2'>
                    <div className='overflow-hidden rounded-md h-full flex flex-1'>
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg559UCluttMW2pAbLffwnPgFl74d0c19kqQ&s" alt="" className='w-full h-full object-cover' />
                    </div>
                    <div className='hidden md:flex lg:flex overflow-hidden  flex-col rounded-md gap-2 w-[30%]'>
                        <div className='flex h-[50%] overflow-hidden rounded-md'>
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3x5gwCp2rw0SQ-8DGTgv0yLJIs6MRoeKwnQ&s" alt="" className='w-full h-full object-cover' />
                        </div>
                        <div className="flex flex-1 relative h-[50%] rounded-md overflow-hidden">
                            {/* Image */}
                            <img
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuoqPCghCjHZW4jj8CssU7TYbxUTe6_DieCQ&s"
                                alt=""
                                className="w-full h-full object-cover"
                            />

                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-black/50"></div>

                            {/* Centered Text */}
                            <p className="absolute inset-0 flex items-center justify-center text-white font-medium text-lg">
                                +12 <br /> More
                            </p>
                        </div>

                    </div>
                </div>
                <div className='py-2 md:py-3 lg:py-4  flex flex-row '>
                    <div className='hidden md:flex lg:flex py-1 md:py-2 lg:py-3  flex-col leading-tight flex-1 border-l px-2 justify-center items-center'>
                        <p className='text-black font-[500]  text-[8px] md:text-[12px] lg:text-[14px]'>2, 2.5, 3 BHK Apartments</p>
                        <p className='text-black text-[7px] md:text-[11px] lg:text-[13px] font-[400]'>Configuration</p>
                    </div>
                    <div className='py-1 md:py-2 lg:py-3 flex flex-col leading-tight flex-1 border-l px-2 justify-center items-center'>
                        <p className='text-black font-[500]  text-[8px] md:text-[12px] lg:text-[14px]'>Dec, 2026</p>
                        <p className='text-black text-[7px] md:text-[11px] lg:text-[13px] font-[400]'>Possession Starts</p>
                    </div>
                    <div className='py-1 md:py-2 lg:py-3 flex flex-col leading-tight flex-1 border-l px-2 justify-center items-center'>
                        <p className='text-black font-[500]  text-[8px] md:text-[12px] lg:text-[14px]'>Dec, 2026</p>
                        <p className='text-black text-[7px] md:text-[11px] lg:text-[13px] font-[400]'>Possession Date</p>
                    </div>
                    <div className='py-1 md:py-2 lg:py-3 flex flex-col leading-tight flex-1 border-l px-2 justify-center items-center'>
                        <p className='text-black font-[500]  text-[8px] md:text-[12px] lg:text-[14px]'>674 - 864 sq.ft</p>
                        <p className='text-black text-[7px] md:text-[11px] lg:text-[13px] font-[400]'>Sizes</p>

                    </div>
                </div>

                <div className='py-2 md:py-3 lg:py-4  h-[1000px] flex flex-row '>
                    <div className='py-1 md:py-2 lg:py-3 flex  flex-row leading-tight  px-2 justify-center items-center'>
                        <p className='text-gray-400 font-normal  text-[10px] md:text-[12px] lg:text-[13px] flex flex-row items-center gap-0.5'><Bed size={16} /> 2 Bed</p>
                    </div>
                    <div className='py-1 md:py-2 lg:py-3 flex  flex-row leading-tight  px-2 justify-center items-center'>
                        <p className='text-gray-400 font-normal  text-[10px] md:text-[12px] lg:text-[13px] flex flex-row items-center gap-0.5'><Bath size={16} /> 2 Bathroom</p>
                    </div>
                    <div className='py-1 md:py-2 lg:py-3 flex flex-row leading-tight  px-2 justify-center items-center'>
                        <p className='text-gray-400 font-normal  text-[10px] md:text-[12px] lg:text-[13px] flex flex-row items-center gap-0.5'><Sun size={16} /> 4 Balcony</p>
                    </div>
                    <div className='py-1 md:py-2 lg:py-3 flex flex-row leading-tight  px-2 justify-center items-center'>
                        <p className='text-gray-400 font-normal  text-[10px] md:text-[12px] lg:text-[13px] flex flex-row items-center gap-0.5'><DoorClosed size={16} /> Furnished</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FullPropertyView
