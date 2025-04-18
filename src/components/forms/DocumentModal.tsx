'use client';

import { X } from 'lucide-react';

interface DocumentModalProps {
  document: {
    data: string;
    filename: string;
    contentType: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentModal({ document, isOpen, onClose }: DocumentModalProps) {
  if (!isOpen || !document) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] w-[90vw] relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h3 className="text-lg font-medium mb-4 pr-8">{document.filename}</h3>
        
        <div className="overflow-auto max-h-[calc(90vh-100px)]">
          {document.contentType.includes('pdf') ? (
            <iframe 
              src={document.data} 
              className="w-full h-[70vh]" 
              title={document.filename}
            />
          ) : (
            <img 
              src={document.data} 
              alt={document.filename} 
              className="max-w-full max-h-[70vh] mx-auto object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}