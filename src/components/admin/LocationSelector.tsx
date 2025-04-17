"use client";

import React from "react";

interface Location {
  _id: string;
  name: string;
  isActive: boolean;
}

interface LocationSelectorProps {
  selectedLocations: string[];
  onLocationChange: (location: string) => void;
  locations: Location[];
  locationMapping: { [key: string]: string[] };
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocations,
  onLocationChange,
  locations
}) => {
  // Filter to only show active locations
  const activeLocations = locations.filter(loc => loc.isActive);
  
  return (
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
      <div className="mb-2">
        <span className="text-xs text-gray-500">Select teaching locations:</span>
      </div>
      
      {/* Simple list of all locations with checkboxes */}
      <div className="space-y-2 mt-2">
        {activeLocations.map((location) => (
          <div 
            key={location.name} 
            className={`flex items-center p-2 rounded-md transition-colors ${
              selectedLocations.includes(location.name)
                ? 'bg-yellow-50 border border-yellow-200'
                : 'hover:bg-gray-100 border border-transparent'
            }`}
          >
            <input
              type="checkbox"
              id={`location-${location.name}`}
              checked={selectedLocations.includes(location.name)}
              onChange={() => onLocationChange(location.name)}
              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <label htmlFor={`location-${location.name}`} className="ml-2 block text-sm text-gray-700 flex-grow">
              {location.name}
            </label>
          </div>
        ))}
        
        {activeLocations.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-2">
            No active locations available
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;