'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import axios from 'axios';
import BasicListingAddressForm from '@/components/Forms/BasicListingAddressForm/BasicListingAddressForm';
import InputBox from '@/components/CustomFields/InputBox';
import { Amenity, DropdownConfig, OptionTag } from '@/types/listingTypes';
import DropdownMenuCustom from '@/components/CustomFields/DropdownMenuCustom';
import DatePickerCustom from '@/components/CustomFields/DatePickerCustom';
import { Switch } from '@/components/ui/switch';
import MultiSelectDropdown from '@/components/CustomFields/MultiDropdown';
import ButtonCommon from '@/components/CustomFields/Button';
import { Bath, Bed, Cross, CrossIcon, Delete, DeleteIcon, Edit2, FileText, Home, IndianRupee, MapPin, Pencil, Plus, Sun, SunMoonIcon, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FloorPlanningPricing, { FloorPlan, initialPlan } from '@/components/AdditionalComponents/FloorPlanningPricing';
import MediaUpload from '@/components/MediaUpload/MediaUpload';
import { getAgentById, UploadPhoto } from '@/utils/api';
import { IoDocument } from 'react-icons/io5';
import { formatAmount, formatIndianCurrency } from '@/utils/commonFn/common';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import ContactForm from '@/components/Forms/ContacFormCommon';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import ListingPreview from '@/components/ListingPreview/ListingPreview';
import { tokenStore } from '@/lib/token';
import { initializeApi } from '@/lib/http';


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
    role: string,
    formCount: number,
    setFormCount: any
    totalSteps: any
    direction: any
    setFinalSubmitData: any
    propertyData: any
}
const Flat = ({
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
    console.log("roleeeee", role);

    const api = initializeApi(tokenStore).getApi();


    const [coverVideo, setCoverVideo] = useState<any>(null)

    const [galleryFiles, setGalleryFiles] = useState<string[]>([])
    const removeGalleryItem = (index: number) => {
        setGalleryFiles((prev: any) => prev.filter((_: any, i: any) => i !== index))
    }


    const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    console.log("fromda", formData);


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
        console.log("Text:", text);

        try {
            setIsLoading(true);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                    text
                )}&key=${apiKey}&components=country:in`
            );
            const data = await response.json();
            console.log("API Response:", data);

            if (data.status === "OK") {
                setSuggestions(data.predictions || []);
            } else {
                console.error("API Error:", data.status, data.error_message || "No error message provided");
                setSuggestions([]);
            }
        } catch (err) {
            console.error("Error fetching suggestions:", err);
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
                    label: "New Construction",
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
            placeholder: 'Sample flat',
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
            placeholder: 'Covered parking',
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
            placeholder: ' banks',
            options: [
                { value: 'SBI', label: 'SBI' },
                { value: 'HDFC', label: 'HDFC' },
                { value: 'ICICI', label: 'ICICI' },
                { value: 'Axis', label: 'Axis' },
                { value: 'LIC Housing', label: 'LIC Housing' },
            ],
            isMulti: true,
        },


    ]


    const amenities: Amenity[] = [
        { icon: "gymIcon", label: "Gym" },
        { icon: "swimmingPoolIcon", label: "Swimming Pool" },
        { icon: "parkingIcon", label: "Parking" },
        { icon: "securityIcon", label: "Security" },
        { icon: "elevatorIcon", label: "Elevator" },
        { icon: "gardenIcon", label: "Garden" },
        { icon: "playgroundIcon", label: "Playground" },
        { icon: "clubHouseicon", label: "Clubhouse" },
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


    // for post payload
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [disabled, setDisabled] = useState(false);

    // all states
    // part 1
    const [reraNumber, setReraNumber] = useState("")
    const [unitType, setUnitType] = useState('')
    const [amount, setAmount] = useState('')
    const [priceRange, setPriceRange] = useState('')
    const [pricePerSqFT, setPricePerSqT] = useState('')
    const [bookingAmount, setBookingAmount] = useState("")
    const [constructionStatus, setConstructionStatus] = useState('')
    const [possessionDate, setPossessionDate] = useState('')
    const [propertyage, setPropertyAge] = useState('')
    const [approvalAuthority, setApprovalAuthority] = useState('')
    const [facingDirection, setFacingDirection] = useState('')
    const [totalUnits, setTotalUnits] = useState('')
    const [area, setArea] = useState('')
    const [noOfTowers, setNoOfTowers] = useState('')
    const [maintainenceCharges, setMaintainenceCharges] = useState('')
    const [n, setN] = useState<boolean>(false);
    const [brochure, setBrochure] = useState<string>("");
    const removePdf = () => {
        setBrochure("")
    }
    // part 1
    // part 2
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
    const [certification, setCertification] = useState('')
    const [extraRoomTypes, setExtraRoomTypes] = useState<string[]>([])
    const [availableOffers, setAvailableOffers] = useState<string[]>([])
    const [banks, setBanks] = useState<string[]>([])
    const [amenitiesdata, setAmenitiesdata] = useState<string[]>([]);
    const [highlights, setHighlights] = useState<string[]>([]);

    const handleSelectionChangeChip = (label: string): void => {
        setAmenitiesdata((prev: string[]) =>
            prev?.includes(label)
                ? prev?.filter((item: string) => item !== label)
                : [...prev, label]
        );
    };

    const handleSelectionChangeChip2 = (label: string): void => {
        setHighlights((prev: string[]) =>
            prev?.includes(label)
                ? prev?.filter((item: string) => item !== label)
                : [...prev, label]
        );
    };



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

    const [open, setOpen] = useState(false)
    const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
    console.log("floor plans", floorPlans);

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
            setEditIndexx(undefined);
            setEditContacts(undefined);
        }
    };
    const { user } = useAuth()
    const [roleAB, setRoleAB] = useState<any>(null)
    console.log("roleAB", roleAB);


    useEffect(() => {
        const fetchAgentOrBuilder = async () => {
            try {
                const id =
                    user?.builderProfile
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

    const router = useRouter()
    // api call final subnmit
    const handleSubmits = async () => {
        const formDataa = {
            entityType: entityType,
            listingType: user?.builderProfile ? "builder" : "agent",
            //   ...fData,
            //   ...(isEdit && { listingId: selectedId }),
            title: formData.propertyName,
            description: formData.description,
            details: {
                approvals: approvalAuthority ? approvalAuthority.split(/[, ]+/).filter(Boolean) : [],
                possessionDate: possessionDate ? format(possessionDate, 'yyyy-MM-dd') : '',
                propertyCategory: constructionStatus,
                totalUnits: totalUnits,
                reraNumber: reraNumber,
                facing: facingDirection,
                ...(unitType && { bhkType: unitType }),
                priceRange: priceRange,
                towers: noOfTowers,
                // availableUnits: unitSizeRanges,
                // unitSizeRange: unitSizeRanges,
                purpose: purpose,
                certification: certification,
                // greenQuality: selectedGreenQuality,
                area: Number(area),
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
                greenQuality: certification

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
            amenities: amenitiesdata,
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
            additionalContacts: savedContacts,
            media: {
                images: galleryFiles.filter((url: any) =>
                    url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                ),
                videos: galleryFiles.filter((url: any) =>
                    url.match(/\.(mp4|mov|avi|mkv|webm)$/i)
                ),
                floorPlan: [brochure]
            }
        };

        const payload = {
            title: title ? title : formData?.propertyName,
            description: description ? description : formData.description,
            video_url: coverVideo?.url,
            thumbnail_url: "",
            duration_seconds: coverVideo?.duration,
            // tags: "#jignes",
            // mentions: ["user123", "user456"],
            visibility: "PUBLIC",
            location: formData.address,
            comments_disabled: disabled,
            //   ...(draft === 'DRAFT' ? { status: 'DRAFT' } : { status: 'PUBLISHED' }),
            status: 'PUBLISHED',
        };
        console.log("formdata", formData);
        setFinalSubmitData({
            formDataa: formDataa,
            payload: payload,
        });


    }

    useEffect(() => {
        handleSubmits()
    }, [formCount])

    const isImage = (url: any) => {
        const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
        return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
    };

    // Function to check if the URL is a video based on extension
    const isVideo = (url: any) => {
        const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
        return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
    };
    const mediaUrl = galleryFiles?.[0];

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

    const scrollRef = useRef<HTMLDivElement>(null);

    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDown.current = true;
        scrollRef.current!.classList.add("cursor-grabbing");
        startX.current = e.pageX - scrollRef.current!.offsetLeft;
        scrollLeft.current = scrollRef.current!.scrollLeft;
    };

    const handleMouseLeave = () => {
        isDown.current = false;
        scrollRef.current!.classList.remove("cursor-grabbing");
    };

    const handleMouseUp = () => {
        isDown.current = false;
        scrollRef.current!.classList.remove("cursor-grabbing");
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDown.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current!.offsetLeft;
        const walk = (x - startX.current) * 1.2; // scroll speed
        scrollRef.current!.scrollLeft = scrollLeft.current - walk;
    };

    const details = [
        {
            label: "Property Name",
            value: formData.propertyName,
            icon: <Home className="w-4 h-4 text-black" />,
        },
        {
            label: "Description",
            value: formData.description,
            icon: <FileText className="w-4 h-4 text-black" />,
        },
        {
            label: "Address",
            value: `${formData.address}, ${formData.state} - ${formData.city}`,
            icon: <MapPin className="w-4 h-4 text-black" />,
        },
        {
            label: "Amount",
            value: `₹ ${priceRange}`,
            icon: <IndianRupee className="w-4 h-4 text-black" />,
        },
    ];

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
                                {/* <h1 className='text-lg font-semibold'>Your Listing is Ready</h1> */}
                                {/* <h1 className='text-[16px] font-medium'>Continue to submit you listing</h1> */}
                                <ListingPreview />
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
                            formCount === 3 &&
                            <FormDetailsThree
                                reraNumber={reraNumber}
                                setReraNumber={setReraNumber}
                                dropdownConfigs={dropdownConfigs}
                                unitType={unitType}
                                setUnitType={setUnitType}
                                amount={amount}
                                setAmount={setAmount}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                pricePerSqFT={pricePerSqFT}
                                setPricePerSqT={setPricePerSqT}
                                constructionStatus={constructionStatus}
                                setConstructionStatus={setConstructionStatus}
                                propertyage={propertyage}
                                setPropertyAge={setPropertyAge}
                                possessionDate={possessionDate}
                                setPossessionDate={setPossessionDate}
                                approvalAuthority={approvalAuthority}
                                setApprovalAuthority={setApprovalAuthority}
                                facingDirection={facingDirection}
                                setFacingDirection={setFacingDirection}
                                noOfTowers={noOfTowers}
                                setNoOfTowers={setNoOfTowers}
                                maintainenceCharges={maintainenceCharges}
                                setMaintainenceCharges={setMaintainenceCharges}
                                n={n}
                                setN={setN}
                                handleClick={handleClick}
                                fileInputRef={fileInputRef}
                                handleFileChange={handleFileChange}
                                brochure={brochure ?? ""}
                                removePdf={removePdf}
                                area={area}
                                setArea={setArea}
                                setTotalUnits={setTotalUnits}
                                totalUnits={totalUnits}
                                currentPlan={currentPlan}
                                editIndex={editIndex}
                                floorPlans={floorPlans}
                                handleAddOrUpdate={handleAddOrUpdate}
                                handleEditPlan={handleEditPlan}
                                handleRemovePlan={handleRemovePlan}
                                open={open}
                                setCurrentPlan={setCurrentPlan}
                                setEditIndex={setEditIndex}
                                setFloorPlans={setFloorPlans}
                                setOpen={setOpen}
                                transactionType={transactionType}
                                entityType={entityType}
                                role={role}
                                bookingAmount={bookingAmount}
                                setBookingAmount={setBookingAmount}
                            />
                        }


                        {
                            formCount === 4 &&
                            <FormDetailsFour
                                dropdownConfigs={dropdownConfigs}
                                totalNo={totalNo}
                                setTotalNo={setTotalNo}
                                purpose={purpose}
                                setPurpose={setPurpose}
                                floorNo={floorNo}
                                setFloorNo={setFloorNo}
                                totalBedroom={totalBedroom}
                                setTotalBedroom={setTotalBedroom}
                                totalBalcony={totalBalcony}
                                setTotalBalcony={setTotalBalcony}
                                totalBathroom={totalBathroom}
                                setTotalBathroom={setTotalBathroom}
                                furnishingStatus={furnishingStatus}
                                setFurnishingStatus={setFurnishingStatus}
                                sampleFlat={sampleFlat}
                                setSampleFlat={setSampleFlat}
                                coveredParking={coveredParking}
                                setCoveredParking={setCoveredParking}
                                ownership={ownership}
                                setOwnership={setOwnership}
                                certification={certification}
                                setCertification={setCertification}
                                extraRoomTypes={extraRoomTypes}
                                setExtraRoomTypes={setExtraRoomTypes}
                                handleSelectionChangeChip={handleSelectionChangeChip}
                                handleSelectionChangeChip2={handleSelectionChangeChip2}
                                amenities={amenities}
                                option={option}
                                availableOffers={availableOffers}
                                setAvailableOffers={setAvailableOffers}
                                banks={banks}
                                setBanks={setBanks}
                                editContacts={editContacts}
                                editIndexx={editIndexx}
                                handleEditContact={handleEditContact}
                                handleFormSubmit={handleFormSubmit}
                                handleOpenChange={handleOpenChange}
                                handleRemoveSavedContact={handleRemoveSavedContact}
                                openn={openn}
                                savedContacts={savedContacts}
                                setEditContacts={setEditContacts}
                                setEditIndexx={setEditIndexx}
                                setOpenn={setOpenn}
                                setSavedContacts={setSavedContacts}
                                transactionType={transactionType}
                                entityType={entityType}
                                role={role}
                                amenitiesdata={amenitiesdata}
                                highlights={highlights}

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

export default Flat;


interface FormFlat1Props {
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
    bookingAmount: string,
    setBookingAmount: (value: string) => void,
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
    noOfTowers: string,
    setNoOfTowers: (value: string) => void,
    maintainenceCharges: string,
    setMaintainenceCharges: (value: string) => void,
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
    setOpen: any
    transactionType: any
    entityType: any
    role: any

}
const FormFlat1 = ({
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
    bookingAmount,
    setBookingAmount,
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
    noOfTowers,
    setNoOfTowers,
    maintainenceCharges,
    setMaintainenceCharges,
    n,
    setN,
    handleClick,
    fileInputRef,
    handleFileChange, brochure, removePdf,
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
    setEditIndex, setFloorPlans, setOpen, entityType, transactionType, role
}: FormFlat1Props) => {


    return (
        <div className='mt-3 space-y-3'>

            {/* <BasicListingAddressForm
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
            /> */}
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
                (transactionType === "sale" && role === "builder") &&
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

            {!!floorPlans?.length
                &&
                <div className="flex flex-row gap-3 py-2 overflow-x-auto">
                    {floorPlans.map((i: any, index: any) => (
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
                        Total Units
                    </label>
                    <InputBox
                        name="Total Units"
                        value={totalUnits}
                        onChange={setTotalUnits}
                        placeholder="Total units"
                        className="mt-1"
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Area
                    </label>
                    <InputBox
                        name="Area"
                        value={area}
                        onChange={setArea}
                        placeholder="Area"
                        className="mt-1"
                    />
                </div>
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
                        name="Price per Sqft."
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
                        onChange={setFacingDirection}
                        placeholder={dropdownConfigs[3].placeholder}
                        label={dropdownConfigs[3].label}
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        No of Towers/Blocks
                    </label>
                    <InputBox
                        name="No of Towers/Blocks"
                        value={noOfTowers}
                        onChange={setNoOfTowers}
                        placeholder="No of towers/blocks"
                        className="mt-1"
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

interface FormFlat2Props {
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
    setSavedContacts: any
    transactionType: any
    entityType: any
    role: any
    amenitiesdata: any
    highlights: any
}
const FormFlat2 = ({ dropdownConfigs, totalNo, setTotalNo, purpose, setPurpose, floorNo, setFloorNo, totalBedroom, setTotalBedroom
    , totalBalcony, setTotalBalcony, totalBathroom, setTotalBathroom, furnishingStatus, setFurnishingStatus,
    sampleFlat, setSampleFlat,
    coveredParking, setCoveredParking,
    setOwnership, ownership, certification, setCertification, setExtraRoomTypes, extraRoomTypes,
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
    entityType,
    transactionType, role, amenitiesdata, highlights
}: FormFlat2Props) => {


    return (
        <div className='space-y-3'>
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
            }
            <div className='flex flex-row gap-4'>
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


                {
                    (transactionType === "sale" || role === "Agent") &&
                    <div className='flex flex-col flex-1'>
                        <DropdownMenuCustom
                            key={dropdownConfigs[11].key}
                            options={dropdownConfigs[11].options}
                            value={sampleFlat}
                            onChange={setSampleFlat}
                            placeholder={dropdownConfigs[11].placeholder}
                            label={dropdownConfigs[11].label}
                        />
                    </div>
                }
            </div>
            <div className='flex flex-row gap-4'>
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
            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[14].key}
                        options={dropdownConfigs[14].options}
                        value={extraRoomTypes}
                        onChange={(value) => setExtraRoomTypes(value as string[])} // ✅ store array
                        placeholder={dropdownConfigs[14].placeholder}
                        label={dropdownConfigs[14].label}
                        className="max-w-sm"
                    />
                </div>
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
            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[15].key}
                        options={dropdownConfigs[15].options}
                        value={availableOffers}
                        onChange={(value) => setAvailableOffers(value)} // ✅ store array
                        placeholder={dropdownConfigs[15].placeholder}
                        label={dropdownConfigs[15].label}
                        className="max-w-sm"
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[16].key}
                        options={dropdownConfigs[16].options}
                        value={banks} // ✅ array state
                        onChange={(value) => setBanks(value)}
                        placeholder={dropdownConfigs[16].placeholder}
                        label={dropdownConfigs[16].label}
                        className="max-w-sm"
                    />
                </div>
            </div>

            <div className='flex flex-row gap-4 my-8'>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm mb-2 font-medium text-gray-700">
                        Amenities
                    </label>
                    {/* <ChipList amenities={amenities} onChange={handleSelectionChangeChip} /> */}
                    <div className="flex flex-wrap gap-2">
                        {amenities?.map((amenity: Amenity) => (
                            <div
                                key={amenity.label}
                                className={`flex items-center px-3 py-1 rounded-full cursor-pointer transition-colors duration-200 ${amenitiesdata?.includes(amenity.label)
                                    ? 'bg-black text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                onClick={() => handleSelectionChangeChip(amenity.label)}
                            >
                                {/* Placeholder for icon */}
                                {/* <span className="mr-2">{amenity.icon}</span> */}
                                <span className='text-[12px]'>{amenity.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='flex flex-row gap-4 '>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm mb-2 font-medium text-gray-700">
                        Highlight Tags
                    </label>
                    {/* <ChipList amenities={option} onChange={handleSelectionChangeChip2} /> */}
                    <div className="flex flex-wrap gap-2">
                        {option?.map((o: Amenity) => (
                            <div
                                key={o.label}
                                className={`flex items-center px-3 py-1 rounded-full cursor-pointer transition-colors duration-200 ${highlights?.includes(o.label)
                                    ? 'bg-black text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                onClick={() => handleSelectionChangeChip2(o.label)}
                            >
                                {/* Placeholder for icon */}
                                {/* <span className="mr-2">{amenity.icon}</span> */}
                                <span className='text-[12px]'>{o.label}</span>
                            </div>
                        ))}
                    </div>
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

interface FormDetailsThreeProps {
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
    bookingAmount: string,
    setBookingAmount: (value: string) => void,
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
    noOfTowers: string,
    setNoOfTowers: (value: string) => void,
    maintainenceCharges: string,
    setMaintainenceCharges: (value: string) => void,
    n: any,
    setN: any,
    handleClick: any,
    fileInputRef: any,
    handleFileChange: any
    brochure: any
    removePdf: any,
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
    setOpen: any
    transactionType: any
    entityType: any
    role: any

}

const FormDetailsThree = ({
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
    bookingAmount,
    setBookingAmount,
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
    noOfTowers,
    setNoOfTowers,
    maintainenceCharges,
    setMaintainenceCharges,
    n,
    setN,
    handleClick,
    fileInputRef,
    handleFileChange, brochure, removePdf,
    currentPlan,
    editIndex,
    floorPlans,
    handleAddOrUpdate,
    handleEditPlan,
    handleRemovePlan,
    open,
    setCurrentPlan,
    setEditIndex, setFloorPlans, setOpen, entityType, transactionType, role
}: FormDetailsThreeProps) => {
    return (
        <div className='space-y-3'>
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
                (transactionType === "sale" && role === "builder") &&
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

            {!!floorPlans?.length
                &&
                <div className="flex flex-row gap-3 py-2 overflow-x-auto">
                    {floorPlans.map((i: any, index: any) => (
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
                        Total Units
                    </label>
                    <InputBox
                        name="Total Units"
                        value={totalUnits}
                        onChange={setTotalUnits}
                        placeholder="Total units"
                        className="mt-1"
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Area
                    </label>
                    <InputBox
                        name="Area"
                        value={area}
                        onChange={setArea}
                        placeholder="Area"
                        className="mt-1"
                    />
                </div>
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
                        name="Price per Sqft."
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
                        onChange={setFacingDirection}
                        placeholder={dropdownConfigs[3].placeholder}
                        label={dropdownConfigs[3].label}
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        No of Towers/Blocks
                    </label>
                    <InputBox
                        name="No of Towers/Blocks"
                        value={noOfTowers}
                        onChange={setNoOfTowers}
                        placeholder="No of towers/blocks"
                        className="mt-1"
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


interface FormDetailsFourProps {
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
    setSavedContacts: any
    transactionType: any
    entityType: any
    role: any
    amenitiesdata: any
    highlights: any
}
const FormDetailsFour = ({
    dropdownConfigs, totalNo, setTotalNo, purpose, setPurpose, floorNo, setFloorNo, totalBedroom, setTotalBedroom
    , totalBalcony, setTotalBalcony, totalBathroom, setTotalBathroom, furnishingStatus, setFurnishingStatus,
    sampleFlat, setSampleFlat,
    coveredParking, setCoveredParking,
    setOwnership, ownership, certification, setCertification, setExtraRoomTypes, extraRoomTypes,
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
    entityType,
    transactionType, role, amenitiesdata, highlights
}: FormDetailsFourProps) => {
    return (
        <div className='space-y-3'>
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
            }
            <div className='flex flex-row gap-4'>
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


                {
                    (transactionType === "sale" || role === "Agent") &&
                    <div className='flex flex-col flex-1'>
                        <DropdownMenuCustom
                            key={dropdownConfigs[11].key}
                            options={dropdownConfigs[11].options}
                            value={sampleFlat}
                            onChange={setSampleFlat}
                            placeholder={dropdownConfigs[11].placeholder}
                            label={dropdownConfigs[11].label}
                        />
                    </div>
                }
            </div>
            <div className='flex flex-row gap-4'>
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
            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[14].key}
                        options={dropdownConfigs[14].options}
                        value={extraRoomTypes}
                        onChange={(value) => setExtraRoomTypes(value as string[])} // ✅ store array
                        placeholder={dropdownConfigs[14].placeholder}
                        label={dropdownConfigs[14].label}
                        className="max-w-sm"
                    />
                </div>
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
            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[15].key}
                        options={dropdownConfigs[15].options}
                        value={availableOffers}
                        onChange={(value) => setAvailableOffers(value)} // ✅ store array
                        placeholder={dropdownConfigs[15].placeholder}
                        label={dropdownConfigs[15].label}
                        className="max-w-sm"
                    />
                </div>
                <div className='flex flex-col flex-1'>
                    <MultiSelectDropdown
                        key={dropdownConfigs[16].key}
                        options={dropdownConfigs[16].options}
                        value={banks} // ✅ array state
                        onChange={(value) => setBanks(value)}
                        placeholder={dropdownConfigs[16].placeholder}
                        label={dropdownConfigs[16].label}
                        className="max-w-sm"
                    />
                </div>
            </div>

            <div className='flex flex-row gap-4 my-8'>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm mb-2 font-medium text-gray-700">
                        Amenities
                    </label>
                    {/* <ChipList amenities={amenities} onChange={handleSelectionChangeChip} /> */}
                    <div className="flex flex-wrap gap-2">
                        {amenities?.map((amenity: Amenity) => (
                            <div
                                key={amenity.label}
                                className={`flex items-center px-3 py-1 rounded-full cursor-pointer transition-colors duration-200 ${amenitiesdata?.includes(amenity.label)
                                    ? 'bg-black text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                onClick={() => handleSelectionChangeChip(amenity.label)}
                            >
                                {/* Placeholder for icon */}
                                {/* <span className="mr-2">{amenity.icon}</span> */}
                                <span className='text-[12px]'>{amenity.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='flex flex-row gap-4 '>
                <div className='flex flex-col flex-1'>
                    <label className="block text-sm mb-2 font-medium text-gray-700">
                        Highlight Tags
                    </label>
                    {/* <ChipList amenities={option} onChange={handleSelectionChangeChip2} /> */}
                    <div className="flex flex-wrap gap-2">
                        {option?.map((o: Amenity) => (
                            <div
                                key={o.label}
                                className={`flex items-center px-3 py-1 rounded-full cursor-pointer transition-colors duration-200 ${highlights?.includes(o.label)
                                    ? 'bg-black text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                onClick={() => handleSelectionChangeChip2(o.label)}
                            >
                                {/* Placeholder for icon */}
                                {/* <span className="mr-2">{amenity.icon}</span> */}
                                <span className='text-[12px]'>{o.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="py-2">
                <div className="flex flex-row items-center flex-1 gap-4">
                    <label className="underline underline-offset-4 block text-sm font-medium text-gray-700">
                        Additional Contacts
                    </label>
                    <Dialog open={openn} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <button className="border border-black w-[20px] flex justify-center items-center h-[20px] rounded-full">
                                <Plus className='h-5 w-5' />
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
                                    <Edit2 className='h-5 w-5' />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSavedContact(index)}
                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                    <Trash2 className='h-5 w-5' />
                                </button>
                            </div>
                            <h1 className="text-sm  font-medium">Name: {item.name}</h1>
                            <h1 className="text-sm  font-medium">Mobile: {item.mobile}</h1>
                            {item.email && (
                                <h1 className="text-sm  font-medium">Email: {item.email}</h1>
                            )}
                        </div>

                    ))}
                </div>
            </div>
        </div>
    )
}
