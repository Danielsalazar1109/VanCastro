'use client';

import React, { useState } from 'react';
import FAQQuestion from './faqQuestion';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  question?: string;
  answer: string;
  note?: string;
}

interface FAQContainerProps {
  title: string;
  items: FAQItem[];
}

const FAQContainer: React.FC<FAQContainerProps> = ({ title, items }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="border border-gray-200 overflow-hidden">
      <button
        className="w-full p-4 text-left font-semibold border-l-4 border-yellow-400 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className='text-2xl'>{title}</span>
        <ChevronDown className="w-6 h-6" />
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {items.map((item, index) => (
            <FAQQuestion 
              key={index} 
              question={item.question} 
              answer={item.answer} 
              note={item.note}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQContainer;