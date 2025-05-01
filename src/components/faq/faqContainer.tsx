'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FAQQuestion from './faqQuestion';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  question?: string;
  answer: string;
  note?: string;
  alwaysExpanded?: boolean;
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
        className={`w-full p-4 text-left font-semibold border-l-4 ${
          isExpanded 
            ? 'bg-gray-100 border-yellow-200' 
            : 'bg-gray-50 border-yellow-400'
        } flex justify-between items-center active:bg-gray-100`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className='text-xl'>{title}</span>
        <ChevronDown 
          className={`w-6 h-6 transform transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Contenedor con animación de rebote */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 12 }}
        className="overflow-hidden"
      >
        <div className="p-4 space-y-4">
          {items.map((item, index) => (
            <FAQQuestion 
              key={index} 
              question={item.question} 
              answer={item.answer} 
              note={item.note}
              alwaysExpanded={item.alwaysExpanded}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FAQContainer;
