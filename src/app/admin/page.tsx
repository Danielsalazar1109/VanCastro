"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

interface Instructor {
  _id: string;
  user: User;
  locations: string[];
  classTypes: string[];
}

interface Booking {
  _id: string;
  user: User;
  instructor: Instructor;
  location: string;
  classType: string;
  package: string;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Hardcoded locations and class types
  const locations = ["Surrey", "Burnaby", "North Vancouver"];
  const classTypes = ["class 4", "class 5", "class 7"];
  
  const [newInstructor, setNewInstructor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    locations: [] as string[],
    classTypes: [] as string[],
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("bookings");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [seedStatus, setSeedStatus] = useState<string>("");
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.email) {
      checkAdminStatus(session.user.email);
    }
  }, [status, session, router]);
  
  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'bookings') {
        fetchPendingBookings();
      } else if (activeTab === 'instructors') {
        fetchInstructors();
      } else if (activeTab === 'users') {
        fetchUsers();
      }
    }
  }, [isAdmin, activeTab]);
  
  const checkAdminStatus = async (email: string) => {
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.users && data.users.length > 0) {
        const user = data.users[0];
        if (user.role === 'admin') {
          setIsAdmin(true);
        } else {
          setError("You do not have admin privileges");
        }
      } else {
        setError("User not found");
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setError("Failed to verify admin status");
      setLoading(false);
    }
  };
  
  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/booking?status=pending');
      const data = await response.json();
      
      setPendingBookings(data.bookings || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      setError("Failed to load pending bookings");
      setLoading(false);
    }
  };
  
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/instructors');
      const data = await response.json();
      
      setInstructors(data.instructors || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setError("Failed to load instructors");
      setLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      
      setUsers(data.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError("Failed to load users");
      setLoading(false);
    }
  };
  
  const handleApproveBooking = async (bookingId: string) => {
    try {
      const response = await fetch('/api/booking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status: 'approved',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve booking');
      }
      
      // Refresh bookings
      fetchPendingBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
      setError("Failed to approve booking");
    }
  };
  
  const handleRejectBooking = async (bookingId: string) => {
    try {
      const response = await fetch('/api/booking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status: 'cancelled',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject booking');
      }
      
      // Refresh bookings
      fetchPendingBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      setError("Failed to reject booking");
    }
  };
  
  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: newInstructor.firstName,
          lastName: newInstructor.lastName,
          email: newInstructor.email,
          password: newInstructor.password,
          phone: newInstructor.phone,
          locations: newInstructor.locations,
          classTypes: newInstructor.classTypes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create instructor');
      }
      
      // Reset form and refresh instructors
      setNewInstructor({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        locations: [],
        classTypes: [],
      });
      
      fetchInstructors();
    } catch (error) {
      console.error('Error creating instructor:', error);
      setError("Failed to create instructor");
    }
  };

  const handleDeleteInstructor = async (instructorId: string) => {
    try {
      const response = await fetch(`/api/instructors/${instructorId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete instructor');
      }
      
      // Refresh instructors
      fetchInstructors();
    } catch (error) {
      console.error('Error deleting instructor:', error);
      setError("Failed to delete instructor");
    }
  }
  
  const handleLocationChange = (locationId: string) => {
    if (newInstructor.locations.includes(locationId)) {
      setNewInstructor({
        ...newInstructor,
        locations: newInstructor.locations.filter(id => id !== locationId),
      });
    } else {
      setNewInstructor({
        ...newInstructor,
        locations: [...newInstructor.locations, locationId],
      });
    }
  };
  
  const handleClassTypeChange = (classTypeId: string) => {
    if (newInstructor.classTypes.includes(classTypeId)) {
      setNewInstructor({
        ...newInstructor,
        classTypes: newInstructor.classTypes.filter(id => id !== classTypeId),
      });
    } else {
      setNewInstructor({
        ...newInstructor,
        classTypes: [...newInstructor.classTypes, classTypeId],
      });
    }
  };
  
  // Removed handleSeedDatabase function as it's no longer needed with hardcoded values
  
  if (status === 'loading' || loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white py-10">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white py-10">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Error</h2>
          <p className="mb-6 text-center text-red-500">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white py-10">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Access Denied</h2>
          <p className="mb-6 text-center">
            You do not have permission to access this page.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
    <div className="w-full min-h-screen bg-white py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-yellow-400 font-bold'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              Pending Bookings
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'instructors'
                  ? 'border-b-2 border-yellow-400 font-bold'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('instructors')}
            >
              Manage Instructors
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'users'
                  ? 'border-b-2 border-yellow-400 font-bold'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('users')}
            >
              View Users
            </button>
          </div>
        </div>
        
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Pending Bookings</h2>
            
            {pendingBookings.length === 0 ? (
              <p>No pending bookings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Date</th>
                      <th className="py-2 px-4 border-b">Time</th>
                      <th className="py-2 px-4 border-b">Location</th>
                      <th className="py-2 px-4 border-b">Class</th>
                      <th className="py-2 px-4 border-b">Duration</th>
                      <th className="py-2 px-4 border-b">Student</th>
                      <th className="py-2 px-4 border-b">Instructor</th>
                      <th className="py-2 px-4 border-b">Payment</th>
                      <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="py-2 px-4 border-b">
                          {new Date(booking.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.startTime} - {booking.endTime}
                        </td>
                        <td className="py-2 px-4 border-b">{booking.location}</td>
                        <td className="py-2 px-4 border-b">{booking.classType}</td>
                        <td className="py-2 px-4 border-b">{booking.duration} mins</td>
                        <td className="py-2 px-4 border-b">
                          {booking.user.firstName} {booking.user.lastName}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.instructor?.user?.firstName} {booking.instructor?.user?.lastName}
                        </td>
                        <td className="py-2 px-4 border-b">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              booking.paymentStatus === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : booking.paymentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveBooking(booking._id)}
                              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                              disabled={booking.paymentStatus !== 'completed'}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectBooking(booking._id)}
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'instructors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Create Instructor</h2>
              
              <form onSubmit={handleCreateInstructor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={newInstructor.firstName}
                    onChange={(e) =>
                      setNewInstructor({ ...newInstructor, firstName: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newInstructor.lastName}
                    onChange={(e) =>
                      setNewInstructor({ ...newInstructor, lastName: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={newInstructor.email}
                    onChange={(e) =>
                      setNewInstructor({ ...newInstructor, email: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={newInstructor.password}
                    onChange={(e) =>
                      setNewInstructor({ ...newInstructor, password: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newInstructor.phone}
                    onChange={(e) =>
                      setNewInstructor({ ...newInstructor, phone: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Locations</label>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <label key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newInstructor.locations.includes(location)}
                          onChange={() => handleLocationChange(location)}
                          className="mr-1"
                        />
                        {location}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Class Types</label>
                  <div className="flex flex-wrap gap-2">
                    {classTypes.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newInstructor.classTypes.includes(type)}
                          onChange={() => handleClassTypeChange(type)}
                          className="mr-1"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg"
                >
                  Create Instructor
                </button>
              </form>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Current Instructors</h2>
              
              {instructors.length === 0 ? (
                <p>No instructors found.</p>
              ) : (
                <div className="space-y-4">
                  {instructors.map((instructor) => (
                    <div
                      key={instructor._id}
                      className="p-4 border rounded-lg shadow-sm"
                    >
                      <h3 className="font-bold text-lg">
                        {instructor?.user?.firstName} {instructor?.user?.lastName}
                      </h3>
                      <p className="text-gray-600">{instructor?.user?.email}</p>
                      <p className="text-gray-600">{instructor?.user?.phone}</p>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium">Locations:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {instructor.locations.map((loc) => (
                            <span
                              key={loc}
                              className="px-2 py-1 bg-gray-100 rounded text-xs"
                            >
                              {loc}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium">Class Types:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {instructor.classTypes.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-1 bg-gray-100 rounded text-xs"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteInstructor(instructor._id)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg mt-2">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Registered Users</h2>
            
            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Email</th>
                      <th className="py-2 px-4 border-b">Phone</th>
                      <th className="py-2 px-4 border-b">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="py-2 px-4 border-b">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-2 px-4 border-b">{user.email}</td>
                        <td className="py-2 px-4 border-b">{user.phone}</td>
                        <td className="py-2 px-4 border-b">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : user.role === 'instructor'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}