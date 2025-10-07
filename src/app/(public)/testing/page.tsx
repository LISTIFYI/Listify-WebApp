'use client';

import { useState } from 'react';
import DropdownMenuCustom from '@/components/CustomFields/DropdownMenuCustom';
import MultiSelectDropdown from '@/components/CustomFields/MultiDropdown';
import { ChipList } from '@/components/CustomFields/ChipList';
import BasicDetails from '@/components/Forms/BasicListingAddressForm/BasicListingAddressForm';

interface Option {
    value: string;
    label: string;
}

interface DropdownConfig {
    key: keyof Selections;
    label: string;
    placeholder: string;
    options: Option[];
    isMulti?: boolean; // Determines if the dropdown is multi-select
}

interface Selections {
    [key: string]: string | string[];
    status: string;
    age: string;
    direction: string;
    unitType: string;
    authority: string;
    flatAvail: string;
    purpose: string;
    furnishing: string;
    totalFloors: string;
    bedrooms: string;
    bathrooms: string;
    balconies: string;
    floorNo: string;
    ownership: string;
    coverParking: string;
    unitSizeRange: string;
    waterAvailability: string;
    electricityStatus: string;
    availabilityStatus: string;
    plotType: string;
    boundaryWall: string;
    cornerPlot: string;
    gatedCommunity: string;
    numberOfOpenSides: string;
    landUseZone: string;
    availOffers: string[];
    banks: string[];
    extraRoomTypes: string[];
    flooring: string[];
}

