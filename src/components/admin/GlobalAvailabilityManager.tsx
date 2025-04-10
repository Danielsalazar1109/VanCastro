"use client";

import { useState, useEffect } from "react";

interface GlobalAvailability {
  _id?: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface SpecialAvailability {
  _id?: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  startDate: string;
  endDate: string;
}

export default function GlobalAvailabilityManager() {
  // State for regular global availability
  const [globalAvailability, setGlobalAvailability] = useState<GlobalAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  
  // State for special availability
  const [specialAvailability, setSpecialAvailability] = useState<SpecialAvailability[]>([]);
  const [loadingSpecial, setLoadingSpecial] = useState<boolean>(false);
  const [savingSpecial, setSavingSpecial] = useState<boolean>(false);
  const [showSpecialForm, setShowSpecialForm] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingDateRange, setEditingDateRange] = useState<{startDate: string, endDate: string} | null>(null);
  
  // Shared state
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'regular' | 'special'>('regular');
  
  // Special availability form state
  const [specialStartDate, setSpecialStartDate] = useState<string>("");
  const [specialEndDate, setSpecialEndDate] = useState<string>("");
  const [newSpecialSettings, setNewSpecialSettings] = useState<SpecialAvailability[]>([]);

  // Initialize
  useEffect(() => {
    fetchGlobalAvailability();
    fetchSpecialAvailability();
    
    // Set default dates for special availability
    const today = new Date();
    setSpecialStartDate(today.toISOString().split('T')[0]);
    
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    setSpecialEndDate(oneMonthLater.toISOString().split('T')[0]);
  }, []);

  // Check for overlapping date ranges
  const checkOverlappingDateRanges = (startDate: string, endDate: string): boolean => {
    // Skip checking against the current editing range
    if (isEditMode && editingDateRange && 
        editingDateRange.startDate === startDate && 
        editingDateRange.endDate === endDate) {
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Group special availability by date range
    const dateRanges = specialAvailability.reduce((acc, setting) => {
      const key = `${setting.startDate}-${setting.endDate}`;
      if (!acc[key]) {
        acc[key] = {
          startDate: new Date(setting.startDate),
          endDate: new Date(setting.endDate)
        };
      }
      return acc;
    }, {} as Record<string, { startDate: Date, endDate: Date }>);
    
    // Check if any existing date range overlaps with the new one
    return Object.values(dateRanges).some(range => {
      // Check if ranges overlap
      return (start <= range.endDate && end >= range.startDate);
    });
  };

  // Fetch regular global availability
  const fetchGlobalAvailability = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/global-availability');
      
      if (!response.ok) {
        throw new Error('Failed to fetch global availability settings');
      }
      
      const data = await response.json();
      
      // If we have data, use it
      if (data.globalAvailability && data.globalAvailability.length > 0) {
        setGlobalAvailability(data.globalAvailability);
      } else {
        // Otherwise initialize with default values - ensure days are in correct order
        // Sunday should be first to match JavaScript's Date.getUTCDay() which returns 0 for Sunday
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const defaultAvailability = daysOfWeek.map(day => ({
          day,
          startTime: '09:00', // Default start time: 9am
          endTime: '17:00',   // Default end time: 5pm
          isAvailable: day !== 'Sunday' // Default all days except Sunday to available
        }));
        setGlobalAvailability(defaultAvailability);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching global availability:', error);
      setError("Failed to load global availability settings");
      setLoading(false);
    }
  };

  // Fetch special availability settings
  const fetchSpecialAvailability = async () => {
    try {
      setLoadingSpecial(true);
      const response = await fetch('/api/special-availability');
      
      if (!response.ok) {
        throw new Error('Failed to fetch special availability settings');
      }
      
      const data = await response.json();
      
      if (data.specialAvailability) {
        setSpecialAvailability(data.specialAvailability);
      }
      
      setLoadingSpecial(false);
    } catch (error) {
      console.error('Error fetching special availability:', error);
      setError("Failed to load special availability settings");
      setLoadingSpecial(false);
    }
  };

  // Save regular global availability
  const handleSaveGlobalAvailability = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");
      
      const response = await fetch('/api/global-availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilitySettings: globalAvailability
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update global availability');
      }
      
      // Refresh the data to ensure UI is in sync with database
      await fetchGlobalAvailability();
      
      setSuccessMessage(`Default availability settings saved successfully.`);
      setSaving(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error: any) {
      console.error('Error saving global availability:', error);
      setError(error.message || "Failed to save global availability settings");
      setSaving(false);
    }
  };

  // Initialize new special settings form
  const handleInitializeSpecialSettings = () => {
    // Create a copy of the current global availability as a starting point
    const initialSpecialSettings = globalAvailability.map(item => ({
      ...item,
      startDate: specialStartDate,
      endDate: specialEndDate
    }));
    
    setNewSpecialSettings(initialSpecialSettings);
    setShowSpecialForm(true);
    setIsEditMode(false);
    setEditingDateRange(null);
  };

  // Initialize edit form for existing special settings
  const handleEditSpecialSettings = (startDate: string, endDate: string) => {
    // Find all settings with this date range
    const settingsToEdit = specialAvailability.filter(
      s => s.startDate === startDate && s.endDate === endDate
    );
    
    if (settingsToEdit.length > 0) {
      setSpecialStartDate(startDate);
      setSpecialEndDate(endDate);
      setNewSpecialSettings(settingsToEdit);
      setShowSpecialForm(true);
      setIsEditMode(true);
      setEditingDateRange({ startDate, endDate });
    }
  };

  // Save special availability settings
  const handleSaveSpecialAvailability = async () => {
    try {
      // Check for overlapping date ranges
      if (checkOverlappingDateRanges(specialStartDate, specialEndDate)) {
        setError("Cannot save: There is already a special date range that overlaps with these dates.");
        return;
      }

      setSavingSpecial(true);
      setError("");
      setSuccessMessage("");
      
      // If in edit mode, first delete the existing settings
      if (isEditMode && editingDateRange) {
        // Find all settings with this date range and delete them
        const settingsToDelete = specialAvailability.filter(
          s => s.startDate === editingDateRange.startDate && s.endDate === editingDateRange.endDate
        );
        
        // Delete each setting
        for (const setting of settingsToDelete) {
          if (setting._id) {
            await fetch(`/api/special-availability?id=${setting._id}`, {
              method: 'DELETE'
            });
          }
        }
      }
      
      // Then save the new or updated settings
      const response = await fetch('/api/special-availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilitySettings: newSpecialSettings
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update special availability');
      }
      
      // Refresh the data and reset form
      await fetchSpecialAvailability();
      setShowSpecialForm(false);
      setIsEditMode(false);
      setEditingDateRange(null);
      
      const actionText = isEditMode ? 'updated' : 'saved';
      setSuccessMessage(`Special availability settings ${actionText} successfully for ${new Date(specialStartDate).toLocaleDateString()} to ${new Date(specialEndDate).toLocaleDateString()}.`);
      setSavingSpecial(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error: any) {
      console.error('Error saving special availability:', error);
      setError(error.message || "Failed to save special availability settings");
      setSavingSpecial(false);
    }
  };

  // Delete a special availability setting
  const handleDeleteSpecialAvailability = async (id: string) => {
    try {
      setError("");
      
      const response = await fetch(`/api/special-availability?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete special availability');
      }
      
      // Refresh the data
      await fetchSpecialAvailability();
      
      setSuccessMessage(`Special availability setting deleted successfully.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error: any) {
      console.error('Error deleting special availability:', error);
      setError(error.message || "Failed to delete special availability setting");
    }
  };

  // Loading state
  if (loading && activeTab === 'regular') {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (loadingSpecial && activeTab === 'special') {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-xl text-red-800 shadow-sm">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-xl text-green-800 shadow-sm">
          {successMessage}
        </div>
      )}
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('regular')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'regular'
                  ? 'text-pink-600 border-b-2 border-pink-600 active'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'
              }`}
            >
              Default Availability
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('special')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'special'
                  ? 'text-pink-600 border-b-2 border-pink-600 active'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'
              }`}
            >
              Special Date Ranges
            </button>
          </li>
        </ul>
      </div>
      
      {/* Default Availability Tab */}
      {activeTab === 'regular' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-pink-100 mb-6">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-b border-pink-100">
            <h3 className="text-xl font-semibold text-pink-700">Default Availability Settings</h3>
            <p className="text-sm text-gray-600">
              Set the default days and hours available for bookings. These settings apply when no special date range is active.
            </p>
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {globalAvailability.map((day, index) => (
              <div
                key={day.day}
                className={`
                  border rounded-lg p-4
                  ${day.isAvailable
                    ? 'bg-green-50 border-green-200'
                    : 'bg-slate-50 border-slate-200'}
                `}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${day.isAvailable
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-300 text-slate-500'}
                    `}>
                      {day.day.charAt(0)}
                    </div>
                    <span className="font-medium">{day.day}</span>
                  </div>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.isAvailable}
                      onChange={(e) => {
                        const updatedAvailability = [...globalAvailability];
                        updatedAvailability[index] = {
                          ...updatedAvailability[index],
                          isAvailable: e.target.checked
                        };
                        setGlobalAvailability(updatedAvailability);
                      }}
                      className="hidden peer"
                    />
                    <div className={`
                      w-12 h-6 rounded-full relative transition-all duration-300
                      ${day.isAvailable
                        ? 'bg-green-500'
                        : 'bg-slate-300'}
                      after:content-[''] after:absolute after:top-1 
                      after:left-1 after:bg-white after:rounded-full
                      after:h-4 after:w-4
                      ${day.isAvailable
                        ? 'after:translate-x-6'
                        : 'after:translate-x-0'}
                      after:transition-all after:duration-300
                    `}></div>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => {
                        const updatedAvailability = [...globalAvailability];
                        updatedAvailability[index] = {
                          ...updatedAvailability[index],
                          startTime: e.target.value
                        };
                        setGlobalAvailability(updatedAvailability);
                      }}
                      min="00:00"
                      max="23:59"
                      disabled={!day.isAvailable}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-500 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => {
                        const updatedAvailability = [...globalAvailability];
                        updatedAvailability[index] = {
                          ...updatedAvailability[index],
                          endTime: e.target.value
                        };
                        setGlobalAvailability(updatedAvailability);
                      }}
                      disabled={!day.isAvailable}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-500 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end p-4 mt-4 border-t border-gray-100">
            <button
              onClick={handleSaveGlobalAvailability}
              disabled={saving}
              className={`
                px-6 py-3 rounded-full font-bold transition-all duration-300
                ${saving 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white hover:shadow-lg'}
              `}
            >
              {saving ? "Saving..." : "Save Default Availability"}
            </button>
          </div>
        </div>
      )}
      
      {/* Special Date Ranges Tab */}
      {activeTab === 'special' && (
        <div>
          {/* Existing Special Date Ranges */}
          {specialAvailability.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-pink-100 mb-6">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-b border-pink-100">
                <h3 className="text-xl font-semibold text-pink-700">Existing Special Date Ranges</h3>
                <p className="text-sm text-gray-600">
                  These special availability settings override the default settings during their date ranges.
                </p>
              </div>
              
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Range
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days Available
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(specialAvailability.reduce((acc, setting) => {
                        // Group by date range
                        const key = `${setting.startDate}-${setting.endDate}`;
                        if (!acc[key]) {
                          acc[key] = {
                            startDate: setting.startDate,
                            endDate: setting.endDate,
                            availableDays: [],
                            unavailableDays: []
                          };
                        }
                        if (setting.isAvailable) {
                          acc[key].availableDays.push(setting.day);
                        } else {
                          acc[key].unavailableDays.push(setting.day);
                        }
                        return acc;
                      }, {} as Record<string, { startDate: string, endDate: string, availableDays: string[], unavailableDays: string[] }>))
                      .map(([key, group]) => (
                        <tr key={key}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {group.availableDays.length > 0 && (
                                <div className="mb-2">
                                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium mr-2">Available</span>
                                  {group.availableDays.join(', ') || 'None'}
                                </div>
                              )}
                              {group.unavailableDays.length > 0 && (
                                <div>
                                  <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium mr-2">Unavailable</span>
                                  {group.unavailableDays.join(', ') || 'None'}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-3 justify-end">
                              <button
                                onClick={() => handleEditSpecialSettings(group.startDate, group.endDate)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  // Find all settings with this date range and delete them
                                  const settingsToDelete = specialAvailability.filter(
                                    s => s.startDate === group.startDate && s.endDate === group.endDate
                                  );
                                  // Delete each setting
                                  settingsToDelete.forEach(s => {
                                    if (s._id) {
                                      handleDeleteSpecialAvailability(s._id);
                                    }
                                  });
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Add New Special Date Range */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-pink-100 mb-6">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-b border-pink-100">
              <h3 className="text-xl font-semibold text-pink-700">Add Special Date Range</h3>
              <p className="text-sm text-gray-600">
                Create special availability settings that apply only during a specific date range.
              </p>
            </div>
            
            <div className="p-4">
              {!showSpecialForm ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                      <input
                        type="date"
                        value={specialStartDate}
                        onChange={(e) => setSpecialStartDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
                      <input
                        type="date"
                        value={specialEndDate}
                        onChange={(e) => setSpecialEndDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleInitializeSpecialSettings}
                    className="px-6 py-3 rounded-full font-bold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:shadow-lg"
                  >
                    Create Special Schedule
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      {isEditMode ? 'Edit' : 'Create'} Special Schedule for {new Date(specialStartDate).toLocaleDateString()} - {new Date(specialEndDate).toLocaleDateString()}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {newSpecialSettings.map((day, index) => (
                        <div
                          key={day.day}
                          className={`
                            border rounded-lg p-4
                            ${day.isAvailable
                              ? 'bg-green-50 border-green-200'
                              : 'bg-slate-50 border-slate-200'}
                          `}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-2">
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center
                                ${day.isAvailable
                                  ? 'bg-green-500 text-white'
                                  : 'bg-slate-300 text-slate-500'}
                              `}>
                                {day.day.charAt(0)}
                              </div>
                              <span className="font-medium">{day.day}</span>
                            </div>
                            
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={day.isAvailable}
                                onChange={(e) => {
                                  const updatedSettings = [...newSpecialSettings];
                                  updatedSettings[index] = {
                                    ...updatedSettings[index],
                                    isAvailable: e.target.checked
                                  };
                                  setNewSpecialSettings(updatedSettings);
                                }}
                                className="hidden peer"
                              />
                              <div className={`
                                w-12 h-6 rounded-full relative transition-all duration-300
                                ${day.isAvailable
                                  ? 'bg-green-500'
                                  : 'bg-slate-300'}
                                after:content-[''] after:absolute after:top-1 
                                after:left-1 after:bg-white after:rounded-full
                                after:h-4 after:w-4
                                ${day.isAvailable
                                  ? 'after:translate-x-6'
                                  : 'after:translate-x-0'}
                                after:transition-all after:duration-300
                              `}></div>
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">Start Time</label>
                              <input
                                type="time"
                                value={day.startTime}
                                onChange={(e) => {
                                  const updatedSettings = [...newSpecialSettings];
                                  updatedSettings[index] = {
                                    ...updatedSettings[index],
                                    startTime: e.target.value
                                  };
                                  setNewSpecialSettings(updatedSettings);
                                }}
                                min="00:00"
                                max="23:59"
                                disabled={!day.isAvailable}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-500 transition-all
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">End Time</label>
                              <input
                                type="time"
                                value={day.endTime}
                                onChange={(e) => {
                                  const updatedSettings = [...newSpecialSettings];
                                  updatedSettings[index] = {
                                    ...updatedSettings[index],
                                    endTime: e.target.value
                                  };
                                  setNewSpecialSettings(updatedSettings);
                                }}
                                disabled={!day.isAvailable}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-500 transition-all
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowSpecialForm(false)}
                      className="px-6 py-3 rounded-full font-bold transition-all duration-300 bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSpecialAvailability}
                      disabled={savingSpecial}
                      className={`
                        px-6 py-3 rounded-full font-bold transition-all duration-300
                        ${savingSpecial 
                          ? 'bg-slate-300 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white hover:shadow-lg'}
                      `}
                    >
                      {savingSpecial ? "Saving..." : isEditMode ? "Update Special Schedule" : "Save Special Schedule"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}