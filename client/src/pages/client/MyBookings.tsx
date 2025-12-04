// Updated ClientMyBookings component with correct status counts
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, Star, MessageCircle, CreditCard, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../stores/authStore';
import { useClientBookings, useCancelBooking, type Booking, type BookingFilters } from '../../hooks/useBooking';
import { useNavigate } from 'react-router-dom';

const ClientMyBookings = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [cancelingBookingId, setCancelingBookingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  // Use the updated hook with filtering capabilities
  const { 
    bookings, 
    summary, 
    statusCounts, // This now contains detailed status counts from backend
    loading, 
    error, 
    filters,
    refetch,
    filterByStatus,
    searchBookings,
    clearFilters
  } = useClientBookings();
  
  const { cancelBooking, loading: canceling } = useCancelBooking();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply search when debounced value changes
  useEffect(() => {
    if (searchDebounce !== filters.search) {
      searchBookings(searchDebounce);
    }
  }, [searchDebounce, filters.search, searchBookings]);

  // Check if user is authenticated and is a client
  if (!isAuthenticated || user?.role !== 'client') {
    return (
      <DashboardLayout title="My Bookings" subtitle="Access denied">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You must be logged in as a client to view bookings.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await cancelBooking(bookingId, cancelReason);
      setCancelingBookingId(null);
      setCancelReason('');
      refetch(); // Refresh the bookings list
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    navigate(`/client/service/${booking.booking_id}`);
  };

  const handleBrowseServices = () => {
    navigate('/services');
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    
    // Apply the filter based on tab selection
    if (tab === 'all') {
      filterByStatus(undefined); // Clear status filter
    } else if (tab === 'pending' || tab === 'confirmed') {
      filterByStatus(tab);
    } else {
      filterByStatus(tab);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchDebounce('');
    searchBookings('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time not set';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get filtered bookings based on active tab
  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'pending':
      case 'confirmed':
        return bookings.upcoming || [];
      case 'completed':
        return bookings.completed || [];
      case 'cancelled':
        return bookings.cancelled || [];
      case 'all':
      default:
        return [
          ...(bookings.upcoming || []),
          ...(bookings.completed || []),
          ...(bookings.cancelled || [])
        ];
    }
  };

  const filteredBookings = getFilteredBookings();

  // FIXED: Use statusCounts from backend for accurate tab counts
  const tabCounts = {
    all: (statusCounts?.pending || 0) + (statusCounts?.confirmed || 0) + (statusCounts?.completed || 0) + (statusCounts?.cancelled || 0),
    pending: statusCounts?.pending || 0,
    confirmed: statusCounts?.confirmed || 0,
    completed: statusCounts?.completed || 0,
    cancelled: statusCounts?.cancelled || 0,
  };

  // Debug logging to see what's happening
  console.log('Current statusCounts:', statusCounts);
  console.log('Calculated tabCounts:', tabCounts);
  console.log('Current filters:', filters);
  console.log('Active tab:', activeTab);

  // Render loading spinner in tab content area
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
          <span className="ml-3 text-gray-600">Loading bookings...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      );
    }

    if (filteredBookings.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {searchTerm ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-4">
                No bookings match your search for "{searchTerm}". Try a different search term.
              </p>
              <button 
                onClick={handleClearSearch}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab !== 'all' ? activeTab : ''} bookings</h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'all' 
                  ? "You haven't made any bookings yet." 
                  : `You have no ${activeTab} bookings.`}
              </p>
              {(activeTab === 'all' || activeTab === 'pending' || activeTab === 'confirmed') && (
                <button 
                  onClick={handleBrowseServices}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
                >
                  Browse Services
                </button>
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-6">
        {filteredBookings.map((booking: Booking) => (
          <div key={booking.booking_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.package_title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{booking.business_name}</p>
                  <p className="text-xs text-gray-500 mt-1">Booking ID: BK{String(booking.booking_id).padStart(6, '0')}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Event Details */}
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{formatDate(booking.wedding_date)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{formatTime(booking.wedding_time)}</span>
                  </div>
                  
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                    <span>{booking.wedding_location}</span>
                  </div>

                  {booking.special_requests && (
                    <div className="pt-2">
                      <p className="text-sm font-medium text-gray-900 mb-2">Special Requests:</p>
                      <p className="text-sm text-gray-600">{booking.special_requests}</p>
                    </div>
                  )}
                </div>

                {/* Right Column - Planner Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-3">Wedding Planner</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        <span>{booking.planner_first_name} {booking.planner_last_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-lg font-semibold text-gray-900">
                      Total: {formatPrice(booking.package_price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message Planner
                  </button>
                  
                  {booking.status === 'pending' && (
                    <button 
                      onClick={() => setCancelingBookingId(booking.booking_id)}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={() => handleViewDetails(booking)}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout 
      title="My Bookings"
      subtitle="View and manage your wedding service bookings"
    >
      {/* FIXED: Summary Stats using correct statusCounts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{statusCounts?.pending || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Confirmed</div>
          <div className="text-2xl font-bold text-green-600">{statusCounts?.confirmed || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-blue-600">{statusCounts?.completed || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">{statusCounts?.cancelled || 0}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search bookings by package, planner, or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FIXED: Tab Navigation with correct counts */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab} ({tabCounts[tab] || 0})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Applied Filters Display */}
      {(filters.status || filters.search) && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Applied filters:</span>
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
              Status: {filters.status}
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{filters.search}"
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-pink-600 hover:text-pink-700 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Tab Content - Loading, Error, or Bookings */}
      {renderTabContent()}

      {/* Cancel Booking Modal */}
      {cancelingBookingId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Booking</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                rows={3}
                placeholder="Please let us know why you're cancelling..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setCancelingBookingId(null);
                  setCancelReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={canceling}
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancelBooking(cancelingBookingId)}
                disabled={canceling}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {canceling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClientMyBookings;