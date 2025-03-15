import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface FAQQuestionProps {
  question?: string;
  answer: string | React.ReactNode;
  note?: string | React.ReactNode;
}

const FAQQuestion: React.FC<FAQQuestionProps> = ({ question, answer, note }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const shouldShowContent = !question || isExpanded;

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      {question ? (
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg mb-2">{question}</h3>
          <button
            className="text-xl font-bold text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      ) : null}
      
      {shouldShowContent && (
        <div className="text-gray-600 mt-2">
          {answer}
          
          {note && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 rounded">
              <div className="flex items-center mb-1">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="font-bold">Note</span>
              </div>
              <div className="ml-7">{note}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FAQQuestion;