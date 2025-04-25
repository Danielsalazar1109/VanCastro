'use client';

import { useState, useEffect } from 'react';
import { X, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize PDF.js worker
// Use the worker from the npm package
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  // Use a responsive scale - smaller on mobile to prevent overflow
  const [scale, setScale] = useState<number>(1.0);
  
  // Set scale based on screen size when component mounts
  useEffect(() => {
    const handleResize = () => {
      // Use smaller scale on mobile devices
      if (window.innerWidth < 640) { // sm breakpoint in Tailwind
        setScale(1.0);
      } else {
        setScale(1.5);
      }
    };
    
    // Set initial scale
    handleResize();
    
    // Update scale when window is resized
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pdfError, setPdfError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (signature?.data) {
      setIsLoading(true);
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
          setPdfError(error instanceof Error ? error : new Error('Error formatting PDF data'));
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

  // PDF viewer functions
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError(error);
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b">
          <div className="flex items-center">
            <FileText className="mr-2 text-yellow-600" size={20} />
            <h2 className="text-xl font-semibold">Signed Contract</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2 sm:p-4 flex flex-col">
          <p className="text-sm text-gray-500 mb-2 sm:mb-4">Signed on: {formattedDate}</p>
          
          <div className="flex-1 min-h-[300px] border rounded p-2">
            {isLoading && (
              <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            )}
            
            {pdfError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-center">
                <p>Failed to load signed contract. Please try again later.</p>
              </div>
            )}
            
            {pdfDataUrl && !pdfError && (
              <div className="flex flex-col items-center">
                <Document
                  file={pdfDataUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex justify-center items-center h-[300px]">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                    </div>
                  }
                  error={
                    <div className="p-4 bg-red-50 border border-red-200 rounded text-center">
                      <p>Failed to load signed contract. Please try again later.</p>
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
                
                <div className="flex flex-col sm:flex-row sm:justify-between items-center w-full mt-2 sm:mt-4 px-1 sm:px-2 space-y-2 sm:space-y-0">
                  <div className="flex space-x-2">
                    <button 
                      onClick={zoomOut} 
                      className="p-1 rounded hover:bg-gray-100"
                      disabled={scale <= 0.5}
                    >
                      <ZoomOut size={16} className={scale <= 0.5 ? "text-gray-400" : "text-gray-700"} />
                    </button>
                    <button 
                      onClick={zoomIn} 
                      className="p-1 rounded hover:bg-gray-100"
                      disabled={scale >= 3.0}
                    >
                      <ZoomIn size={16} className={scale >= 3.0 ? "text-gray-400" : "text-gray-700"} />
                    </button>
                    <button 
                      onClick={rotate} 
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <RotateCw size={16} className="text-gray-700" />
                    </button>
                  </div>
                  
                  {numPages && numPages > 1 && (
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <button 
                        onClick={previousPage} 
                        className="p-1 rounded hover:bg-gray-100"
                        disabled={pageNumber <= 1}
                      >
                        <ChevronLeft size={16} className={pageNumber <= 1 ? "text-gray-400" : "text-gray-700"} />
                      </button>
                      
                      <span className="text-sm sm:text-xl">
                        Page {pageNumber} of {numPages || 1}
                      </span>
                      
                      <button 
                        onClick={nextPage} 
                        className="p-1 rounded hover:bg-gray-100"
                        disabled={pageNumber >= (numPages || 1)}
                      >
                        <ChevronRight size={16} className={pageNumber >= (numPages || 1) ? "text-gray-400" : "text-gray-700"} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}