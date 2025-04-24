'use client';

import { X, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SignatureModalProps {
  signature: {
    data: string;
    date?: Date;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SignatureModal({ signature, isOpen, onClose }: SignatureModalProps) {
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  
  useEffect(() => {
    if (signature?.data) {
      // Check if the data is already a data URL
      if (signature.data.startsWith('data:')) {
        setPdfDataUrl(signature.data);
      } else {
        // Convert base64 to data URL for PDF
        try {
          // Make sure we have a clean base64 string (remove any prefixes if present)
          const base64Data = signature.data.replace(/^data:application\/pdf;base64,/, '');
          setPdfDataUrl(`data:application/pdf;base64,${base64Data}`);
        } catch (error) {
          console.error('Error formatting PDF data:', error);
        }
      }
    }
  }, [signature]);

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
      <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] w-[90vw] relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center mb-4 pr-8">
          <FileText className="mr-2 text-yellow-600" size={24} />
          <h3 className="text-lg font-medium">Signed Contract Document</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Signed on: {formattedDate}</p>
        
        <div className="overflow-hidden border rounded-lg bg-gray-50 h-[calc(90vh-150px)]">
          {pdfDataUrl ? (
            <iframe 
              src={pdfDataUrl}
              className="w-full h-full"
              title="Signed Contract"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading document...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}