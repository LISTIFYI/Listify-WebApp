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
import FloorPlanningPricing, { FloorPlan, initialPlan } from '@/components/AdditionalComponents/FloorPlanningPricing';
import { Bath, Bed, Edit2, Pencil, Plus, Sun, Trash2, X } from 'lucide-react';
import { formatAmount, formatIndianCurrency } from '@/utils/commonFn/common';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IoDocument } from 'react-icons/io5';
import { tokenStore } from '@/lib/token';
import { getAgentById, UploadPhoto } from '@/utils/api';
import ButtonCommon from '@/components/CustomFields/Button';
import { DialogDescription, DialogTrigger } from '@radix-ui/react-dialog';
import ContactForm from '@/components/Forms/ContacFormCommon';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

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
}

const Villa = ({ transactionType, entityType,
    showNext,
    setShowNext,
    coverVideo,
    galleryFiles,
    role
}: FlatProps) => {
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
            placeholder: 'Choose extra room types',
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
            placeholder: 'Choose available offers',
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
            placeholder: 'Choose banks',
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

    ]


    const amenities: Amenity[] = [
        { icon: "gardenIcon", label: "Garden" },
        { icon: "garageIcon", label: "Garage" },
        { icon: "ServantRoomIcon", label: "Servant Room" },
        { icon: "terraceIcon", label: "Terrace" },
        { icon: "swimmingPoolIcon", label: "Swimming Pool" },
        { icon: "gymIcon", label: "Gym" },
        { icon: "securityIcon", label: "Security" },
        { icon: "gatedCommunityIcon", label: "Gated Community" },
        { icon: "PowerBackupIcon", label: "Power Backup" },
        { icon: "waterIcon", label: "Water Supply" },
    ];

    const option: OptionTag[] = [
        {
            label: "Zero Brokerage",
            icon: "leaf",
        },
        {
            label: "Pet Friendly",
            icon: "paw",
        },
        {
            label: "Eco Friendly",
            icon: "solar-power",
        },
        {
            label: "Lake View",
            icon: "water-sharp",
        },
        {
            label: "Smart Home",
            icon: "home",
        },
    ];


    const handleSelectionChangeChip = (selectedChips: Record<string, boolean>) => {
        setAmenitiesdata(selectedChips) // ✅ types match
    }
    const handleSelectionChangeChip2 = (selectedChips: Record<string, boolean>) => {
        setHighlights(selectedChips) // ✅ types match
    }

    const [open, setOpen] = useState(false)
    const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
    const [currentPlan, setCurrentPlan] = useState<FloorPlan>({ ...initialPlan });
    const [editIndex, setEditIndex] = useState<any>(null);
    const handleEditPlan = (index: number) => {
        setCurrentPlan({ ...floorPlans[index] });
        setEditIndex(index);
        setOpen(true)
    };

    const handleRemovePlan = (index: number) => {
        const updatedPlans = [...floorPlans];
        updatedPlans.splice(index, 1);
        setFloorPlans(updatedPlans);
        if (editIndex === index) {
            setCurrentPlan({ ...initialPlan });
            setEditIndex(null);
        }
    };


    const handleAddOrUpdate = () => {
        if (!currentPlan.bhkType || !currentPlan.superArea || !currentPlan.unitSize) {
            alert("Please fill BHK Type, Super Built-Up Area, and Unit Size.");
            return;
        }
        setFloorPlans((prev) => {
            if (editIndex !== null) {
                // Update existing plan
                const updatedPlans = [...prev];
                updatedPlans[editIndex] = currentPlan;
                return updatedPlans;
            }
            // Add new plan
            return [...prev, currentPlan];
        });
        setCurrentPlan({ ...initialPlan });
        setEditIndex(null);
        setOpen(false)
    };

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
            setEditIndex(undefined);
            setEditContacts(undefined);
        }
    };


    //all input
    // part1

    const [reraNumber, setReraNumber] = useState("")
    const [unitType, setUnitType] = useState('')
    const [area, setArea] = useState('')
    const [propertySize, setPropertySize] = useState('')
    const [plotArea, setPlotArea] = useState('')
    const [unitSizeRange, setUnitSizeRange] = useState('')
    const [carpetArea, setCarpetArea] = useState('')

    const [amount, setAmount] = useState('')
    const [priceRange, setPriceRange] = useState('')
    const [pricePerSqFT, setPricePerSqT] = useState('')
    const [bookingAmount, setBookingAmount] = useState('')
    const [constructionStatus, setConstructionStatus] = useState('')
    const [possessionDate, setPossessionDate] = useState('')
    const [propertyage, setPropertyAge] = useState('')
    const [approvalAuthority, setApprovalAuthority] = useState('')
    const [facingDirection, setFacingDirection] = useState('')
    // const [noOfTowers, setNoOfTowers] = useState('')
    const [electricityStatus, setElectricityStatus] = useState('')
    const [waterAvailablity, setWterAvailablity] = useState('')
    const [totalUnits, setTotalUnits] = useState('')

    const [maintainenceCharges, setMaintainenceCharges] = useState('')
    const [n, setN] = useState<boolean>(false);
    const [brochure, setBrochure] = useState<string>("");
    const removePdf = () => {
        setBrochure("")
    }
    // part1
    const [totalNo, setTotalNo] = useState("")
    const [purpose, setPurpose] = useState('')
    const [floorNo, setFloorNo] = useState('')
    const [totalBedroom, setTotalBedroom] = useState('')
    const [totalBathroom, setTotalBathroom] = useState('')
    const [totalBalcony, setTotalBalcony] = useState('')
    const [furnishingStatus, setFurnishingStatus] = useState('')
    const [sampleFlat, setSampleFlat] = useState('')
    const [ownership, setOwnership] = useState('')
    const [coveredParking, setCoveredParking] = useState('')
    const [flooring, setFlooring] = useState<string[]>([])
    const [certification, setCertification] = useState('')
    const [extraRoomTypes, setExtraRoomTypes] = useState<string[]>([])
    const [availableOffers, setAvailableOffers] = useState<string[]>([])
    const [banks, setBanks] = useState<string[]>([])
    const [amenitiesdata, setAmenitiesdata] = useState<Record<string, boolean>>({})
    const [highlights, setHighlights] = useState<Record<string, boolean>>({})
    // part2

    // part2


    const fileInputRef = useRef<HTMLInputElement | null>(null)

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

    const { user } = useAuth()
    const [roleAB, setRoleAB] = useState<any>(null)
    console.log("roleAB", roleAB);


    useEffect(() => {
        const fetchAgentOrBuilder = async () => {

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

                const res = await getAgentById(id, type, token?.accessToken ?? "");

                setRoleAB(res);
            } catch (error) {
                console.error("Error fetching agent/builder:", error);
            }
        };

        fetchAgentOrBuilder();
    }, [entityType]);

    useEffect(() => {
        if (amount || floorPlans?.length > 0) {
            let text = '';
            if (amount) {
                text = formatAmount(Number(amount));
            } else if (floorPlans.length === 1) {
                text = formatAmount(Number(floorPlans[0].amount));
            } else {
                text = `${formatAmount(Number(floorPlans[0].amount))} - ${formatAmount(
                    Number(floorPlans[floorPlans.length - 1].amount)
                )}`;
            }

            setPriceRange(text);
        } else {
            setPriceRange('');
        }
    }, [amount, floorPlans]);

    // api call final subnmit
    const handleSubmits = () => {
        const formDataa = {
            entityType: entityType,
            listingType: user?.builderProfile ? "builder" : "agent",
            title: formData.propertyName,
            description: formData.description,
            details: {
                approvals: approvalAuthority ? approvalAuthority.split(/[, ]+/).filter(Boolean) : [],
                possessionDate: possessionDate ? format(possessionDate, 'yyyy-MM-dd') : '',
                propertyCategory: constructionStatus,
                reraNumber: reraNumber,
                facing: facingDirection,
                ...(unitType && { bhkType: unitType }),
                priceRange: priceRange,
                towers: totalUnits,
                unitSizeRange: unitSizeRange,
                area: Number(area),
                carpetArea: Number(carpetArea),
                propertySize: Number(propertySize),
                plotArea: Number(plotArea),
                purpose: purpose,
                certification: certification,
                totalFloors: totalNo,
                ageOfProperty: propertyage,
                furnished: furnishingStatus,
                floor: floorNo,
                sampleFlatAvailable: sampleFlat,
                additionalRooms: extraRoomTypes,
                loanApprovedBanks: banks,
                ...(totalBedroom && { bedrooms: totalBedroom }),
                ...(totalBathroom && { bathrooms: totalBathroom }),
                ...(totalBalcony && { balconies: totalBalcony }),
                floorPlanningPricing: floorPlans,
                propertyType: entityType,
                reraRegistered: reraNumber ? true : false,
                coveredParking: coveredParking,
                ownership: ownership,
                bookingAmount: Number(bookingAmount),
                waterAvailability: waterAvailablity,
                electricityStatus: electricityStatus,
                greenQuality: certification
                // availability: availabl,
                // parking: parking

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
                negotiable: n ? true : false,
                maintenanceCharges: Number(maintainenceCharges),
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
            },
            additionalContacts: savedContacts,

        };

        console.log("formdata", formDataa);

    };
    return (
        <>

            {
                !showNext ?
                    <VillaForm1
                        dropdownConfigs={dropdownConfigs}
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

                        amount={amount}
                        approvalAuthority={approvalAuthority}
                        area={area}
                        bookingAmount={bookingAmount}
                        brochure={brochure}
                        carpetArea={carpetArea}
                        constructionStatus={constructionStatus}
                        currentPlan={currentPlan}
                        editIndex={editIndex}
                        electricityStatus={electricityStatus}
                        facingDirection={facingDirection}
                        fileInputRef={fileInputRef}
                        floorPlans={floorPlans}
                        handleAddOrUpdate={handleAddOrUpdate}
                        handleClick={handleClick}
                        handleEditPlan={handleEditPlan}
                        handleFileChange={handleFileChange}
                        handleRemovePlan={handleRemovePlan}
                        maintainenceCharges={maintainenceCharges}
                        n={n}
                        open={open}
                        plotArea={plotArea}
                        possessionDate={possessionDate}
                        pricePerSqFT={pricePerSqFT}
                        priceRange={priceRange}
                        propertySize={propertySize}
                        propertyage={propertyage}
                        removePdf={removePdf}
                        reraNumber={reraNumber}
                        setAmount={setAmount}
                        setApprovalAuthority={setApprovalAuthority}
                        setArea={setArea}
                        setBookingAmount={setBookingAmount}
                        setCarpetArea={setCarpetArea}
                        setConstructionStatus={setConstructionStatus}
                        setCurrentPlan={setCurrentPlan}
                        setEditIndex={setEditIndex}
                        setElectricityStatus={setElectricityStatus}
                        setFacingDirection={setFacingDirection}
                        setFloorPlans={setFloorPlans}
                        setMaintainenceCharges={setMaintainenceCharges}
                        setN={setN}
                        setOpen={setOpen}
                        setPlotArea={setPlotArea}
                        setPossessionDate={setPossessionDate}
                        setPricePerSqT={setPricePerSqT}
                        setPriceRange={setPriceRange}
                        setPropertyAge={setPropertyAge}
                        setPropertySize={setPropertySize}
                        setReraNumber={setReraNumber}
                        setTotalUnits={setTotalUnits}
                        setUnitSizeRange={setUnitSizeRange}
                        setUnitType={setUnitType}
                        setWaterAvailablity={setWterAvailablity}
                        totalUnits={totalUnits}
                        unitSizeRange={unitSizeRange}
                        unitType={unitType}
                        waterAvailablity={waterAvailablity}
                        role={role}
                        transactionType={transactionType}
                    /> :

                    <VillaForm2
                        amenities={amenities}
                        availableOffers={availableOffers}
                        banks={banks}
                        certification={certification}
                        coveredParking={coveredParking}
                        dropdownConfigs={dropdownConfigs}
                        editContacts={editContacts}
                        editIndexx={editIndexx}
                        extraRoomTypes={extraRoomTypes}
                        floorNo={floorNo}
                        flooring={flooring}
                        furnishingStatus={furnishingStatus}
                        handleEditContact={handleEditContact}
                        handleFormSubmit={handleFormSubmit}
                        handleOpenChange={handleOpenChange}
                        handleRemoveSavedContact={handleRemoveSavedContact}
                        handleSelectionChangeChip={handleSelectionChangeChip}
                        handleSelectionChangeChip2={handleSelectionChangeChip2}
                        openn={openn}
                        option={option}
                        ownership={ownership}
                        purpose={purpose}
                        sampleFlat={sampleFlat}
                        savedContacts={savedContacts}
                        setAvailableOffers={setAvailableOffers}
                        setBanks={setBanks}
                        setCertification={setCertification}
                        setCoveredParking={setCoveredParking}
                        setEditContacts={setEditContacts}
                        setEditIndexx={setEditIndexx}
                        setExtraRoomTypes={setExtraRoomTypes}
                        setFloorNo={setFloorNo}
                        setFlooring={setFlooring}
                        setFurnishingStatus={setFurnishingStatus}
                        setOpenn={setOpenn}
                        setOwnership={setOwnership}
                        setPurpose={setPurpose}
                        setSampleFlat={setSampleFlat}
                        setSavedContacts={setSavedContacts}
                        setTotalBalcony={setTotalBalcony}
                        setTotalBathroom={setTotalBathroom}
                        setTotalBedroom={setTotalBedroom}
                        setTotalNo={setTotalNo}
                        totalBalcony={totalBalcony}
                        totalBathroom={totalBathroom}
                        totalBedroom={totalBedroom}
                        totalNo={totalNo}
                        role={role}
                        transactionType={transactionType}

                    />
            }


            <div className='border flex flex-row transition-all duration-300 gap-4 w-full mt-4'>
                {
                    showNext &&
                    <ButtonCommon
                        onClick={() => {
                            setShowNext(false)
                        }}
                        title='Back' />
                }
                <ButtonCommon
                    onClick={() => {
                        if (showNext) {
                            // setShowNext(true)
                            handleSubmits()
                            alert("Final call")
                        } else {
                            setShowNext(true)

                        }
                    }}
                    title={showNext ? "Continue" : "Next"} />
            </div>
        </>
    );
};

