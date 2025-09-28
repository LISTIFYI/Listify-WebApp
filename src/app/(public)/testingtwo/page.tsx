import InputBox from '@/components/CustomFields/InputBox'
import MultiSelectDropdown from '@/components/CustomFields/MultiDropdown';
import React from 'react'
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
const dropdownConfigs: DropdownConfig[] = [
    {
        key: 'Type',
        label: 'Transaction Type',
        placeholder: 'Select Transaction Type',
        options: [
            { value: 'sale', label: 'Sale' },
            { value: 'resale', label: 'Resale' },
        ],
    },
    {
        key: 'PropertyType',
        label: 'Property Type',
        placeholder: 'Select Property Type',
        options: [
            { value: 'flat', label: 'Flat' },
            { value: 'villa', label: 'Villa' },
            { value: 'plot', label: 'Plot' },
        ],
    },
]

const Tesing2 = () => {


    return (
        <div className="border-[4px] border-red-400 h-full  flex flex-col">
            <div className="border-green-300 border-[4px] h-20"></div>
            <div className="border-blue-400 border-[10px] flex-1"></div>
        </div>

    )
}

export default Tesing2
