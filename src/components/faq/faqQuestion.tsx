import React, { useState } from 'react';

interface FAQQuestionProps {
  question: string;
  answer: string;
}

const FAQQuestion: React.FC<FAQQuestionProps> = ({ question, answer }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg mb-2">{question}</h3>
        <button 
          className="text-xl font-bold text-gray-500 hover:text-gray-700 focus:outline-none" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      {isExpanded && (
        <p className="text-gray-600 mt-2">{answer}</p>
      )}
    </div>
  );
};

export default FAQQuestion;