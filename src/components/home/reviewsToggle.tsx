'use client';
import { useState } from 'react';
import GoogleReviews from '@/components/home/googleReviews';
import AlumniGrid from '@/components/home/alumniGrid';
import VideoReview from '@/components/home/videoReview';

export default function ReviewsToggle() {
  const [activeTab, setActiveTab] = useState('google');
  
  const tabs = [
    { id: 'alumni', label: 'Alumni Review', component: <AlumniGrid /> },
    { id: 'google', label: 'Google Review', component: <GoogleReviews /> },
    { id: 'video', label: 'Video Review', component: <VideoReview /> }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-full p-1 flex justify-between max-w-xl mx-auto mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
                py-2 px-6 
                rounded-full 
                font-medium 
                transition-all 
                text-xl
                ${activeTab === tab.id ? 'bg-yellow-300' : 'hover:bg-gray-700'}
                ${activeTab === tab.id ? 'text-black' : 'text-white'}
              `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="review-content">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}