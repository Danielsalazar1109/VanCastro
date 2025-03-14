import React from 'react';

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  durationPerLesson: string;
  includesCar: boolean;
  includesPickupDropoff: boolean;
  licenseType: string;
  locations: string[];
  isPopular?: boolean;
  onBookingClick?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  subtitle,
  price,
  durationPerLesson,
  includesCar,
  includesPickupDropoff,
  licenseType,
  locations,
  isPopular = false,
  onBookingClick = () => {}
}) => {
  return (
    <div className="border-2 border-yellow-400 rounded-lg p-6 flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-6">
        {isPopular && (
          <div className="bg-yellow-400 text-gray-800 font-bold py-1 px-4 rounded-full mx-auto mb-4 flex items-center justify-center w-56">
            <span className="text-lg mr-2">★</span>
            Most popular
            <span className="text-lg ml-2">★</span>
          </div>
        )}
        <h3 className="text-gray-700 font-medium">{title}</h3>
        <h2 className="text-4xl font-bold text-gray-800 mt-1">{subtitle}</h2>
      </div>
      
      {/* Content */}
      <div className="flex flex-col h-full">
        <div className="bg-yellow-50 rounded-full w-36 h-36 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl font-bold text-gray-800">${price}</span>
        </div>
        
        <ul className="mb-8 flex-grow">
          <li className="flex items-start mb-3">
            <span className="text-yellow-400 mr-2">●</span>
            <span className="text-gray-700">{durationPerLesson}</span>
          </li>
          
          {includesCar && (
            <li className="flex items-start mb-3">
              <span className="text-yellow-400 mr-2">●</span>
              <span className="text-gray-700">Include driving school car</span>
            </li>
          )}
          
          {includesPickupDropoff && (
            <li className="flex items-start mb-3">
              <span className="text-yellow-400 mr-2">●</span>
              <span className="text-gray-700">Pick-up and Drop-off</span>
            </li>
          )}
          
          <li className="flex items-start mb-3">
            <span className="text-yellow-400 mr-2">●</span>
            <span className="text-gray-700">{licenseType}</span>
          </li>
          
          <li className="flex items-start">
            <span className="text-yellow-400 mr-2">●</span>
            <span className="text-gray-700">
              Available at {locations.join(', ')}
            </span>
          </li>
        </ul>
        
        <button 
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-3 rounded-md transition-colors duration-200"
          onClick={onBookingClick}
        >
          Booking Now
        </button>
      </div>
    </div>
  );
};

export default PricingCard;