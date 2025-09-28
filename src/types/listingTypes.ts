export interface Option {
    value: string;
    label: string;
}

export interface DropdownConfig {
    key: keyof Selections;
    label: string;
    placeholder: string;
    options: Option[];
    isMulti?: boolean; // Determines if the dropdown is multi-select
}

export interface Selections {
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
export interface Amenity {
    icon: string;
    label: string;
    selected?: boolean;
}

export interface OptionTag {
    label: string;
    icon: string;
}