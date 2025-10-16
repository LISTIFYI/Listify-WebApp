'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BasicListingAddressForm from '@/components/Forms/BasicListingAddressForm/BasicListingAddressForm';
import InputBox from '@/components/CustomFields/InputBox';
import { Amenity, DropdownConfig, OptionTag } from '@/types/listingTypes';
import DropdownMenuCustom from '@/components/CustomFields/DropdownMenuCustom';
import DatePickerCustom from '@/components/CustomFields/DatePickerCustom';
import { Switch } from '@/components/ui/switch';
import MultiSelectDropdown from '@/components/CustomFields/MultiDropdown';
import { ChipList } from '@/components/CustomFields/ChipList';
import ContactFormCommon from '@/components/Forms/ContacFormCommon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ContactForm from '@/components/Forms/ContacFormCommon';
import { Plus, X } from 'lucide-react';
import { tokenStore } from '@/lib/token';
import { getAgentById, UploadPhoto } from '@/utils/api';
import { IoDocument } from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';
import ButtonCommon from '@/components/CustomFields/Button';
import { AnimatePresence, motion } from 'framer-motion';
import MediaUpload from '@/components/MediaUpload/MediaUpload';

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


interface FlatProps {
    transactionType: string
    entityType: string,
    showNext: boolean,
    setShowNext: (value: boolean) => void
    coverVideo: any
    galleryFiles: any
    role: string
    formCount: number,
    setFormCount: any
    totalSteps: any
    direction: any
    setFinalSubmitData: any
    propertyData: any
}

