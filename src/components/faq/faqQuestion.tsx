import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface FAQQuestionProps {
  question?: string;
  answer: string | React.ReactNode;
  note?: string | React.ReactNode;
  alwaysExpanded?: boolean;
}

const FAQQuestion: React.FC<FAQQuestionProps> = ({ question, answer, note, alwaysExpanded }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(alwaysExpanded || false);

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      {question && !alwaysExpanded && (
        <div className="flex justify-between items-center pl-8">
          <button
            className="text-xl font-bold focus:outline-none"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'} {question}
          </button>
        </div>
      )}

      {alwaysExpanded ? (
        <div className="ml-8 mt-2">
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
      ) : (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="overflow-hidden ml-8"
        >
          <div className="mt-2">
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
        </motion.div>
      )}
    </div>
  );
};

export default FAQQuestion;