export default Villa;

interface FormVilla1Props {
    reraNumber: string,
    setReraNumber: (value: string) => void,
    dropdownConfigs: any,
    unitType: string,
    setUnitType: (value: string) => void
    amount: string,
    setAmount: (value: string) => void,
    priceRange: string,
    setPriceRange: (value: string) => void,
    pricePerSqFT: string,
    setPricePerSqT: (value: string) => void,
    constructionStatus: string,
    setConstructionStatus: (value: string) => void,
    propertyage: string;
    setPropertyAge: (value: string) => void,
    possessionDate: string
    setPossessionDate: any,
    approvalAuthority: string,
    setApprovalAuthority: (value: string) => void,
    facingDirection: string,
    setFacingDirection: (value: string) => void,
    maintainenceCharges: string,
    setMaintainenceCharges: (value: string) => void,
    bookingAmount: string,
    setBookingAmount: (value: string) => void,
    electricityStatus: string,
    setElectricityStatus: (value: string) => void,
    waterAvailablity: string,
    setWaterAvailablity: (value: string) => void
    propertySize: string,
    setPropertySize: (value: string) => void
    plotArea: string,
    setPlotArea: (value: string) => void
    unitSizeRange: string,
    setUnitSizeRange: (value: string) => void
    carpetArea: string,
    setCarpetArea: (value: string) => void

