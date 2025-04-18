'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Check, Eye, RefreshCw } from 'lucide-react';
import DocumentModal from './DocumentModal';

interface DocumentUploadProps {
  bookingId?: string;
  userId?: string;
  initialDocument?: {
    data: string;
    filename: string;
    contentType: string;
  } | null;
  onUploadSuccess?: (document: { data: string; filename: string; contentType: string }) => void;
  label?: string;
  className?: string;
}

export default function DocumentUpload({
  bookingId,
  userId,
  initialDocument = null,
  onUploadSuccess,
  label = "Upload Yellow Paper or Driving License",
  className = ""
}: DocumentUploadProps) {
  const [document, setDocument] = useState<{ data: string; filename: string; contentType: string } | null>(initialDocument);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialDocument) {
      setDocument(initialDocument);
    }
  }, [initialDocument]);

  // Fetch user document if userId is provided and no initialDocument
  useEffect(() => {
    const fetchUserDocument = async () => {
      if (userId && !initialDocument && !document) {
        setIsLoadingDocument(true);
        try {
          console.log(`[DocumentUpload] Fetching document for user ID: ${userId}`);
          const response = await fetch(`/api/users?userId=${userId}`);
          const data = await response.json();
          
          if (response.ok && data.users && data.users.length > 0) {
            const user = data.users[0];
            if (user.document) {
              console.log(`[DocumentUpload] Document found for user ID: ${userId}`);
              setDocument(user.document);
            } else {
              console.log(`[DocumentUpload] No document found for user ID: ${userId}`);
            }
          }
        } catch (error) {
          console.error('[DocumentUpload] Error fetching user document:', error);
        } finally {
          setIsLoadingDocument(false);
        }
      }
    };

    fetchUserDocument();
  }, [userId, initialDocument, document]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`[DocumentUpload] Starting upload process for file: ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Check if file is PDF or image
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      console.log(`[DocumentUpload] File type validation failed: ${file.type} is not a PDF or image`);
      setError('Please upload a PDF or image file');
      return;
    }

    // Check file size (limit to 10MB to stay safely under MongoDB's 16MB limit after base64 encoding)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      console.log(`[DocumentUpload] File size validation failed: ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds 10MB limit`);
      setError('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log(`[DocumentUpload] Converting file to base64: ${file.name}`);
      // Convert file to base64
      const base64 = await convertFileToBase64(file);
      console.log(`[DocumentUpload] File converted to base64 successfully. Base64 length: ${base64.length} characters`);
      
      // Create document object
      const newDocument = {
        data: base64,
        filename: file.name,
        contentType: file.type
      };

      // Update both booking and user documents when possible
      if (bookingId) {
        console.log(`[DocumentUpload] Updating document for booking ID: ${bookingId}`);
        
        // Get the booking to find the associated user
        console.log(`[DocumentUpload] Fetching booking details for ID: ${bookingId}`);
        const bookingResponse = await fetch(`/api/booking?bookingId=${bookingId}`);
        
        if (!bookingResponse.ok) {
          const errorData = await bookingResponse.json();
          console.error(`[DocumentUpload] Failed to fetch booking: ${bookingResponse.status} - ${JSON.stringify(errorData)}`);
          throw new Error(`Failed to fetch booking: ${errorData.error || bookingResponse.statusText}`);
        }
        
        const bookingData = await bookingResponse.json();
        console.log(`[DocumentUpload] Booking data retrieved: ${JSON.stringify(bookingData, (key, value) => 
          key === 'data' ? '[BASE64_DATA]' : value)}`);
        
        if (bookingData.booking && bookingData.booking.user && bookingData.booking.user._id) {
          const userId = bookingData.booking.user._id;
          console.log(`[DocumentUpload] Updating user document for user ID: ${userId}`);
          // Update the user document as well
          try {
            await updateUserDocument(userId, newDocument);
            console.log(`[DocumentUpload] User document updated successfully for user ID: ${userId}`);
          } catch (userUpdateError) {
            console.error(`[DocumentUpload] Failed to update user document: ${userUpdateError}`);
            throw userUpdateError;
          }
        } else {
          console.log(`[DocumentUpload] No user associated with booking or user ID not found`);
        }
        
        // Update the booking document
        try {
          await updateBookingDocument(bookingId, newDocument);
          console.log(`[DocumentUpload] Booking document updated successfully for booking ID: ${bookingId}`);
        } catch (bookingUpdateError) {
          console.error(`[DocumentUpload] Failed to update booking document: ${bookingUpdateError}`);
          throw bookingUpdateError;
        }
      } 
      else if (userId) {
        console.log(`[DocumentUpload] Updating document for user ID: ${userId}`);
        
        // Update the user document
        try {
          await updateUserDocument(userId, newDocument);
          console.log(`[DocumentUpload] User document updated successfully for user ID: ${userId}`);
        } catch (userUpdateError) {
          console.error(`[DocumentUpload] Failed to update user document: ${userUpdateError}`);
          throw userUpdateError;
        }
        
        // Get all bookings for this user and update them too
        console.log(`[DocumentUpload] Fetching bookings for user ID: ${userId}`);
        const bookingsResponse = await fetch(`/api/booking?userId=${userId}`);
        
        if (!bookingsResponse.ok) {
          const errorData = await bookingsResponse.json();
          console.error(`[DocumentUpload] Failed to fetch user bookings: ${bookingsResponse.status} - ${JSON.stringify(errorData)}`);
          throw new Error(`Failed to fetch user bookings: ${errorData.error || bookingsResponse.statusText}`);
        }
        
        const bookingsData = await bookingsResponse.json();
        console.log(`[DocumentUpload] Found ${bookingsData.bookings?.length || 0} bookings for user ID: ${userId}`);
        
        if (bookingsData.bookings && bookingsData.bookings.length > 0) {
          // Update all bookings for this user
          for (const booking of bookingsData.bookings) {
            console.log(`[DocumentUpload] Updating document for booking ID: ${booking._id}`);
            try {
              await updateBookingDocument(booking._id, newDocument);
              console.log(`[DocumentUpload] Booking document updated successfully for booking ID: ${booking._id}`);
            } catch (bookingUpdateError) {
              console.error(`[DocumentUpload] Failed to update booking document: ${bookingUpdateError}`);
              throw bookingUpdateError;
            }
          }
        }
      } else {
        console.log(`[DocumentUpload] No bookingId or userId provided, document will not be saved to database`);
      }

      console.log(`[DocumentUpload] Document upload completed successfully`);
      setDocument(newDocument);
      
      if (onUploadSuccess) {
        onUploadSuccess(newDocument);
        console.log(`[DocumentUpload] onUploadSuccess callback executed`);
      }
    } catch (err: any) {
      console.error(`[DocumentUpload] Error uploading document:`, err);
      // Provide more detailed error message to the user
      let errorMessage = 'Failed to upload document. ';
      
      if (err.message) {
        errorMessage += err.message;
        console.error(`[DocumentUpload] Error message: ${err.message}`);
      }
      
      if (err.stack) {
        console.error(`[DocumentUpload] Error stack: ${err.stack}`);
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      console.log(`[DocumentUpload] Upload process completed (success or failure)`);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log(`[DocumentUpload] Starting file to base64 conversion for ${file.name}`);
      const reader = new FileReader();
      
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          console.log(`[DocumentUpload] File read complete. Base64 string length: ${result.length} characters`);
          
          // Additional check for base64 string size
          if (result.length > 21 * 1024 * 1024) { // ~21MB in characters (roughly 16MB after accounting for base64 overhead)
            console.error(`[DocumentUpload] Base64 string too large: ${(result.length / 1024 / 1024).toFixed(2)}MB exceeds limit`);
            reject(new Error('Encoded file size is too large for database storage'));
            return;
          }
          
          console.log(`[DocumentUpload] Base64 conversion successful`);
          resolve(result);
        } catch (error) {
          console.error(`[DocumentUpload] Error in FileReader onload handler:`, error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error(`[DocumentUpload] FileReader error:`, error);
        reject(error);
      };
      
      reader.onabort = () => {
        console.error(`[DocumentUpload] FileReader operation aborted`);
        reject(new Error('File reading aborted'));
      };
    });
  };

  const updateBookingDocument = async (bookingId: string, document: { data: string; filename: string; contentType: string } | null) => {
    console.log(`[DocumentUpload] Sending PATCH request to update booking document for booking ID: ${bookingId}`);
    
    try {
      const response = await fetch(`/api/booking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          document
        }),
      });

      console.log(`[DocumentUpload] Booking API response status: ${response.status}`);
      
      if (!response.ok) {
        const data = await response.json();
        console.error(`[DocumentUpload] Booking API error response: ${JSON.stringify(data)}`);
        throw new Error(data.error || `Failed to update booking document (Status: ${response.status})`);
      }
      
      const responseData = await response.json();
      console.log(`[DocumentUpload] Booking document update successful: ${JSON.stringify(responseData, (key, value) => 
        key === 'data' ? '[BASE64_DATA]' : value)}`);
      
      return responseData;
    } catch (error) {
      console.error(`[DocumentUpload] Error in updateBookingDocument:`, error);
      throw error;
    }
  };

  const updateUserDocument = async (userId: string, document: { data: string; filename: string; contentType: string } | null) => {
    console.log(`[DocumentUpload] Sending PATCH request to update user document for user ID: ${userId}`);
    
    try {
      const response = await fetch(`/api/users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          document
        }),
      });

      console.log(`[DocumentUpload] User API response status: ${response.status}`);
      
      if (!response.ok) {
        const data = await response.json();
        console.error(`[DocumentUpload] User API error response: ${JSON.stringify(data)}`);
        throw new Error(data.error || `Failed to update user document (Status: ${response.status})`);
      }
      
      const responseData = await response.json();
      console.log(`[DocumentUpload] User document update successful: ${JSON.stringify(responseData, (key, value) => 
        key === 'data' ? '[BASE64_DATA]' : value)}`);
      
      return responseData;
    } catch (error) {
      console.error(`[DocumentUpload] Error in updateUserDocument:`, error);
      throw error;
    }
  };

  const handleRemoveDocument = async () => {
    console.log(`[DocumentUpload] Starting document removal process`);
    try {
      setIsUploading(true);
      setError(null);

      // Remove document from both booking and user when possible
      if (bookingId) {
        console.log(`[DocumentUpload] Removing document for booking ID: ${bookingId}`);
        
        // Get the booking to find the associated user
        console.log(`[DocumentUpload] Fetching booking details for ID: ${bookingId}`);
        const bookingResponse = await fetch(`/api/booking?bookingId=${bookingId}`);
        
        if (!bookingResponse.ok) {
          const errorData = await bookingResponse.json();
          console.error(`[DocumentUpload] Failed to fetch booking: ${bookingResponse.status} - ${JSON.stringify(errorData)}`);
          throw new Error(`Failed to fetch booking: ${errorData.error || bookingResponse.statusText}`);
        }
        
        const bookingData = await bookingResponse.json();
        console.log(`[DocumentUpload] Booking data retrieved for document removal`);
        
        if (bookingData.booking && bookingData.booking.user && bookingData.booking.user._id) {
          const userId = bookingData.booking.user._id;
          console.log(`[DocumentUpload] Removing document for user ID: ${userId}`);
          // Remove the document from the user as well
          try {
            await updateUserDocument(userId, null);
            console.log(`[DocumentUpload] User document removed successfully for user ID: ${userId}`);
          } catch (userUpdateError) {
            console.error(`[DocumentUpload] Failed to remove user document: ${userUpdateError}`);
            throw userUpdateError;
          }
        }
        
        // Remove the document from the booking
        try {
          await updateBookingDocument(bookingId, null);
          console.log(`[DocumentUpload] Booking document removed successfully for booking ID: ${bookingId}`);
        } catch (bookingUpdateError) {
          console.error(`[DocumentUpload] Failed to remove booking document: ${bookingUpdateError}`);
          throw bookingUpdateError;
        }
      } 
      else if (userId) {
        console.log(`[DocumentUpload] Removing document for user ID: ${userId}`);
        
        // Remove the document from the user
        try {
          await updateUserDocument(userId, null);
          console.log(`[DocumentUpload] User document removed successfully for user ID: ${userId}`);
        } catch (userUpdateError) {
          console.error(`[DocumentUpload] Failed to remove user document: ${userUpdateError}`);
          throw userUpdateError;
        }
        
        // Get all bookings for this user and remove the document from them too
        console.log(`[DocumentUpload] Fetching bookings for user ID: ${userId}`);
        const bookingsResponse = await fetch(`/api/booking?userId=${userId}`);
        
        if (!bookingsResponse.ok) {
          const errorData = await bookingsResponse.json();
          console.error(`[DocumentUpload] Failed to fetch user bookings: ${bookingsResponse.status} - ${JSON.stringify(errorData)}`);
          throw new Error(`Failed to fetch user bookings: ${errorData.error || bookingsResponse.statusText}`);
        }
        
        const bookingsData = await bookingsResponse.json();
        console.log(`[DocumentUpload] Found ${bookingsData.bookings?.length || 0} bookings for user ID: ${userId}`);
        
        if (bookingsData.bookings && bookingsData.bookings.length > 0) {
          // Remove document from all bookings for this user
          for (const booking of bookingsData.bookings) {
            console.log(`[DocumentUpload] Removing document for booking ID: ${booking._id}`);
            try {
              await updateBookingDocument(booking._id, null);
              console.log(`[DocumentUpload] Booking document removed successfully for booking ID: ${booking._id}`);
            } catch (bookingUpdateError) {
              console.error(`[DocumentUpload] Failed to remove booking document: ${bookingUpdateError}`);
              throw bookingUpdateError;
            }
          }
        }
      } else {
        console.log(`[DocumentUpload] No bookingId or userId provided, nothing to remove from database`);
      }

      console.log(`[DocumentUpload] Document removal completed successfully`);
      setDocument(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        console.log(`[DocumentUpload] File input reset`);
      }
    } catch (err: any) {
      console.error(`[DocumentUpload] Error removing document:`, err);
      
      // Provide more detailed error message to the user
      let errorMessage = 'Failed to remove document. ';
      
      if (err.message) {
        errorMessage += err.message;
        console.error(`[DocumentUpload] Error message: ${err.message}`);
      }
      
      if (err.stack) {
        console.error(`[DocumentUpload] Error stack: ${err.stack}`);
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      console.log(`[DocumentUpload] Document removal process completed (success or failure)`);
    }
  };

  const openModal = () => {
    if (document) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const renderDocumentPreview = () => {
    if (!document) return null;

    if (document.contentType.includes('pdf')) {
      return (
        <div 
          className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
          onClick={openModal}
        >
          <FileText className="text-red-500" size={24} />
          <span className="text-sm truncate max-w-[200px]">{document.filename}</span>
          <Check className="text-green-500" size={16} />
          <Eye className="text-blue-500" size={16} />
        </div>
      );
    } else if (document.contentType.includes('image')) {
      return (
        <div className="relative cursor-pointer" onClick={openModal}>
          <img 
            src={document.data} 
            alt="Document preview" 
            className="max-h-32 max-w-full rounded-md object-contain"
          />
          <div className="absolute top-0 right-0 bg-green-500 rounded-full p-1">
            <Check className="text-white" size={12} />
          </div>
          <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
            <Eye className="text-white" size={12} />
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {isLoadingDocument ? (
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-500 mr-2"></div>
          Loading document...
        </div>
      ) : document ? (
        <div className="space-y-2">
          {renderDocumentPreview()}
          
          <div className="flex space-x-2 mt-2">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              disabled={isUploading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw size={16} className="mr-1" />
              Update
            </button>
            
            <button
              type="button"
              onClick={handleRemoveDocument}
              disabled={isUploading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <X size={16} className="mr-1" />
              Remove
            </button>
          </div>
          
          <input
            id="file-update"
            name="file-update"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isUploading}
          />
        </div>
      ) : (
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-yellow-400 transition-colors">
          <div className="space-y-1 text-center">
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={isUploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <div className="flex justify-center">
              <Upload className="text-gray-400" size={24} />
            </div>
            <p className="text-xs text-gray-500">
              PDF or image (JPG, PNG) - Max 10MB
            </p>
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="mt-2 text-sm text-gray-500">
          Uploading...
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <DocumentModal 
        document={document}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}