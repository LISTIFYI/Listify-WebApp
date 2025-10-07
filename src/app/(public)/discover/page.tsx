"use client"

import React, { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { useRouter } from "next/navigation"
import { http } from "@/lib/http"
import CarouselCardLoader from "@/components/Loader/CarouselCardLoader"
import { Heart, MapPin } from "lucide-react"
import CarouselCardLoader2 from "@/components/Loader/CarouselCardLoader2"

const Discover = () => {
  const router = useRouter()
  const [allNearbyProperties, setAllNearbyProperties] = useState<any[]>([]);
  const [allAgents, setAllAgents] = useState<any[]>([])
  const [allBuilders, setAllBuilders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)


  const getAllNearbyProperties = async () => {
    setLoading(true);
    try {

      const res = await http.get(`/public/listings-v2/nearby?page=${1}&limit=${6}&lat=${Number("12.9735897")}&lng=${Number("77.7504179")}`);
      const newNP = res?.data?.listings || [];
      console.log('API Response:', res?.data);
      console.log('New Builder:', newNP);

    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAllAgents = async () => {
    setLoading(true)
    try {
      const res = await http.get(`/public/agents?page=${1}&limit=${6}`)
      const newAgents = res?.data?.agents || []
      setAllAgents(newAgents || [])
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    } finally {
      setLoading(false)
    }
  }

  const getAllBuilders = async () => {
    setLoading(true)
    try {
      const res = await http.get(`/public/builders?page=${1}&limit=${6}`)
      const newBuilders = res?.data?.builders || []
      setAllBuilders(newBuilders || [])
    } catch (err) {
      console.error('Failed to fetch builders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllNearbyProperties()
    getAllAgents()
    getAllBuilders()
  }, [])
  const data = [
    { name: "John" },
    { name: "Anj" },
    { name: "Geof" },
    { name: "Goes" },
    { name: "Maya" },
    { name: "Liam" },
  ]

  const [windowWidth, setWindowWidth] = useState<number | null>(null)
  // Breakpoints for slidesPerView
  const breakpoints = {
    1250: 4,
    1020: 3,
    490: 2,
    0: 1,
  }

  // Handle window resize
  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const getSlidesPerView = () => {
    if (!windowWidth) return 1
    if (windowWidth >= 1250) return breakpoints[1250]
    if (windowWidth >= 1020) return breakpoints[1020]
    if (windowWidth >= 490) return breakpoints[490]
    return breakpoints[0]
  }

  const slidesPerView = getSlidesPerView()
  const isPropertiesScrollable = data.length > slidesPerView
  const isAgentsScrollable = allAgents.length > slidesPerView
  const isBuildersScrollable = allBuilders.length > slidesPerView


  const swiperSettings = {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: {
      nextEl: '.custom-swiper-button-next',
      prevEl: '.custom-swiper-button-prev',
    },
    speed: 400,
    effect: 'slide',
    pagination: { clickable: true },
    modules: [Navigation],
    loop: true,
    breakpoints: {
      490: { slidesPerView: 2, spaceBetween: 20 },
      1020: { slidesPerView: 3, spaceBetween: 30 },
      1250: { slidesPerView: 4, spaceBetween: 20 },
    },
  }

  const swiperSettings2 = {
    ...swiperSettings,
    navigation: {
      nextEl: '.custom-swiper-button-next2',
      prevEl: '.custom-swiper-button-prev2',
    },
  }

  const swiperSettings3 = {
    ...swiperSettings,
    navigation: {
      nextEl: '.custom-swiper-button-next3',
      prevEl: '.custom-swiper-button-prev3',
    },
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return null

  return (
    <div className="grid grid-cols-1 px-4 py-4 h-full overflow-y-auto flex-col ">
      <div className=" ">
        <div className="relative mx-auto ">
          <div className="flex flex-row justify-between items-center py-0.5">
            <h1 className="text-2xl font-semibold text-black">Nearby Properties</h1>
            <button className="text-black hover:text-gray-800 duration-300 transition-all text-[16px] cursor-pointer"
              onClick={() => router.push("/nearby-properties")}

            >See All</button>
          </div>
          <Swiper {...swiperSettings} className="mySwiper ">
            {
              loading ?
                <>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <SwiperSlide key={idx}>
                      <CarouselCardLoader2 />
                    </SwiperSlide>
                  ))}
                </>

                :
                <>
                  {data?.map((item, index) => (
                    <SwiperSlide key={index}>
                      <div
                        className="flex  flex-col my-4 flex-1 items-center shadow-sm bg-[#fff] rounded-[30px]  overflow-hidden"
                      >
                        <div className="h-[260px] overflow-hidden border w-full">
                          <img src="https://is1-3.housingcdn.com/4f2250e8/7b8debc34e219b419bc9dd59c3aea1ce/v0/fs/prestige_finsbury_park-gummanahalli-bengaluru-prestige_projects_pvt_ltd.png" className='w-full h-full' alt="" />
                        </div>

                        <div className='w-full flex flex-col gap-1 p-4'>
                          <div className='px-2 flex flex-row justify-between items-center w-full'>
                            <h1>$34343443</h1>
                            <h1><Heart size={20} /></h1>
                          </div>
                          <div className='px-2 flex flex-row gap-1 items-center w-full mb-2'>
                            {/* <h1>$34343443</h1> */}
                            <MapPin size={16} color='#4B5563' />
                            <h1 className='truncate text-ellipsis text-sm text-[#4B5563]'>Lik sjdns jdnsjdns jnsd sdnds sdjnsde</h1>
                          </div>
                          <button className='cursor-pointer h-10 rounded-md text-[14px] border border-[#454545] px-4 font-medium flex justify-center items-center w-full  transition-all duration-300'>
                            View Details
                          </button>
                        </div>
                        {/* <button>View Details</button> */}

                      </div>
                    </SwiperSlide>
                  ))}
                </>
            }
          </Swiper>
          {
            isPropertiesScrollable &&
            <div className="flex justify-center items-center gap-4 mb-2">
              <button className="custom-swiper-button-prev bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer  text-white p-2 rounded-full">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button className="custom-swiper-button-next bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer  text-white p-2 rounded-full">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          }
        </div>
      </div>
      {
        !!allAgents?.length &&

        <div className="">
          <div className="relative mx-auto ">
            <div className="flex flex-row justify-between items-center py-0.5">
              <h1 className="text-2xl font-semibold text-black">Agents</h1>
              <button
                className="text-black hover:text-gray-800 duration-300 transition-all text-[16px] cursor-pointer"
                onClick={() => router.push("/agents")}
              >
                See All
              </button>
            </div>
            <Swiper {...swiperSettings2} className="mySwiper">
              {
                loading ?
                  <>
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <SwiperSlide key={idx}>
                        <CarouselCardLoader />
                      </SwiperSlide>
                    ))}
                  </>
                  :
                  <>
                    {allAgents?.map((item, index) => (
                      <SwiperSlide key={index}>
                        <div className="px-2 my-4 flex justify-center">
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
                              <div className="rounded-full flex justify-center items-center h-[100px] w-[100px] overflow-hidden border">
                                {item?.logoUrl ? (
                                  <img src={item.logoUrl} className="w-full h-full object-cover" alt={item.agentName} />
                                ) : (
                                  <h1 className="text-black font-semibold text-3xl">{item?.agentName[0]}</h1>
                                )}
                              </div>
                            </div>
                            <div className="text-center justify-center items-center flex-col w-full flex py-6">
                              <h1 className="text-[18px] font-semibold">{item.agentName}</h1>
                              <h2 className="text-[15px] text-[#4B5563]">{item?.companyName}</h2>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </>
              }
            </Swiper>
            {
              isAgentsScrollable &&
              <div className="flex justify-center items-center gap-4 mb-2">
                <button className="custom-swiper-button-prev2 bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.3)]  transition-all duration-300 cursor-pointer  text-white p-2 rounded-full">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button className="custom-swiper-button-next2  bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.3)]  transition-all duration-300 cursor-pointer  text-white p-2 rounded-full">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            }
          </div>
        </div>
      }
      {
        !!allBuilders?.length &&
        <div className=" ">
          <div className="relative mx-auto ">
            <div className="flex flex-row justify-between items-center py-0.5">
              <h1 className="text-2xl font-semibold text-black">Builders</h1>
              <button
                className="text-black hover:text-gray-800 duration-300 transition-all text-[16px] cursor-pointer"
                onClick={() => router.push("/builders")}
              >
                See All
              </button>
            </div>
            <Swiper {...swiperSettings3} className="mySwiper">
              {
                loading ?
                  <>
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <SwiperSlide key={idx}>
                        <CarouselCardLoader />
                      </SwiperSlide>
                    ))}
                  </>
                  :
                  <>
                    {allBuilders?.map((item, index) => (
                      <SwiperSlide key={index}>
                        <div className="px-2 my-4 flex justify-center my-5">
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
                              <div className="rounded-full flex justify-center items-center h-[100px] w-[100px] overflow-hidden border">
                                {item?.logoUrl ? (
                                  <img src={item.logoUrl} className="w-full h-full object-cover" alt={item.builderName} />
                                ) : (
                                  <h1 className="text-black font-semibold text-3xl">{item?.builderName[0]}</h1>
                                )}
                              </div>
                            </div>
                            <div className="text-center justify-center items-center flex-col w-full flex py-6">
                              <h1 className="text-[18px] font-semibold">{item.builderName}</h1>
                              <h2 className="text-[15px] text-[#4B5563]">{item?.companyName}</h2>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </>
              }
            </Swiper>
            {
              isBuildersScrollable &&
              <div className="flex justify-center items-center gap-4 mb-2">
                <button className="custom-swiper-button-prev3 bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.3)]  transition-all duration-300 cursor-pointer   text-white p-2 rounded-full">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button className="custom-swiper-button-next3 bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.3)]  transition-all duration-300 cursor-pointer   text-white p-2 rounded-full">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  )
}

export default Discover