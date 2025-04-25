"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { X, Save, RefreshCw, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize PDF.js worker
// Use the worker from the public directory
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.js';

interface ContractSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  classType: string;
}

// Map of class types to file names and display names
const contractsMap: Record<string, { fileName: string; displayName: string }> = {
  "class4": {
    fileName: "StudentContractClass4.pdf",
    displayName: "Class 4 Student Contract",
  },
  "class5": {
    fileName: "StudentContractClass5.pdf",
    displayName: "Class 5 Student Contract",
  },
  "class7": {
    fileName: "StudentContractClass7.pdf",
    displayName: "Class 7 Student Contract",
  },
};

const ContractSignModal: React.FC<ContractSignModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  classType,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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
  
  const signatureRef = useRef<SignatureCanvas>(null);
  const formattedClassType = classType.replace(/\s+/g, "");
  const contractInfo = contractsMap[formattedClassType];

  // Load the PDF when the component mounts
  useEffect(() => {
    if (isOpen && contractInfo) {
      const loadPdf = async () => {
        try {
          setIsLoading(true);
          setPdfError(null);
          
          const response = await fetch(`/api/contracts/files/${contractInfo.fileName}`);
          if (!response.ok) {
            throw new Error(`Failed to load PDF: ${response.statusText}`);
          }
          
          // Get the PDF as ArrayBuffer for pdf-lib (for signing)
          const arrayBuffer = await response.arrayBuffer();
          setPdfBytes(arrayBuffer);
          
          // Create a URL for react-pdf (for viewing)
          setPdfUrl(`/api/contracts/files/${contractInfo.fileName}`);
          
          setIsLoading(false);
        } catch (err) {
          console.error("Error loading PDF:", err);
          setError("Failed to load contract PDF");
          setPdfError(err instanceof Error ? err : new Error("Unknown error loading PDF"));
          setIsLoading(false);
        }
      };
      
      loadPdf();
    }
  }, [isOpen, contractInfo]);

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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

  // Clear the signature pad
  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  // Save the signature and combine with PDF
  const handleSave = async () => {
    if (!signatureRef.current || !pdfBytes) return;

    // Check if signature pad is empty
    if (signatureRef.current.isEmpty()) {
      setError("Please sign the contract before submitting");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Get signature as base64 data URL
      const signatureDataUrl = signatureRef.current.toDataURL();
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Get all pages of the document
      const pages = pdfDoc.getPages();
      // Get the last page of the document
      const lastPage = pages[pages.length - 1];
      
      // Convert the signature to an image
      const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
      
      // Get page dimensions of the last page
      const { width, height } = lastPage.getSize();
      
      // Determine y-coordinate based on class type
      let signatureYPosition = 470; // Default for class5 and class7
      if (formattedClassType === "class4") {
        signatureYPosition = 230;
      }
      
      // Add the signature to the PDF
      lastPage.drawImage(signatureImage, {
        x: width / 2 - 100, // Center the signature horizontally
        y: signatureYPosition, // Position based on class type
        width: 200, // Width of the signature
        height: 30, // Height of the signature
      });
      
      // Save the PDF
      const signedPdfBytes = await pdfDoc.save();
      
      // Convert to base64 for sending to the server
      const signedPdfBase64 = Buffer.from(signedPdfBytes).toString('base64');

      // Send to API
      const response = await fetch("/api/booking", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          signature: {
            data: signedPdfBase64,
            date: new Date(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save signature");
      }

      setSuccess("Contract signed successfully");
      
      // Trigger a refresh of the bookings in both admin and instructor views
      // This will update the admin and instructor views without requiring a page reload
      try {
        // Refresh admin view
        await fetch("/api/booking?status=approved");
        
        // Refresh instructor view
        await fetch(`/api/booking?instructorId=${bookingId.split('-')[0]}&status=approved`);
        
        // Broadcast a message to all open windows/tabs to refresh their data
        // This will notify both admin and instructor views about the signature update
        window.postMessage({
          type: "SIGNATURE_UPDATED",
          bookingId,
          timestamp: new Date().toISOString()
        }, window.location.origin);
      } catch (refreshError) {
        console.error("Error refreshing bookings:", refreshError);
        // Continue with normal flow even if refresh fails
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error saving signature:", err);
      setError(err instanceof Error ? err.message : "Failed to save signature");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      setPageNumber(1);
      // Reset scale based on screen size
      if (window.innerWidth < 640) {
        setScale(1.0);
      } else {
        setScale(1.5);
      }
      setRotation(0);
      if (signatureRef.current) {
        signatureRef.current.clear();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b">
          <h2 className="text-xl font-semibold">
            {contractInfo ? contractInfo.displayName : "Contract"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2 sm:p-4 flex flex-col">
          {/* Contract Display */}
          {contractInfo ? (
            <div className="flex-1 min-h-[250px] sm:min-h-[300px] border rounded p-1 sm:p-2">
              {isLoading && (
                <div className="flex justify-center items-center h-[300px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
              )}
              
              {pdfError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-center">
                  <p>Failed to load contract PDF. Please try again later.</p>
                </div>
              )}
              
              {pdfUrl && !pdfError && (
                <div className="flex flex-col items-center">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex justify-center items-center h-[300px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                      </div>
                    }
                    error={
                      <div className="p-4 bg-red-50 border border-red-200 rounded text-center">
                        <p>Failed to load contract PDF. Please try again later.</p>
                      </div>
                    }
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      scale={scale}
                      rotate={rotation}
                      className="shadow-lg text-lg text-blue-600"
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
                    
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <button 
                        onClick={previousPage} 
                        className="p-1 rounded hover:bg-gray-100"
                        disabled={pageNumber <= 1}
                      >
                        <ChevronLeft size={16} className={pageNumber <= 1 ? "text-gray-400" : "text-gray-700"} />
                      </button>
                      
                      <span className="text-sm sm:text-xl">
                        Page {pageNumber} of {numPages}
                      </span>
                      
                      <button 
                        onClick={nextPage} 
                        className="p-1 rounded hover:bg-gray-100"
                        disabled={pageNumber >= (numPages || 1)}
                      >
                        <ChevronRight size={16} className={pageNumber >= (numPages || 1) ? "text-gray-400" : "text-gray-700"} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Signature Pad - Only show on the last page */}
                  {numPages && pageNumber === numPages && (
                    <div className="w-full mt-4 sm:mt-6 border-t pt-2 sm:pt-4">
                      <h3 className="font-medium mb-1 sm:mb-2 text-center">Sign Contract</h3>
                      <div className="border rounded p-1 sm:p-2 bg-gray-50">
                        <SignatureCanvas
                          ref={signatureRef}
                          canvasProps={{
                            className: "w-full h-32 sm:h-40 bg-white border rounded",
                          }}
                          backgroundColor="white"
                        />
                      </div>
                      <div className="flex justify-between mt-1 sm:mt-2">
                        <button
                          onClick={handleClear}
                          className="text-sm text-gray-600 flex items-center"
                          disabled={isSaving}
                        >
                          <RefreshCw size={16} className="mr-1" /> Clear
                        </button>
                        <button
                          onClick={handleSave}
                          className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            "Saving..."
                          ) : (
                            <>
                              <Save size={16} className="mr-2" /> Sign Contract
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p>Contract not found for this class type.</p>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractSignModal;