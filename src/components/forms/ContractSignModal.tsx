"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { X, Save, RefreshCw } from "lucide-react";
import { PDFDocument } from "pdf-lib";

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
  const signatureRef = useRef<SignatureCanvas>(null);
  const formattedClassType = classType.replace(/\s+/g, "");
  const contractInfo = contractsMap[formattedClassType];

  // Load the PDF when the component mounts
  useEffect(() => {
    if (isOpen && contractInfo) {
      const loadPdf = async () => {
        try {
          const response = await fetch(`/contracts/${contractInfo.fileName}`);
          if (!response.ok) {
            throw new Error(`Failed to load PDF: ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          setPdfBytes(arrayBuffer);
        } catch (err) {
          console.error("Error loading PDF:", err);
          setError("Failed to load contract PDF");
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
      if (signatureRef.current) {
        signatureRef.current.clear();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
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

        <div className="flex-1 overflow-auto p-4 flex flex-col">
          {/* Contract Display */}
          {contractInfo ? (
            <div className="mb-6 flex-1 min-h-[300px]">
              <iframe
                src={`/contracts/${contractInfo.fileName}`}
                className="w-full h-full min-h-[300px] border rounded"
                title={contractInfo.displayName}
              />
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p>Contract not found for this class type.</p>
            </div>
          )}

          {/* Signature Pad */}
          <div className="mt-4">
            <h3 className="font-medium mb-2">Sign Contract</h3>
            <div className="border rounded p-2 bg-gray-50">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: "w-full h-40 bg-white border rounded",
                }}
                backgroundColor="white"
              />
            </div>
            <div className="flex justify-between mt-2">
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