const Plot = ({
    transactionType,
    entityType,
    showNext,
    setShowNext,
    role,
    formCount,
    setFormCount,
    totalSteps,
    direction,
    setFinalSubmitData,
    propertyData

}: FlatProps) => {


    const [coverVideo, setCoverVideo] = useState<any>(null)

    const [galleryFiles, setGalleryFiles] = useState<string[]>([])
    const removeGalleryItem = (index: number) => {
        setGalleryFiles((prev: any) => prev.filter((_: any, i: any) => i !== index))
    }


    const [useLocationSearch, setUseLocationSearch] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<Place[]>([]);
    const [landmarkInput, setLandmarkInput] = useState<string>('');
    const [formData, setFormData] = useState<FormData>({
        propertyName: '',
        description: '',
        address: '',
        pincode: '',
        city: '',
        state: '',
        landmarks: [],
        searchInput: '',
        location: null,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const apiKey = 'AIzaSyAgfV-EJzC32o4aAvCq_zRhg4gs-bVh-FM';

    // Custom validation function
    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (formData.propertyName.length < 2) {
            newErrors.propertyName = 'Property name must be at least 2 characters';
        }
        if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }
        if (formData.address.length < 5) {
            newErrors.address = 'Address must be at least 5 characters';
        }
        if (!/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = 'Pincode must be 6 digits';
        }
        if (!formData.city) {
            newErrors.city = 'City is required';
        }
        if (!formData.state) {
            newErrors.state = 'State is required';
        }
        return newErrors;
    };

    // Handle input changes
    const handleChange = (name: string) => (value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    // Handle address search input
    const handleSearchInput = (value: string) => {
        setFormData((prev) => ({ ...prev, searchInput: value }));
        setErrors((prev) => ({ ...prev, address: undefined }));
    };

    // Add landmark
    const addLandmark = () => {
        if (landmarkInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                landmarks: [...prev.landmarks, landmarkInput.trim()],
            }));
            setLandmarkInput('');
            setErrors((prev) => ({ ...prev, landmark: undefined }));
        } else {
            setErrors((prev) => ({ ...prev, landmark: 'Landmark cannot be empty' }));
        }
    };

    // Remove landmark
    const removeLandmark = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            landmarks: prev.landmarks.filter((_, i) => i !== index),
        }));
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        console.log('Form submitted:', formData);
    };

    // Fetch suggestions for address search
    const fetchSuggestions = async (text: string) => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                    text
                )}&key=${apiKey}&components=country:in`
            );
            setSuggestions(response.data.predictions || []);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch location from address
    const fetchLocationFromAddress = async (address: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                    address
                )}&key=${apiKey}`
            );
            const data = await response.json();
            if (data.status === 'OK' && data.results.length > 0) {
                const result = data.results[0];
                const loc = result.geometry.location;
                setFormData((prev) => ({
                    ...prev,
                    location: loc,
                    state:
                        result.address_components.find((c: any) =>
                            c.types.includes('administrative_area_level_1')
                        )?.long_name || '',
                    city:
                        result.address_components.find((c: any) =>
                            c.types.includes('locality')
                        )?.long_name || '',
                    pincode:
                        result.address_components.find((c: any) =>
                            c.types.includes('postal_code')
                        )?.long_name || '',
                }));
            }
        } catch (err) {
            console.error('Error fetching location from address:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced effect for fetching suggestions
    useEffect(() => {
        if (formData.searchInput.length > 2) {
            const delayDebounce = setTimeout(() => {
                fetchSuggestions(formData.searchInput);
            }, 500);
            return () => clearTimeout(delayDebounce);
        } else {
            setSuggestions([]);
        }
    }, [formData.searchInput]);

    // Effect for fetching location from address
    useEffect(() => {
        if (formData.address) {
            fetchLocationFromAddress(formData.address);
        }
    }, [formData.address]);


    // listing states
    const dropdownConfigs: DropdownConfig[] = [
        {
            key: 'unitTypes',
            label: 'Unit Type',
            placeholder: 'Select unit type',
            options: [
                { value: "1 BHK", label: "1 BHK" },
                { value: "2 BHK", label: "2 BHK" },
                { value: "3 BHK", label: "3 BHK" },
                { value: "4 BHK", label: "4 BHK" },
                { value: "4+ BHK", label: "4+ BHK" },
            ],
        },
        {
            key: 'propertyAge',
            label: 'Property Age',
            placeholder: 'Property age',
            options: [
                { value: "Less than 1 year", label: "Less than 1 years" },
                { value: "Less than 3 years", label: "Less than 3 years" },
                { value: "Less than 5 years", label: "Less than 5 years" },
                { value: "5-10 Years", label: "5-10 years", },
                { value: "10+ Years", label: "10+ years", },
            ],
        },
        {
            key: 'constructionStatus',
            label: 'Construction Status',
            placeholder: 'Construction Status',
            options: [
                {
                    value: "New/Under Construction",
                    label: "New/Under Construction",
                },
                { value: "Ready to Move", label: "Ready to Move", },
            ],
        },
        {
            key: 'facingDirection',
            label: 'Facing Direction',
            placeholder: 'Facing direction',
            options: [
                { value: "North", label: "North" },
                { value: "East", label: "East" },
                { value: "West", label: "West", },
                { value: "South", label: "South" },
                { value: "North-East", label: "North-East" },
                { value: "North-West", label: "North-West" },
                { value: "South-East", label: "South-East" },
                { value: "South-West", label: "South-West" },
            ],
        },
        {
            key: 'totalFloors',
            label: 'Total Floors',
            placeholder: 'Total Floors',
            options: [
                { value: "1", label: "1 Floor" },
                { value: "2", label: "2 Floors" },
                { value: "3", label: "3 Floors" },
                { value: "4", label: "4 Floors" },
                { value: "5", label: "5 Floors" },
                { value: "10", label: "10 Floors" },
                { value: "15", label: "15 Floors" },
                { value: "20", label: "20 Floors" },
                { value: "20+", label: "20+ Floors" },
            ],
        },
        {
            key: 'purpose',
            label: 'Purpose',
            placeholder: 'Purpose',
            options: [
                { value: "Living", label: "Living" },
                { value: "Investment", label: "Investment" },
            ],
        },
        {
            key: 'floorNo',
            label: 'Floor no',
            placeholder: 'Floor no',
            options: [
                { value: "1", label: "1 Floor" },
                { value: "2", label: "2 Floors" },
                { value: "3", label: "3 Floors" },
                { value: "4", label: "4 Floors" },
                { value: "5", label: "5 Floors" },
                { value: "10", label: "10 Floors" },
                { value: "15", label: "15 Floors", },
                { value: "20", label: "20 Floors", },
                { value: "20+", label: "20+ Floors", },
            ],
        },
        {
            key: 'TotalBedroom',
            label: 'Total Bedroom',
            placeholder: 'Total bedroom',
            options: [
                { value: "1", label: "1 Bedroom" },
                { value: "2", label: "2 Bedrooms" },
                { value: "3", label: "3 Bedrooms" },
                { value: "4", label: "4 Bedrooms" },
                { value: "5", label: "5 Bedrooms" },
                { value: "6", label: "6 Bedrooms" },
                { value: "7", label: "7 Bedrooms" },
                { value: "8", label: "8 Bedrooms" },
                { value: "9", label: "9 Bedrooms" },
                { value: "10", label: "10 Bedrooms" },
            ],
        },
        {
            key: 'TotalBathroom',
            label: 'Total Bathroom',
            placeholder: 'Total bathroom',
            options: [
                { value: "1", label: "1 Bathroom" },
                { value: "2", label: "2 Bathrooms" },
                { value: "3", label: "3 Bathrooms" },
                { value: "4", label: "4 Bathrooms" },
                { value: "5", label: "5 Bathrooms", },
                { value: "6", label: "6 Bathrooms", },
                { value: "7", label: "7 Bathrooms", },
                { value: "8", label: "8 Bathrooms", },
                { value: "9", label: "9 Bathrooms", },
                { value: "10", label: "10 Bathrooms", },
            ],
        },
        {
            key: 'TotalBalcony',
            label: 'Total Balcony',
            placeholder: 'Total balcony',
            options: [
                { value: "0", label: "No Balcony" },
                { value: "1", label: "1 Balcony" },
                { value: "2", label: "2 Balconies" },
                { value: "3", label: "3 Balconies" },
                { value: "4", label: "4 Balconies" },
                { value: "5", label: "5 Balconies" }
            ],
        },
        {
            key: 'FurnishingStatus',
            label: 'Furnishing Status',
            placeholder: 'Furnishing status',
            options: [
                { value: "Furnished", label: "Furnished" },
                { value: "Semi-Furnished", label: "Semi-Furnished" },
                { value: "Unfurnished", label: "Unfurnished" },
            ],
        },
        {
            key: 'SampleFlat?',
            label: 'Sample Flat?',
            placeholder: 'Sample flat',
            options: [
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
            ],
        },
        {
            key: 'Ownership?',
            label: 'Ownership',
            placeholder: 'Ownership',
            options: [
                { value: 'Freehold', label: 'Freehold', },
                { value: 'Leasehold', label: 'Leasehold' },
                { value: 'Power Of Attorney"', label: 'Power Of Attorney' },
                { value: 'Co-operative Society', label: 'Co-operative Society' },
            ],
        },
        {
            key: 'CoveredParking',
            label: 'Covered Parking',
            placeholder: ' Covered parking',
            options: [
                { value: "1", label: "1", },
                { value: "2", label: "2", },
                { value: "3", label: "3", },
                { value: "4", label: "4", },
            ],
        },
        {
            key: 'extraRoomTypes',
            label: 'Extra Room Types',
            placeholder: 'Extra room types',
            options: [
                { value: 'Study', label: 'Study' },
                { value: 'Servant Room', label: 'Servant Room' },
                { value: 'Pooja Room', label: 'Pooja Room' },
                { value: 'Home Theatre', label: 'Home Theatre' },
            ],
            isMulti: true,
        },

        {
            key: 'availOffers',
            label: 'Available Offers',
            placeholder: 'Available offers',
            options: [
                { value: 'Under 5% Discount', label: 'Under 5% Discount' },
                { value: 'Flat 10% Cashback', label: 'Flat 10% Cashback' },
                { value: 'No Floor Rise Charges', label: 'No Floor Rise Charges' },
            ],
            isMulti: true,
        },
        {
            key: 'banks',
            label: 'Banks',
            placeholder: 'Banks',
            options: [
                { value: 'SBI', label: 'SBI' },
                { value: 'HDFC', label: 'HDFC' },
                { value: 'ICICI', label: 'ICICI' },
                { value: 'Axis', label: 'Axis' },
                { value: 'LIC Housing', label: 'LIC Housing' },
            ],
            isMulti: true,
        },
        {
            key: 'AvailabilityStatus',
            label: 'Availablity Status',
            placeholder: 'Availablity status',
            options: [
                { value: 'Immediate', label: 'Immediate' },
                { value: 'Future', label: 'Future', },
            ],
        },
        {
            key: 'WaterAvailablity',
            label: 'Water Availablity',
            placeholder: 'Water availablity',
            options: [
                { value: '24 Hours Available', label: '24 Hours Available' },
                { value: 'Limited Hours', label: 'Limited Hours', },
            ],
        },
        {
            key: 'Status of Electricity',
            label: 'Status of Electricity',
            placeholder: 'Status of electricity',
            options: [
                { value: 'No/Rare Powercut', label: 'No/Rare Powercut' },
                { value: 'Frequent Powercuts', label: 'Frequent Powercuts' },
                { value: 'Not Available', label: 'Not Available' },
            ],
        },

        {
            key: 'UnitRange',
            label: 'Unit Range',
            placeholder: 'Unit range',
            options: [
                { value: "Sqft", label: "Sqft" },
                { value: "Acre", label: "Acre" },
                { value: "Sq-ft", label: "Sq-ft", },
                { value: "Sq-yrd", label: "Sq-yrd", },
                { value: "Sq-m", label: "Sq-m", },
                { value: "Bigha", label: "Bigha", },
                { value: "Hectare", label: "Hectare", },
                { value: "Marla", label: "Marla", },
                { value: "Kanal", label: "Kanal", },
                { value: "Biswa1", label: "Biswa1", },
                { value: "Biswa2", label: "Biswa2", },
                { value: "Ground", label: "Ground", },
                { value: "Aankadam", label: "Aankadam", },
                { value: "Rood", label: "Rood", },
                { value: "Chatak", label: "Chatak", },
                { value: "Kottah", label: "Kottah", },
                { value: "Cent", label: "Cent", },
                { value: "Perch", label: "Perch", },
                { value: "Guntha", label: "Guntha", },
                { value: "Are", label: "Are", },
                { value: "Kuncham", label: "Kuncham", },
                { value: "Katha", label: "Katha", },
                { value: "Gaj", label: "Gaj", },
                { value: "Killa", label: "Killa", },
            ],
        },
        {
            key: 'Flooring',
            label: 'Flooring',
            placeholder: 'Flooring',
            options: [
                { value: 'vitrified', label: 'Vitrified' },
                { value: 'marble', label: 'Marble' },
            ],
            isMulti: true,
        },
        {
            key: 'Plot Type',
            label: 'Plot Type',
            placeholder: 'Plot type',
            options: [
                { value: "Residential Plot", label: "Residential Plot" },
                { value: "Farm Land", label: "Farm Land" },
                { value: "Gated Community Plot", label: "Gated Community Plot" },
                { value: "Corner Plot", label: "Corner Plot" },
                { value: "Commercial Land", label: "Commercial Land" },
            ],
            isMulti: true,
        },
        {
            key: 'Boundary Wall',
            label: 'Boundary Wall',
            placeholder: 'Boundary wall',
            options: [
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
            ],
            isMulti: true,
        },

        {
            key: 'Gated Community',
            label: 'Gated Community',
            placeholder: 'Gated community',
            options: [
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
            ],
            isMulti: true,
        },
        {
            key: 'No of Open Sides',
            label: 'No of Open Sides',
            placeholder: 'No of open sides',
            options: [
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
            ],
            isMulti: true,
        },
        {
            key: 'Land Use Zone',
            label: 'Land Use Zone',
            placeholder: 'Land use zone',
            options: [
                { value: "Residential", label: "Residential" },
                { value: "Commercial", label: "Commercial" },
                { value: "Industrial", label: "Industrial" },
                { value: "Agricultural", label: "Agricultural" },
            ],
            isMulti: true,
        },
        {
            key: 'Corner Plot',
            label: 'Corner Plot',
            placeholder: 'Corner plot',
            options: [
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
            ],
            isMulti: true,
        },
        {
            key: 'Approval Authority',
            label: 'Approval Authority',
            placeholder: 'Approval authority',
            options: [
                { value: "BDA", label: "BDA" },
                { value: "BBMP", label: "BBMP" },
                { value: "DTCP", label: "DTCP" },
                { value: "Panchayat", label: "Panchayat" },
                { value: "No Approval", label: "No Approval" },
            ],
            isMulti: true,
        },
    ]


    const amenities: Amenity[] = [
        { icon: "waterIcon", label: "Water Connection" },
        { icon: "lightIcon", label: "Electricity" },
        { icon: "roadAccessIcon", label: "Road Access" },
        { icon: "drainageIcon", label: "Drainage" },
        { icon: "securityIcon", label: "Security" },
        { icon: "streetLightIcon", label: "Streetlight" },
    ];

    const option: OptionTag[] = [
        {
            label: "DTCP Approved",
            icon: "leaf",
        },
        {
            label: "Corner Plot",
            icon: "paw",
        },
        {
            label: "Gated Community",
            icon: "solar-power",
        },
    ];


    // part1

    const [reraNumber, setReraNumber] = useState("")
    const [plotArea, setPlotArea] = useState("")
    const [unitSize, setUnitSize] = useState("")
    const [plotWidth, setPlotWidth] = useState("")
    const [plotLength, setPlotLength] = useState("")
    const [amount, setAmount] = useState('')
    const [bookingAmount, setBookingAmount] = useState('')
    const [priceRange, setPriceRange] = useState('')
    const [pricePerSqFT, setPricePerSqT] = useState('')
    const [facingDirection, setFacingDirection] = useState('')
    const [brochure, setBrochure] = useState<string>("");
    // part1

    // part2
    const [plotType, setPlotType] = useState('')
    const [boundaryWall, setBoundaryWall] = useState('')
    const [gatedCommunity, setGatedCommunity] = useState('')
    const [purpose, setPurpose] = useState('')
    const [noOfOpenSides, setNoOfOpenSides] = useState('')
    const [landUseZone, setLandUseZone] = useState('')
    const [widthFacingRoad, setWidthFacingRoad] = useState('')
    const [roadWidth, setRoadWidth] = useState('')
    const [availablityStatus, setAvailablityStatus] = useState('')
    const [waterAvailablity, setWaterAvailablity] = useState('')
    const [electricityStatus, setElectricityStatus] = useState('')
    const [ownership, setOwnership] = useState('')
    const [cornerPlot, setCornerPlot] = useState('')
    const [approvalAuthority, setApprovalAuthority] = useState<string[]>([])
    const [availableOffers, setAvailableOffers] = useState<string[]>([])
    const [banks, setBanks] = useState<string[]>([])
    const [amenitiesdata, setAmenitiesdata] = useState<Record<string, boolean>>({})
    const [highlights, setHighlights] = useState<Record<string, boolean>>({})
    // part2

    const handleSelectionChangeChip = (selectedChips: Record<string, boolean>) => {
        setAmenitiesdata(selectedChips) // ✅ types match
    }
    const handleSelectionChangeChip2 = (selectedChips: Record<string, boolean>) => {
        setHighlights(selectedChips) // ✅ types match
    }

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const removePdf = () => {
        setBrochure("")
    }
    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const tk = tokenStore.get();
            const extension = file.type.split("/").pop()
            const name = file.name.split(".")[0];
            const payload = {
                entity: "DOCUMENTS",
                fileExtension: extension,
                type: "DOCUMENT",
                name: name,
            };

            try {
                const res = await UploadPhoto(payload, tk?.accessToken ?? "", file, "document")
                if (res.fileUrl) {
                    setBrochure(res?.fileUrl)
                }
            } catch (error) {
                console.log("Something went wrong", error);

            }
        }
    }

    interface ContactI {
        name: string
        mobile: string
        email: string
    }
    const [openn, setOpenn] = useState(false);
    const [savedContacts, setSavedContacts] = useState<ContactI[]>([]);
    const [editIndexx, setEditIndexx] = useState<number | undefined>(undefined);
    const [editContacts, setEditContacts] = useState<ContactI[] | undefined>(undefined);

    const handleFormSubmit = (contacts: ContactI[], editIndex?: number) => {
        if (editIndexx !== undefined) {
            // Update existing contact
            const updatedContacts = [...savedContacts];
            updatedContacts[editIndexx] = contacts[0]; // Assume single contact for edit
            setSavedContacts(updatedContacts);
        } else {
            // Add new contacts
            setSavedContacts([...savedContacts, ...contacts]);
        }
        setOpenn(false);
        setEditIndexx(undefined);
        setEditContacts(undefined);
    };

    const handleEditContact = (index: number) => {
        setEditIndexx(index);
        setEditContacts([savedContacts[index]]);
        setOpenn(true);
    };

    const handleRemoveSavedContact = (index: number) => {
        setSavedContacts(savedContacts.filter((_, i) => i !== index));
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpenn(isOpen);
        if (!isOpen) {
            setEditIndexx(undefined);
            setEditContacts(undefined);
        }
    };

    const { user } = useAuth()
    const [roleAB, setRoleAB] = useState<any>(null)
    console.log("roleAB", roleAB);


    useEffect(() => {
        const fetchAgentOrBuilder = async () => {
            console.log("called");

            try {
                const token = tokenStore.get();
                const id = user?.builderProfile
                    ? user?.builderProfile?.id
                    : user?.agentProfile?.id;

                if (!id) {
                    console.warn("No profile id found");
                    return;
                }

                const type = user?.builderProfile ? "builder" : "agent";

                const res = await getAgentById(id, type);
                setRoleAB(res);
            } catch (error) {
                console.error("Error fetching agent/builder:", error);
            }
        };

        fetchAgentOrBuilder();
    }, [user]);
    const handleSubmits = () => {
        const formDataa = {
            entityType: entityType,
            listingType: user?.builderProfile ? "builder" : "agent",
            title: formData.propertyName,
            description: formData.description,
            details: {
                approvals: approvalAuthority,
                reraNumber: reraNumber,
                facing: facingDirection,
                priceRange: priceRange,
                unitSizeRange: unitSize,
                purpose: purpose,
                loanApprovedBanks: banks,
                propertyType: entityType,
                reraRegistered: reraNumber ? true : false,
                ownership: ownership,
                plotArea: Number(plotArea),
                booking_amount: Number(bookingAmount),
                waterAvailability: waterAvailablity,
                electricityStatus: electricityStatus,
                availability: availablityStatus,
                plotLength: plotLength,
                plotWidth: plotWidth,
                plotType: plotType,
                // plotPlanningPricing: plotPlans,
                boundaryWall: boundaryWall === "Yes" ? true : boundaryWall === "No" ? false : "",
                gatedCommunity: gatedCommunity === "Yes" ? true : gatedCommunity === "No" ? false : "",
                numberOfOpenSides: noOfOpenSides,
                landUseZone: landUseZone,
                widthOfFacingRoad: widthFacingRoad,
                roadWidth: roadWidth,
                cornerPlot: cornerPlot === "Yes" ? true : false,
                amount: amount,
                bookingAmount: Number(bookingAmount),
            },

            location: {
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                coordinates: [
                    formData.location?.lat,
                    formData.location?.lng,
                ],
                landmarks: formData.landmarks
            },
            pricing: {
                ...(transactionType && { type: transactionType }),
                pricePerSqft: Number(pricePerSqFT) || 0,
                amount: Number(amount),
            },
            amenities: setAmenitiesdata,
            tags: highlights,
            availableOffers: availableOffers,
            status: "pending_approval",
            featured: false,
            contact: {
                name: roleAB?.builderName ? roleAB?.builderName : roleAB?.agentName,
                phone: roleAB?.contactPhone,
                email: roleAB?.contactEmail,
                whatsapp: roleAB?.contactPhone,
                isAgent: roleAB?.agentProfile ? true : false,
                agentId: roleAB?._id
            },
            //   additionalContacts: submittedContacts,
            media: {
                images: galleryFiles.filter((url: any) =>
                    url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                ),
                videos: galleryFiles.filter((url: any) =>
                    url.match(/\.(mp4|mov|avi|mkv|webm)$/i)
                ),
                floorPlan: brochure
            }
        };
        const payload = {
            title: formData?.propertyName,
            description: formData.description,
            video_url: coverVideo?.url,
            thumbnail_url: "",
            duration_seconds: coverVideo?.duration,
            // tags: "#jignes",
            // mentions: ["user123", "user456"],
            visibility: "PUBLIC",
            location: formData.address,
            comments_disabled: false,
            //   ...(draft === 'DRAFT' ? { status: 'DRAFT' } : { status: 'PUBLISHED' }),
            status: 'PUBLISHED',
        };
        console.log("formdata", formData);
        setFinalSubmitData({
            formDataa: formDataa,
            payload: payload,
        });
    };

    useEffect(() => {
        handleSubmits()
    }, [formCount])
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            position: "absolute",
        }),
        center: {
            x: 0,
            opacity: 1,
            position: "relative",
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -100 : 100,
            opacity: 0,
            position: "absolute",
        }),
    };

    const fadeVariants = {
        enter: {
            opacity: 0,
            position: "absolute",
        },
        center: {
            opacity: 1,
            position: "relative",
        },
        exit: {
            opacity: 0,
            position: "absolute",
        },
    };

    return (
        <div className="flex flex-1 overflow-hidden h-full  ">
            <div className="w-full h-full relative  flex justify-center items-center ">
                <AnimatePresence custom={direction} mode='wait'>
                    <motion.div
                        key={formCount}
                        custom={direction}
                        variants={formCount === 6 ? fadeVariants : variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={
                            (formCount === 6 || formCount === 6)
                                ? { opacity: { duration: 0.4, ease: "easeInOut" } } // smooth fade
                                : {
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.3 },
                                }
                        }
                        className="h-full w-full ps-0 pr-4 md:px-4 lg:px-4 py-4 overflow-y-auto"

                    >
                        {
                            formCount === 6 &&
                            <div className='h-full flex flex-col gap-1'>
                                {/* <FullPropertyView propertyData={propertyData} /> */}
                                <h1 className='text-lg font-semibold'>Your Listing is Ready</h1>
                                <h1 className='text-[16px] font-medium'>Continue to submit you listing</h1>
                            </div>
                        }
                        {
                            Number(formCount) === Number(2) &&
                            <div className=''>
                                <FormDetailsTwo
                                    addLandmark={addLandmark}
                                    errors={errors}
                                    formData={formData}
                                    handleChange={handleChange}
                                    handleSearchInput={handleSearchInput}
                                    handleSubmit={handleSubmit}
                                    isLoading={isLoading}
                                    landmarkInput={landmarkInput}
                                    removeLandmark={removeLandmark}
                                    setLandmarkInput={setLandmarkInput}
                                    setUseLocationSearch={setUseLocationSearch}
                                    suggestions={suggestions}
                                    useLocationSearch={useLocationSearch}
                                />
                            </div>
                        }
                        {
                            formCount === 4 &&
                            <PlotForm2 dropdownConfigs={dropdownConfigs}
                                amenitiesdata={amenitiesdata}
                                approvalAuthority={approvalAuthority}
                                availableOffers={availableOffers}
                                availablityStatus={availablityStatus}
                                banks={banks}
                                boundaryWall={boundaryWall}
                                cornerPlot={cornerPlot}
                                electricityStatus={electricityStatus}
                                gatedCommunity={gatedCommunity}
                                highlights={highlights}
                                landUseZone={landUseZone}
                                noOfOpenSides={noOfOpenSides}
                                ownership={ownership}
                                plotType={plotType}
                                purpose={purpose}
                                roadWidth={roadWidth}
                                setAmenitiesdata={setAmenitiesdata}
                                setApprovalAuthority={setApprovalAuthority}
                                setAvailableOffers={setAvailableOffers}
                                setAvailablityStatus={setAvailablityStatus}
                                setBanks={setBanks}
                                setBoundaryWall={setBoundaryWall}
                                setCornerPlot={setCornerPlot}
                                setElectricityStatus={setElectricityStatus}
                                setGatedCommunity={setGatedCommunity}
                                setHighlights={setHighlights}
                                setLandUseZone={setLandUseZone}
                                setNoOfOpenSides={setNoOfOpenSides}
                                setOwnership={setOwnership}
                                setPlotType={setPlotType}
                                setPurpose={setPurpose}
                                setRoadWidth={setRoadWidth}
                                setWaterAvailablity={setWaterAvailablity}
                                setWidthFacingRoad={setWidthFacingRoad}
                                waterAvailablity={waterAvailablity}
                                widthFacingRoad={widthFacingRoad}
                                role={role}
                                transactionType={transactionType}
                                amenities={amenities}
                                option={option}

                            />

                        }
                        {
                            formCount === 3 &&
                            <PlotForm1
                                addLandmark={addLandmark}
                                amount={amount}
                                bookingAmount={bookingAmount}
                                brochure={brochure}
                                dropdownConfigs={dropdownConfigs}
                                errors={errors}
                                facingDirection={facingDirection}
                                fileInputRef={fileInputRef}
                                formData={formData}
                                handleChange={handleChange}
                                handleClick={handleClick}
                                handleFileChange={handleFileChange}
                                handleSearchInput={handleSearchInput}
                                handleSubmit={handleSubmit}
                                isLoading={isLoading}
                                landmarkInput={landmarkInput}
                                plotArea={plotArea}
                                plotLength={plotLength}
                                plotWidth={plotWidth}
                                pricePerSqFT={pricePerSqFT}
                                priceRange={priceRange}
                                removeLandmark={removeLandmark}
                                removePdf={removePdf}
                                reraNumber={reraNumber}
                                setAmount={setAmount}
                                setBookingAmount={setBookingAmount}
                                setFacingDirection={setFacingDirection}
                                setLandmarkInput={setLandmarkInput}
                                setPlotArea={setPlotArea}
                                setPlotLength={setPlotLength}
                                setPlotWidth={setPlotWidth}
                                setPricePerSqT={setPricePerSqT}
                                setPriceRange={setPriceRange}
                                setReraNumber={setReraNumber}
                                setUnitSize={setUnitSize}
                                setUseLocationSearch={setUseLocationSearch}
                                suggestions={suggestions}
                                unitSize={unitSize}
                                useLocationSearch={useLocationSearch}
                                role={role}
                                transactionType={transactionType}

                            />
                        }
                        {
                            formCount === 5 &&
                            <MediaUpload
                                coverVideo={coverVideo}
                                galleryFiles={galleryFiles}
                                removeGalleryItem={removeGalleryItem}
                                setCoverVideo={setCoverVideo}
                                setGalleryFiles={setGalleryFiles}
                            />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Plot;

interface FormDetailsTwoProps {
    formData: any,
    errors: any,
    suggestions: any,
    useLocationSearch: any,
    setUseLocationSearch: any,
    isLoading: any,
    landmarkInput: any,
    setLandmarkInput: any,
    handleChange: any,
    handleSearchInput: any,
    addLandmark: any,
    removeLandmark: any
    handleSubmit: any
}
const FormDetailsTwo = ({
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
    handleSubmit
}: FormDetailsTwoProps) => {
    return (
        <div>
            <BasicListingAddressForm
                formData={formData}
                errors={errors}
                suggestions={suggestions}
                useLocationSearch={useLocationSearch}
                setUseLocationSearch={setUseLocationSearch}
                isLoading={isLoading}
                landmarkInput={landmarkInput}
                setLandmarkInput={setLandmarkInput}
                handleChange={handleChange}
                handleSearchInput={handleSearchInput}
                addLandmark={addLandmark}
                removeLandmark={removeLandmark}
                handleSubmit={handleSubmit}
            />
        </div>
    )
}


interface FormPlot1Props {
    reraNumber: string,
    setReraNumber: (value: string) => void,
    dropdownConfigs: any,
    amount: string,
    setAmount: (value: string) => void,
    priceRange: string,
    setPriceRange: (value: string) => void,
    pricePerSqFT: string,
    setPricePerSqT: (value: string) => void,
    facingDirection: string,
    setFacingDirection: (value: string) => void,
    handleClick: any,
    fileInputRef: any,
    handleFileChange: any
    brochure: any
    removePdf: any,
    formData: any,
    errors: any,
    suggestions: any,
    useLocationSearch: any,
    setUseLocationSearch: any,
    isLoading: any,
    landmarkInput: any,
    setLandmarkInput: any,
    handleChange: any,
    handleSearchInput: any,
    addLandmark: any,
    removeLandmark: any,
    handleSubmit: any,
    plotArea: any,
    setPlotArea: any,
    unitSize: any,
    setUnitSize: any,
    plotWidth: any,
    setPlotWidth: any,
    plotLength: any,
    setPlotLength: any,
    bookingAmount: any,
    setBookingAmount: any,
    role: string,
    transactionType: any
}

const PlotForm1 = ({
    addLandmark,
    amount,
    brochure,
    dropdownConfigs,
    errors,
    facingDirection,
    fileInputRef,
    formData,
    handleChange,
    handleClick,
    handleFileChange,
    handleSearchInput,
    handleSubmit,
    isLoading,
    landmarkInput,
    pricePerSqFT,
    removeLandmark,
    removePdf,
    reraNumber,
    setAmount,
    setFacingDirection,
    setLandmarkInput,
    setPricePerSqT,
    setPriceRange,
    priceRange,
    setReraNumber,
    setUseLocationSearch,
    suggestions,
    useLocationSearch,
    bookingAmount,
    plotArea,
    plotLength,
    plotWidth,
    setBookingAmount,
    setPlotArea,
    setPlotLength,
    setPlotWidth,
    setUnitSize,
    unitSize, role, transactionType

}: FormPlot1Props) => {
    return (
        <>
            <div className='space-y-3' >
                <div className='flex flex-row gap-4'>
                    <div className='flex flex-col flex-1'>
                        <label className="block text-sm font-medium text-gray-700">
                            Rera Registration No
                        </label>
                        <InputBox
                            name="Rera Registraion"
                            value={reraNumber}
                            onChange={setReraNumber}
                            placeholder="Rera registration no"
                            className="mt-1"
                        />
                    </div>

                </div>
                <div className='flex flex-row gap-4'>
                    <div className='flex flex-col flex-1'>
                        <label className="block text-sm font-medium text-gray-700">
                            Plot Area
                        </label>
                        <InputBox
                            name="Plot Area"
                            value={plotArea}
                            onChange={setPlotArea}
                            placeholder="Plot area"
                            className="mt-1"
                        />
                    </div>
                    <div className='flex flex-col flex-1'>
                        <DropdownMenuCustom
                            key={dropdownConfigs[20].key}
                            options={dropdownConfigs[20].options}
                            value={unitSize}
                            onChange={setUnitSize}
                            placeholder={dropdownConfigs[20].placeholder}
                            label={dropdownConfigs[20].label}
                        />
                    </div>

                </div>

                <div className='flex flex-row gap-4'>
                    <div className='flex flex-col flex-1'>
                        <label className="block text-sm font-medium text-gray-700">
                            Plot Width
                        </label>
                        <InputBox
                            name=" Plot Width"
                            value={plotWidth}
                            onChange={setPlotWidth}
                            placeholder=" Plot width"
                            className="mt-1"
                        />
                    </div>
                    <div className='flex flex-col flex-1'>
                        <label className="block text-sm font-medium text-gray-700">
                            Plot Length
                        </label>
                        <InputBox
                            name="Plot Length"
                            value={plotLength}
                            onChange={setPlotLength}
                            placeholder="Plot length"
                            className="mt-1"
                        />
                    </div>
                </div>

                <div className='flex flex-row gap-4'>
                    <div className='flex flex-col flex-1'>
                        <label className="block text-sm font-medium text-gray-700">
                            Amount
                        </label>
                        <InputBox
                            name="Amount"
                            value={amount}
                            onChange={setAmount}
                            placeholder="Amount"
                            className="mt-1"
                        />
                    </div>
                    <div className='flex flex-col flex-1'>
                        <label className="block text-sm font-medium text-gray-700">
                            Booking Amount
                        </label>
                        <InputBox
                            name="Booking Amount"
                            value={bookingAmount}
                            onChange={setBookingAmount}
                            placeholder="Booking amount"
                            className="mt-1"
                        />
                    </div>
                </div>
                <div className='flex flex-row gap-4'>
                    <div className='flex flex-col flex-1'>
                        <label className="block text-sm font-medium text-gray-700">
                            Price per Sq ft (₹)
                        </label>
                        <InputBox
                            name="Amount"
                            value={pricePerSqFT}
                            onChange={setPricePerSqT}
                            placeholder="Price per Sq ft (₹)"
                            className="mt-1"
                        />
                    </div>
                    <div className='flex flex-col flex-1'>
                        <DropdownMenuCustom
                            key={dropdownConfigs[3].key}
                            options={dropdownConfigs[3].options}
                            value={facingDirection}
                            onChange={(value) => setFacingDirection(value as string)}
                            placeholder={dropdownConfigs[3].placeholder}
                            label={dropdownConfigs[3].label}
                        />
                    </div>
                </div>
                <div className='flex flex-row gap-4'>
                    <div className="flex flex-col flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Project Brochure (PDF)
                        </label>
                        <div
                            className="mt-1 h-[36px] flex flex-col relative justify-center items-center bg-gray-100 transition-all duration-300 border rounded-sm text-sm cursor-pointer hover:bg-gray-200"
                            onClick={() => {
                                if (!brochure && brochure === "") {
                                    handleClick()
                                }
                            }}
                        >
                            {
                                brochure ?
                                    <div className='flex flex-row gap-1 items-center justify-center'>
                                        <IoDocument size={16} />
                                        <h1 className="font-medium text-sm">{brochure.split("/").pop()}</h1>
                                    </div>
                                    :
                                    <h1 className="font-medium text-sm">Project Brochure (PDF)</h1>
                            }
                            {brochure &&
                                <div
                                    onClick={removePdf}
                                    className='border w-fit absolute top-[-10px] rounded-full shadow-md bg-gray-100 right-[-8px]'><X color='red' size={16} /></div>
                            }
                        </div>

                        {/* Hidden input */}
                        <input
                            type="file"
                            accept="application/pdf"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>
        </>
    )
}



interface FormPlot2Props {
    dropdownConfigs: any
    plotType: any,
    setPlotType: any,
    boundaryWall: any,
    setBoundaryWall: any,
    gatedCommunity: any,
    setGatedCommunity: any,
    purpose: any,
    setPurpose: any,
    noOfOpenSides: any,
    setNoOfOpenSides: any,
    landUseZone: any,
    setLandUseZone: any,
    widthFacingRoad: any,
    setWidthFacingRoad: any
    roadWidth: any,
    setRoadWidth: any,
    availablityStatus: any,
    setAvailablityStatus: any,
    waterAvailablity: any,
    setWaterAvailablity: any,
    electricityStatus: any,
    setElectricityStatus: any,
    ownership: any,
    setOwnership: any,
    cornerPlot: any,
    setCornerPlot: any,
    approvalAuthority: any,
    setApprovalAuthority: any,
    availableOffers: any,
    setAvailableOffers: any,
    banks: any,
    setBanks: any,
    amenitiesdata: any,
    setAmenitiesdata: any,
    highlights: any,
    setHighlights: any,
    role: string,
    transactionType: any
    amenities: any,
    option: any

}
const PlotForm2 = ({
    dropdownConfigs,
    plotType,
    setPlotType,
    boundaryWall,
    setBoundaryWall,
    gatedCommunity,
    setGatedCommunity,
    purpose,
    setPurpose,
    noOfOpenSides,
    setNoOfOpenSides,
    landUseZone,
    setLandUseZone,
    widthFacingRoad,
    setWidthFacingRoad,
    roadWidth,
    setRoadWidth,
    availablityStatus,
    setAvailablityStatus,
    waterAvailablity,
    setWaterAvailablity,
    electricityStatus,
    setElectricityStatus,
    ownership,
    setOwnership,
    cornerPlot,
    setCornerPlot,
    approvalAuthority,
    setApprovalAuthority,
    availableOffers,
    setAvailableOffers,
    banks,
    setBanks,
    amenitiesdata,
    setAmenitiesdata,
    highlights,
    setHighlights,
    role,
    transactionType,
    amenities,
    option,
}: FormPlot2Props) => {
    return (
        <div className='space-y-3'>
            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[22].key}
                        options={dropdownConfigs[22].options}
                        value={plotType}
                        onChange={setPlotType}
                        placeholder={dropdownConfigs[22].placeholder}
                        label={dropdownConfigs[22].label}
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[23].key}
                        options={dropdownConfigs[23].options}
                        value={boundaryWall}
                        onChange={setBoundaryWall}
                        placeholder={dropdownConfigs[23].placeholder}
                        label={dropdownConfigs[23].label}
                    />
                </div>
            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[24].key}
                        options={dropdownConfigs[24].options}
                        value={gatedCommunity}
                        onChange={setGatedCommunity}
                        placeholder={dropdownConfigs[24].placeholder}
                        label={dropdownConfigs[24].label}
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[5].key}
                        options={dropdownConfigs[5].options}
                        value={purpose}
                        onChange={setPurpose}
                        placeholder={dropdownConfigs[5].placeholder}
                        label={dropdownConfigs[5].label}
                    />
                </div>
            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[25].key}
                        options={dropdownConfigs[25].options}
                        value={noOfOpenSides}
                        onChange={setNoOfOpenSides}
                        placeholder={dropdownConfigs[25].placeholder}
                        label={dropdownConfigs[25].label}
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[26].key}
                        options={dropdownConfigs[26].options}
                        value={landUseZone}
                        onChange={setLandUseZone}
                        placeholder={dropdownConfigs[26].placeholder}
                        label={dropdownConfigs[26].label}
                    />
                </div>
            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Width of Facing Road
                    </label>
                    <InputBox
                        name="Width of Facing Road"
                        value={widthFacingRoad}
                        onChange={setWidthFacingRoad}
                        placeholder="Width of facing road"
                        className="mt-1"
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Road Width
                    </label>
                    <InputBox
                        name="Road Width"
                        value={roadWidth}
                        onChange={setRoadWidth}
                        placeholder="Road width"
                        className="mt-1"
                    />
                </div>
            </div>
            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[17].key}
                        options={dropdownConfigs[17].options}
                        value={availablityStatus}
                        onChange={setAvailablityStatus}
                        placeholder={dropdownConfigs[17].placeholder}
                        label={dropdownConfigs[17].label}
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[18].key}
                        options={dropdownConfigs[18].options}
                        value={waterAvailablity}
                        onChange={setWaterAvailablity}
                        placeholder={dropdownConfigs[18].placeholder}
                        label={dropdownConfigs[18].label}
                    />
                </div>
            </div>
            <div className='flex flex-row gap-4'>
                {
                    role === "agent" &&
                    <div className='flex flex-col flex-1'>
                        <DropdownMenuCustom
                            key={dropdownConfigs[27].key}
                            options={dropdownConfigs[27].options}
                            value={cornerPlot}
                            onChange={setCornerPlot}
                            placeholder={dropdownConfigs[27].placeholder}
                            label={dropdownConfigs[27].label}
                        />
                    </div>
                }
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[28].key}
                        options={dropdownConfigs[28].options}
                        value={approvalAuthority}
                        onChange={setApprovalAuthority} // ✅ store array
                        placeholder={dropdownConfigs[28].placeholder}
                        label={dropdownConfigs[28].label}
                        className="max-w-sm"
                    />
                </div>
            </div>
            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[19].key}
                        options={dropdownConfigs[19].options}
                        value={electricityStatus}
                        onChange={setElectricityStatus} // ✅ store array
                        placeholder={dropdownConfigs[19].placeholder}
                        label={dropdownConfigs[19].label}
                        className="max-w-sm"
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[12].key}
                        options={dropdownConfigs[12].options}
                        value={ownership}
                        onChange={setOwnership}
                        placeholder={dropdownConfigs[12].placeholder}
                        label={dropdownConfigs[12].label}
                    />
                </div>

            </div>
            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[15].key}
                        options={dropdownConfigs[15].options}
                        value={availableOffers}
                        onChange={setAvailableOffers} // ✅ store array
                        placeholder={dropdownConfigs[15].placeholder}
                        label={dropdownConfigs[15].label}
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[16].key}
                        options={dropdownConfigs[16].options}
                        value={banks}
                        onChange={setBanks} // ✅ store array
                        placeholder={dropdownConfigs[16].placeholder}
                        label={dropdownConfigs[16].label}
                        className="max-w-sm"
                    />
                </div>
            </div>


            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm mb-1 font-medium text-gray-700">
                        Amenities
                    </label>
                    <ChipList

                        amenities={amenities}
                        onChange={(selected) => console.log("Selected chips:", selected)}
                    />
                </div>
            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm mb-1 font-medium text-gray-700">
                        Highlight Tags
                    </label>
                    <ChipList
                        amenities={option}
                        onChange={(selected) => console.log("Selected chips:", selected)}
                    />
                </div>
            </div>

        </div>

    )
}