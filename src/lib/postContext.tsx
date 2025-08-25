'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Interface for Location
interface Location {
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

// Interface for Pricing
interface Pricing {
  type: string;
  pricePerSqft: number;
  amount: number;
  negotiable: boolean;
  maintenanceCharges: number;
}

// Interface for Listing
interface Listing {
  id: string;
  location: Location;
  pricing: Pricing;
  status: string;
  title: string;
  propertyValues?: {
    bedroom?: number;
    bathroom?: number;
    hall?: number;
    totalFloor?: number;
    sqft_area?: number;
  };
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
}

// Interface for User
interface User {
  id: string;
  name: string;
  profile_photo: string;
}

// Interface for Pagination
interface Pagination {
  totalCount: number;
  limit: number;
  offset: number;
}

// Main Response Interface
interface ApiResponse {
  listing: Listing;
  post: Post;
  user: User;
  pagination?: Pagination;
}

interface PostContextType {
  selectedPost: ApiResponse | null;
  setSelectedPost: (post: ApiResponse | null) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPost, setSelectedPost] = useState<ApiResponse | null>(null);

  return (
    <PostContext.Provider value={{ selectedPost, setSelectedPost }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  return context;
};