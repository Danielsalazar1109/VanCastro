'use client';

import { X } from 'lucide-react';

interface SignatureModalProps {
  signature: {
    data: string;
    date?: Date;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SignatureModal({ signature, isOpen, onClose }: SignatureModalProps) {
  if (!isOpen || !signature) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format the date if available
  const formattedDate = signature.date 
    ? new Date(signature.date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Unknown date';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[90vh] w-[90vw] relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h3 className="text-lg font-medium mb-4 pr-8">Signature</h3>
        <p className="text-sm text-gray-500 mb-4">Signed on: {formattedDate}</p>
        
        <div className="overflow-auto max-h-[calc(90vh-150px)] border rounded-lg p-4 bg-gray-50">
          <img 
            src={signature.data} 
            alt="Signature" 
            className="max-w-full max-h-[60vh] mx-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}