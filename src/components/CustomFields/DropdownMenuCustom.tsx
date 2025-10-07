import * as React from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Option {
    value: string;
    label: string;
}

interface DropdownMenuCustomProps {
    options?: Option[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
}

const DropdownMenuCustom: React.FC<DropdownMenuCustomProps> = ({
    options = [],
    value,
    onChange,
    placeholder = 'Select an option',
    label,
    disabled = false,
    className = '',
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="w-full text-sm rounded-sm bg-white" style={{ height: "38px" }}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default DropdownMenuCustom;