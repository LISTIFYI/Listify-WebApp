"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CiHeart, CiBookmark, CiShare2 } from "react-icons/ci";
import { Bath, BedDouble, Eye, MessageCircle, Signal, TriangleRight } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Interface for Location
interface Location {
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  [key: string]: any; // Allow additional fields if present
}

// Interface for Pricing
interface Pricing {
  type: string;
  pricePerSqft: number;
  amount: number;
  negotiable: boolean;
  maintenanceCharges: number;
  [key: string]: any; // Allow additional fields if present
}

// Interface for Listing
interface Listing {
  id: string;
  location: Location;
  pricing: Pricing;
  status: string;
  title: string;
  [key: string]: any; // Allow additional fields if present
}

// Interface for Post
interface Post {
  comment_count: number;
  comments_disabled: boolean;
  created_at: string;
  description: string;
  duration_seconds: number;
  id: string;
  like_count: number;
  location: string;
  mentions: string[];
  save_count: number;
  share_count: number;
  status: string;
  tags: string[];
  thumbnail_url: string;
  title: string;
  updated_at: string;
  video_url: string;
  view_count: number;
  visibility: string;
  [key: string]: any; // Allow additional fields if present
}

// Interface for User
interface User {
  id: string;
  name: string;
  profile_photo: string;
  [key: string]: any; // Allow additional fields if present
}

// Main Response Interface
interface ApiResponse {
  listing: Listing;
  post: Post;
  user: User;
  [key: string]: any; // Allow additional top-level fields if present
}

const Home = () => {
  const [posts, setPosts] = useState<any>([]);
  console.log("post", posts);

  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const getPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://listifyi-api-1012443530727.asia-south1.run.app/public/posts/feed"
      );

      if (res.data && res.data.posts) {
        setPosts(res.data.posts); // Assuming the array is under res.data.posts
      } else {
        console.log("No posts found in response");
        setPosts([]); // Fallback to empty array if no posts
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]); // Fallback on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div className="w-[100%] py-4">
      <div className="lg:px-6 px-4 flex w-full overflow-x-auto gap-2 no-scrollbar">
        {tags.map((tag, index) => (
          <div
            onClick={() => setSelected(tag)}
            key={index}
            className={`px-[12px] cursor-pointer py-[4px] text-[12px] border-[1px] border-[#EAEAEA] transition-all rounded-full ${selected === tag ? "bg-[#F8F8F8]" : "bg-[#fff]"}`}
          >
            {tag}
          </div>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading properties...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-5 gap-x-4 lg:p-6 p-4">
          {posts.map((post: any) => (
            <div
              // onClick={() => router.push(`/explore?postId=${post.id || post._id}`)} // Adjust based on your ID field
              key={post.post.id} // Use a unique ID from post
              className="shadow-sm border-[#EAEAEA] rounded-[20px]"
            >
              <div className="h-[280px] border rounded-[20px] relative overflow-hidden">

                <Image
                  className="object-cover w-full h-full"
                  alt={post?.post.title || "Property image"}
                  src={post?.post.thumbnail_url || "https://via.placeholder.com/300x280?text=Image+Not+Available"}
                  width={0}
                  height={0}

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
                    <CiHeart color="#fff" size={16} />
                    <h1 className="text-white text-[8px]">{post?.post?.likes || 0}</h1>
                  </div>
                  <div className="flex flex-row gap-[4px] justify-center items-center">
                    <MessageCircle color="#fff" size={12} />
                    <h1 className="text-white text-[8px]">{post?.post?.comment_count || 0}</h1>
                  </div>
                  <div className="flex flex-row gap-[4px] justify-center items-center">
                    <CiShare2 color="#fff" size={14} />
                    <h1 className="text-white text-[8px]">{post?.post?.share_count || 0}</h1>
                  </div>
                  <div className="flex flex-row gap-[4px] justify-center items-center">
                    <CiBookmark color="#fff" size={12} />
                    <h1 className="text-white text-[8px]">{post?.post.save_count || 0}</h1>
                  </div>
                  <div className="flex flex-row gap-[4px] justify-center items-center">
                    <Eye color="#fff" size={12} />
                    <h1 className="text-white text-[8px]">{post?.post.view_count || 0}</h1>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="flex flex-col gap-[2px]">

                  {
                    post?.listing?.pricing?.amount &&
                    <h1 className="text-black text-[16px] font-[600] truncate text-ellipsis">
                      ₹{post?.listing?.pricing?.amount || "N/A"}
                    </h1>
                  }
                  <h1 className="text-black text-[12px] font-[600] truncate text-ellipsis">
                    {post?.post.title || "Untitled Property"}
                  </h1>
                  <h1 className="text-[#A5A5A5] text-[10px] truncate text-ellipsis">
                    {post?.listing?.location?.address || "Address not available"}
                  </h1>
                </div>
                {/* <div className="flex flex-row gap-[4px] mt-[6px]">
                  <div className="flex flex-row justify-start items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                    <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                      <BedDouble color="#000" size={10} />
                    </div>
                    <h1 className="text-black text-[10px] px-[6px]">{post.bedrooms || 0}</h1>
                  </div>
                  <div className="flex flex-row justify-center items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                    <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                      <Bath color="#000" size={10} />
                    </div>
                    <h1 className="text-black text-[10px] px-[6px]">{post.bathrooms || 0}</h1>
                  </div>
                  <div className="flex flex-row justify-center items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                    <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                      <TriangleRight color="#000" size={10} />
                    </div>
                    <h1 className="text-black text-[10px] px-[6px]">{post.area || "N/A"}</h1>
                  </div>
                  <div className="flex flex-row justify-center items-center bg-[#F8F8F8] border-[#EAEAEA] border-[1px] rounded-full">
                    <div className="flex flex-col justify-center items-center w-[20px] bg-white border-[#EAEAEA] border-[1px] h-[20px] rounded-full">
                      <Signal color="#000" size={10} />
                    </div>
                    <h1 className="text-black text-[10px] px-[6px]">{post.floors || 0}</h1>
                  </div>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;