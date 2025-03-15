import React, { useState } from 'react';
import FAQQuestion from './faqQuestion';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQContainerProps {
  title: string;
  items: FAQItem[];
}

const FAQContainer: React.FC<FAQContainerProps> = ({ title, items }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full p-4 text-left font-semibold flex justify-between items-center bg-gray-50 hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{title}</span>
        <span className="text-xl">▼</span>
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {items.map((item, index) => (
            <FAQQuestion 
              key={index} 
              question={item.question} 
              answer={item.answer} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQContainer;