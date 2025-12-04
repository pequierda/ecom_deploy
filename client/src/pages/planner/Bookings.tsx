import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, MessageCircle, FileText, Filter, Loader2, CreditCard, Receipt, Eye, Download } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../stores/authStore';
import ConfirmationModal from '../../components/ConfirmationModal';

// Updated Types to include payment information
interface Payment {
  payment_id: number;
  amount: string;
  receipt_url: string;
  uploaded_at: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_at: string | null;
}

interface Booking {
  booking_id: number;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone: string;
  package_title: string;
  package_price: number;
  wedding_date: string;
  wedding_time: string;
  wedding_location: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  business_name: string;
  // Payment information
  payment_id?: number;
  payment_amount?: string;
  receipt_url?: string;
  payment_uploaded_at?: string;
  payment_status?: 'pending' | 'verified' | 'rejected';
  payment_verified_at?: string | null;
  payment?: Payment | null;
}

interface ApiBookingsResponse {
  bookings: Booking[];
  pagination: {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
  };
  stats: {
    total_bookings: number;
    pending_bookings: number;
    confirmed_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
  };
}

// Payment Status Badge Component
const PaymentStatusBadge = ({ payment }: { payment?: Payment | null }) => {
  if (!payment) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        No Payment
      </span>
    );
  }

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return CheckCircle;
      case 'pending':
        return AlertCircle;
      case 'rejected':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const PaymentIcon = getPaymentIcon(payment.status);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusStyle(payment.status)}`}>
      <PaymentIcon className="w-3 h-3 mr-1" />
      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
    </span>
  );
};

// Payment Receipt Component
const PaymentReceipt = ({ payment }: { payment?: Payment | null }) => {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!payment || !payment.receipt_url) {
    return null;
  }

  // Handle receipt URL - check if it's a full URL or relative path
  const getReceiptUrl = React.useCallback((url: string) => {
    if (url.startsWith('http')) {
      return url;
    }
    // If it's a relative path, prepend the API base URL
    return `http://localhost:5000${url}`;
  }, []);

  const receiptUrl = React.useMemo(() => getReceiptUrl(payment.receipt_url), [payment.receipt_url, getReceiptUrl]);

  const handleViewReceipt = React.useCallback(() => {
    setShowReceiptModal(true);
    setImageLoading(true);
    setImageError(false);
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setShowReceiptModal(false);
    setImageLoading(true);
    setImageError(false);
  }, []);

  const handleDownloadReceipt = React.useCallback(() => {
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = `receipt-${payment.payment_id}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [receiptUrl, payment.payment_id]);

  const handleImageLoad = React.useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = React.useCallback(() => {
    setImageLoading(false);
    setImageError(true);
    console.error('Failed to load receipt image:', receiptUrl);
  }, [receiptUrl]);

  return (
    <>
      <div className="flex items-center space-x-2 mt-2">
        <Receipt className="w-4 h-4 text-blue-500" />
        <span className="text-sm text-gray-600">Payment Receipt:</span>
        <div className="flex space-x-2">
          <button
            onClick={handleViewReceipt}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </button>
          <button
            onClick={handleDownloadReceipt}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto border border-gray-300">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Payment Receipt</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                {imageLoading && (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading receipt...</span>
                  </div>
                )}
                
                {imageError && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <XCircle className="w-12 h-12 text-red-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Failed to load receipt</h4>
                    <p className="text-gray-600 mb-4">The receipt image could not be loaded.</p>
                    <p className="text-xs text-gray-500 mb-4">URL: {receiptUrl}</p>
                    <button
                      onClick={() => {
                        setImageError(false);
                        setImageLoading(true);
                      }}
                      className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                <img
                  src={receiptUrl}
                  alt="Payment Receipt"
                  className={`max-w-full h-auto mx-auto ${imageLoading || imageError ? 'hidden' : 'block'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-300">
              <button
                onClick={handleDownloadReceipt}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// API Service functions
const bookingAPI = {
  // Get planner's bookings
  getPlannerBookings: async (plannerId: string, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiBookingsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`http://localhost:5000/api/bookings/planner/${plannerId}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }

    return response.json();
  },

  // Update booking status
  updateBookingStatus: async (bookingId: number, status: string, notes?: string): Promise<void> => {
    const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update booking status');
    }
  },

  // Confirm booking
  confirmBooking: async (bookingId: number, notes?: string): Promise<void> => {
    const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/confirm`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to confirm booking');
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId: number, reason?: string): Promise<void> => {
    const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel booking');
    }
  },
};

// Rejection Modal Component
interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  bookingId: number;
  clientName: string;
}

const RejectionModal: React.FC<RejectionModalProps> = ({ isOpen, onClose, onConfirm, bookingId, clientName }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setReason('');
      onClose();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 border border-gray-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reject Booking for {clientName}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Please provide a reason for rejecting this booking. This will help the client understand your decision.
        </p>
        
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for rejection..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          rows={4}
          maxLength={500}
        />
        
        <p className="text-xs text-gray-500 mt-1">
          {reason.length}/500 characters
        </p>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Rejecting...' : 'Reject Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PlannerBookings = () => {
  // Use actual auth store
  const { user } = useAuthStore();
  
  // State
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingBookings, setUpdatingBookings] = useState<Set<number>>(new Set());
  
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    bookingId: number | null;
    clientName: string;
    packageName: string;
  }>({
    isOpen: false,
    bookingId: null,
    clientName: '',
    packageName: ''
  });

  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    bookingId: number | null;
    clientName: string;
  }>({
    isOpen: false,
    bookingId: null,
    clientName: ''
  });

  // Get planner ID from auth store - memoized to prevent recreations
  const getPlannerId = React.useCallback((): string | null => {
    if (!user || user.role !== 'planner') {
      console.warn('No authenticated planner found');
      return null;
    }
    return user.user_id.toString();
  }, [user]);

  // Fetch bookings - wrapped in useCallback to prevent recreations
  const fetchBookings = React.useCallback(async (page = 1, status = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const plannerId = getPlannerId();
      if (!plannerId) {
        setError('No authenticated planner found. Please log in as a planner.');
        setLoading(false);
        return;
      }
      
      const response = await bookingAPI.getPlannerBookings(plannerId, {
        status: status !== 'all' ? status : undefined,
        page,
        limit: 20
      });

      setBookings(response.bookings);
      setStats(response.stats);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [getPlannerId]);

  // Initial load and auth check - fixed dependencies
  useEffect(() => {
    if (!user) {
      setError('Please log in as a wedding planner to view bookings.');
      setLoading(false);
      return;
    }

    if (user.role === 'planner') {
      fetchBookings(1, activeTab);
    } else {
      setError('Access denied. This page is only available to wedding planners.');
      setLoading(false);
    }
  }, [activeTab, user?.role, fetchBookings]);

  // Tab change handler
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Format booking data for display and create payment object
  const formatBookingForDisplay = (booking: Booking) => {
    // Create payment object from booking data
    const payment: Payment | null = booking.payment_id ? {
      payment_id: booking.payment_id,
      amount: booking.payment_amount || '0',
      receipt_url: booking.receipt_url || '',
      uploaded_at: booking.payment_uploaded_at || '',
      status: booking.payment_status || 'pending',
      verified_at: booking.payment_verified_at || null
    } : null;

    return {
      id: booking.booking_id,
      clientName: `${booking.client_first_name} ${booking.client_last_name}`,
      clientEmail: booking.client_email,
      clientPhone: booking.client_phone,
      packageName: booking.package_title,
      weddingDate: booking.wedding_date,
      weddingTime: booking.wedding_time,
      venue: booking.wedding_location,
      status: booking.status,
      amount: `₱${booking.package_price?.toLocaleString() || '0'}`,
      bookingDate: booking.created_at,
      notes: booking.notes || 'No special requests',
      payment: payment, // Add payment object
      originalBooking: booking // Keep reference to original booking
    };
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'pending': return AlertCircle;
      case 'cancelled': return XCircle;
      case 'completed': return CheckCircle;
      default: return AlertCircle;
    }
  };

  // Handle status changes
  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    if (newStatus === 'cancelled') {
      const booking = bookings.find(b => b.booking_id === bookingId);
      if (booking) {
        setRejectionModal({
          isOpen: true,
          bookingId,
          clientName: `${booking.client_first_name} ${booking.client_last_name}`
        });
      }
    } else if (newStatus === 'confirmed') {
      const booking = bookings.find(b => b.booking_id === bookingId);
      if (booking) {
        setConfirmationModal({
          isOpen: true,
          bookingId,
          clientName: `${booking.client_first_name} ${booking.client_last_name}`,
          packageName: booking.package_title
        });
      }
    }
  };

  const handleConfirmBooking = async () => {
    if (!confirmationModal.bookingId) return;

    try {
      setUpdatingBookings(prev => new Set(prev).add(confirmationModal.bookingId!));
      await bookingAPI.confirmBooking(confirmationModal.bookingId);
      
      // Refresh bookings
      await fetchBookings(currentPage, activeTab);
      
      // Close modal
      setConfirmationModal({ isOpen: false, bookingId: null, clientName: '', packageName: '' });
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert(error instanceof Error ? error.message : 'Failed to confirm booking');
    } finally {
      setUpdatingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(confirmationModal.bookingId!);
        return newSet;
      });
    }
  };

  const handleRejection = async (reason: string) => {
    if (!rejectionModal.bookingId) return;

    try {
      await bookingAPI.cancelBooking(rejectionModal.bookingId, reason);
      
      // Refresh bookings
      await fetchBookings(currentPage, activeTab);
      
      // Close modal
      setRejectionModal({ isOpen: false, bookingId: null, clientName: '' });
    } catch (error) {
      console.error('Error rejecting booking:', error);
      throw error; // Re-throw to be handled by modal
    }
  };

  const getDaysUntilWedding = (weddingDate: string) => {
    const today = new Date();
    const wedding = new Date(weddingDate);
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const displayBookings = bookings.map(formatBookingForDisplay);

  if (loading && bookings.length === 0) {
    return (
      <DashboardLayout title="Bookings" subtitle="Manage your wedding bookings and client requests">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
          <span className="ml-2 text-gray-600">Loading bookings...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Bookings" subtitle="Manage your wedding bookings and client requests">
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchBookings(currentPage, activeTab)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Bookings"
      subtitle="Manage your wedding bookings and client requests"
    >
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total_bookings}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_bookings}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed_bookings}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.completed_bookings}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled_bookings}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
                {stats && (
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                    {tab === 'all' ? stats.total_bookings :
                     tab === 'pending' ? stats.pending_bookings :
                     tab === 'confirmed' ? stats.confirmed_bookings :
                     tab === 'completed' ? stats.completed_bookings :
                     stats.cancelled_bookings}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {displayBookings.map((booking) => {
          const StatusIcon = getStatusIcon(booking.status);
          const daysUntil = getDaysUntilWedding(booking.weddingDate);
          const isUpdating = updatingBookings.has(booking.id);
          
          return (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <StatusIcon className={`w-5 h-5 ${
                        booking.status === 'confirmed' || booking.status === 'completed' ? 'text-green-500' :
                        booking.status === 'pending' ? 'text-yellow-500' :
                        'text-red-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{booking.clientName}</h3>
                      <p className="text-sm text-gray-600">{booking.packageName}</p>
                      <p className="text-xs text-gray-500">Booked on {new Date(booking.bookingDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{booking.amount}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Wedding Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{new Date(booking.weddingDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        daysUntil <= 30 ? 'bg-red-100 text-red-800' :
                        daysUntil <= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {daysUntil > 0 ? `${daysUntil} days` : 'Past due'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{booking.weddingTime || 'Time not specified'}</span>
                    </div>
                    
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                      <span>{booking.venue}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{booking.clientName}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{booking.clientPhone}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{booking.clientEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information Section */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">Payment Information</span>
                    </div>
                    <PaymentStatusBadge payment={booking.payment} />
                  </div>
                  
                  {booking.payment ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Amount Paid:</span>
                          <span className="ml-2 font-medium">₱{parseFloat(booking.payment.amount).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Uploaded:</span>
                          <span className="ml-2">{new Date(booking.payment.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {booking.payment.verified_at && (
                        <div className="text-sm">
                          <span className="text-gray-500">Verified:</span>
                          <span className="ml-2">{new Date(booking.payment.verified_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <PaymentReceipt payment={booking.payment} />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No payment submitted yet</p>
                  )}
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Special Requests:</p>
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                 
                  
                  <div className="flex items-center space-x-3">
                    {booking.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleStatusChange(booking.id, 'confirmed')}
                          disabled={isUpdating}
                          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Confirm
                        </button>
                        <button 
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                          disabled={isUpdating}
                          className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchBookings(currentPage - 1, activeTab)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchBookings(currentPage + 1, activeTab)}
              disabled={currentPage === pagination.totalPages || loading}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {displayBookings.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-4">
            {activeTab !== 'all'
              ? `You don't have any ${activeTab} bookings yet.`
              : 'You haven\'t received any bookings yet.'}
          </p>
          {activeTab === 'all' && (
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700">
              Promote Your Services
            </button>
          )}
        </div>
      )}
         {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, bookingId: null, clientName: '', packageName: '' })}
        onConfirm={handleConfirmBooking}
        title="Confirm Booking"
        message={`Are you sure you want to confirm the booking for ${confirmationModal.clientName}?\n\nPackage: ${confirmationModal.packageName}\n\nThis action will notify the client and mark the booking as confirmed.`}
        confirmText="Yes, Confirm Booking"
        cancelText="Cancel"
        type="success"
        isLoading={updatingBookings.has(confirmationModal.bookingId || 0)}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, bookingId: null, clientName: '' })}
        onConfirm={handleRejection}
        bookingId={rejectionModal.bookingId || 0}
        clientName={rejectionModal.clientName}
      />


      {/* Rejection Modal */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, bookingId: null, clientName: '' })}
        onConfirm={handleRejection}
        bookingId={rejectionModal.bookingId || 0}
        clientName={rejectionModal.clientName}
      />
    </DashboardLayout>
  );
};

export default PlannerBookings;