const dropdownConfigs: DropdownConfig[] = [
    {
        key: 'status',
        label: 'Construction Status',
        placeholder: 'Choose a construction status',
        options: [
            { value: 'New/Under Construction', label: 'New/Under Construction' },
            { value: 'Ready to Move', label: 'Ready to Move' },
            { value: 'Resale', label: 'Resale' },
        ],
    },
    {
        key: 'age',
        label: 'Property Age',
        placeholder: 'Choose property age',
        options: [
            { value: 'Less than 1 years', label: 'Less than 1 years (New Construction)' },
            { value: 'Less than 3 years', label: 'Less than 3 years (Recent)' },
            { value: 'Less than 5 years', label: 'Less than 5 years (Modern)' },
            { value: '5-10 Years', label: '5-10 years (Established)' },
            { value: '10+ Years', label: '10+ years (Mature)' },
        ],
    },
    {
        key: 'direction',
        label: 'Facing Direction',
        placeholder: 'Choose a facing direction',
        options: [
            { value: 'North', label: 'North' },
            { value: 'East', label: 'East' },
            { value: 'West', label: 'West' },
            { value: 'South', label: 'South' },
            { value: 'North-East', label: 'North-East' },
            { value: 'North-West', label: 'North-West' },
            { value: 'South-East', label: 'South-East' },
            { value: 'South-West', label: 'South-West' },
        ],
    },
    {
        key: 'unitType',
        label: 'Unit Type',
        placeholder: 'Choose a unit type',
        options: [
            { value: '1 BHK', label: '1 BHK' },
            { value: '2 BHK', label: '2 BHK' },
            { value: '3 BHK', label: '3 BHK' },
            { value: '4 BHK', label: '4 BHK' },
            { value: '4+ BHK', label: '4+ BHK' },
        ],
    },
    {
        key: 'authority',
        label: 'Approval Authority',
        placeholder: 'Choose an approval authority',
        options: [
            { value: 'BDA', label: 'BDA' },
            { value: 'BBMP', label: 'BBMP' },
            { value: 'DTCP', label: 'DTCP' },
            { value: 'Panchayat', label: 'Panchayat' },
            { value: 'No Approval', label: 'No Approval' },
        ],
    },
    {
        key: 'flatAvail',
        label: 'Flat Availability',
        placeholder: 'Choose flat availability',
        options: [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
        ],
    },
    {
        key: 'purpose',
        label: 'Purpose',
        placeholder: 'Choose a purpose',
        options: [
            { value: 'Living', label: 'Living' },
            { value: 'Investment', label: 'Investment' },
        ],
    },
    {
        key: 'furnishing',
        label: 'Furnishing Status',
        placeholder: 'Choose furnishing status',
        options: [
            { value: 'Furnished', label: 'Furnished' },
            { value: 'Semi-Furnished', label: 'Semi-Furnished' },
            { value: 'Unfurnished', label: 'Unfurnished' },
        ],
    },
    {
        key: 'totalFloors',
        label: 'Total Floors',
        placeholder: 'Choose total floors',
        options: [
            { value: '1', label: '1 Floor' },
            { value: '2', label: '2 Floors' },
            { value: '3', label: '3 Floors' },
            { value: '4', label: '4 Floors' },
            { value: '5', label: '5 Floors' },
            { value: '10', label: '10 Floors' },
            { value: '15', label: '15 Floors' },
            { value: '20', label: '20 Floors' },
            { value: '20+', label: '20+ Floors' },
        ],
    },
    {
        key: 'bedrooms',
        label: 'Bedrooms',
        placeholder: 'Choose number of bedrooms',
        options: [
            { value: '1', label: '1 Bedroom' },
            { value: '2', label: '2 Bedrooms' },
            { value: '3', label: '3 Bedrooms' },
            { value: '4', label: '4 Bedrooms' },
            { value: '5+', label: '5+ Bedrooms' },
        ],
    },
    {
        key: 'bathrooms',
        label: 'Bathrooms',
        placeholder: 'Choose number of bathrooms',
        options: [
            { value: '1', label: '1 Bathroom' },
            { value: '2', label: '2 Bathrooms' },
            { value: '3', label: '3 Bathrooms' },
            { value: '4', label: '4 Bathrooms' },
            { value: '5+', label: '5+ Bathrooms' },
        ],
    },
    {
        key: 'balconies',
        label: 'Balconies',
        placeholder: 'Choose number of balconies',
        options: [
            { value: '0', label: 'No Balcony' },
            { value: '1', label: '1 Balcony' },
            { value: '2', label: '2 Balconies' },
            { value: '3', label: '3 Balconies' },
            { value: '4', label: '4 Balconies' },
            { value: '5+', label: '5+ Balconies' },
        ],
    },
    {
        key: 'floorNo',
        label: 'Floor Number',
        placeholder: 'Choose floor number',
        options: [
            { value: '1', label: '1 Floor' },
            { value: '2', label: '2 Floors' },
            { value: '3', label: '3 Floors' },
            { value: '4', label: '4 Floors' },
            { value: '5', label: '5 Floors' },
            { value: '10', label: '10 Floors' },
            { value: '15', label: '15 Floors' },
            { value: '20', label: '20 Floors' },
            { value: '20+', label: '20+ Floors' },
        ],
    },
    {
        key: 'ownership',
        label: 'Ownership Type',
        placeholder: 'Choose ownership type',
        options: [
            { value: 'Freehold', label: 'Freehold' },
            { value: 'Leasehold', label: 'Leasehold' },
            { value: 'Power Of Attorney', label: 'Power Of Attorney' },
            { value: 'Co-operative Society', label: 'Co-operative Society' },
        ],
    },
    {
        key: 'coverParking',
        label: 'Covered Parking',
        placeholder: 'Choose covered parking',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
        ],
    },
    {
        key: 'unitSizeRange',
        label: 'Unit Size Range',
        placeholder: 'Choose unit size range',
        options: [
            { value: 'Sqft', label: 'Sqft' },
            { value: 'Acre', label: 'Acre' },
            { value: 'Sq-ft', label: 'Sq-ft' },
            { value: 'Sq-yrd', label: 'Sq-yrd' },
            { value: 'Sq-m', label: 'Sq-m' },
            { value: 'Bigha', label: 'Bigha' },
            { value: 'Hectare', label: 'Hectare' },
            { value: 'Marla', label: 'Marla' },
            { value: 'Kanal', label: 'Kanal' },
            { value: 'Biswa1', label: 'Biswa1' },
            { value: 'Biswa2', label: 'Biswa2' },
            { value: 'Ground', label: 'Ground' },
            { value: 'Aankadam', label: 'Aankadam' },
            { value: 'Rood', label: 'Rood' },
            { value: 'Chatak', label: 'Chatak' },
            { value: 'Kottah', label: 'Kottah' },
            { value: 'Cent', label: 'Cent' },
            { value: 'Perch', label: 'Perch' },
            { value: 'Guntha', label: 'Guntha' },
            { value: 'Are', label: 'Are' },
            { value: 'Kuncham', label: 'Kuncham' },
            { value: 'Katha', label: 'Katha' },
            { value: 'Gaj', label: 'Gaj' },
            { value: 'Killa', label: 'Killa' },
        ],
    },
    {
        key: 'waterAvailability',
        label: 'Water Availability',
        placeholder: 'Choose water availability',
        options: [
            { value: '24 Hours Available', label: '24 Hours Available' },
            { value: 'Limited', label: 'Limited' },
            { value: 'Not Available', label: 'Not Available' },
        ],
    },
    {
        key: 'electricityStatus',
        label: 'Electricity Status',
        placeholder: 'Choose electricity status',
        options: [
            { value: 'Power Available', label: 'Power Available' },
            { value: 'Frequent Powercut', label: 'Frequent Powercut' },
            { value: 'Not Available', label: 'Not Available' },
        ],
    },
    {
        key: 'availabilityStatus',
        label: 'Availability Status',
        placeholder: 'Choose availability status',
        options: [
            { value: 'Immediate', label: 'Immediate' },
            { value: 'Within 3 months', label: 'Within 3 months' },
            { value: 'After 3 months', label: 'After 3 months' },
        ],
    },
    {
        key: 'plotType',
        label: 'Plot Type',
        placeholder: 'Choose plot type',
        options: [
            { value: 'Residential Plot', label: 'Residential Plot' },
            { value: 'Farm Land', label: 'Farm Land' },
            { value: 'Gated Community Plot', label: 'Gated Community Plot' },
            { value: 'Corner Plot', label: 'Corner Plot' },
            { value: 'Commercial Land', label: 'Commercial Land' },
        ],
    },
    {
        key: 'boundaryWall',
        label: 'Boundary Wall',
        placeholder: 'Choose boundary wall status',
        options: [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
        ],
    },
    {
        key: 'cornerPlot',
        label: 'Corner Plot',
        placeholder: 'Choose corner plot status',
        options: [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
        ],
    },
    {
        key: 'gatedCommunity',
        label: 'Gated Community',
        placeholder: 'Choose gated community status',
        options: [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
        ],
    },
    {
        key: 'numberOfOpenSides',
        label: 'Number of Open Sides',
        placeholder: 'Choose number of open sides',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
        ],
    },
    {
        key: 'landUseZone',
        label: 'Land Use Zone',
        placeholder: 'Choose land use zone',
        options: [
            { value: 'Residential', label: 'Residential' },
            { value: 'Commercial', label: 'Commercial' },
            { value: 'Industrial', label: 'Industrial' },
            { value: 'Agricultural', label: 'Agricultural' },
        ],
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
        key: 'flooring',
        label: 'Flooring',
        placeholder: 'Choose flooring types',
        options: [
            { value: 'vitrified', label: 'Vitrified' },
            { value: 'marble', label: 'Marble' },
        ],
        isMulti: true,
    },

];

