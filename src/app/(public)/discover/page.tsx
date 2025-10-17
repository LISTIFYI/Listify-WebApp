"use client"

import React, { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { useRouter } from "next/navigation"
import CarouselCardLoader from "@/components/Loader/CarouselCardLoader"
import { Heart, MapPin } from "lucide-react"
import CarouselCardLoader2 from "@/components/Loader/CarouselCardLoader2"
import { initializeApi } from "@/lib/http"
import { tokenStore } from "@/lib/token"

const Discover = () => {
  const api = initializeApi(tokenStore).getApi();

  const router = useRouter()
  const [allNearbyProperties, setAllNearbyProperties] = useState<any[]>([]);
  const [allAgents, setAllAgents] = useState<any[]>([])
  const [allBuilders, setAllBuilders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);



  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLoading(false);
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        // Optional: Use this data to fetch nearby places, e.g., via an API call
        // fetchNearbyPlaces(latitude, longitude);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access denied. Please enable it in browser settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information unavailable.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out.");
            break;
          default:
            setError("An unknown error occurred.");
        }
      },
      {
        enableHighAccuracy: true, // Use GPS for better accuracy (slower)
        timeout: 10000,           // 10 seconds max
        maximumAge: 0,            // Always fetch fresh location (no cache)
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  console.log("token", tokenStore.get()?.accessToken);

  const getAllNearbyProperties = async () => {
    try {
      const res = await api.get(`/public/listings-v2/nearby?page=${1}&limit=${6}&lat=${Number("12.9754666")}&lng=${Number("77.6328723")}`);
      const newNP = res?.data?.listings || [];
      console.log('API Response:', res?.data);
      console.log('New Builder:', newNP);

    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
    }
  };

  const getAllAgents = async () => {
    try {
      const res = await api.get(`/public/agents?page=${1}&limit=${6}`)
      const newAgents = res?.data?.agents || []
      setAllAgents(newAgents || [])
    } catch (err) {
      console.error('Failed to fetch agents:', err)
    } finally {
    }
  }

  const getAllBuilders = async () => {
    try {
      const res = await api.get(`/public/builders?page=${1}&limit=${6}`)
      const newBuilders = res?.data?.builders || []
      setAllBuilders(newBuilders || [])
    } catch (err) {
      console.error('Failed to fetch builders:', err)
    } finally {
    }
  }

  useEffect(() => {
    setLoading(true)
    getAllNearbyProperties()
    getAllAgents()
    getAllBuilders()
    setLoading(false)

  }, [location])
  const data = [
    { name: "John" },
    { name: "Anj" },
    { name: "Geof" },
    { name: "Goes" },
    { name: "Maya" },
    { name: "Liam" },
  ]

  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);

  // Define Swiper breakpoints
  const breakpoints: Record<number, { slidesPerView: number; spaceBetween: number }> = {
    0: { slidesPerView: 2, spaceBetween: 10 },
    490: { slidesPerView: 3, spaceBetween: 20 },
    1020: { slidesPerView: 5, spaceBetween: 30 },
    1250: { slidesPerView: 6, spaceBetween: 20 },
  };
  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamically get slides per view based on current window width
  const getSlidesPerView = () => {
    if (windowWidth >= 1250) return breakpoints[1250].slidesPerView;
    if (windowWidth >= 1020) return breakpoints[1020].slidesPerView;
    if (windowWidth >= 490) return breakpoints[490].slidesPerView;
    return breakpoints[0].slidesPerView;
  };

  const slidesPerView = getSlidesPerView();
  const isPropertiesScrollable = data.length > slidesPerView;
  const isAgentsScrollable = allAgents.length > slidesPerView;
  const isBuildersScrollable = allBuilders.length > slidesPerView;


  const swiperSettings = {
    slidesPerView: 2,
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
      490: { slidesPerView: 3, spaceBetween: 20 },
      1020: { slidesPerView: 5, spaceBetween: 30 },
      1250: { slidesPerView: 6, spaceBetween: 20 },
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
    <div className="grid grid-cols-1  px-4 py-4 gap-4 overflow-y-auto flex-col ">
      {
        !!allNearbyProperties.length &&
        <div className="h-fit ">
          <div className="relative mx-auto ">
            <div className="flex flex-row justify-between items-center py-0.5">
              <h1 className="text-[20px] font-semibold text-black">Nearby Properties</h1>
              <div className="flex flex-row gap-4">
                <button
                  className="text-black hover:text-gray-800 duration-300 transition-all text-[14px] cursor-pointer"
                  onClick={() => router.push("/nearby-properties")}
                >
                  See All
                </button>
                {isPropertiesScrollable && <div className="flex justify-center items-center gap-1">
                  <button className="custom-swiper-button-prev bg-gray-300 hover:bg-gray-300  transition-all duration-300 cursor-pointer   text-black p-2 rounded-full">
                    <svg
                      className="w-4 h-4"
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
                  <button className="custom-swiper-button-next bg-gray-300 hover:bg-gray-300  transition-all duration-300 cursor-pointer   text-black p-2 rounded-full">
                    <svg
                      className="w-4 h-4"
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
                </div>}
              </div>
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
                    {allNearbyProperties?.map((item, index) => (
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
                              <h1 className='truncate text-ellipsis text-[15px] text-[#4B5563]'>Lik sjdns jdnsjdns jnsd sdnds sdjnsde</h1>
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
      }
      {
        !!allAgents?.length &&
        <div className=" h-fit">
          <div className="relative mx-auto ">
            <div className="flex flex-row justify-between items-center py-0.5">
              <h1 className="text-[20px] font-semibold text-black">Agents</h1>
              <div className="flex flex-row gap-4">
                <button
                  className="text-black hover:text-gray-800 duration-300 transition-all text-[14px] cursor-pointer"
                  onClick={() => router.push("/agents")}
                >
                  See All
                </button>
                {isAgentsScrollable && <div className="flex justify-center items-center gap-1">
                  <button className="custom-swiper-button-prev2 bg-gray-300 hover:bg-gray-300  transition-all duration-300 cursor-pointer   text-black p-2 rounded-full">
                    <svg
                      className="w-4 h-4"
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
                  <button className="custom-swiper-button-next2 bg-gray-300 hover:bg-gray-300  transition-all duration-300 cursor-pointer   text-black p-2 rounded-full">
                    <svg
                      className="w-4 h-4"
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
                </div>}
              </div>
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
                        <div className="px-2 my-4  flex justify-center">
                          <div
                            className="flex flex-col max-w-[320px] min-w-[100%] justify-center items-center shadow-md"
                            style={{
                              height: '180px',
                              backgroundColor: '#fff',
                              opacity: '82%',
                              borderRadius: '10%',
                            }}
                          >
                            <div className="flex flex-1 w-full justify-center items-center">
                              <div className="rounded-full mt-auto flex justify-center items-center h-[60px] w-[60px] overflow-hidden border">
                                {item?.logoUrl ? (
                                  <img src={item.logoUrl} className="w-full h-full object-cover" alt={item.agentName} />
                                ) : (
                                  <h1 className="text-black font-semibold text-xl">{item?.agentName[0]}</h1>
                                )}
                              </div>
                            </div>
                            <div className="text-center justify-center items-center flex-col w-full flex py-6">
                              <h1 className="text-[15px] font-semibold">{item.agentName}</h1>
                              <h2 className="text-[14px] text-[#4B5563]">{item?.companyName}</h2>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </>
              }
            </Swiper>
          </div>
        </div>
      }
      {
        !!allBuilders?.length &&
        <div className=" h-fit">
          <div className="relative mx-auto ">
            <div className="flex flex-row justify-between items-center py-0.5">
              <h1 className="text-[20px] font-semibold text-black">Builders</h1>
              <div className="flex flex-row gap-4">
                <button
                  className="text-black hover:text-gray-800 duration-300 transition-all text-[14px] cursor-pointer"
                  onClick={() => router.push("/builders")}
                >
                  See All
                </button>
                {isBuildersScrollable && <div className="flex justify-center items-center gap-1">
                  <button className="custom-swiper-button-prev3 bg-gray-300 hover:bg-gray-300  transition-all duration-300 cursor-pointer   text-black p-2 rounded-full">
                    <svg
                      className="w-4 h-4"
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
                  <button className="custom-swiper-button-next3 bg-gray-300 hover:bg-gray-300  transition-all duration-300 cursor-pointer   text-black p-2 rounded-full">
                    <svg
                      className="w-4 h-4"
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
                </div>}
              </div>
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
                        <div className="px-2 flex justify-center my-5">
                          <div
                            className="flex flex-col max-w-[320px] min-w-[100%] justify-center items-center shadow-md"
                            style={{
                              height: '180px',
                              backgroundColor: '#fff',
                              opacity: '82%',
                              borderRadius: '10%',
                            }}
                          >
                            <div className="flex   flex-1 w-full justify-center items-center">
                              <div className="rounded-full flex mt-auto justify-center items-center h-[60px] w-[60px] overflow-hidden border">
                                {item?.logoUrl ? (
                                  <img src={item.logoUrl} className="w-full h-full object-cover" alt={item.builderName} />
                                ) : (
                                  <h1 className="text-black font-semibold text-xl">{item?.builderName[0]}</h1>
                                )}
                              </div>
                            </div>
                            <div className=" text-center justify-center items-center flex-col w-full flex py-6">
                              <h1 className="text-[15px] font-semibold">{item.builderName}</h1>
                              <h2 className="text-[13px] text-[#4B5563]">{item?.companyName}</h2>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </>
              }
            </Swiper>
          </div>
        </div>
      }
    </div>
  )
}

export default Discover