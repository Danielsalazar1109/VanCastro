'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, RefreshCw } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize PDF.js worker
// This only needs to be done once in your application
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentModalProps {
  document: {
    data: string;
    filename: string;
    contentType: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void; // New prop for handling document updates
}

export default function DocumentModal({ document, isOpen, onClose, onUpdate }: DocumentModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Reset state when document changes
  useEffect(() => {
    if (document) {
      setPageNumber(1);
      setScale(1.0);
      setRotation(0);
      setIsLoading(true);
      setError(null);
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError(error);
    setIsLoading(false);
  };

  const previousPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const nextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  const rotate = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] w-[90vw] relative">
        <div className="absolute top-2 right-2 flex space-x-2">
          {onUpdate && (
            <button 
              onClick={() => {
                onUpdate();
                onClose(); // Close modal after initiating update
              }}
              className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md px-2 py-1 flex items-center text-sm"
            >
              <RefreshCw size={16} className="mr-1" /> Update
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <h3 className="text-lg font-medium mb-4 pr-8">{document.filename}</h3>
        
        <div className="overflow-auto max-h-[calc(90vh-160px)]">
          {document.contentType.includes('pdf') ? (
            <div className="flex flex-col items-center">
              {isLoading && (
                <div className="flex justify-center items-center h-[50vh]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
              )}
              
              {error && (
                <div className="text-red-500 p-4 text-center">
                  Error loading PDF. Please try again later.
                </div>
              )}
              
              <Document
                file={document.data}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex justify-center items-center h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                  </div>
                }
                error={
                  <div className="text-red-500 p-4 text-center">
                    Error loading PDF. Please try again later.
                  </div>
                }
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  rotate={rotation}
                  className="shadow-lg"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <img 
                src={document.data} 
                alt={document.filename} 
                className="max-w-full max-h-[70vh] mx-auto object-contain"
              />
              
              {/* Add update button below image for better visibility */}
              {onUpdate && (
                <button 
                  onClick={() => {
                    onUpdate();
                    onClose(); // Close modal after initiating update
                  }}
                  className="mt-4 text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md px-4 py-2 flex items-center"
                >
                  <RefreshCw size={18} className="mr-2" /> Update Image
                </button>
              )}
            </div>
          )}
        </div>
        
        {document.contentType.includes('pdf') && numPages && (
          <div className="flex justify-between items-center mt-4 border-t pt-3">
            <div className="flex space-x-2">
              <button 
                onClick={zoomOut} 
                className="p-1 rounded hover:bg-gray-100"
                disabled={scale <= 0.5}
              >
                <ZoomOut size={20} className={scale <= 0.5 ? "text-gray-400" : "text-gray-700"} />
              </button>
              <button 
                onClick={zoomIn} 
                className="p-1 rounded hover:bg-gray-100"
                disabled={scale >= 3.0}
              >
                <ZoomIn size={20} className={scale >= 3.0 ? "text-gray-400" : "text-gray-700"} />
              </button>
              <button 
                onClick={rotate} 
                className="p-1 rounded hover:bg-gray-100"
              >
                <RotateCw size={20} className="text-gray-700" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={previousPage} 
                className="p-1 rounded hover:bg-gray-100"
                disabled={pageNumber <= 1}
              >
                <ChevronLeft size={20} className={pageNumber <= 1 ? "text-gray-400" : "text-gray-700"} />
              </button>
              
              <span className="text-sm">
                Page {pageNumber} of {numPages}
              </span>
              
              <button 
                onClick={nextPage} 
                className="p-1 rounded hover:bg-gray-100"
                disabled={pageNumber >= numPages}
              >
                <ChevronRight size={20} className={pageNumber >= numPages ? "text-gray-400" : "text-gray-700"} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}