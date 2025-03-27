import React from 'react';
import Image from 'next/image';

interface CircularSelectorProps {
  label: string;
  options: {
    value: string;
    imageUrl: string;
    alt: string;
  }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const CircularSelector: React.FC<CircularSelectorProps> = ({ 
  label, 
  options, 
  selectedValue, 
  onChange 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-4">{label}</label>
      <div className="flex flex-wrap gap-4 justify-center">
        {options.map((option) => (
          <div>
          <div 
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              w-40 h-40 rounded-full flex items-center justify-center 
              cursor-pointer transition-all duration-300 
              border-2 relative overflow-hidden
              ${selectedValue === option.value 
                ? 'border-yellow-500 scale-110 shadow-lg' 
                : 'border-gray-300 hover:border-yellow-400 hover:scale-105'}
            `}
          >
            <Image
              src={option.imageUrl}
              alt={option.alt}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
            
            {selectedValue === option.value && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center z-10">
                ✓
              </div>

            )}
          </div>
          <h3 className="text-2xl font-bold text-center mt-4">{option.alt}</h3>
        </div>
        ))}
      </div>
    </div>
  );
};

export default CircularSelector;