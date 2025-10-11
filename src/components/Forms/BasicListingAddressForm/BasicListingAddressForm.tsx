'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import InputBox from '@/components/CustomFields/InputBox';
import TextAreaBox from '@/components/CustomFields/TextAreaBox';
import { Plus, X } from 'lucide-react';

// Interface for form data
interface FormData {
    propertyName: string;
    description: string;
    address: string;
    pincode: string;
    city: string;
    state: string;
    landmarks: string[];
    searchInput: string;
    location: { lat: number; lng: number } | null;
}

// Interface for form errors
interface FormErrors {
    propertyName?: string;
    description?: string;
    address?: string;
    pincode?: string;
    city?: string;
    state?: string;
    landmark?: string;
    root?: string;
}

// Interface for Google Maps Place
interface Place {
    description: string;
    place_id: string;
}

interface BasicListingAddressFormProps {
    formData: FormData;
    errors: FormErrors;
    suggestions: Place[];
    useLocationSearch: boolean;
    setUseLocationSearch: (value: boolean) => void;
    isLoading: boolean;
    landmarkInput: string;
    setLandmarkInput: (value: string) => void;
    handleChange: (name: string) => (value: string) => void;
    handleSearchInput: (value: string) => void;
    addLandmark: () => void;
    removeLandmark: (index: number) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const BasicListingAddressForm: React.FC<BasicListingAddressFormProps> = ({
    formData,
    errors,
    suggestions,
    useLocationSearch,
    setUseLocationSearch,
    isLoading,
    landmarkInput,
    setLandmarkInput,
    handleChange,
    handleSearchInput,
    addLandmark,
    removeLandmark,
    handleSubmit,
}) => {
    const { role } = useAuth();

    return (
        <div className="">
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {'Property Name'}
                    </label>
                    <InputBox
                        name="propertyName"
                        value={formData.propertyName}
                        onChange={handleChange('propertyName')}
                        placeholder="Enter property name"
                        className="mt-1"
                    />
                    {errors.propertyName && <p className="text-red-500 text-sm mt-1">{errors.propertyName}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <TextAreaBox
                        name="description"
                        value={formData.description}
                        onChange={handleChange('description')}
                        placeholder="Describe the property"
                        className="mt-1"
                        rows={3}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <div className="flex items-center gap-4">
                            <Switch checked={useLocationSearch} onCheckedChange={setUseLocationSearch} />
                            <span className="mr-2">Search Location</span>
                        </div>
                    </div>
                    <TextAreaBox
                        name="address"
                        value={useLocationSearch ? formData.searchInput : formData.address}
                        onChange={useLocationSearch ? handleSearchInput : handleChange('address')}
                        placeholder={useLocationSearch ? 'Search for address' : 'Enter full address'}
                        className="mt-1"
                        rows={3}
                    />
                    {useLocationSearch && suggestions.length > 0 && (
                        <ul className="mt-1 border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.place_id}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                // Add onClick handler if needed for selecting suggestions
                                >
                                    {suggestion.description}
                                </li>
                            ))}
                        </ul>
                    )}
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <InputBox
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange('pincode')}
                        placeholder="Enter 6-digit pincode"
                        className="mt-1"
                    />
                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                </div>
                <div className='flex flex-row gap-4'>
                    <div className='flex flex-1 flex-col'>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <InputBox
                            name="city"
                            value={formData.city}
                            onChange={handleChange('city')}
                            placeholder="Enter city"
                            className="mt-1"
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div className='flex flex-1 flex-col'>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <InputBox
                            name="state"
                            value={formData.state}
                            onChange={handleChange('state')}
                            placeholder="Enter state"
                            className="mt-1"
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Landmarks (Optional)</label>
                    <div className="flex items-center gap-2 mt-1">
                        <InputBox
                            value={landmarkInput}
                            onChange={setLandmarkInput}
                            placeholder="Add a landmark"
                            className="flex-1"
                        />
                        <button className='w-10 h-10 rounded-md flex justify-center items-center border bg-black' onClick={addLandmark} disabled={isLoading}>
                            <Plus size={24} color='#fff' />
                        </button>
                    </div>
                    {errors.landmark && <p className="text-red-500 text-sm mt-1">{errors.landmark}</p>}
                    {formData.landmarks.length > 0 && (
                        <ul className="flex flex-wrap gap-x-2 gap-y-2.5">
                            {formData.landmarks.map((landmark, index) => (
                                <li key={index} className="flex items-center">
                                    <span>{landmark}</span>
                                    <button
                                        onClick={() => removeLandmark(index)}
                                        className="ml-1 mt-1"
                                    >
                                        <X color="red" size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Uncomment if you want to re-enable the submit button */}
                {/* <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isLoading || (role !== 'builder' && role !== 'agent')}
                >
                    {isLoading ? 'Loading...' : 'Submit'}
                </Button>
                {errors.root && <p className="text-red-500 text-sm mt-2">{errors.root}</p>} */}
            </div>
        </div>
    );
};

export default BasicListingAddressForm;