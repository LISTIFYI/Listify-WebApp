'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react'; // For caret icon

interface Option {
    value: string;
    label: string;
}

interface MultiSelectDropdownProps {
    options?: Option[];
    value?: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    options = [],
    value = [],
    onChange,
    placeholder = 'Select options',
    label,
    disabled = false,
    className = '',
}) => {
    // Handle individual option toggle
    const handleToggle = (optionValue: string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter((v) => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (value.length === options.length) {
            onChange([]); // Deselect all
        } else {
            onChange(options.map((option) => option.value)); // Select all
        }
    };

    // Get display text for selected options
    const getDisplayText = () => {
        if (value.length === 0) return placeholder;
        if (value.length === options.length) return 'All selected';
        const selectedLabels = value
            .map((v) => options.find((o) => o.value === v)?.label)
            .filter(Boolean);
        return selectedLabels.length > 2
            ? `${selectedLabels.slice(0, 2).join(', ')} +${selectedLabels.length - 2}`
            : selectedLabels.join(', ');
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <Label
                    htmlFor={`multi-select-${label?.toLowerCase().replace(/\s/g, '-')}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                </Label>
            )}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={`
              w-full h-10 px-3  text-left text-sm font-normal
              border border-gray-300 rounded-md
              bg-white ${value.length === 0 ? "text-gray-500" : "text-black"}
              focus:ring-0  
              disabled:opacity-50 disabled:cursor-not-allowed
              flex justify-between items-center
              hover:bg-gray-50
            `}
                        disabled={disabled}
                        id={`multi-select-${label ? label.toLowerCase().replace(/\s/g, '-') : 'dropdown'}`}
                        role="combobox"
                        aria-expanded="false"
                        aria-haspopup="listbox"
                    >
                        <span className="truncate text-sm text-ellipsis">{getDisplayText()}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-2 max-h-60 overflow-y-auto" align="start">
                    <div className="space-y-1">
                        {options.length > 1 && (
                            <div className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 rounded">
                                <Checkbox
                                    id="select-all"
                                    checked={value.length === options.length}
                                    onCheckedChange={handleSelectAll}
                                    disabled={disabled}
                                />
                                <Label htmlFor="select-all" className="text-sm">
                                    Select All
                                </Label>
                            </div>
                        )}
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 rounded"
                            >
                                <Checkbox
                                    id={option.value}
                                    checked={value.includes(option.value)}
                                    onCheckedChange={() => handleToggle(option.value)}
                                    disabled={disabled}
                                />
                                <Label htmlFor={option.value} className="text-[12px] md:text-sm lg:text-sm">
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default MultiSelectDropdown;