"use client";

import { X } from "lucide-react";

interface PriceUpdateModalProps {
  price: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (e: React.FormEvent) => void;
  onPriceChange: (field: string, value: any) => void;
}

const PriceUpdateModal = ({ price, isOpen, onClose, onUpdate, onPriceChange }: PriceUpdateModalProps) => {
  if (!isOpen || !price) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-yellow-600">Update Price</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Class Type</label>
            <select
              value={price.classType}
              onChange={(e) => onPriceChange('classType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              required
            >
              <option value="class 7">Class 7</option>
              <option value="class 5">Class 5</option>
              <option value="class 4">Class 4</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Duration (minutes)</label>
            <select
              value={price.duration}
              onChange={(e) => onPriceChange('duration', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              required
            >
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes (Road Test)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Package</label>
            <select
              value={price.package}
              onChange={(e) => onPriceChange('package', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              required
            >
              <option value="1 lesson">1 Lesson</option>
              <option value="3 lessons">3 Lessons</option>
              <option value="10 lessons">10 Lessons</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={price.price}
              onChange={(e) => onPriceChange('price', parseFloat(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              required
            />
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
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-colors shadow-md"
            >
              Update Price
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PriceUpdateModal;