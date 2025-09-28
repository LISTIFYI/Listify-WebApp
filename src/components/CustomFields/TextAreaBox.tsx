'use client';

import React, { ChangeEvent } from 'react';

interface TextareaBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

const TextAreaBox: React.FC<TextareaBoxProps> = ({
  value,
  onChange,
  placeholder = 'Enter text',
  name,
  disabled = false,
  className = '',
  rows = 4,
}) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        name={name}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-3 py-1.5 border text-sm border-gray-300 rounded-md
          focus:border-black focus:ring-0 focus:outline-none
          transition-colors duration-200 bg-white text-gray-900
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
      />
    </div>
  );
};

export default TextAreaBox;