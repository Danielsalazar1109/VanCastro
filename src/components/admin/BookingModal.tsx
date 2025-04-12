"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface BookingModalProps {
  booking: {
    id: string;
    title: string;
    extendedProps: {
      location: string;
      classType: string;
      duration: number;
      student: string;
      instructor: string;
      paymentStatus?: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (bookingId: string) => void;
  onReschedule: (bookingId: string) => void;
  onSendInvoice?: (bookingId: string) => void;
  onApprovePayment?: (bookingId: string) => void;
  onRejectPayment?: (bookingId: string) => void;
}

const BookingModal = ({ 
  booking, 
  isOpen, 
  onClose, 
  onDelete, 
  onReschedule, 
  onSendInvoice, 
  onApprovePayment, 
  onRejectPayment 
}: BookingModalProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !booking) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !onSendInvoice) return;
    
    setIsUploading(true);
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('bookingId', booking.id);
      formData.append('invoiceNumber', invoiceNumber);
      formData.append('notes', notes);
      
      // Call the onSendInvoice callback with the booking ID
      await onSendInvoice(booking.id);
      
      // Close the upload modal
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setInvoiceNumber('');
      setNotes('');
    } catch (error) {
      console.error('Error uploading invoice:', error);
      alert('Failed to upload invoice. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to get payment status badge color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'invoice sent':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-pink-600">Booking Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 text-pink-500 mt-0.5"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div>
              <p className="font-medium text-gray-700">Student</p>
              <p className="text-gray-900">{booking.extendedProps.student}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 text-indigo-500 mt-0.5"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div>
              <p className="font-medium text-gray-700">Instructor</p>
              <p className="text-gray-900">{booking.extendedProps.instructor}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 text-purple-500 mt-0.5"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div>
              <p className="font-medium text-gray-700">Location</p>
              <p className="text-gray-900">{booking.extendedProps.location}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 text-blue-500 mt-0.5"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <p className="font-medium text-gray-700">Class Type</p>
              <p className="text-gray-900">{booking.extendedProps.classType}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 text-green-500 mt-0.5"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <div>
              <p className="font-medium text-gray-700">Duration</p>
              <p className="text-gray-900">{booking.extendedProps.duration} mins</p>
            </div>
          </div>
          
          {booking.extendedProps.paymentStatus && (
            <div className="flex items-start space-x-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-5 h-5 text-orange-500 mt-0.5"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <div>
                <p className="font-medium text-gray-700">Payment Status</p>
                <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(booking.extendedProps.paymentStatus)}`}>
                  {booking.extendedProps.paymentStatus}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 space-y-3">
          {/* Payment action buttons */}
          {booking.extendedProps.paymentStatus && (
            <div className="flex flex-wrap gap-2 justify-end">
              {booking.extendedProps.paymentStatus === 'requested' && onSendInvoice && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 transition-colors shadow-md"
                >
                  Upload & Send Invoice
                </button>
              )}
              
              {booking.extendedProps.paymentStatus === 'invoice sent' && (
                <>
                  {onApprovePayment && (
                    <button
                      onClick={() => {
                        onApprovePayment(booking.id);
                        onClose();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600 transition-colors shadow-md"
                    >
                      Approve Payment
                    </button>
                  )}
                  
                  {onRejectPayment && (
                    <button
                      onClick={() => {
                        onRejectPayment(booking.id);
                        onClose();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transition-colors shadow-md"
                    >
                      Reject Payment
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          
          {/* Standard booking action buttons */}
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onDelete(booking.id);
                onClose();
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transition-colors shadow-md"
            >
              Cancel Booking
            </button>
            <button
              onClick={() => {
                onReschedule(booking.id);
                onClose();
              }}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full hover:from-pink-600 hover:to-red-600 transition-colors shadow-md"
            >
              Reschedule Booking
            </button>
          </div>
        </div>
      </div>
      
      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-pink-600">Upload Invoice Document</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Invoice Document</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {selectedFile && (
                  <p className="mt-1 text-sm text-green-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Invoice Number (Optional)</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., INV-2023-001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Any additional information..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3 justify-end">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={!selectedFile || isUploading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 transition-colors shadow-md disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Upload & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingModal;