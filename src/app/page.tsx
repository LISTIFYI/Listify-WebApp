"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CiHeart, CiBookmark, CiShare2 } from "react-icons/ci";
import { Bath, BedDouble, Signal, TriangleRight } from "lucide-react";
import axios from "axios";
import { log } from "console";
import { useRouter } from "next/navigation";

const Home = () => {
  const items = Array.from({ length: 15 }, (_, index) => index + 1);
  const [selected, setSelected] = useState("");
  const tags = [
    "City",
    "House",
    "Residential",
    "Apartment",
    "Apartment1",
    "Apartment2",
    "Apartment3",
    "Apartment4",
    "Apartment5",
    "Apartment6",
    "Apartment7",
  ];

  const get = async () => {
    const res = axios.get("https://listifyi-api-1012443530727.asia-south1.run.app/public/posts/feed ")
    console.log("res", res);
  }
  useEffect(() => {
    get()
  }, [])

  const router = useRouter();

  return (
    <div className="w-[100%] py-4">
      <div className="lg:px-6 px-4 flex w-full overflow-x-auto gap-2  no-scrollbar">
        {tags.map((tag, index) => (
          <div
            onClick={() => setSelected(tag)}
            key={index}
            className={`px-[12px] cursor-pointer py-[4px] text-[12px] border-[1px] border-[#EAEAEA] transition-all rounded-full ${selected === tag ? "bg-[#F8F8F8]" : "bg-[#fff]"
              }`}
          >
            {tag}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-5 gap-x-4 lg:p-6 p-4">
        {items.map((item) => (
          <div
            onClick={() => router.push("/explore")}
            key={item}
            className="p-2 border-[2px] border-[#EAEAEA] rounded-[20px]"
          >
            <div className="h-[280px] border rounded-[20px] relative overflow-hidden">
              <Image
                alt="img"
                src={
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ52CyCh_takVY_6gLcC3-p9m_JdVoXL67EhA&s"
                }
                layout="fill" // Fill the parent container
                objectFit="cover" // Ensure the image covers the area without distortion
                width={0} // Required with layout="fill"
                height={0} // Required with layout="fill"
              />
              <h2 className="absolute top-4 left-4 bg-white px-2 py-0.5 rounded-full text-black text-[8px]">
                Sponsored
              </h2>
              <div
                style={{
                  boxShadow: "inset 0 -10px 24px -2px rgba(0, 0, 0, 0.8)",
                }}
                className="absolute flex flex-row gap-[10px] bottom-0 bg-opacity-80 backdrop-blur-[2px] w-full left-0 items-center px-4 py-2 text-black text-[8px]"
              >
                <div className="flex flex-row gap-[4px] justify-center items-center">
                  <CiHeart color="#fff" size={12} />
                  <h1 className="text-white text-[8px]">4300</h1>
                </div>
                <div className="flex flex-row gap-[4px] justify-center items-center">
                  <CiBookmark color="#fff" size={12} />
                  <h1 className="text-white text-[8px]">2323</h1>
                </div>
                <div className="flex flex-row gap-[4px] justify-center items-center">
                  <CiShare2 color="#fff" size={12} />
                  <h1 className="text-white text-[8px]">565</h1>
                </div>
              </div>
            </div>
            <div className="p-2">
              <div className="flex flex-col gap-[2px]">
                <h1 className="text-black text-[16px] font-[600] truncate text-ellipsis">
                  2,470,000 $
                </h1>
                <h1 className="text-black text-[12px] font-[600] truncate text-ellipsis">
                  Modern Villa with Pool
                </h1>
                <h1 className="text-[#A5A5A5] text-[10px] truncate text-ellipsis">
                  1245 Ocean Drive, Miami Beach, FL 33139
                </h1>
              </div>
              <div className="flex flex-row gap-[4px] mt-[6px]">
                <div className="flex flex-row justify-start items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                  <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                    <BedDouble color="#000" size={10} />
                  </div>
                  <h1 className="text-black text-[10px] px-[6px]">4</h1>
                </div>
                <div className="flex flex-row justify-center items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                  <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                    <Bath color="#000" size={10} />
                  </div>
                  <h1 className="text-black text-[10px] px-[6px]">3</h1>
                </div>
                <div className="flex flex-row justify-center items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                  <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                    <TriangleRight color="#000" size={10} />
                  </div>
                  <h1 className="text-black text-[10px] px-[6px]">230 m²</h1>
                </div>
                <div className="flex flex-row justify-center items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                  <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                    <Signal color="#000" size={10} />
                  </div>
                  <h1 className="text-black text-[10px] px-[6px]">2</h1>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
