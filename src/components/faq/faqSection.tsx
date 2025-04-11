import React from 'react';
import FAQContainer, { FAQItem } from './faqContainer';

export interface FAQContainerData {
  title: string;
  items: FAQItem[];
}

interface FAQSectionProps {
  title: string;
  description?: string;
  containers: FAQContainerData[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ title, description, containers }) => {
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">{title}</h1>
      {description && (
        <p className="text-center mb-8">{description}</p>
      )}

      <div className="space-y-4">
        {containers.map((container, index) => (
          <FAQContainer 
            key={index} 
            title={container.title} 
            items={container.items} 
          />
        ))}
      </div>
    </div>
  );
};

export default FAQSection;