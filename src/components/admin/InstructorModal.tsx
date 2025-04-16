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
  locations: string[] | Promise<string[]>;
  classTypes: string[];
  availability?: Availability[];
  absences?: {
    startDate: Date | string;
    endDate: Date | string;
    reason?: string;
  }[];
  image?: string;
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
  locations?: string[];
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