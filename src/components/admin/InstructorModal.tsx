"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

interface Availability {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Instructor {
  _id: string;
  user: User;
  locations?: string[] | Promise<string[]>;
  teachingLocations?: string[];
  classTypes: string[];
  availability?: Availability[];
  absences?: {
    startDate: Date | string;
    endDate: Date | string;
    reason?: string;
  }[];
  image?: string;
}

interface Location {
  _id: string;
  name: string;
  isActive: boolean;
}

interface InstructorModalProps {
  instructor: Instructor | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (e: React.FormEvent) => void;
  onInstructorChange: (field: string, value: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationChange?: (location: string) => void;
  onClassTypeChange?: (classType: string) => void;
  locations?: Location[];
  classTypes?: string[];
  locationMapping?: { [key: string]: string[] };
}

const InstructorModal = ({ 
  instructor, 
  isOpen, 
  onClose, 
  onUpdate, 
  onInstructorChange, 
  onImageUpload,
  onLocationChange,
  onClassTypeChange,
  locations,
  classTypes,
  locationMapping
}: InstructorModalProps) => {
  if (!isOpen || !instructor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-yellow-600">Edit Instructor</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">First Name</label>
            <input
              type="text"
              value={instructor.user.firstName}
              onChange={(e) => onInstructorChange('firstName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Last Name</label>
            <input
              type="text"
              value={instructor.user.lastName}
              onChange={(e) => onInstructorChange('lastName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={instructor.user.email}
              onChange={(e) => onInstructorChange('email', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
            <input
              type="tel"
              value={instructor.user.phone}
              onChange={(e) => onInstructorChange('phone', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Profile Image</label>
            <div className="flex items-center space-x-4">
              {instructor.image && (
                <img 
                  src={instructor.image} 
                  alt={`${instructor.user.firstName} ${instructor.user.lastName}`} 
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          {locations && locations.length > 0 && onLocationChange && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Teaching Locations</label>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Select where this instructor can teach:</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Select all locations
                        const allLocationNames = locations.map(loc => loc.name);
                        allLocationNames.forEach(name => {
                          if (!instructor.teachingLocations?.includes(name)) {
                            onLocationChange(name);
                          }
                        });
                      }}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Deselect all locations
                        const currentLocations = Array.isArray(instructor.teachingLocations) ? [...instructor.teachingLocations] : [];
                        currentLocations.forEach(name => {
                          onLocationChange(name);
                        });
                      }}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {locations.map((location) => (
                    <div 
                      key={location.name} 
                      className={`flex items-center p-2 rounded-md transition-colors ${
                        Array.isArray(instructor.teachingLocations) && instructor.teachingLocations.includes(location.name)
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`location-${location.name}`}
                        checked={Array.isArray(instructor.teachingLocations) ? instructor.teachingLocations.includes(location.name) : false}
                        onChange={() => onLocationChange(location.name)}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`location-${location.name}`} className="ml-2 block text-sm text-gray-700 flex-grow">
                        {location.name}
                      </label>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex space-x-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-colors shadow-md"
            >
              Update Instructor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorModal;