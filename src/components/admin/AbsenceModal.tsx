"use client";

import { useState, useEffect } from "react";
import { X, Edit } from "lucide-react";

interface Instructor {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
  };
  locations?: string[] | Promise<string[]>;
  teachingLocations?: string[];
  classTypes: string[];
  availability?: {
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
  absences?: {
    startDate: Date | string;
    endDate: Date | string;
    reason?: string;
  }[];
  image?: string;
}

// Interface for absence modal
interface AbsenceModalProps {
  instructor: Instructor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const AbsenceModal = ({ 
  instructor, 
  isOpen, 
  onClose, 
  onSave 
}: AbsenceModalProps) => {
  const [absences, setAbsences] = useState<{startDate: string; endDate: string; reason: string}[]>([]);
  const [newStartDate, setNewStartDate] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [newReason, setNewReason] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [loadingSpecialAvailability, setLoadingSpecialAvailability] = useState<boolean>(false);
  const [specialAvailabilityDates, setSpecialAvailabilityDates] = useState<{startDate: string; endDate: string; days: string[]}[]>([]);
  const [editingAbsenceIndex, setEditingAbsenceIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editStartDate, setEditStartDate] = useState<string>('');
  const [editEndDate, setEditEndDate] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');

  useEffect(() => {
    if (instructor && instructor.absences) {
      // Format dates for input fields
      const formattedAbsences = instructor.absences.map((absence) => ({
        startDate: new Date(absence.startDate).toISOString().split('T')[0],
        endDate: new Date(absence.endDate).toISOString().split('T')[0],
        reason: absence.reason || ''
      }));
      setAbsences(formattedAbsences);
    } else {
      setAbsences([]);
    }

    // Set default dates for new absence
    const today = new Date();
    setNewStartDate(today.toISOString().split('T')[0]);
    
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    setNewEndDate(nextWeek.toISOString().split('T')[0]);
    
    // Fetch special availability date ranges with absences
    fetchSpecialAvailabilityWithAbsences();
  }, [instructor]);
  
  // Fetch special availability date ranges that contain absences
  const fetchSpecialAvailabilityWithAbsences = async () => {
    try {
      setLoadingSpecialAvailability(true);
      const response = await fetch('/api/special-availability');
      
      if (!response.ok) {
        throw new Error('Failed to fetch special availability settings');
      }
      
      const data = await response.json();
      
      if (data.specialAvailability) {
        // Group by date range and filter for those with absences
        const dateRangesWithAbsences = data.specialAvailability.reduce((acc: any, setting: any) => {
          if (!setting.isAvailable) { // This is an absence
            const key = `${setting.startDate}-${setting.endDate}`;
            if (!acc[key]) {
              acc[key] = {
                startDate: setting.startDate,
                endDate: setting.endDate,
                days: []
              };
            }
            acc[key].days.push(setting.day);
          }
          return acc;
        }, {});
        
        // Convert to array format
        const dateRanges = Object.values(dateRangesWithAbsences).map((range: any) => ({
          startDate: range.startDate,
          endDate: range.endDate,
          days: range.days
        }));
        
        setSpecialAvailabilityDates(dateRanges);
      }
      
      setLoadingSpecialAvailability(false);
    } catch (error) {
      console.error('Error fetching special availability with absences:', error);
      setLoadingSpecialAvailability(false);
    }
  };

  const handleAddAbsence = () => {
    if (!newStartDate || !newEndDate) return;
    
    setAbsences([...absences, {
      startDate: newStartDate,
      endDate: newEndDate,
      reason: newReason
    }]);
    
    // Reset form
    setNewReason('');
  };

  const handleEditAbsence = (index: number) => {
    const absence = absences[index];
    setEditStartDate(absence.startDate);
    setEditEndDate(absence.endDate);
    setEditReason(absence.reason || '');
    setEditingAbsenceIndex(index);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingAbsenceIndex === null) return;
    
    const updatedAbsences = [...absences];
    updatedAbsences[editingAbsenceIndex] = {
      startDate: editStartDate,
      endDate: editEndDate,
      reason: editReason
    };
    
    setAbsences(updatedAbsences);
    setIsEditModalOpen(false);
    setEditingAbsenceIndex(null);
  };

  const handleRemoveAbsence = (index: number) => {
    const updatedAbsences = [...absences];
    updatedAbsences.splice(index, 1);
    setAbsences(updatedAbsences);
  };

  const handleSaveAbsences = async () => {
    if (!instructor) return;
    
    try {
      setSaving(true);
      
      const response = await fetch('/api/instructors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorId: instructor._id,
          absences: absences.map(absence => ({
            startDate: absence.startDate,
            endDate: absence.endDate,
            reason: absence.reason
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update instructor absences');
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving instructor absences:', error);
      alert('Failed to save absences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !instructor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-yellow-600">
            Manage Absences for {instructor.user.firstName} {instructor.user.lastName}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-700">
              Set periods when this instructor will be unavailable. During these periods, the instructor will not appear in booking options.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-lg mb-3 text-yellow-600">Add New Absence Period</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
                <input
                  type="date"
                  value={newEndDate}
                  min = {newStartDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Reason (Optional)</label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Vacation, Training, etc."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 transition-all"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAddAbsence}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-colors shadow-md"
              >
                Add Absence
              </button>
            </div>
          </div>
          
          <h4 className="font-medium text-lg mb-3 text-yellow-600">Current Absence Periods</h4>
          {absences.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No absences scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {absences.map((absence, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {/* Fix for date display - ensure correct date is shown regardless of timezone */}
                      {(() => {
                        const startDate = new Date(absence.startDate);
                        const endDate = new Date(absence.endDate);
                        // Format dates using ISO string and extract just the date part
                        const formattedStartDate = startDate.toISOString().split('T')[0];
                        const formattedEndDate = endDate.toISOString().split('T')[0];
                        // Convert to display format (MM/DD/YYYY)
                        const displayStartDate = new Date(formattedStartDate + 'T00:00:00').toLocaleDateString();
                        const displayEndDate = new Date(formattedEndDate + 'T00:00:00').toLocaleDateString();
                        return `${displayStartDate} - ${displayEndDate}`;
                      })()}
                    </div>
                    {absence.reason && (
                      <div className="text-sm text-gray-600">
                        Reason: {absence.reason}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditAbsence(index)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRemoveAbsence(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Edit Absence Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-yellow-600">Edit Absence</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={editEndDate}
                    min = {editStartDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Reason (Optional)</label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Vacation, Training, etc."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 transition-all"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-colors shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAbsences}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600  text-white rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-colors shadow-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Absences"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbsenceModal;