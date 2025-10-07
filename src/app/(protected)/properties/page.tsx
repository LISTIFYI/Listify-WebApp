"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming axios is used for the 'get' function
import { tokenStore } from '@/lib/token';
import { ChipList } from '@/components/CustomFields/ChipList';
import PropetiesCard from '@/components/CommonCards/PropetiesCard';
import PropertyCardLoader from '@/components/Loader/PropertyCardLoader';

// Define the API base URL and routes
const API_BASE_URL = 'https://listifyi-api-dev-1012443530727.asia-south1.run.app';
const API_ROUTES = {
    getAllListing: '/listings-v2/my-listings',
};

// Define tabs as a constant array with a specific type
const tabs = ['Active', 'Pending Approval', 'Draft', 'Sold', 'Upcoming', 'Inactive', 'Others'] as const;
type Tab = typeof tabs[number];

// Define the Listing interface (adjust based on actual API response)
interface Listing {
    id: string;
    title?: string;
    status?: string;
    [key: string]: any; // For flexibility if response has additional fields
}

// Define the API response type (adjust based on actual response structure)
interface ApiResponse {
    data: Listing[];
    total?: number;
    page?: number;
    limit?: number;
}

const Properties: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Active');
    const [listings, setListings] = useState<Listing[]>([]);
    console.log("listings", listings);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch listings
    const fetchListings = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        const tk = tokenStore.get();
        try {
            const apiStatus = activeTab === 'Pending Approval' ? 'pending_approval' : activeTab === 'Active' ? 'published' : activeTab.toLowerCase();
            const response = await axios.get<any>(
                `${API_BASE_URL}${API_ROUTES.getAllListing}?status=${apiStatus}`,
                {
                    headers: {
                        Authorization: `Bearer ${tk?.accessToken}`,
                    },
                }
            );
            setListings(response.data.data?.listings); // Adjust based on actual response structure
        } catch (err) {
            setError('Failed to fetch listings. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    // Function to delete a listing
    const deleteListing = async (listingId: string): Promise<boolean> => {
        const tk = tokenStore.get();
        try {
            await axios.delete(
                `${API_BASE_URL}/listings-v2/${listingId}`,
                {
                    headers: {
                        Authorization: `Bearer ${tk?.accessToken}`,
                    },
                }
            );
            return true;
        } catch (err: any) {
            setError('Failed to delete listing. Please try again.');
            console.error(err.response);
            return false;
        }
    };


    // Fetch listings when activeTab or pageNum changes
    useEffect(() => {
        fetchListings();
    }, [activeTab]);

    // Handle tab change
    const handleTabChange = (tab: Tab): void => {
        setActiveTab(tab);
    };


    return (
        <div className="h-full flex flex-col w-full p-4">
            <h1 className="text-2xl font-semibold mb-4">Your Properties</h1>

            <div className='w-full'>
                <div className="flex  flex-nowrap gap-x-2 items-center">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`inline-flex cursor-pointer  items-center border px-4 py-1.5 mr-1 rounded-full text-[12px] font-medium transition-colors ${activeTab === tab ? 'bg-black text-white hover:bg-black' : 'text-gray-800 hover:bg-gray-200'
                                }`}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className='h-full mt-4 overflow-y-auto '>
                <div className='w-[100%] md:grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2'>
                    {loading ? (
                        // 👇 Show 6 shimmer cards while loading
                        Array.from({ length: 6 }).map((_, idx) => (
                            <PropertyCardLoader key={idx} />
                        ))
                    ) : listings.length > 0 ? (
                        listings.map((item, index) => (
                            <PropetiesCard item={item} key={index}
                                onDelete={async () => {
                                    const success = await deleteListing(item.id);
                                    if (success) {
                                        await fetchListings();
                                    }
                                }}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 col-span-full">
                            No properties found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Properties;