const Testing = () => {
    const [selections, setSelections] = useState<Selections>({
        status: '',
        age: '',
        direction: '',
        unitType: '',
        authority: '',
        flatAvail: '',
        purpose: '',
        furnishing: '',
        totalFloors: '',
        bedrooms: '',
        bathrooms: '',
        balconies: '',
        floorNo: '',
        ownership: '',
        coverParking: '',
        unitSizeRange: '',
        waterAvailability: '',
        electricityStatus: '',
        availabilityStatus: '',
        plotType: '',
        boundaryWall: '',
        cornerPlot: '',
        gatedCommunity: '',
        numberOfOpenSides: '',
        landUseZone: '',
        availOffers: [],
        banks: [],
        extraRoomTypes: [],
        flooring: [],
    });

    const handleSelectionChange = (key: keyof Selections, value: string | string[]) => {
        setSelections((prev) => ({ ...prev, [key]: value }));
    };


    interface Amenity {
        icon: string;
        label: string;
        selected?: boolean;
    }

    const amenities: Amenity[] = [
        { icon: "waterIcon", label: "Water Connection" },
        { icon: "lightIcon", label: "Electricity" },
        { icon: "roadAccessIcon", label: "Road Access" },
        { icon: "drainageIcon", label: "Drainage" },
        { icon: "securityIcon", label: "Security" },
        { icon: "streetLightIcon", label: "Streetlight" },
    ];

    const amenities2: Amenity[] = [
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
    const amenities3: Amenity[] = [
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


    interface Option {
        label: string;
        icon: string;
    }

    const option: Option[] = [
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


    const option2: Option[] = [
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

    const option3: Option[] = [
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



    const handleSelectionChangeChip = (selectedChips: Record<string, boolean>) => {
        console.log('Selected amenities:', selectedChips);
    };

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Dropdown Testing</h1>
            <div className="grid grid-cols-4 gap-4">
                {dropdownConfigs.map((config) =>
                    config.isMulti ? (
                        <MultiSelectDropdown
                            key={config.key}
                            options={config.options}
                            value={selections[config.key] as string[]}
                            onChange={(value) => handleSelectionChange(config.key, value)}
                            placeholder={config.placeholder}
                            label={config.label}
                            className="max-w-sm"
                        />
                    ) : (
                        <DropdownMenuCustom
                            key={config.key}
                            options={config.options}
                            value={selections[config.key] as string}
                            onChange={(value) => handleSelectionChange(config.key, value)}
                            placeholder={config.placeholder}
                            label={config.label}
                            className="max-w-sm"
                        />
                    )
                )}
            </div>

            <div className='flex flex-col gap-4'>
                <ChipList amenities={amenities} onChange={handleSelectionChangeChip} />
                <ChipList amenities={amenities2} onChange={handleSelectionChangeChip} />
                <ChipList amenities={amenities3} onChange={handleSelectionChangeChip} />
            </div>


            <div className='flex flex-col gap-4'>
                <ChipList amenities={option} onChange={handleSelectionChangeChip} />
                <ChipList amenities={option2} onChange={handleSelectionChangeChip} />
                <ChipList amenities={option3} onChange={handleSelectionChangeChip} />
            </div>

            {/* <BasicDetails /> */}
        </div>
    );
};

export default Testing;