    n: any,
    setN: any,
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
    area: any,
    setArea: any,
    totalUnits: any,
    setTotalUnits: any,
    floorPlans: any,
    setFloorPlans: any,
    currentPlan: any,
    setCurrentPlan: any,
    editIndex: any,
    setEditIndex: any,
    handleEditPlan: any,
    handleRemovePlan: any
    handleAddOrUpdate: any
    open: any,
    setOpen: any,
    role: string,
    transactionType: any

}
const VillaForm1 = ({
    reraNumber,
    setReraNumber,
    dropdownConfigs,
    unitType,
    setUnitType,
    amount,
    setAmount,
    priceRange,
    area,
    setArea,
    totalUnits,
    setTotalUnits,
    setPriceRange,
    pricePerSqFT,
    setPricePerSqT,
    constructionStatus,
    setConstructionStatus,
    propertyage,
    setPropertyAge,
    possessionDate,
    setPossessionDate,
    approvalAuthority,
    setApprovalAuthority,
    facingDirection,
    setFacingDirection,
    maintainenceCharges,
    setMaintainenceCharges,
    n,
    setN,
    handleClick,
    fileInputRef,
    handleFileChange,
    brochure,
    removePdf,
    bookingAmount,
    electricityStatus,
    setBookingAmount,
    setElectricityStatus,
    setWaterAvailablity,
    waterAvailablity,
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
    currentPlan,
    editIndex,
    floorPlans,
    handleAddOrUpdate,
    handleEditPlan,
    handleRemovePlan,
    open,
    setCurrentPlan,
    setEditIndex, setFloorPlans, setOpen,
    plotArea,
    propertySize,
    setPlotArea,
    setPropertySize,
    setUnitSizeRange,
    unitSizeRange,
    carpetArea,
    setCarpetArea, role, transactionType
}: FormVilla1Props) => {
    return (
        <div className='mt-3 space-y-3'>
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
                {
                    (transactionType === "resale" || role === "Agent") &&
                    <div className='flex flex-col flex-1'>
                        <DropdownMenuCustom
                            key={dropdownConfigs[0].key}
                            options={dropdownConfigs[0].options}
                            value={unitType}
                            onChange={setUnitType}
                            placeholder={dropdownConfigs[0].placeholder}
                            label={dropdownConfigs[0].label}
                        />
                    </div>
                }
            </div>

            {
                (transactionType === "sale" && role === "Builder") &&
                <div onClick={() => {
                    setOpen(true)
                    setCurrentPlan({ ...initialPlan }); // Reset to initial empty state
                    setEditIndex(null);
                }}
                    className='cursor-pointer my-4 flex flex-row gap-1 justify-center items-center  border border-gray-300 py-2 rounded-sm bg-gray-100 hover:bg-gray-50 transition-all duration-300'>
                    <Plus size={18} />
                    <h1 className='text-sm text-black font-normal '>Add Floor Planning & Pricing</h1>
                </div>

            }
            {
                !!floorPlans?.length &&
                <div className="flex flex-row gap-3 py-2 overflow-x-auto">
                    {floorPlans?.map((i: any, index: any) => (
                        <div
                            key={index}
                            className="py-4  w-[180px] shadow-sm border rounded-md shrink-0"
                            onClick={() => handleEditPlan(index)}
                        >
                            <div className='flex flex-col gap-2 px-4'>
                                <p className="text-sm font-normal">
                                    {formatIndianCurrency(i?.amount)}
                                </p>
                                <p className="text-sm font-normal">
                                    {i?.bhkType} - {i.superArea} {i.unitSize}
                                </p>
                                {/* <p className="text-sm font-normal">Amount: {i?.amount}</h1> */}
                                <div className='flex flex-row gap-4 items-center '>
                                    <h1 className='text-xs flex flex-row gap-0.5'><Bed size={14} />{i.noOfBedroom}</h1>
                                    <h1 className='text-xs flex flex-row gap-0.5'><Bath size={14} />{i.noOfBathroom}</h1>
                                    <h1 className='text-xs flex flex-row gap-0.5'><Sun size={14} />{i.noOfBedroom}</h1>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 mt-2 py-2 overflow-x-auto px-4">
                                {i?.floorPlanImages?.map((img: any, idx: any) => (
                                    <div key={idx} className="w-[80px] h-[80px] overflow-hidden shadow-md rounded-md shrink-0">
                                        <img
                                            src={img}
                                            alt=""
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className='flex flex-row gap-2 mt-4 px-4'>
                                <button ><Trash2 color='red' size={16} /></button>
                                <button><Pencil color='black' size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            }
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Floor Planning & Pricing</DialogTitle>
                    </DialogHeader>

                    <FloorPlanningPricing
                        currentPlan={currentPlan}
                        editIndex={editIndex}
                        floorPlans={floorPlans}
                        handleAddOrUpdate={handleAddOrUpdate}
                        handleEditPlan={handleEditPlan}
                        handleRemovePlan={handleRemovePlan}
                        openFP={open}
                        setCurrentPlan={setCurrentPlan}
                        setEditIndex={setEditIndex}
                        setFloorPlans={setFloorPlans}
                        setOpenFP={setOpen}
                    />
                </DialogContent>
            </Dialog>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Area
                    </label>
                    <InputBox
                        name="Area"
                        value={area}
                        onChange={area}
                        placeholder="Area"
                        className="mt-1"
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Property Size
                    </label>
                    <InputBox
                        name="Property Size"
                        value={propertySize}
                        onChange={setPropertySize}
                        placeholder="Property size"
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
                        value={unitSizeRange}
                        onChange={setUnitSizeRange}
                        placeholder={dropdownConfigs[20].placeholder}
                        label={dropdownConfigs[20].label}
                    />
                </div>
            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Carpet Area
                    </label>
                    <InputBox
                        name="Carpet Area"
                        value={carpetArea}
                        onChange={setCarpetArea}
                        placeholder="Carpet area"
                        className="mt-1"
                    />
                </div>
                {/* <div className='flex flex-col flex-1'>
                        <DropdownMenuCustom
                            key={dropdownConfigs[20].key}
                            options={dropdownConfigs[20].options}
                            value={constructionStatus}
                            onChange={(value) => setConstructionStatus(value as string)}
                            placeholder={dropdownConfigs[20].placeholder}
                            label={dropdownConfigs[20].label}
                        />
                        {errors.propertyName && <p className="text-red-500 text-sm mt-1">{errors.propertyName}</p>}
                    </div> */}
            </div>
            <div className='flex flex-row gap-4'>
                {
                    (transactionType === "resale" || role === "Agent") &&
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
                }
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Price Range
                    </label>
                    <InputBox
                        name="Price range"
                        value={priceRange ?? 0}
                        onChange={setPriceRange}
                        placeholder="Price range"
                        className="mt-1"
                        disabled

                    />
                </div>
            </div>
            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Price per Sq ft (₹)
                    </label>
                    <InputBox
                        name="Price Per Sqft"
                        value={pricePerSqFT}
                        onChange={setPricePerSqT}
                        placeholder="Price per Sq ft (₹)"
                        className="mt-1"
                    />
                </div>
                {
                    transactionType === "sale" &&
                    <div className='flex flex-col flex-1'>
                        <label className="block text-sm font-medium text-gray-700">
                            Booking Amount
                        </label>
                        <InputBox
                            name="Booking Amount"
                            value={bookingAmount}
                            onChange={setBookingAmount}
                            placeholder="Booking Amount"
                            className="mt-1"
                        />
                    </div>
                }


            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[2].key}
                        options={dropdownConfigs[2].options}
                        value={constructionStatus}
                        onChange={setConstructionStatus}
                        placeholder={dropdownConfigs[2].placeholder}
                        label={dropdownConfigs[2].label}
                    />
                </div>
                {
                    constructionStatus === "Ready to Move" &&
                    <div className='flex flex-col flex-1'>
                        <DropdownMenuCustom
                            key={dropdownConfigs[1].key}
                            options={dropdownConfigs[1].options}
                            value={propertyage}
                            onChange={setPropertyAge}
                            placeholder={dropdownConfigs[1].placeholder}
                            label={dropdownConfigs[1].label}
                        />
                    </div>

                }

                {
                    constructionStatus === "New/Under Construction" &&
                    <div className='flex flex-col flex-1'>
                        <label className="block text-sm font-medium text-gray-700">
                            Possession Date
                        </label>
                        <DatePickerCustom
                            value={possessionDate ? new Date(possessionDate) : undefined}
                            onChange={(date) => setPossessionDate(date ? date.toISOString() : "")}
                            disabled={(date) => date < new Date()}
                            placeholder="Possession date"
                            className="mt-1"
                        />
                    </div>
                }
            </div>
            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[1].key}
                        options={dropdownConfigs[1].options}
                        value={propertyage}
                        onChange={setPropertyAge}
                        placeholder={dropdownConfigs[1].placeholder}
                        label={dropdownConfigs[1].label}
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Approval Authority
                    </label>
                    <InputBox
                        name="Approval Authority"
                        value={approvalAuthority}
                        onChange={setApprovalAuthority}
                        placeholder="Approval authority"
                        className="mt-1"
                    />
                </div>

            </div>

            <div className='flex flex-row gap-4'>
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
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        No of Villa's
                    </label>
                    <InputBox
                        name=" No of Villa's"
                        value={totalUnits}
                        onChange={setTotalUnits}
                        placeholder=" No of villa's"
                        className="mt-1"
                    />
                </div>
            </div>

            <div className='flex flex-row gap-4'>
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
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[19].key}
                        options={dropdownConfigs[19].options}
                        value={electricityStatus}
                        onChange={setElectricityStatus}
                        placeholder={dropdownConfigs[19].placeholder}
                        label={dropdownConfigs[19].label}
                    />
                </div>

            </div>
            {
                transactionType === "resale" &&
                <div className='flex flex-row gap-4'>
                    <div className='flex flex-col flex-1'>
                        <label className="block text-sm font-medium text-gray-700">
                            Maintenance Charges
                        </label>
                        <InputBox
                            name="Maintenance Charges"
                            value={maintainenceCharges}
                            onChange={setMaintainenceCharges}
                            placeholder="Maintenance charges"
                            className="mt-1"
                        />
                    </div>

                    <div className='flex flex-col flex-1'>
                        <label className="block text-sm font-medium text-gray-700">
                            Rent Negotiable
                        </label>
                        <div className='h-8 flex flex-row gap-4 items-center mt-1 '>
                            <Switch checked={n} onCheckedChange={setN} />
                            <h1 className='text-sm font-normal'>{n ? "Yes" : "No"}</h1>
                        </div>
                    </div>
                </div>
            }


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

    )
}


interface FormVilla2Props {
    totalNo: string,
    setTotalNo: (value: string) => void,
    dropdownConfigs: any,
    purpose: string,
    setPurpose: (value: string) => void
    floorNo: string,
    setFloorNo: (value: string) => void,
    totalBedroom: string,
    setTotalBedroom: (value: string) => void,
    totalBathroom: string,
    setTotalBathroom: (value: string) => void,
    totalBalcony: string,
    setTotalBalcony: (value: string) => void,
    furnishingStatus: string;
    setFurnishingStatus: (value: string) => void,
    sampleFlat: string
    setSampleFlat: any,
    ownership: string,
    setOwnership: (value: string) => void,
    coveredParking: string,
    setCoveredParking: (value: string) => void,
    extraRoomTypes: any
    setExtraRoomTypes: any,
    certification: string,
    setCertification: (value: string) => void,
    availableOffers: any,
    setAvailableOffers: any,
    banks: any,
    setBanks: any,
    handleSelectionChangeChip: any
    amenities: any,
    option: any,
    handleSelectionChangeChip2: any,
    openn: any,
    setOpenn: any,
    editIndexx: any,
    setEditIndexx: any,
    editContacts: any,
    setEditContacts: any
    handleFormSubmit: any
    handleEditContact: any
    handleRemoveSavedContact: any
    handleOpenChange: any,
    savedContacts: any,
    setSavedContacts: any,
    flooring: any
    setFlooring: any
    role: string
    transactionType: any


}
const VillaForm2 = ({
    dropdownConfigs,
    totalNo,
    setTotalNo,
    purpose,
    setPurpose,
    floorNo,
    setFloorNo,
    totalBedroom,
    setTotalBedroom,
    totalBalcony,
    setTotalBalcony,
    totalBathroom,
    setTotalBathroom,
    furnishingStatus,
    setFurnishingStatus,
    sampleFlat,
    setSampleFlat,
    coveredParking,
    setCoveredParking,
    setOwnership,
    ownership,
    certification,
    setCertification,
    setExtraRoomTypes,
    extraRoomTypes,
    handleSelectionChangeChip,
    amenities,
    option,
    availableOffers,
    setAvailableOffers, banks, setBanks,
    handleSelectionChangeChip2,
    editContacts,
    editIndexx,
    handleEditContact,
    handleFormSubmit,
    handleOpenChange,
    handleRemoveSavedContact,
    openn,
    setEditContacts,
    setEditIndexx,
    setOpenn,
    savedContacts,
    setSavedContacts,
    flooring,
    setFlooring, role, transactionType
}: FormVilla2Props) => {
    return (
        <div className='mt-3 space-y-3'>
            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[4].key}
                        options={dropdownConfigs[4].options}
                        value={totalNo}
                        onChange={setTotalNo}
                        placeholder={dropdownConfigs[4].placeholder}
                        label={dropdownConfigs[4].label}
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

            {
                (transactionType === "resale" || role === "Agent") &&
                <>
                    <div className='flex flex-row gap-4'>
                        <div className='flex flex-col flex-1'>
                            <DropdownMenuCustom
                                key={dropdownConfigs[6].key}
                                options={dropdownConfigs[6].options}
                                value={floorNo}
                                onChange={setFloorNo}
                                placeholder={dropdownConfigs[6].placeholder}
                                label={dropdownConfigs[6].label}
                            />
                        </div>
                        <div className='flex flex-col flex-1'>
                            <DropdownMenuCustom
                                key={dropdownConfigs[7].key}
                                options={dropdownConfigs[7].options}
                                value={totalBedroom}
                                onChange={setTotalBedroom}
                                placeholder={dropdownConfigs[7].placeholder}
                                label={dropdownConfigs[7].label}
                            />
                        </div>
                    </div>
                    <div className='flex flex-row gap-4'>
                        <div className='flex flex-col flex-1'>
                            <DropdownMenuCustom
                                key={dropdownConfigs[8].key}
                                options={dropdownConfigs[8].options}
                                value={totalBathroom}
                                onChange={setTotalBathroom}
                                placeholder={dropdownConfigs[8].placeholder}
                                label={dropdownConfigs[8].label}
                            />
                        </div>
                        <div className='flex flex-col flex-1'>
                            <DropdownMenuCustom
                                key={dropdownConfigs[9].key}
                                options={dropdownConfigs[9].options}
                                value={totalBalcony}
                                onChange={setTotalBalcony}
                                placeholder={dropdownConfigs[9].placeholder}
                                label={dropdownConfigs[9].label}
                            />
                        </div>
                    </div>
                </>

            }            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[10].key}
                        options={dropdownConfigs[10].options}
                        value={furnishingStatus}
                        onChange={setFurnishingStatus}
                        placeholder={dropdownConfigs[10].placeholder}
                        label={dropdownConfigs[10].label}
                    />
                </div>
                {/* <div className='flex flex-col flex-1'>
                    <DropdownMenuCustom
                        key={dropdownConfigs[11].key}
                        options={dropdownConfigs[11].options}
                        value={sampleFlat}
                        onChange={setSampleFlat}
                        placeholder={dropdownConfigs[11].placeholder}
                        label={dropdownConfigs[11].label}
                    />
                </div> */}
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
                    <DropdownMenuCustom
                        key={dropdownConfigs[13].key}
                        options={dropdownConfigs[13].options}
                        value={coveredParking}
                        onChange={setCoveredParking}
                        placeholder={dropdownConfigs[13].placeholder}
                        label={dropdownConfigs[13].label}
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[14].key}
                        options={dropdownConfigs[14].options}
                        value={extraRoomTypes}
                        onChange={setExtraRoomTypes} // ✅ store array
                        placeholder={dropdownConfigs[14].placeholder}
                        label={dropdownConfigs[14].label}
                        className="max-w-sm"
                    />
                </div>
            </div>


            <div className='flex flex-row gap-4'>

                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Certification
                    </label>
                    <InputBox
                        name="Certification"
                        value={certification}
                        onChange={setCertification}
                        placeholder="Certification"
                        className="mt-1"
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[15].key}
                        options={dropdownConfigs[15].options}
                        value={availableOffers}
                        onChange={setAvailableOffers} // ✅ store array
                        placeholder={dropdownConfigs[15].placeholder}
                        label={dropdownConfigs[15].label}
                        className="max-w-sm"
                    />
                </div>
            </div>
            <div className='flex flex-row gap-4'>

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
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[21].key}
                        options={dropdownConfigs[21].options}
                        value={flooring}
                        onChange={setFlooring}
                        placeholder={dropdownConfigs[21].placeholder}
                        label={dropdownConfigs[21].label}
                    />
                </div>
            </div>

            <div className='flex flex-row gap-4'>

            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm mb-1 font-medium text-gray-700">
                        Amenities
                    </label>
                    <ChipList amenities={amenities} onChange={handleSelectionChangeChip} />
                </div>
            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm mb-1 font-medium text-gray-700">
                        Highlight Tags
                    </label>
                    <ChipList amenities={option} onChange={handleSelectionChangeChip2} />
                </div>
            </div>

            <div className="p-4">
                <div className="flex flex-row items-center flex-1 gap-4">
                    <label className="underline underline-offset-4 block text-sm font-medium text-gray-700">
                        Add Contact
                    </label>
                    <Dialog open={openn} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <button className="border border-black w-[20px] flex justify-center items-center h-[20px] rounded-full">
                                <Plus size={16} />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editIndexx !== undefined ? 'Edit Contact' : 'Add Contacts'}</DialogTitle>
                                <DialogDescription>
                                    {editIndexx !== undefined
                                        ? 'Update the details for the contact.'
                                        : 'Fill in the details for one or more contacts.'}
                                </DialogDescription>
                            </DialogHeader>
                            <ContactForm
                                onSubmit={handleFormSubmit}
                                initialContacts={editContacts}
                                editIndex={editIndexx}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex flex-row overflow-x-auto mt-2 gap-2">
                    {savedContacts.map((item: any, index: any) => (
                        <div
                            key={index}
                            className="border  p-2 shadow-md rounded-md mb-2 flex flex-col gap-0.5 relative"
                        >
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleEditContact(index)}
                                    className="text-black cursor-pointer"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSavedContact(index)}
                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h1 className="text-sm font-medium">Name: {item.name}</h1>
                            <h1 className="text-sm font-medium">Mobile: {item.mobile}</h1>
                            {item.email && (
                                <h1 className="text-sm font-medium">Email: {item.email}</h1>
                            )}
                        </div>

                    ))}
                </div>
            </div>
        </div>

    )
}