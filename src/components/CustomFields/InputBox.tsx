'use client';

import React, { ChangeEvent } from 'react';

interface InputBoxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    name?: string;
    disabled?: boolean;
    className?: string;
}

const InputBox: React.FC<InputBoxProps> = ({
    value,
    onChange,
    placeholder = 'Enter text',
    name,
    disabled = false,
    className = '',
}) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="w-full">
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                name={name}
                disabled={disabled}
                className={`
          w-full px-3 h-10 md:h-10 lg:h-10 text-[12px] md:text-sm lg:text-sm placeholder:text-[12px] placeholder:md:text-sm placeholder:lg:text-sm   border border-gray-300 rounded-sm
          focus:border-black focus:ring-0 focus:outline-none
          transition-colors duration-300 bg-white text-gray-900
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
            />
        </div>
    );
};

export default InputBox;