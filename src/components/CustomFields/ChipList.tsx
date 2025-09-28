import React, { useState } from 'react';

interface Amenity {
    icon: string;
    label: string;
}

interface ChipProps {
    icon: string;
    label: string;
    isSelected?: boolean;
    onChange?: (label: string, isSelected: boolean) => void;
}

interface ChipListProps {
    amenities: Amenity[];
    onChange?: (selectedChips: Record<string, boolean>) => void;
}

const Chip: React.FC<ChipProps> = ({ icon, label, isSelected = false, onChange = () => { } }) => {
    const handleClick = () => {
        onChange(label, !isSelected);
    };

    return (
        <button
            onClick={handleClick}
            className={`inline-flex items-center border px-4 py-1.5 mr-1 rounded-full text-[12px] font-medium transition-colors ${isSelected
                ? 'bg-black text-white hover:bg-black'
                : ' text-gray-800 hover:bg-gray-200'
                }`}
        >
            {/* <span className={`mr-2 ${icon}`} aria-hidden="true"></span> */}
            <span className=''>{label}</span>
        </button>
    );
};

const ChipList: React.FC<ChipListProps> = ({ amenities, onChange = () => { } }) => {
    const [selectedChips, setSelectedChips] = useState<Record<string, boolean>>({});

    const handleChipChange = (label: string, isSelected: boolean) => {
        const updatedSelection = { ...selectedChips, [label]: isSelected };
        setSelectedChips(updatedSelection);
        onChange(updatedSelection);
    };

    return (
        <div className="flex flex-wrap gap-x-2 gap-y-2">
            {amenities.map((amenity, index) => (
                <Chip
                    key={index}
                    icon={amenity.icon}
                    label={amenity.label}
                    isSelected={selectedChips[amenity.label] ?? false}
                    onChange={handleChipChange}
                />
            ))}
        </div>
    );
};

export { Chip, ChipList };